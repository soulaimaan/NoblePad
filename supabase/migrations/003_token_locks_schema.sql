-- Token Locks Schema Migration
-- Adds token locking functionality to NoblePad

-- ======================================================================
-- TOKEN LOCKS TABLE
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.token_locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lock_id BIGINT NOT NULL, -- On-chain lock ID
  chain_id INTEGER NOT NULL,
  
  -- Token Information
  token_address VARCHAR(42) NOT NULL,
  token_name VARCHAR(100),
  token_symbol VARCHAR(10),
  token_decimals INTEGER DEFAULT 18,
  
  -- Lock Details
  owner_address VARCHAR(42) NOT NULL,
  beneficiary_address VARCHAR(42) NOT NULL,
  amount NUMERIC(36, 0) NOT NULL, -- Support up to 36 digits for large numbers
  
  -- Timing
  lock_time TIMESTAMP WITH TIME ZONE NOT NULL,
  unlock_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  description TEXT,
  lock_type VARCHAR(20) NOT NULL DEFAULT 'custom',
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'cancelled')),
  
  -- Blockchain Data
  creation_transaction VARCHAR(66) NOT NULL,
  unlock_transaction VARCHAR(66),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(chain_id, lock_id),
  CHECK (unlock_time > lock_time),
  CHECK (amount > 0),
  CHECK (length(token_address) = 42),
  CHECK (length(owner_address) = 42),
  CHECK (length(beneficiary_address) = 42)
);

-- ======================================================================
-- TOKEN VESTING TABLE (for advanced vesting schedules)
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.token_vesting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lock_id UUID NOT NULL REFERENCES public.token_locks(id) ON DELETE CASCADE,
  
  -- Vesting Period Details
  period_index INTEGER NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL, -- Up to 999.99%
  amount NUMERIC(36, 0) NOT NULL,
  unlock_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  
  -- Status
  claimed BOOLEAN DEFAULT FALSE,
  claim_transaction VARCHAR(66),
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (percentage > 0 AND percentage <= 100),
  CHECK (amount > 0),
  UNIQUE(lock_id, period_index)
);

-- ======================================================================
-- TOKEN LOCK EVENTS TABLE (for audit trail)
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.token_lock_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lock_id UUID NOT NULL REFERENCES public.token_locks(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(30) NOT NULL,
  event_data JSONB,
  transaction_hash VARCHAR(66),
  block_number BIGINT,
  
  -- User and timing
  user_address VARCHAR(42),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (event_type IN (
    'lock_created', 'lock_unlocked', 'lock_cancelled',
    'vesting_claimed', 'beneficiary_changed', 'lock_extended'
  ))
);

-- ======================================================================
-- INDEXES FOR PERFORMANCE
-- ======================================================================

-- Token Locks Indexes
CREATE INDEX IF NOT EXISTS idx_token_locks_owner ON public.token_locks(owner_address);
CREATE INDEX IF NOT EXISTS idx_token_locks_beneficiary ON public.token_locks(beneficiary_address);
CREATE INDEX IF NOT EXISTS idx_token_locks_token ON public.token_locks(token_address);
CREATE INDEX IF NOT EXISTS idx_token_locks_chain ON public.token_locks(chain_id);
CREATE INDEX IF NOT EXISTS idx_token_locks_status ON public.token_locks(status);
CREATE INDEX IF NOT EXISTS idx_token_locks_unlock_time ON public.token_locks(unlock_time);
CREATE INDEX IF NOT EXISTS idx_token_locks_lock_type ON public.token_locks(lock_type);

-- Token Vesting Indexes
CREATE INDEX IF NOT EXISTS idx_token_vesting_lock ON public.token_vesting(lock_id);
CREATE INDEX IF NOT EXISTS idx_token_vesting_unlock_time ON public.token_vesting(unlock_time);
CREATE INDEX IF NOT EXISTS idx_token_vesting_claimed ON public.token_vesting(claimed);

