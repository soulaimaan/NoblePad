# 🪟 Windows Setup Guide for NoblePad

Since the Supabase CLI installation is having issues, let's set up your backend using the web interface - this is actually easier and more reliable!

## 🚀 Quick Web-Based Setup (No CLI Required)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and click "New Project"
3. Name: **NoblePad**
4. Choose strong password for database
5. Select region close to you
6. Wait ~2 minutes for setup

### Step 2: Set Up Database Schema
1. Go to your project dashboard
2. Click **SQL Editor** in the sidebar
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **RUN** to create all tables

Then repeat with:
1. Copy contents of `supabase/migrations/002_row_level_security.sql` 
2. Click **RUN** to set up security policies

### Step 3: Set Up Edge Functions (Optional for now)
We'll configure these later. Your app will work with mock data for testing.

### Step 4: Configure Your Environment
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Update your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo
ADMIN_ADDRESSES=0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4
\`\`\`

### Step 5: Add Sample Data (Optional)
1. In **SQL Editor**, copy contents of `scripts/create-sample-data.sql`
2. Click **RUN** to add test presales and users

### Step 6: Test Your Setup
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000 - you should see:
- ✅ Beautiful landing page loads
- ✅ Presales page shows data (if you added sample data)
- ✅ Wallet connection works
- ✅ No console errors

## 🎯 What Works Right Now

Even without Edge Functions, you have:
- ✅ **Complete Frontend**: All pages and components
- ✅ **Database**: Secure schema with sample data
- ✅ **Web3 Integration**: Wallet connection and multi-chain support
- ✅ **Golden Black Theme**: Premium design system
- ✅ **Mobile Responsive**: Works on all devices

## 🔄 Adding Edge Functions Later

When ready for production:
1. Install Supabase CLI using different method
2. Deploy Edge Functions for full backend functionality
3. Switch from mock data to real API calls

## 🎊 You're Ready to Demo!

Your NoblePad is working with:
- Beautiful UI/UX with Golden Black theme
- Database backend with security
- Sample presales and user data
- Web3 wallet integration
- Admin dashboard (restricted access)

**Start developing:** `npm run dev` 🚀