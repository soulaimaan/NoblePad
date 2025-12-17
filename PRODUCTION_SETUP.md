# NoblePad Production Setup Guide

Complete guide for deploying NoblePad to production with full Three-Tier Architecture.

## 🏗️ Architecture Overview

```
Frontend (Vercel)
     ↓
Application Logic Tier (Supabase Edge Functions)
     ↓
Data Tier (Supabase Database with RLS)
```

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Vercel account
- WalletConnect account
- Domain name (optional)

## 🚀 Step-by-Step Deployment

### 1. Supabase Setup

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and keys

#### B. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy database schema
supabase db push

# Deploy Edge Functions
chmod +x scripts/deploy-supabase.sh
./scripts/deploy-supabase.sh
```

#### C. Configure Environment Variables
In your Supabase dashboard (Settings > Environment Variables):

```env
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4,0x456...
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### D. Set up Storage
```bash
# Create KYC documents bucket
supabase storage create kyc-documents --public false

# Set up storage policies (automatically done via migrations)
```

### 2. WalletConnect Setup

1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create new project
3. Configure:
   - **Name**: NoblePad
   - **URL**: https://your-domain.com
   - **Description**: Anti-Rug Launchpad. Powered by Trust.
4. Note your Project ID

### 3. Frontend Deployment (Vercel)

#### A. Environment Variables
Create these in Vercel dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Admin (optional)
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
```

#### B. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod

# Or connect GitHub repo for auto-deployment
```

### 4. Domain Setup (Optional)

#### A. Custom Domain
1. In Vercel dashboard, go to your project
2. Settings > Domains
3. Add your custom domain
4. Update DNS records as shown

#### B. Update Configurations
Update these URLs in:
- Supabase Auth settings
- WalletConnect project settings
- Any hardcoded URLs in code

### 5. Security Configuration

#### A. CORS Settings
In Supabase dashboard:
1. Settings > API
2. Add your domain to CORS origins

#### B. RLS Policies
Verify Row Level Security is enabled:
```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### C. Admin Access
Update admin addresses in:
1. Environment variables
2. Database if using admin table
3. Frontend constants

### 6. Testing Production

#### A. Functionality Tests
- [ ] Wallet connection works
- [ ] Presale browsing/filtering
- [ ] Presale creation flow
- [ ] Admin dashboard access
- [ ] KYC document upload
- [ ] User tier calculations

#### B. Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] Admin functions restricted to admin wallets
- [ ] Edge Functions require proper authentication
- [ ] File uploads are secure

#### C. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Database queries optimized
- [ ] Image optimization working
- [ ] Edge Function cold starts acceptable

## 📊 Monitoring & Analytics

### 1. Supabase Analytics
- Monitor database performance
- Track Edge Function usage
- Watch for errors in logs

### 2. Vercel Analytics
- Monitor frontend performance
- Track user interactions
- Monitor build/deployment status

### 3. Custom Monitoring
Consider adding:
- Error tracking (Sentry)
- User analytics (Mixpanel, PostHog)
- Uptime monitoring (UptimeRobot)

## 🔧 Maintenance

### Daily
- Check error logs in Supabase and Vercel
- Monitor presale submissions

### Weekly
- Review admin actions log
- Check database performance metrics
- Update dependencies if needed

### Monthly
- Security review
- Performance optimization
- Backup verification

## 🚨 Troubleshooting

### Common Issues

#### 1. Edge Function Errors
```bash
# Check function logs
supabase functions logs get-presales

# Redeploy specific function
supabase functions deploy get-presales
```

#### 2. Database Connection Issues
```bash
# Check database status
supabase status

# Reset database if needed
supabase db reset
```

#### 3. Authentication Problems
- Verify JWT configuration
- Check admin addresses format
- Ensure WalletConnect project ID is correct

#### 4. Frontend Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Wagmi Docs**: https://wagmi.sh

## 🔐 Security Checklist

- [ ] All sensitive data routes through Edge Functions
- [ ] RLS policies tested and working
- [ ] Admin access properly restricted
- [ ] File uploads sanitized and secured
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Regular security audits scheduled

## 📈 Scaling Considerations

### Database Scaling
- Monitor query performance
- Add indexes for frequent queries
- Consider read replicas for heavy read loads

### Edge Function Scaling
- Monitor cold start times
- Optimize function performance
- Consider function splitting for large operations

### Frontend Scaling
- Use Vercel's CDN
- Optimize images and assets
- Implement caching strategies

---

**Your NoblePad launchpad is ready for production! 🚀**

For support, refer to the troubleshooting section or create an issue in the repository.