-- Supabase Advanced Setup for Belgrave System
-- Phase 2: Missing columns, Utility Tables, RLS, and Performance
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 2. UPDATE EXISTING TABLES WITH MISSING COLUMNS
-- UPDATE presales
ALTER TABLE public.presales
ADD COLUMN IF NOT EXISTS discord TEXT,
    ADD COLUMN IF NOT EXISTS token_name TEXT NOT NULL DEFAULT 'Unknown',
    ADD COLUMN IF NOT EXISTS total_supply BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS team_token_lock_months INTEGER NOT NULL DEFAULT 12 CHECK (team_token_lock_months >= 12),
    ADD COLUMN IF NOT EXISTS vesting_schedule JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS current_raised DECIMAL(20, 8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS chain TEXT NOT NULL DEFAULT 'BASE' CHECK (
        chain IN (
            'BSC',
            'ETH',
            'POLYGON',
            'ARB',
            'BASE',
            'SOL',
            'XRPL'
        )
    ),
    ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS audit_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS audit_report_url TEXT,
    ADD COLUMN IF NOT EXISTS team_wallets JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approved_by TEXT;
-- Update status check for presales to include 'cancelled'
ALTER TABLE public.presales DROP CONSTRAINT IF EXISTS presales_status_check;
ALTER TABLE public.presales
ADD CONSTRAINT presales_status_check CHECK (
        status IN (
            'pending',
            'approved',
            'rejected',
            'live',
            'ended',
            'cancelled'
        )
    );
-- UPDATE user_stakes
ALTER TABLE public.user_stakes
ADD COLUMN IF NOT EXISTS max_allocation DECIMAL(20, 8) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_stake_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS total_stakes INTEGER DEFAULT 0;
ALTER TABLE public.user_stakes DROP CONSTRAINT IF EXISTS user_stakes_tier_check;
ALTER TABLE public.user_stakes
ADD CONSTRAINT user_stakes_tier_check CHECK (tier IN ('none', 'bronze', 'silver', 'gold'));
-- UPDATE user_commitments
ALTER TABLE public.user_commitments
ADD COLUMN IF NOT EXISTS token_allocation DECIMAL(20, 8) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS block_number BIGINT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'failed', 'refunded')
    ),
    ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_commitments DROP CONSTRAINT IF EXISTS user_commitments_presale_id_user_address_key;
ALTER TABLE public.user_commitments
ADD CONSTRAINT user_commitments_presale_id_user_address_key UNIQUE(presale_id, user_address);
-- 3. CREATE MISSING UTILITY TABLES
-- KYC Documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    presale_id UUID REFERENCES public.presales(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);
-- Admin Actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_address TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (
        action_type IN (
            'approve_presale',
            'reject_presale',
            'verify_kyc',
            'verify_audit'
        )
    ),
    target_id UUID NOT NULL,
    reason TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Stats
CREATE TABLE IF NOT EXISTS public.presale_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    total_presales INTEGER DEFAULT 0,
    active_presales INTEGER DEFAULT 0,
    total_raised DECIMAL(20, 8) DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    pending_presales INTEGER DEFAULT 0,
    approved_presales INTEGER DEFAULT 0,
    rejected_presales INTEGER DEFAULT 0,
    live_presales INTEGER DEFAULT 0,
    ended_presales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);
-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_presales_status ON public.presales(status);
CREATE INDEX IF NOT EXISTS idx_presales_chain ON public.presales(chain);
CREATE INDEX IF NOT EXISTS idx_presales_submitter ON public.presales(submitter_address);
CREATE INDEX IF NOT EXISTS idx_user_commitments_presale ON public.user_commitments(presale_id);
CREATE INDEX IF NOT EXISTS idx_user_commitments_user ON public.user_commitments(user_address);
CREATE INDEX IF NOT EXISTS idx_user_stakes_address ON public.user_stakes(user_address);
-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.presales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presale_stats ENABLE ROW LEVEL SECURITY;
-- 6. RLS POLICIES
-- Presales
DROP POLICY IF EXISTS "Public read access to approved presales" ON public.presales;
CREATE POLICY "Public read access to approved presales" ON public.presales FOR
SELECT USING (status IN ('approved', 'live', 'ended'));
DROP POLICY IF EXISTS "Users can read own presales" ON public.presales;
CREATE POLICY "Users can read own presales" ON public.presales FOR
SELECT USING (
        auth.jwt()->>'wallet_address' = submitter_address
    );
