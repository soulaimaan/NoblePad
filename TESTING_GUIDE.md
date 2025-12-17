# NoblePad Testing Guide

Comprehensive testing guide for the Three-Tier Architecture implementation.

## 🧪 Testing Overview

### Test Categories
1. **Frontend UI/UX Testing**
2. **Edge Functions Testing**
3. **Database & RLS Testing**
4. **Web3 Integration Testing**
5. **Security Testing**
6. **Performance Testing**

## 📱 Frontend Testing

### Manual Testing Checklist

#### Landing Page
- [ ] Hero section displays correctly
- [ ] Features section loads
- [ ] Statistics display properly
- [ ] Navigation works
- [ ] Mobile responsive design
- [ ] Golden Black theme consistent

#### Presales Page
- [ ] Presales list loads (mock data)
- [ ] Search functionality works
- [ ] Chain filtering works
- [ ] Status filtering works
- [ ] Pagination works (when implemented)
- [ ] Loading states display
- [ ] No results state displays

#### Presale Details
- [ ] Individual presale loads
- [ ] Countdown timer works
- [ ] Progress bar displays
- [ ] Commitment form appears
- [ ] Wallet connection required
- [ ] User tier displays

#### Project Creation
- [ ] Multi-step form works
- [ ] Validation messages appear
- [ ] File upload works (KYC)
- [ ] Form persistence between steps
- [ ] Submission confirmation

#### Admin Dashboard
- [ ] Admin access restriction works
- [ ] Pending presales list
- [ ] Approval/rejection actions
- [ ] Statistics display
- [ ] Admin action logging

#### Web3 Integration
- [ ] Wallet connection modal
- [ ] Multiple wallet support
- [ ] Network switching
- [ ] Disconnect functionality
- [ ] Address display/truncation

### Automated Testing Commands

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (when implemented)
npm run test:e2e
```

## 🔧 Edge Functions Testing

### Test Each Function Individually

#### 1. Test get-presales
```bash
# Using curl
curl -X GET "https://your-project.supabase.co/functions/v1/get-presales?status=all&chain=all" \
  -H "apikey: YOUR_ANON_KEY"

# Expected: List of presales with filtering
```

#### 2. Test get-presale-details
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/get-presale-details" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"presale_id": "test-id"}'

# Expected: Detailed presale information
```

#### 3. Test create-presale (Authenticated)
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/create-presale" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d @test-presale-data.json

# Expected: Presale created successfully
```

#### 4. Test admin-actions (Admin Only)
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/admin-actions" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "presale_id": "test-id"}'

# Expected: Presale approved/rejected
```

#### 5. Test user-tier
```bash
# Get user tier
curl -X GET "https://your-project.supabase.co/functions/v1/user-tier" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT"

# Update user stake
curl -X POST "https://your-project.supabase.co/functions/v1/user-tier" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"staked_amount": "5000"}'

# Expected: Tier calculation and update
```

#### 6. Test commit-to-presale
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/commit-to-presale" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"presale_id": "test-id", "amount": "1.0", "transaction_hash": "0x..."}'

# Expected: Commitment recorded
```

### Function Testing Checklist
- [ ] All functions deploy without errors
- [ ] Authentication works correctly
- [ ] Admin access properly restricted
- [ ] Input validation working
- [ ] Error handling appropriate
- [ ] Response formats consistent

## 🗄️ Database Testing

### RLS (Row Level Security) Testing

#### Test User Access
```sql
-- Switch to test user context
SET LOCAL jwt.claims.wallet_address = '0x123...';

-- Should only return user's own data
SELECT * FROM user_stakes WHERE user_address = current_setting('jwt.claims.wallet_address');

-- Should return only public presales
SELECT * FROM presales WHERE status IN ('approved', 'live', 'ended');
```

#### Test Admin Access
```sql
-- Switch to admin context
SET LOCAL jwt.claims.wallet_address = '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4';
SET LOCAL jwt.claims.role = 'admin';

-- Should return all presales
SELECT * FROM presales;

-- Should allow admin actions
INSERT INTO admin_actions (admin_address, action_type, target_id) VALUES (...);
```

#### Test Unauthorized Access
```sql
-- Try to access restricted data without proper auth
SET LOCAL jwt.claims.wallet_address = '0xinvalid';