-- Token Lock Events Indexes
CREATE INDEX IF NOT EXISTS idx_token_lock_events_lock ON public.token_lock_events(lock_id);
CREATE INDEX IF NOT EXISTS idx_token_lock_events_type ON public.token_lock_events(event_type);
CREATE INDEX IF NOT EXISTS idx_token_lock_events_user ON public.token_lock_events(user_address);
CREATE INDEX IF NOT EXISTS idx_token_lock_events_time ON public.token_lock_events(created_at);

-- ======================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ======================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to token_locks
CREATE TRIGGER update_token_locks_updated_at 
  BEFORE UPDATE ON public.token_locks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- VIEWS FOR COMMON QUERIES
-- ======================================================================

-- Active locks view
CREATE OR REPLACE VIEW public.active_token_locks AS
SELECT 
  tl.*,
  EXTRACT(EPOCH FROM (unlock_time - CURRENT_TIMESTAMP))::BIGINT AS seconds_until_unlock,
  CASE 
    WHEN unlock_time <= CURRENT_TIMESTAMP AND status = 'locked' THEN 'claimable'
    WHEN status = 'locked' THEN 'active'
    ELSE status
  END AS effective_status
FROM public.token_locks tl
WHERE status IN ('locked', 'unlocked')
ORDER BY created_at DESC;

-- Lock statistics by user
CREATE OR REPLACE VIEW public.user_lock_stats AS
SELECT 
  owner_address,
  COUNT(*) as total_locks,
  COUNT(CASE WHEN status = 'locked' THEN 1 END) as active_locks,
  COUNT(CASE WHEN status = 'unlocked' THEN 1 END) as unlocked_locks,
  COUNT(CASE WHEN unlock_time <= CURRENT_TIMESTAMP AND status = 'locked' THEN 1 END) as claimable_locks,
  SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) as total_locked_amount,
  MIN(created_at) as first_lock_date,
  MAX(created_at) as latest_lock_date
FROM public.token_locks
GROUP BY owner_address;

-- Token statistics
CREATE OR REPLACE VIEW public.token_lock_stats AS
SELECT 
  token_address,
  token_symbol,
  chain_id,
  COUNT(*) as lock_count,
  SUM(amount) as total_locked_amount,
  COUNT(DISTINCT owner_address) as unique_lockers,
  MIN(unlock_time) as earliest_unlock,
  MAX(unlock_time) as latest_unlock
FROM public.token_locks
WHERE status IN ('locked', 'unlocked')
GROUP BY token_address, token_symbol, chain_id
ORDER BY lock_count DESC;

-- ======================================================================
-- FUNCTIONS FOR TOKEN LOCK OPERATIONS
-- ======================================================================

