# 🎯 Complete Supabase Setup for NoblePad

## 🚀 Your Backend Setup Options

### Option 1: Automated Setup (Recommended)
```bash
cd noblepad
npm run supabase:setup
```

### Option 2: Manual Step-by-Step
Follow the detailed guide below for complete control.

---

## 📋 Before You Start

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] New Supabase project created
- [ ] Project ID ready (from dashboard URL)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose name: "NoblePad" 
4. Set strong database password
5. Select region close to your users
6. Wait 2 minutes for setup

---

## 🔧 Step-by-Step Manual Setup

### 1. Install and Login
```bash
# Install Supabase CLI
npm install -g supabase

# Login (opens browser)
supabase login

# Verify login
supabase projects list
```

### 2. Link Your Project
```bash
cd noblepad

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID
```

**Find Your Project ID:**
- Dashboard URL: `app.supabase.com/project/[PROJECT_ID]`
- Or: Settings > General > Reference ID

### 3. Deploy Database Schema
```bash
# Deploy all tables and security policies
supabase db push
```

This creates:
- ✅ `presales` table with validation
- ✅ `user_stakes` for tier system
- ✅ `user_commitments` for participation tracking
- ✅ `kyc_documents` for verification
- ✅ `admin_actions` for audit trail
- ✅ `presale_stats` for analytics
- ✅ All Row Level Security policies
- ✅ Functions and triggers

### 4. Deploy Edge Functions
```bash
# Deploy all 6 Edge Functions
supabase functions deploy get-presales
supabase functions deploy get-presale-details  
supabase functions deploy create-presale
supabase functions deploy admin-actions
supabase functions deploy commit-to-presale
supabase functions deploy user-tier
```

### 5. Create Storage
```bash
# Create bucket for KYC documents
supabase storage create kyc-documents --public false
```

### 6. Get Your API Keys
1. Go to Supabase Dashboard
2. Settings > API
3. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 7. Get WalletConnect Project ID
1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create new project
3. Name: "NoblePad"
4. Copy Project ID

### 8. Configure Environment
Update `noblepad/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
```

### 9. Set Supabase Environment Variables
In Supabase Dashboard > Settings > Environment Variables:
```env
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0xYourAdminWallet
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## 🧪 Test Your Setup

### Quick Test
```bash
cd noblepad
node scripts/test-supabase-setup.js
```

### Manual Testing
1. **Database**: Check tables in Supabase Dashboard > Table Editor
2. **Functions**: See them in Dashboard > Edge Functions
3. **Storage**: Verify bucket in Dashboard > Storage
4. **Frontend**: Run `npm run dev` and test at http://localhost:3000

---

## 📊 Add Sample Data (Optional)

### Method 1: SQL Editor
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `scripts/create-sample-data.sql`
3. Run the SQL query
4. Refresh your app to see test data

### Method 2: API Testing
Use Postman or curl to test Edge Functions:
```bash
# Test get-presales
curl "https://your-project.supabase.co/functions/v1/get-presales" \
  -H "apikey: your_anon_key"
```

---

## ✅ Verification Checklist

### Database Verification
- [ ] All 6 tables created
- [ ] Row Level Security enabled
- [ ] Sample data inserted (optional)
- [ ] Triggers and functions working

### Edge Functions Verification
- [ ] All 6 functions deployed
- [ ] Functions respond to requests
- [ ] Authentication working
- [ ] Error handling proper

### Frontend Integration
- [ ] App connects to Supabase
- [ ] Presales page loads
- [ ] Wallet connection works
- [ ] Admin dashboard restricted

### Security Verification
- [ ] RLS policies prevent unauthorized access
- [ ] Admin functions restricted to admin wallets
- [ ] File uploads work securely
- [ ] JWT authentication required where needed

---

## 🎯 Your Complete Three-Tier Architecture

```
┌─────────────────────┐
│   Frontend Layer    │  ← Next.js App (Port 3000)
│   (Presentation)    │  ← Golden Black Theme
└─────────────────────┘
           │ HTTPS/API Calls
           ▼
┌─────────────────────┐
│ Application Logic   │  ← 6 Supabase Edge Functions
│      Tier           │  ← Business Logic & Validation
│   (Edge Functions)  │  ← Authentication & Authorization
└─────────────────────┘
           │ SQL Queries
           ▼
┌─────────────────────┐
│    Data Tier        │  ← Supabase PostgreSQL
│   (Database +       │  ← Row Level Security
│    Storage)         │  ← File Storage
└─────────────────────┘
```

---

## 🚀 Development Workflow

### Daily Development
```bash
# Start everything
npm run dev                    # Frontend (port 3000)
# Supabase runs in cloud

# Check status
supabase status                # Local Supabase status
curl your-functions            # Test Edge Functions
```

### Making Changes
```bash
# Database changes
supabase db push               # Deploy schema changes

# Function changes  
supabase functions deploy FUNCTION_NAME

# Frontend changes
# Just save - hot reload works
```

---

## 🆘 Troubleshooting

### Common Issues & Solutions

#### Database Connection Errors
```bash
# Check project link
supabase status

# Re-link if needed
supabase link --project-ref YOUR_PROJECT_ID

# Check .env.local values
```

#### Edge Functions Not Working
```bash
# Check deployment
supabase functions list

# Check logs
supabase functions logs FUNCTION_NAME

# Redeploy
supabase functions deploy FUNCTION_NAME
```

#### Authentication Issues
- Verify API keys in .env.local
- Check admin addresses format
- Ensure WalletConnect Project ID is correct

#### Frontend Errors
- Check browser console for errors
- Verify environment variables
- Restart dev server: `npm run dev`

---

## 🎉 Success! What's Next?

### Your Backend is Ready With:
✅ **6 Edge Functions** handling all business logic  
✅ **Secure Database** with Row Level Security  
✅ **File Storage** for KYC documents  
✅ **Admin Controls** with audit trails  
✅ **User Tier System** with staking calculations  
✅ **Presale Management** with anti-rug protection  

### Next Steps:
1. **Test All Features**: Browse presales, create projects, use admin dashboard
2. **Customize Branding**: Update colors, logo, content
3. **Add Real Admin Wallets**: Replace test addresses
4. **Deploy to Production**: Use production deployment guide
5. **Go Live**: Your secure launchpad is ready!

### Available Commands:
```bash
npm run dev                    # Start development
npm run test                   # Run tests
npm run build                  # Build for production
supabase functions logs        # Check function logs
supabase db reset             # Reset database (dev only)
```

---

**🎊 Congratulations! Your NoblePad Three-Tier Architecture backend is complete and ready for secure token launches!**