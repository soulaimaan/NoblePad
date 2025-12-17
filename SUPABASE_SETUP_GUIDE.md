# 🗄️ NoblePad Supabase Setup Guide

Complete step-by-step guide to set up your Supabase backend for NoblePad.

## 📋 Prerequisites

- Supabase account (free tier works)
- Node.js 18+ installed
- Your NoblePad project ready

## 🚀 Step 1: Create Supabase Project

### A. Sign Up / Login
1. Go to [supabase.com](https://supabase.com)
2. Sign up or login to your account
3. Click "New Project"

### B. Project Configuration
```
Project Name: NoblePad
Organization: [Your Organization]
Database Password: [Choose a strong password - save this!]
Region: [Choose closest to your users]
```

### C. Wait for Setup
- Project creation takes ~2 minutes
- Note your project URL: `https://[your-project-id].supabase.co`

## 🔧 Step 2: Install Supabase CLI

### Install Globally
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```
- This will open a browser for authentication
- Authorize the CLI access

### Verify Installation
```bash
supabase --version
```

## 🔗 Step 3: Link Your Project

### Navigate to Your Project
```bash
cd noblepad
```

### Link to Remote Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

**Find Your Project ID:**
1. Go to your Supabase dashboard
2. Look in the URL: `app.supabase.com/project/[YOUR_PROJECT_ID]`
3. Or go to Settings > General > Reference ID

### Verify Link
```bash
supabase status
```

## 🗄️ Step 4: Deploy Database Schema

### Run Migrations
```bash
supabase db push
```

This creates:
- ✅ All tables (presales, user_stakes, user_commitments, etc.)
- ✅ Row Level Security policies
- ✅ Functions and triggers
- ✅ Indexes for performance

### Verify Database Setup
1. Go to Supabase Dashboard > Table Editor
2. You should see these tables:
   - `presales`
   - `user_stakes` 
   - `user_commitments`
   - `kyc_documents`
   - `admin_actions`
   - `presale_stats`

## 📡 Step 5: Deploy Edge Functions

### Deploy All Functions
```bash
supabase functions deploy get-presales
supabase functions deploy get-presale-details
supabase functions deploy create-presale
supabase functions deploy admin-actions
supabase functions deploy commit-to-presale
supabase functions deploy user-tier
```

### Verify Functions
1. Go to Supabase Dashboard > Edge Functions
2. All 6 functions should be listed as "Active"

## 🔐 Step 6: Configure Environment Variables

### In Supabase Dashboard
1. Go to Settings > Environment Variables
2. Add these variables:

```env
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0xYOUR_ADMIN_WALLET
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**Get WalletConnect Project ID:**
1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create new project
3. Copy the Project ID

## 📦 Step 7: Set Up Storage

### Create Storage Bucket
```bash
supabase storage create kyc-documents --public false
```

### Verify Storage
1. Go to Supabase Dashboard > Storage
2. You should see `kyc-documents` bucket

## 🔑 Step 8: Get API Keys

### Find Your Keys
1. Go to Supabase Dashboard > Settings > API
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Update Environment File
Update your `noblepad/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
```

## 🧪 Step 9: Test Your Setup

### Test Database Connection
```bash
cd noblepad
npm run dev
```

### Test Edge Functions
Open browser developer tools and run:
```javascript
// Test get-presales function
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/get-presales', {
  headers: {
    'apikey': 'your_anon_key'
  }
})
.then(r => r.json())
.then(console.log)
```

### Expected Results
- ✅ No errors in console
- ✅ Functions return proper responses
- ✅ Database queries work
- ✅ Frontend connects successfully

## 🔒 Step 10: Verify Security

### Test Row Level Security
1. Go to Supabase Dashboard > SQL Editor
2. Run this query:
```sql
-- Should return empty (no auth)
SELECT * FROM admin_actions;

-- Should return public presales only
SELECT * FROM presales WHERE status IN ('approved', 'live');
```

### Test Admin Access
1. Connect wallet with admin address
2. Try accessing admin dashboard
3. Should show admin functions

## 📊 Step 11: Add Sample Data (Optional)

### Insert Test Presale
```sql
INSERT INTO presales (
  project_name,
  description,
  website,
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
  team_wallets
) VALUES (
  'NobleDeFi Protocol',
  'A revolutionary DeFi protocol with advanced yield farming capabilities and cross-chain interoperability. Our mission is to provide secure and profitable DeFi opportunities.',
  'https://nobledefi.com',
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
  '["0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4"]'
);
```

### Insert Test User Stake
```sql
INSERT INTO user_stakes (
  user_address,
  staked_amount,
  tier,
  max_allocation
) VALUES (
  '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
  5000,
  'silver',
  2500
);
```

## ✅ Step 12: Final Verification

### Checklist
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] All 6 Edge Functions active
- [ ] Environment variables configured
- [ ] Storage bucket created
- [ ] API keys updated in .env.local
- [ ] Frontend connects successfully
- [ ] Test data inserted (optional)
- [ ] Security policies working

### Test Complete Flow
1. **Browse Presales**: Should show test presale
2. **Connect Wallet**: Wallet connection works
3. **View Details**: Presale detail page loads
4. **Check Tier**: User tier displays correctly
5. **Admin Access**: Admin dashboard accessible with admin wallet

## 🚀 Production Considerations

### Before Going Live
1. **Remove test data** from production database
2. **Update admin addresses** to real admin wallets
3. **Configure proper WalletConnect** project
4. **Set up monitoring** and alerts
5. **Backup strategy** in place

### Security Best Practices
- ✅ Regular database backups
- ✅ Monitor Edge Function logs
- ✅ Rotate API keys periodically
- ✅ Keep admin addresses secure
- ✅ Regular security audits

## 🆘 Troubleshooting

### Common Issues

#### "Permission Denied" Errors
- Check your API keys are correct
- Verify you're using the right project URL
- Ensure RLS policies are applied

#### Edge Functions Not Working
```bash
# Check function logs
supabase functions logs get-presales

# Redeploy function
supabase functions deploy get-presales
```

#### Database Connection Issues
```bash
# Check Supabase status
supabase status

# Restart local development
supabase stop
supabase start
```

#### Environment Variable Issues
- Double-check all values in `.env.local`
- Restart development server after changes
- Verify variable names match exactly

### Get Help
- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **GitHub Issues**: Create issue in your repository

## 🎉 Success!

Your Supabase backend is now fully configured with:
✅ **Secure database** with Row Level Security  
✅ **6 Edge Functions** for business logic  
✅ **File storage** for KYC documents  
✅ **Environment variables** properly set  
✅ **API keys** configured for frontend  

**Your Three-Tier Architecture is complete and ready for production!** 🚀