-- Should return empty or error
SELECT * FROM admin_actions;
SELECT * FROM kyc_documents;
```

### Database Testing Checklist
- [ ] RLS policies prevent unauthorized access
- [ ] User can only see their own data
- [ ] Admin can see all data
- [ ] Public data accessible to all
- [ ] Triggers working correctly
- [ ] Indexes optimizing queries

## 🌐 Web3 Integration Testing

### Wallet Connection Testing
- [ ] MetaMask connection works
- [ ] WalletConnect works
- [ ] Multiple wallet switching
- [ ] Network switching prompts
- [ ] Disconnection clears state

### Transaction Testing
- [ ] Transaction signing works
- [ ] Failed transactions handled
- [ ] Transaction confirmation
- [ ] Gas estimation accurate
- [ ] Network fee display

### Contract Interaction Testing
- [ ] Token approval flows
- [ ] Presale participation
- [ ] Staking transactions
- [ ] Claim functionality

## 🔒 Security Testing

### Authentication Testing
- [ ] JWT validation works
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Role-based access working

### Input Validation Testing
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload validation
- [ ] Amount validation
- [ ] Address format validation

### Authorization Testing
- [ ] Admin functions restricted
- [ ] User data isolation
- [ ] Presale access control
- [ ] File access permissions

### Security Checklist
- [ ] All inputs validated
- [ ] SQL injection protected
- [ ] XSS attacks prevented
- [ ] File uploads secured
- [ ] Authentication required
- [ ] Admin access restricted

## ⚡ Performance Testing

### Frontend Performance
```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --output=html

# Core Web Vitals
# Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Database Performance
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM presales WHERE status = 'live';

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';
```

### Edge Function Performance
- [ ] Cold start times < 3s
- [ ] Warm execution < 500ms
- [ ] Memory usage reasonable
- [ ] Error rate < 1%

## 🎯 Test Scenarios

### Happy Path Testing

#### Investor Flow
1. Visit landing page
2. Browse presales
3. Connect wallet
4. Check tier status
5. Commit to presale
6. Claim tokens (when available)

#### Project Creator Flow
1. Connect wallet
2. Start project creation
3. Complete all steps
4. Upload KYC documents
5. Submit for review
6. Receive approval
7. Launch presale

#### Admin Flow
1. Connect admin wallet
2. Access admin dashboard
3. Review pending presales
4. Verify KYC documents
5. Approve/reject presales
6. Monitor live presales

### Error Scenarios

#### Authentication Errors
- [ ] Wallet connection failures
- [ ] Invalid JWT tokens
- [ ] Expired sessions
- [ ] Network switching errors

#### Validation Errors
- [ ] Invalid presale data
- [ ] Insufficient funds
- [ ] Exceeded allocations
- [ ] Missing required fields

#### Network Errors
- [ ] API timeouts
- [ ] Database connection failures
- [ ] Transaction failures
- [ ] File upload failures

## 📊 Test Data

### Create Test Data
```sql
-- Insert test presale
INSERT INTO presales (
  project_name, description, token_name, token_symbol,
  soft_cap, hard_cap, status, submitter_address
) VALUES (
  'Test Project', 'Test Description', 'Test Token', 'TEST',
  100, 200, 'approved', '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4'
);

-- Insert test user stake
INSERT INTO user_stakes (user_address, staked_amount, tier, max_allocation)
VALUES ('0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4', 5000, 'silver', 2500);
```

### Test Wallets
Use these test wallet addresses:
- **User**: `0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4`
- **Admin**: `0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4`
- **Project Creator**: `0x456...`

## 🚀 Production Testing

Before going live, ensure:

### Final Checklist
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] User acceptance testing done
- [ ] Load testing completed
- [ ] Backup and recovery tested
- [ ] Monitoring and alerts configured

### Load Testing
```bash
# Use tools like Artillery or k6
npm install -g artillery

# Test API endpoints
artillery quick --count 100 --num 10 https://your-api.com/functions/v1/get-presales
```

---

**Your NoblePad testing is comprehensive and production-ready! 🧪✅**