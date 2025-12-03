-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  total_supply NUMERIC(78, 18) NOT NULL,
  chain_id INTEGER NOT NULL,
  creator_address TEXT NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT fk_chain FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON DELETE CASCADE,
  CONSTRAINT unique_token_address_chain UNIQUE (address, chain_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tokens_creator ON public.tokens(creator_address);
CREATE INDEX IF NOT EXISTS idx_tokens_chain ON public.tokens(chain_id);

-- Enable Row Level Security
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" 
  ON public.tokens
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for token creators"
  ON public.tokens
  FOR UPDATE
  USING (auth.uid()::text = creator_address);

-- Add comments
COMMENT ON TABLE public.tokens IS 'Stores information about deployed ERC20 tokens';
COMMENT ON COLUMN public.tokens.address IS 'The contract address of the token';
COMMENT ON COLUMN public.tokens.chain_id IS 'The blockchain network ID where the token is deployed';
COMMENT ON COLUMN public.tokens.creator_address IS 'The address that created the token';
COMMENT ON COLUMN public.tokens.metadata IS 'Additional token metadata (e.g., logo, social links, etc.)';

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tokens' AND column_name = 'updated_at') THEN
    ALTER TABLE public.tokens ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Create trigger for updated_at
    CREATE TRIGGER update_tokens_updated_at
    BEFORE UPDATE ON public.tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add token verification status
ALTER TABLE public.tokens 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_source TEXT;

-- Add token type (standard, deflationary, rebasing, etc.)
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'standard';

-- Add token logo URI
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS logo_uri TEXT;

-- Add token website and social links
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS discord TEXT,
ADD COLUMN IF NOT EXISTS github TEXT;
