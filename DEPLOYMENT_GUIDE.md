# NoblePad Deployment Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd noblepad
npm install --legacy-peer-deps
```

### 2. Environment Setup
Copy `.env.local` and configure:
```bash
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Required: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Optional: Admin Configuration
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
```

### 3. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

## 🏗️ Supabase Setup (Required)

### Database Tables

1. **presales** table:
```sql
CREATE TABLE presales (
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'live', 'ended')),
  submitter_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **user_commitments** table:
```sql
CREATE TABLE user_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presale_id UUID REFERENCES presales(id),
  user_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. **user_stakes** table:
```sql
CREATE TABLE user_stakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT UNIQUE NOT NULL,
  staked_amount DECIMAL DEFAULT 0,
  tier TEXT DEFAULT 'none',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Edge Functions

Deploy these Edge Functions to Supabase:

1. **get-presales** - Fetch presale data
2. **create-presale** - Handle presale creation
3. **admin-actions** - Admin approval/rejection
4. **user-tier** - Calculate user tiers
5. **commit-to-presale** - Handle presale commitments

### Row Level Security (RLS)
Enable RLS on all tables and create appropriate policies.

## 🔐 Security Configuration

### Admin Access
Add admin wallet addresses to the `ADMIN_ADDRESSES` environment variable.

### Web3 Integration
1. Get WalletConnect Project ID from https://cloud.walletconnect.com/
2. Configure supported networks in `src/components/providers/Web3Provider.tsx`

## 🎨 Customization

### Branding
- Replace logo in `src/components/layout/Navigation.tsx`
- Update color scheme in `tailwind.config.js`
- Add favicon to `public/favicon.ico`

### Features
- Modify tier requirements in `src/lib/utils.ts`
- Adjust vesting schedules in presale creation
- Update supported chains in Web3Provider

## 📱 Mobile Support
The application is fully responsive and mobile-optimized.

## 🔍 Testing

### Manual Testing Checklist
- [ ] Wallet connection works
- [ ] Presale browsing/filtering
- [ ] Presale detail pages load
- [ ] Project creation flow
- [ ] Admin dashboard (with admin wallet)

### E2E Testing
```bash
npm run test:e2e
```

## 🌐 Production Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Other Platforms
- Netlify: Configure build settings
- Railway: Connect GitHub repo
- AWS/Azure: Use container deployment

### Environment Variables
Ensure all production environment variables are set:
- Supabase production URLs
- Real WalletConnect Project ID
- Production admin addresses

## 🔧 Troubleshooting

### Common Issues
1. **Dependency conflicts**: Use `--legacy-peer-deps`
2. **Supabase errors**: Check API keys and URLs
3. **Web3 connection**: Verify WalletConnect Project ID
4. **Build failures**: Check TypeScript errors

### Support
- Check console logs for errors
- Verify environment variables
- Test with different wallets
- Ensure Supabase functions are deployed

---

Your NoblePad launchpad is ready! 🚀