# 🚀 NoblePad Supabase Quickstart

## Get your backend running in 5 minutes!

### 🎯 Quick Setup (Automated)

```bash
cd noblepad
chmod +x scripts/setup-supabase-complete.sh
./scripts/setup-supabase-complete.sh
```

This script will:
1. ✅ Install Supabase CLI (if needed)
2. ✅ Link to your Supabase project
3. ✅ Deploy database schema
4. ✅ Deploy all 6 Edge Functions
5. ✅ Create storage buckets
6. ✅ Configure environment variables
7. ✅ Test your setup

### 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Create Project**: New project in Supabase dashboard
3. **Project ID**: Copy from project settings

### 🔑 What You Need

- **Project ID**: Found in your Supabase dashboard URL
- **Anon Key**: From Settings > API in your Supabase dashboard
- **WalletConnect ID**: Get free one at [cloud.walletconnect.com](https://cloud.walletconnect.com)

### ⚡ Manual Setup (Alternative)

If you prefer step-by-step:

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref YOUR_PROJECT_ID

# 4. Deploy schema
supabase db push

# 5. Deploy functions
supabase functions deploy get-presales
supabase functions deploy get-presale-details
supabase functions deploy create-presale
supabase functions deploy admin-actions
supabase functions deploy commit-to-presale
supabase functions deploy user-tier

# 6. Create storage
supabase storage create kyc-documents --public false

# 7. Update .env.local
# (Use values from your Supabase dashboard)
```

### 🧪 Test Your Setup

```bash
# Test database and functions
node scripts/test-supabase-setup.js

# Start development
npm run dev

# Open in browser
# http://localhost:3000
```

### ✅ Success Indicators

Your setup is working when:
- ✅ All Edge Functions deploy successfully
- ✅ Database tables are visible in Supabase dashboard
- ✅ Test script passes
- ✅ Frontend connects without errors
- ✅ Presales page loads (even with mock data)

### 🔧 Environment Variables

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
```

### 📊 Add Sample Data (Optional)

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `scripts/create-sample-data.sql`
3. Run the SQL
4. Refresh your app to see test presales

### 🆘 Common Issues

**"Permission denied" errors:**
- Check your Supabase project ID
- Verify you're logged into Supabase CLI
- Ensure API keys are correct

**Edge Functions not working:**
- Functions may take a few minutes to be available
- Check Supabase Dashboard > Edge Functions
- Redeploy if needed: `supabase functions deploy FUNCTION_NAME`

**Database connection issues:**
- Verify your .env.local file
- Check Supabase project is running
- Test with: `supabase status`

### 📞 Get Help

- **Supabase Docs**: https://supabase.com/docs
- **Test Script**: Run `node scripts/test-supabase-setup.js`
- **Check Logs**: Supabase Dashboard > Logs

### 🎉 Next Steps

1. **Test Everything**: Browse presales, try creating projects
2. **Customize**: Update admin addresses, branding
3. **Deploy**: Use production deployment guide
4. **Go Live**: Your secure launchpad is ready!

---

**Your Three-Tier Architecture backend is ready in minutes! 🚀**