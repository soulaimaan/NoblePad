-- Supabase Initialization Script for Belgrave System
-- Created on: January 8, 2026
-- 1. Create presales table
CREATE TABLE IF NOT EXISTS presales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_name TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    token_address TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT,
    twitter TEXT,
    telegram TEXT,
    whitepaper TEXT,
    soft_cap DECIMAL NOT NULL,
    hard_cap DECIMAL NOT NULL,
    token_price DECIMAL NOT NULL,
    min_contribution DECIMAL NOT NULL,
    max_contribution DECIMAL NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    liquidity_percentage INTEGER NOT NULL,
    liquidity_lock_months INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'rejected',
            'live',
            'ended'
        )
    ),
    submitter_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- 2. Create user_commitments table
CREATE TABLE IF NOT EXISTS user_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presale_id UUID REFERENCES presales(id),
    user_address TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    transaction_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
-- 3. Create user_stakes table
CREATE TABLE IF NOT EXISTS user_stakes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT UNIQUE NOT NULL,
    staked_amount DECIMAL DEFAULT 0,
    tier TEXT DEFAULT 'none',
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Note: Ensure Row Level Security (RLS) is enabled and appropriate policies are created in the Supabase Dashboard.