DROP POLICY IF EXISTS "Users can create presales" ON public.presales;
CREATE POLICY "Users can create presales" ON public.presales FOR
INSERT WITH CHECK (
        auth.jwt()->>'wallet_address' = submitter_address
    );
-- User Stakes
DROP POLICY IF EXISTS "Users can read own stakes" ON public.user_stakes;
CREATE POLICY "Users can read own stakes" ON public.user_stakes FOR
SELECT USING (auth.jwt()->>'wallet_address' = user_address);
DROP POLICY IF EXISTS "Public read for tier info" ON public.user_stakes;
CREATE POLICY "Public read for tier info" ON public.user_stakes FOR
SELECT USING (true);
-- User Commitments
DROP POLICY IF EXISTS "Users can read own commitments" ON public.user_commitments;
CREATE POLICY "Users can read own commitments" ON public.user_commitments FOR
SELECT USING (auth.jwt()->>'wallet_address' = user_address);
DROP POLICY IF EXISTS "Users can create commitments" ON public.user_commitments;
CREATE POLICY "Users can create commitments" ON public.user_commitments FOR
INSERT WITH CHECK (auth.jwt()->>'wallet_address' = user_address);
-- 7. UTILITIES & TRIGGERS
-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_presales_updated_at ON public.presales;
CREATE TRIGGER update_presales_updated_at BEFORE
UPDATE ON public.presales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_stakes_updated_at ON public.user_stakes;
CREATE TRIGGER update_user_stakes_updated_at BEFORE
UPDATE ON public.user_stakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Tier calculation
CREATE OR REPLACE FUNCTION calculate_user_tier(stake_amount DECIMAL) RETURNS TABLE(tier TEXT, max_allocation DECIMAL) AS $$ BEGIN IF stake_amount >= 175000000 THEN RETURN QUERY
SELECT 'gold'::TEXT,
    500000.00::DECIMAL;
ELSIF stake_amount >= 87500000 THEN RETURN QUERY
SELECT 'silver'::TEXT,
    250000.00::DECIMAL;
ELSIF stake_amount >= 17500000 THEN RETURN QUERY
SELECT 'bronze'::TEXT,
    100000.00::DECIMAL;
ELSE RETURN QUERY
SELECT 'none'::TEXT,
    0.00::DECIMAL;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Stats sync
CREATE OR REPLACE FUNCTION update_presale_stats() RETURNS TRIGGER AS $$ BEGIN
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
        (
            SELECT COUNT(*)
            FROM public.presales
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status IN ('live', 'approved')
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status = 'pending'
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status = 'approved'
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status = 'rejected'
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status = 'live'
        ),
        (
            SELECT COUNT(*)
            FROM public.presales
            WHERE status = 'ended'
        )
    ) ON CONFLICT (date) DO
UPDATE
SET total_presales = EXCLUDED.total_presales,
    active_presales = EXCLUDED.active_presales,
    pending_presales = EXCLUDED.pending_presales,
    approved_presales = EXCLUDED.approved_presales,
    rejected_presales = EXCLUDED.rejected_presales,
    live_presales = EXCLUDED.live_presales,
    ended_presales = EXCLUDED.ended_presales;
RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS presale_stats_trigger ON public.presales;
CREATE TRIGGER presale_stats_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON public.presales FOR EACH ROW EXECUTE FUNCTION update_presale_stats();