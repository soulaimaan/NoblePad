-- Sample data for NoblePad testing
-- Run this in Supabase SQL Editor after setting up the schema

-- Insert sample presales
INSERT INTO presales (
  project_name,
  description,
  website,
  twitter,
  telegram,
  whitepaper,
  token_name,
  token_symbol,
  token_address,
  total_supply,
  soft_cap,
  hard_cap,
  token_price,
  min_contribution,
  max_contribution,
  start_date,
  end_date,
  liquidity_percentage,
  liquidity_lock_months,
  team_token_lock_months,
  chain,
  status,
  submitter_address,
  vesting_schedule,
  team_wallets,
  kyc_verified,
  audit_verified,
  audit_report_url
) VALUES 
(
  'NobleDeFi Protocol',
  'A revolutionary DeFi protocol with advanced yield farming capabilities and cross-chain interoperability. Our mission is to provide secure and profitable DeFi opportunities for all users.',
  'https://nobledefi.com',
  'https://twitter.com/nobledefi',
  'https://t.me/nobledefi',
  'https://nobledefi.com/whitepaper.pdf',
  'NobleDeFi Token',
  'NOBLE',
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  1000000,
  250.0,
  500.0,
  1000.0,
  0.1,
  10.0,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  80,
  12,
  12,
  'BSC',
  'approved',
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  '[{"percentage": 50, "time_description": "TGE (Token Generation Event)"}, {"percentage": 50, "time_description": "1 month after TGE"}]',
  '["0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4"]',
  true,
  true,
  'https://certik.com/projects/nobledefi'
),
(
  'CryptoVault Finance',
  'Next-generation crypto vault with AI-powered portfolio management and automated yield optimization strategies.',
  'https://cryptovault.finance',
  'https://twitter.com/cryptovault',
  'https://t.me/cryptovault',
  'https://cryptovault.finance/whitepaper.pdf',
  'CryptoVault Token',
  'CVT',
  '0x456789abcdef123456789abcdef123456789abcde',
  2000000,
  150.0,
  300.0,
  800.0,
  0.05,
  5.0,
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '9 days',
  75,
  18,
  24,
  'ETH',
  'approved',
  '0x456789abcdef123456789abcdef123456789abcde',
  '[{"percentage": 25, "time_description": "TGE"}, {"percentage": 25, "time_description": "3 months"}, {"percentage": 50, "time_description": "6 months"}]',
  '["0x456789abcdef123456789abcdef123456789abcde", "0x123456789abcdef123456789abcdef123456789a"]',
  true,
  true,
  'https://hacken.io/audits/cryptovault'
),
(
  'MetaSwap DEX',
  'High-performance decentralized exchange with cross-chain capabilities and innovative AMM mechanisms.',
  'https://metaswap.io',
  'https://twitter.com/metaswap',
  'https://t.me/metaswap',
  'https://metaswap.io/docs/whitepaper.pdf',
  'MetaSwap Token',
  'MSP',
  '0xabcdef123456789abcdef123456789abcdef123456',
  5000000,
  400.0,
  750.0,
  1200.0,
  0.2,
  15.0,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '5 days',
  85,
  12,
  18,
  'POLYGON',
  'live',
  '0xabcdef123456789abcdef123456789abcdef123456',
  '[{"percentage": 40, "time_description": "TGE"}, {"percentage": 30, "time_description": "2 months"}, {"percentage": 30, "time_description": "4 months"}]',
  '["0xabcdef123456789abcdef123456789abcdef123456"]',
  true,
  true,
  'https://slowmist.com/security-audit-certificate.html?id=metaswap'
),
(
  'TokenLaunch Pro',
  'Professional token launching platform with built-in marketing tools and community management features.',
  'https://tokenlaunch.pro',
  'https://twitter.com/tokenlaunchpro',
  'https://t.me/tokenlaunchpro',
  'https://tokenlaunch.pro/whitepaper.pdf',
  'TokenLaunch Token',
  'TLP',
  '0x123abc456def789abc123def456abc789def123ab',
  10000000,
  500.0,
  1000.0,
  2000.0,
  0.1,
  20.0,
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '17 days',
  70,
  24,
  36,
  'ARB',
  'pending',
  '0x123abc456def789abc123def456abc789def123ab',
  '[{"percentage": 30, "time_description": "TGE"}, {"percentage": 70, "time_description": "Linear vesting over 12 months"}]',
  '["0x123abc456def789abc123def456abc789def123ab", "0x789def123abc456def789abc123def456abc789d"]',
  false,
  false,
  null
);