-- Function to create a token lock event
CREATE OR REPLACE FUNCTION log_token_lock_event(
  p_lock_id UUID,
  p_event_type VARCHAR(30),
  p_event_data JSONB DEFAULT NULL,
  p_transaction_hash VARCHAR(66) DEFAULT NULL,
  p_user_address VARCHAR(42) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.token_lock_events (
    lock_id, event_type, event_data, transaction_hash, user_address
  ) VALUES (
    p_lock_id, p_event_type, p_event_data, p_transaction_hash, p_user_address
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update lock status
CREATE OR REPLACE FUNCTION update_lock_status(
  p_lock_id UUID,
  p_status VARCHAR(20),
  p_transaction_hash VARCHAR(66) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  old_status VARCHAR(20);
BEGIN
  -- Get current status
  SELECT status INTO old_status FROM public.token_locks WHERE id = p_lock_id;
  
  IF old_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update status
  UPDATE public.token_locks 
  SET 
    status = p_status,
    unlock_transaction = COALESCE(p_transaction_hash, unlock_transaction),
    unlocked_at = CASE WHEN p_status = 'unlocked' THEN CURRENT_TIMESTAMP ELSE unlocked_at END
  WHERE id = p_lock_id;
  
  -- Log event
  PERFORM log_token_lock_event(
    p_lock_id,
    CASE p_status 
      WHEN 'unlocked' THEN 'lock_unlocked'
      WHEN 'cancelled' THEN 'lock_cancelled'
      ELSE 'status_changed'
    END,
    jsonb_build_object('old_status', old_status, 'new_status', p_status),
    p_transaction_hash
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- ROW LEVEL SECURITY POLICIES
-- ======================================================================

-- Enable RLS on all tables
ALTER TABLE public.token_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_vesting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_lock_events ENABLE ROW LEVEL SECURITY;

-- Token locks policies
CREATE POLICY "Users can view their own locks" ON public.token_locks
  FOR SELECT USING (
    owner_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
    OR beneficiary_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
  );

CREATE POLICY "Users can create locks" ON public.token_locks
  FOR INSERT WITH CHECK (
    owner_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
  );

CREATE POLICY "Users can update their own locks" ON public.token_locks
  FOR UPDATE USING (
    owner_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
    OR beneficiary_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
  );

-- Admins can see all locks
CREATE POLICY "Admins can view all locks" ON public.token_locks
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin'
  );

-- Public read access for basic lock information (for transparency)
CREATE POLICY "Public can view basic lock info" ON public.token_locks
  FOR SELECT USING (true);

-- Vesting policies (inherit from parent lock)
CREATE POLICY "Vesting follows lock permissions" ON public.token_vesting
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.token_locks tl 
      WHERE tl.id = token_vesting.lock_id 
      AND (
        tl.owner_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
        OR tl.beneficiary_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
        OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin'
      )
    )
  );

-- Events policies (read-only for users, full access for admins)
CREATE POLICY "Users can view lock events" ON public.token_lock_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.token_locks tl 
      WHERE tl.id = token_lock_events.lock_id 
      AND (
        tl.owner_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
        OR tl.beneficiary_address = current_setting('request.jwt.claims', true)::jsonb->>'wallet_address'
        OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "System can create events" ON public.token_lock_events
  FOR INSERT WITH CHECK (true);

-- ======================================================================
-- COMMENTS FOR DOCUMENTATION
-- ======================================================================

COMMENT ON TABLE public.token_locks IS 'Stores token lock information synced from blockchain';
COMMENT ON TABLE public.token_vesting IS 'Stores vesting schedules for token locks with multiple unlock periods';
COMMENT ON TABLE public.token_lock_events IS 'Audit trail for all token lock related events';

COMMENT ON COLUMN public.token_locks.lock_id IS 'On-chain lock ID from smart contract';
COMMENT ON COLUMN public.token_locks.amount IS 'Amount of tokens locked (in wei/smallest unit)';
COMMENT ON COLUMN public.token_locks.lock_type IS 'Type of lock: team, marketing, development, advisors, custom';

COMMENT ON VIEW public.active_token_locks IS 'Active token locks with calculated status and time remaining';
COMMENT ON VIEW public.user_lock_stats IS 'Aggregated statistics per user for token locks';
COMMENT ON VIEW public.token_lock_stats IS 'Statistics per token across all chains';

-- ======================================================================
-- GRANT PERMISSIONS
-- ======================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.token_locks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.token_vesting TO authenticated;
GRANT SELECT, INSERT ON public.token_lock_events TO authenticated;

-- Grant permissions to service role (for functions)
GRANT ALL ON public.token_locks TO service_role;
GRANT ALL ON public.token_vesting TO service_role;
GRANT ALL ON public.token_lock_events TO service_role;

-- Grant view permissions
GRANT SELECT ON public.active_token_locks TO authenticated, anon;
GRANT SELECT ON public.user_lock_stats TO authenticated;
GRANT SELECT ON public.token_lock_stats TO authenticated, anon;