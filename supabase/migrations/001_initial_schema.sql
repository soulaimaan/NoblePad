-- NoblePad Database Schema
-- Three-Tier Architecture Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 1. PRESALES TABLE
CREATE TABLE public.presales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Project Information
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  twitter TEXT,
  telegram TEXT,
  discord TEXT,
  whitepaper TEXT,
  
  -- Token Details
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_address TEXT NOT NULL,
  total_supply BIGINT NOT NULL,
  
  -- Presale Configuration
  soft_cap DECIMAL(20,8) NOT NULL,
  hard_cap DECIMAL(20,8) NOT NULL,
  token_price DECIMAL(20,8) NOT NULL,
  min_contribution DECIMAL(20,8) NOT NULL,
  max_contribution DECIMAL(20,8) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Security Settings
  liquidity_percentage INTEGER NOT NULL CHECK (liquidity_percentage >= 60),
  liquidity_lock_months INTEGER NOT NULL CHECK (liquidity_lock_months >= 6),
  team_token_lock_months INTEGER NOT NULL CHECK (team_token_lock_months >= 12),
  
  -- Vesting Schedule (JSON)
  vesting_schedule JSONB DEFAULT '[]'::jsonb,
  
  -- Status and Approval
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'live', 'ended', 'cancelled')),
  rejection_reason TEXT,
  
  -- Tracking
  current_raised DECIMAL(20,8) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  
  -- Blockchain
  chain TEXT NOT NULL DEFAULT 'BSC' CHECK (chain IN ('BSC', 'ETH', 'POLYGON', 'ARB', 'BASE', 'SOL')),
  
  -- Security Verification
  kyc_verified BOOLEAN DEFAULT FALSE,
  audit_verified BOOLEAN DEFAULT FALSE,
  audit_report_url TEXT,
  
  -- Submitter Information
  submitter_address TEXT NOT NULL,
  team_wallets JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT
);

-- 2. USER STAKES TABLE (for tier calculation)
CREATE TABLE public.user_stakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_address TEXT UNIQUE NOT NULL,
  staked_amount DECIMAL(20,8) DEFAULT 0,
  tier TEXT DEFAULT 'none' CHECK (tier IN ('none', 'bronze', 'silver', 'gold')),
  max_allocation DECIMAL(20,8) DEFAULT 0,
  
  -- Tracking
  last_stake_date TIMESTAMP WITH TIME ZONE,
  total_stakes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER COMMITMENTS TABLE
CREATE TABLE public.user_commitments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presale_id UUID REFERENCES public.presales(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  
  -- Commitment Details
  amount DECIMAL(20,8) NOT NULL,
  token_allocation DECIMAL(20,8) NOT NULL,
  
  -- Transaction Info
  transaction_hash TEXT,
  block_number BIGINT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(presale_id, user_address)
);

-- 4. KYC DOCUMENTS TABLE
CREATE TABLE public.kyc_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presale_id UUID REFERENCES public.presales(id) ON DELETE CASCADE,
  
  -- Document Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  
  -- Verification
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 5. ADMIN ACTIONS LOG TABLE
CREATE TABLE public.admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_address TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_presale', 'reject_presale', 'verify_kyc', 'verify_audit')),
  target_id UUID NOT NULL,
  
  -- Action Details
  reason TEXT,
  notes TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRESALE STATISTICS TABLE
CREATE TABLE public.presale_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Daily Stats
  total_presales INTEGER DEFAULT 0,
  active_presales INTEGER DEFAULT 0,
  total_raised DECIMAL(20,8) DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  
  -- Status Breakdown
  pending_presales INTEGER DEFAULT 0,
  approved_presales INTEGER DEFAULT 0,
  rejected_presales INTEGER DEFAULT 0,
  live_presales INTEGER DEFAULT 0,
  ended_presales INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_presales_status ON public.presales(status);
CREATE INDEX idx_presales_chain ON public.presales(chain);
CREATE INDEX idx_presales_submitter ON public.presales(submitter_address);
CREATE INDEX idx_presales_dates ON public.presales(start_date, end_date);
CREATE INDEX idx_user_commitments_presale ON public.user_commitments(presale_id);
CREATE INDEX idx_user_commitments_user ON public.user_commitments(user_address);
CREATE INDEX idx_user_stakes_address ON public.user_stakes(user_address);
CREATE INDEX idx_admin_actions_admin ON public.admin_actions(admin_address);

-- FUNCTIONS AND TRIGGERS
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_presales_updated_at BEFORE UPDATE ON public.presales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stakes_updated_at BEFORE UPDATE ON public.user_stakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user tier based on staked amount
CREATE OR REPLACE FUNCTION calculate_user_tier(stake_amount DECIMAL)
RETURNS TABLE(tier TEXT, max_allocation DECIMAL) AS $$
BEGIN
    IF stake_amount >= 10000 THEN
        RETURN QUERY SELECT 'gold'::TEXT, 5000.00::DECIMAL;
    ELSIF stake_amount >= 5000 THEN
        RETURN QUERY SELECT 'silver'::TEXT, 2500.00::DECIMAL;
    ELSIF stake_amount >= 1000 THEN
        RETURN QUERY SELECT 'bronze'::TEXT, 1000.00::DECIMAL;
    ELSE
        RETURN QUERY SELECT 'none'::TEXT, 0.00::DECIMAL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update presale statistics
CREATE OR REPLACE FUNCTION update_presale_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.presale_stats (
        date,
        total_presales,
        active_presales,
        pending_presales,
        approved_presales,
        rejected_presales,
        live_presales,
        ended_presales
    )
    VALUES (
        CURRENT_DATE,
        (SELECT COUNT(*) FROM public.presales),
        (SELECT COUNT(*) FROM public.presales WHERE status IN ('live', 'approved')),
        (SELECT COUNT(*) FROM public.presales WHERE status = 'pending'),
        (SELECT COUNT(*) FROM public.presales WHERE status = 'approved'),
        (SELECT COUNT(*) FROM public.presales WHERE status = 'rejected'),
        (SELECT COUNT(*) FROM public.presales WHERE status = 'live'),
        (SELECT COUNT(*) FROM public.presales WHERE status = 'ended')
    )
    ON CONFLICT (date)
    DO UPDATE SET
        total_presales = EXCLUDED.total_presales,
        active_presales = EXCLUDED.active_presales,
        pending_presales = EXCLUDED.pending_presales,
        approved_presales = EXCLUDED.approved_presales,
        rejected_presales = EXCLUDED.rejected_presales,
        live_presales = EXCLUDED.live_presales,
        ended_presales = EXCLUDED.ended_presales;
        
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats
CREATE TRIGGER presale_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.presales
    FOR EACH ROW EXECUTE FUNCTION update_presale_stats();

-- COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE public.presales IS 'Main presales table storing all project information and configuration';
COMMENT ON TABLE public.user_stakes IS 'User $NPAD staking amounts and calculated tiers';
COMMENT ON TABLE public.user_commitments IS 'User commitments to presales with transaction tracking';
COMMENT ON TABLE public.kyc_documents IS 'KYC document storage and verification status';
COMMENT ON TABLE public.admin_actions IS 'Audit trail of all admin actions';
COMMENT ON TABLE public.presale_stats IS 'Daily aggregated statistics for analytics';