-- Insert sample user stakes
INSERT INTO user_stakes (
  user_address,
  staked_amount,
  tier,
  max_allocation,
  last_stake_date,
  total_stakes
) VALUES 
(
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  15000,
  'gold',
  5000,
  NOW(),
  1
),
(
  '0x456789abcdef123456789abcdef123456789abcde',
  7500,
  'silver',
  2500,
  NOW() - INTERVAL '1 day',
  1
),
(
  '0xabcdef123456789abcdef123456789abcdef123456',
  2000,
  'bronze',
  1000,
  NOW() - INTERVAL '2 days',
  1
),
(
  '0x123abc456def789abc123def456abc789def123ab',
  500,
  'none',
  0,
  NOW() - INTERVAL '3 days',
  1
);

-- Insert sample user commitments
INSERT INTO user_commitments (
  presale_id,
  user_address,
  amount,
  token_allocation,
  transaction_hash,
  block_number,
  status,
  confirmed_at
) VALUES 
(
  (SELECT id FROM presales WHERE token_symbol = 'NOBLE'),
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  2.5,
  2500,
  '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789',
  18500000,
  'confirmed',
  NOW() - INTERVAL '1 hour'
),
(
  (SELECT id FROM presales WHERE token_symbol = 'MSP'),
  '0x456789abcdef123456789abcdef123456789abcde',
  1.0,
  1200,
  '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef12',
  18500100,
  'confirmed',
  NOW() - INTERVAL '2 hours'
),
(
  (SELECT id FROM presales WHERE token_symbol = 'MSP'),
  '0xabcdef123456789abcdef123456789abcdef123456',
  0.5,
  600,
  '0x456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789a',
  18500200,
  'confirmed',
  NOW() - INTERVAL '3 hours'
);

-- Insert sample admin actions
INSERT INTO admin_actions (
  admin_address,
  action_type,
  target_id,
  reason,
  notes,
  metadata
) VALUES 
(
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  'approve_presale',
  (SELECT id FROM presales WHERE token_symbol = 'NOBLE'),
  'All requirements met',
  'KYC verified, audit completed, team tokens locked properly',
  '{"project_name": "NobleDeFi Protocol", "previous_status": "pending"}'
),
(
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  'verify_kyc',
  (SELECT id FROM presales WHERE token_symbol = 'CVT'),
  'Documents verified',
  'All team member identities confirmed',
  '{"project_name": "CryptoVault Finance", "verification_method": "manual_review"}'
),
(
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  'verify_audit',
  (SELECT id FROM presales WHERE token_symbol = 'MSP'),
  'Audit report approved',
  'Hacken audit shows no critical issues',
  '{"project_name": "MetaSwap DEX", "audit_firm": "Hacken"}'
);

-- Update presale statistics based on commitments
UPDATE presales SET 
  current_raised = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM user_commitments 
    WHERE presale_id = presales.id AND status = 'confirmed'
  ),
  participant_count = (
    SELECT COUNT(DISTINCT user_address) 
    FROM user_commitments 
    WHERE presale_id = presales.id AND status = 'confirmed'
  );

-- Insert daily statistics
INSERT INTO presale_stats (
  date,
  total_presales,
  active_presales,
  total_raised,
  total_participants,
  pending_presales,
  approved_presales,
  rejected_presales,
  live_presales,
  ended_presales
) VALUES (
  CURRENT_DATE,
  (SELECT COUNT(*) FROM presales),
  (SELECT COUNT(*) FROM presales WHERE status IN ('approved', 'live')),
  (SELECT COALESCE(SUM(current_raised), 0) FROM presales),
  (SELECT COUNT(DISTINCT user_address) FROM user_commitments WHERE status = 'confirmed'),
  (SELECT COUNT(*) FROM presales WHERE status = 'pending'),
  (SELECT COUNT(*) FROM presales WHERE status = 'approved'),
  (SELECT COUNT(*) FROM presales WHERE status = 'rejected'),
  (SELECT COUNT(*) FROM presales WHERE status = 'live'),
  (SELECT COUNT(*) FROM presales WHERE status = 'ended')
);

-- Verify data insertion
SELECT 'Presales inserted: ' || COUNT(*) FROM presales;
SELECT 'User stakes inserted: ' || COUNT(*) FROM user_stakes;
SELECT 'Commitments inserted: ' || COUNT(*) FROM user_commitments;
SELECT 'Admin actions inserted: ' || COUNT(*) FROM admin_actions;

COMMIT;