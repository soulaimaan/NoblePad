-- Row Level Security (RLS) Implementation
-- Security layer of the Three-Tier Architecture

-- Enable RLS on all tables
ALTER TABLE public.presales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presale_stats ENABLE ROW LEVEL SECURITY;

-- 1. PRESALES TABLE POLICIES

-- Allow public read access to approved/live presales
CREATE POLICY "Public read access to approved presales" ON public.presales
    FOR SELECT USING (status IN ('approved', 'live', 'ended'));

-- Allow users to read their own submitted presales
CREATE POLICY "Users can read own presales" ON public.presales
    FOR SELECT USING (auth.jwt() ->> 'wallet_address' = submitter_address);

-- Allow users to create presales
CREATE POLICY "Users can create presales" ON public.presales
    FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = submitter_address);

-- Allow users to update their own pending presales
CREATE POLICY "Users can update own pending presales" ON public.presales
    FOR UPDATE USING (
        auth.jwt() ->> 'wallet_address' = submitter_address 
        AND status = 'pending'
    );

-- Admin policies for presales
CREATE POLICY "Admins can read all presales" ON public.presales
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );

CREATE POLICY "Admins can update presales" ON public.presales
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );

-- 2. USER_STAKES TABLE POLICIES

-- Users can read their own stakes
CREATE POLICY "Users can read own stakes" ON public.user_stakes
    FOR SELECT USING (auth.jwt() ->> 'wallet_address' = user_address);

-- Users can insert/update their own stakes
CREATE POLICY "Users can manage own stakes" ON public.user_stakes
    FOR ALL USING (auth.jwt() ->> 'wallet_address' = user_address);

-- Public read for tier calculation (no sensitive data)
CREATE POLICY "Public read for tier info" ON public.user_stakes
    FOR SELECT USING (true);

-- 3. USER_COMMITMENTS TABLE POLICIES

-- Users can read their own commitments
CREATE POLICY "Users can read own commitments" ON public.user_commitments
    FOR SELECT USING (auth.jwt() ->> 'wallet_address' = user_address);

-- Users can create commitments
CREATE POLICY "Users can create commitments" ON public.user_commitments
    FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = user_address);

-- Presale owners can read commitments to their presales
CREATE POLICY "Presale owners can read commitments" ON public.user_commitments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.presales 
            WHERE id = presale_id 
            AND submitter_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Admins can read all commitments
CREATE POLICY "Admins can read all commitments" ON public.user_commitments
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );

-- 4. KYC_DOCUMENTS TABLE POLICIES

-- Presale owners can read their own KYC documents
CREATE POLICY "Presale owners can read own KYC" ON public.kyc_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.presales 
            WHERE id = presale_id 
            AND submitter_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Presale owners can insert KYC documents
CREATE POLICY "Presale owners can insert KYC" ON public.kyc_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.presales 
            WHERE id = presale_id 
            AND submitter_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Admins can read and update all KYC documents
CREATE POLICY "Admins can manage KYC documents" ON public.kyc_documents
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );

-- 5. ADMIN_ACTIONS TABLE POLICIES

-- Only admins can read admin actions
CREATE POLICY "Admins can read admin actions" ON public.admin_actions
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions" ON public.admin_actions
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        ))
        AND auth.jwt() ->> 'wallet_address' = admin_address
    );

-- 6. PRESALE_STATS TABLE POLICIES

-- Public read access to stats (no sensitive data)
CREATE POLICY "Public read access to stats" ON public.presale_stats
    FOR SELECT USING (true);

-- Only system can insert/update stats
CREATE POLICY "System can manage stats" ON public.presale_stats
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- HELPER FUNCTIONS FOR RLS

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'wallet_address' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_addresses', true), ','))
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user wallet address
CREATE OR REPLACE FUNCTION auth.wallet_address()
RETURNS TEXT AS $$
BEGIN
    RETURN auth.jwt() ->> 'wallet_address';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADDITIONAL SECURITY MEASURES

-- Create secure view for public presale data
CREATE OR REPLACE VIEW public.public_presales AS
SELECT 
    id,
    project_name,
    description,
    website,
    twitter,
    telegram,
    whitepaper,
    token_name,
    token_symbol,
    soft_cap,
    hard_cap,
    token_price,
    min_contribution,
    max_contribution,
    start_date,
    end_date,
    liquidity_percentage,
    liquidity_lock_months,
    vesting_schedule,
    status,
    current_raised,
    participant_count,
    chain,
    kyc_verified,
    audit_verified,
    created_at,
    approved_at
FROM public.presales
WHERE status IN ('approved', 'live', 'ended');

-- Grant access to public view
GRANT SELECT ON public.public_presales TO anon, authenticated;

COMMENT ON VIEW public.public_presales IS 'Public view of approved presales with sensitive data filtered';

-- Create function to validate presale data
CREATE OR REPLACE FUNCTION validate_presale_data(
    p_soft_cap DECIMAL,
    p_hard_cap DECIMAL,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_liquidity_percentage INTEGER,
    p_liquidity_lock_months INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate caps
    IF p_soft_cap <= 0 OR p_hard_cap <= p_soft_cap THEN
        RETURN FALSE;
    END IF;
    
    -- Validate dates
    IF p_start_date >= p_end_date OR p_start_date <= NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Validate liquidity settings
    IF p_liquidity_percentage < 60 OR p_liquidity_lock_months < 6 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_presale_data IS 'Validates presale parameters for security compliance';