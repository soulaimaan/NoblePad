# WalletConnect Setup Guide

## Step 1: Create WalletConnect Project

1. **Go to WalletConnect Cloud**: https://cloud.walletconnect.com/
2. **Sign up/Login** with your email or GitHub account
3. **Create New Project**:
   - Click "Create" or "New Project"
   - Enter project name: `NoblePad`
   - Enter project description: `Anti-Rug Token Launchpad`
   - Select "Web App" as platform
4. **Get Project ID**: Copy the Project ID from the dashboard

## Step 2: Update Environment Variables

Replace the placeholder in your `.env.local` file:

```bash
# Replace this line:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=2f05ae7f1116030fde2d36508f472bfb-project-id

# With your real Project ID:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
```

## Step 3: Supported Wallets

Your NoblePad app now supports:

### Ethereum/EVM Wallets:
- **MetaMask** - Browser extension and mobile
- **WalletConnect** - 300+ wallets including:
  - Trust Wallet
  - Rainbow Wallet
  - Coinbase Wallet
  - 1inch Wallet
  - Argent
  - And many more...

### Supported Networks:
- **Ethereum Mainnet**
- **Binance Smart Chain (BSC)**
- **Polygon**
- **Arbitrum**
- **Base**

## Step 4: Testing Wallet Connection

1. **Restart Development Server**: After updating the Project ID
2. **Open**: http://localhost:3001
3. **Click "Connect Wallet"** in the navigation
4. **Select Wallet**: Choose from MetaMask or WalletConnect options
5. **Test Connection**: Verify wallet address appears in navigation

## Features Added:

✅ **Web3Modal Integration** - Beautiful wallet selection modal
✅ **Multiple Wallet Support** - MetaMask, WalletConnect, and more  
✅ **Network Switching** - Support for multiple EVM chains
✅ **Auto-reconnection** - Remembers wallet connection
✅ **Mobile Support** - Works on mobile devices
✅ **Session Management** - Automatic user session creation
✅ **Supabase Integration** - Stores user wallet addresses

## Next Steps:

After setting up WalletConnect, you can:
1. Test wallet connections
2. Set up database schema (users, presales, etc.)
3. Configure additional wallet features
4. Add Solana wallet support