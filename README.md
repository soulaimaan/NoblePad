# NoblePad - Anti-Rug Launchpad

**Powered by Trust. Secured by Design.**

NoblePad is a revolutionary decentralized token launchpad that implements maximum security measures and anti-rug protection through a robust Three-Tier Architecture.

## 🏗️ Architecture

### Three-Tier Security Model
1. **Frontend Layer** - Next.js React application with Web3 integration
2. **Application Logic Tier** - Supabase Edge Functions handling all sensitive operations
3. **Data Tier** - Supabase database with row-level security

## ✨ Features

### 🛡️ Security First
- **Three-Tier Architecture** ensures no direct database access from frontend
- **KYC Verification** required for all project creators
- **Smart Contract Audits** mandatory for all projects
- **Liquidity Locks** minimum 60% for 6+ months
- **Team Token Locks** minimum 12 months
- **Admin Review Process** for all submissions

### 🎯 Anti-Rug Protection
- Mandatory liquidity locking
- Team token vesting schedules
- Community governance features
- Transparent project tracking
- Multi-signature security

### 🥇 Guaranteed Allocations
- **$NPAD Staking Tiers**:
  - Bronze (1,000+ $NPAD): $1,000 allocation
  - Silver (5,000+ $NPAD): $2,500 allocation
  - Gold (10,000+ $NPAD): $5,000 allocation

### 🌟 User Experience
- Modern Golden Black UI design
- Seamless Web3 wallet integration
- Real-time presale tracking
- Mobile-responsive design
- Intuitive project creation flow

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- WalletConnect project ID

### Installation

1. **Clone and Setup**
```bash
git clone <repository>
cd noblepad
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

3. **Start Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## 🏛️ Project Structure

```
noblepad/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # Landing page
│   │   ├── presales/       # Presale listings
│   │   ├── presale/[id]/   # Individual presale
│   │   ├── create/         # Project creation
│   │   └── admin/          # Admin dashboard
│   ├── components/
│   │   ├── layout/         # Navigation, layout
│   │   ├── presale/        # Presale components
│   │   ├── create/         # Creation flow
│   │   ├── admin/          # Admin interface
│   │   ├── web3/           # Wallet integration
│   │   ├── providers/      # Context providers
│   │   ├── sections/       # Page sections
│   │   └── ui/             # Reusable UI components
│   └── lib/
│       └── utils.ts        # Utility functions
```

## 🔒 Security Implementation

### Edge Functions Architecture
All sensitive operations are handled by Supabase Edge Functions:

- **User Authentication**: Wallet-based auth with session management
- **Presale Creation**: Validation and submission processing
- **Admin Actions**: Approval/rejection with audit trails
- **Staking Calculations**: Tier allocation and limits
- **Transaction Handling**: Secure Web3 interaction

### Database Security
- Row Level Security (RLS) enabled
- Admin-only table access
- Encrypted sensitive data
- Audit logging for all actions

## 🎨 Design System

### Golden Black Theme
- **Primary**: Deep black (#000000) backgrounds
- **Accent**: Rich gold (#D4AF37) highlights
- **Gradient**: Noble gold gradient effects
- **Typography**: Clean, modern fonts

### Component Standards
- Consistent `noble-*` CSS classes
- Responsive mobile-first design
- Accessible color contrasts
- Smooth animations and transitions

## 📋 User Flows

### For Investors
1. Connect wallet
2. Browse verified presales
3. Check allocation tier (based on $NPAD staking)
4. Commit to presales
5. Claim tokens after vesting

### For Project Creators
1. Connect wallet
2. Complete multi-step submission:
   - Project information
   - Token details
   - Presale parameters
   - Security documentation
3. Wait for admin review
4. Launch approved presale

### For Admins
1. Connect admin wallet
2. Review pending submissions
3. Validate KYC and audit documents
4. Approve or reject with reasons
5. Monitor live presales

## 🔧 API Integration

### Supabase Edge Functions
Located in `/supabase/functions/`:
- `auth-user` - Wallet authentication
- `create-presale` - Process project submissions
- `get-presales` - Fetch presale data
- `admin-actions` - Handle admin operations
- `user-tier` - Calculate staking tiers

### Web3 Integration
- **Wagmi** for Web3 hooks
- **Web3Modal** for wallet connections
- **Viem** for blockchain interactions
- Multi-chain support (BSC, ETH, Polygon, Arbitrum)

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Supabase Setup
1. Create new Supabase project
2. Run database migrations
3. Deploy Edge Functions
4. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@noblepad.app
- 💬 Telegram: https://t.me/noblepad
- 🐦 Twitter: https://twitter.com/noblepad
- 📖 Documentation: https://docs.noblepad.app

---

**NoblePad** - Where trust meets innovation in decentralized finance.