-- Migration: Add missing columns to presales table for enhanced tracking
-- Created: 2025-12-30

ALTER TABLE public.presales ADD COLUMN IF NOT EXISTS contract_address TEXT;
ALTER TABLE public.presales ADD COLUMN IF NOT EXISTS audit_report_url TEXT;
ALTER TABLE public.presales ADD COLUMN IF NOT EXISTS creation_transaction TEXT;

COMMENT ON COLUMN public.presales.contract_address IS 'The deployed smart contract address of the presale';
COMMENT ON COLUMN public.presales.audit_report_url IS 'URL to the security audit report';
COMMENT ON COLUMN public.presales.creation_transaction IS 'Transaction hash of the presale creation on blockchain';
