# NoblePad Quick Start Guide ⚡

Get your NoblePad launchpad running in under 10 minutes!

## 🚀 One-Command Setup

```bash
# Clone and setup everything
git clone <your-repo-url> noblepad
cd noblepad
npm run setup:dev
```

This will:
- ✅ Install all dependencies
- ✅ Start local Supabase
- ✅ Run database migrations
- ✅ Create environment files
- ✅ Start development server

## 📋 Manual Setup (Alternative)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo
```

### 3. Start Supabase
```bash
npm run supabase:start
```

### 4. Start Development
```bash
npm run dev
```

## 🎯 Quick Demo

### Test the Application
1. **Landing Page**: http://localhost:3000
2. **Browse Presales**: Click "Explore Presales"
3. **Connect Wallet**: Use any Web3 wallet
4. **Create Project**: Click "Launch Your Project"
5. **Admin Access**: Use admin wallet address

### Demo Accounts
- **Admin**: `0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4`
- **User**: Any connected wallet address

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Reset database
npm run supabase:reset

# Deploy to Supabase
npm run deploy:supabase
```

## 📱 Test Scenarios

### 1. Browse Presales
- Filter by chain (BSC, ETH, Polygon)
- Filter by status (Live, Upcoming, Ended)
- Search by project name

### 2. Create Presale
- Fill out project information
- Configure token details
- Set presale parameters
- Upload KYC documents (mock)

### 3. Admin Functions
- Connect with admin wallet
- Review pending presales
- Approve/reject projects
- Monitor statistics

## 🎨 Customization

### Update Branding
1. **Logo**: Replace in `src/components/layout/Navigation.tsx`
2. **Colors**: Modify `tailwind.config.js`
3. **Content**: Update text in page components

### Add Features
1. **New Page**: Create in `src/app/your-page/page.tsx`
2. **New Component**: Add to `src/components/`
3. **New API**: Create Edge Function in `supabase/functions/`

## 🚀 Production Deployment

### Quick Deploy to Vercel
```bash
npm run build
npx vercel --prod
```

### Deploy to Supabase
```bash
npm run deploy:supabase
```

See `PRODUCTION_SETUP.md` for complete production guide.

## 🆘 Troubleshooting

### Common Issues

#### Dependencies Error
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Supabase Not Starting
```bash
npm run supabase:stop
npm run supabase:start
```

#### Build Errors
```bash
npm run lint
npm run build
```

#### Database Issues
```bash
npm run supabase:reset
```

### Get Help
- 📖 Check `TESTING_GUIDE.md` for detailed testing
- 📋 See `PRODUCTION_SETUP.md` for deployment
- 🔧 Review `DEPLOYMENT_GUIDE.md` for configuration

## ✅ Success Indicators

Your setup is working when:
- ✅ Landing page loads at http://localhost:3000
- ✅ Presales page shows mock data
- ✅ Wallet connection modal appears
- ✅ Create presale form works
- ✅ Admin dashboard restricts access

## 🎉 Next Steps

1. **Customize Branding**: Update colors, logo, content
2. **Configure Production**: Set up Supabase project
3. **Deploy**: Use Vercel for frontend, Supabase for backend
4. **Go Live**: Launch your secure token launchpad!

---

**Your NoblePad is ready! Start building the future of secure token launches! 🚀**