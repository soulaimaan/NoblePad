# 🚀 Quick Start: Deploy to Sepolia (5 min)

## Step 1: Get Sepolia ETH

Visit one of these faucets (choose one):
- https://sepoliafaucet.com (recommended)
- https://www.alchemy.com/faucets/ethereum-sepolia

Paste your wallet address and claim ~1 ETH.

**Confirm you have ETH**:
```
https://sepolia.etherscan.io/address/YOUR_ADDRESS
```

---

## Step 2: Get Alchemy/Infura API Key

Choose ONE:

### Option A: Alchemy (Free)
1. Go to https://www.alchemy.com/
2. Sign up (free account)
3. Click "Create app"
4. Select "Sepolia" network
5. Copy the API URL (starts with https://eth-sepolia.g.alchemy.com)

### Option B: Infura (Free)
1. Go to https://infura.io/
2. Sign up (free account)
3. Create project
4. Copy Sepolia endpoint (https://sepolia.infura.io/v3/YOUR_PROJECT_ID)

---

## Step 3: Export Private Key

From MetaMask:
1. Click account icon → Settings
2. Security & Privacy
3. Reveal seed phrase (or private key)
4. Copy private key (starts with 0x)
5. **NEVER share this key!**

---

## Step 4: Create .env File

In `contracts/` folder, create `.env`:

```bash
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# OR use Infura:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

---

## Step 5: Deploy

From `contracts/` folder:

```bash
npm run deploy:sepolia
```

**You should see**:
```
🚀 Deploying NoblePad Contracts to Sepolia...
📝 Deployer Address: 0x...
💰 Balance: X.XX ETH

1️⃣  Deploying TokenLock...
   Tx Hash: 0x...
   ✅ TokenLock: 0x...

2️⃣  Deploying PresaleFactory...
   Tx Hash: 0x...
   ✅ PresaleFactory: 0x...

3️⃣  Deploying Vesting...
   Tx Hash: 0x...
   ✅ Vesting: 0x...

4️⃣  Deploying TreasuryTimelock...
   Tx Hash: 0x...
   ✅ TreasuryTimelock: 0x...

✅ Deployment Complete!
```

---

## Step 6: Save Addresses

Copy the contract addresses and save them:

**File**: `src/lib/contracts.ts`

```typescript
export const CONTRACTS = {
  sepolia: {
    tokenLock: '0x...', // From TokenLock output
    presaleFactory: '0x...', // From PresaleFactory output
    vesting: '0x...', // From Vesting output
    treasuryTimelock: '0x...' // From TreasuryTimelock output
  }
};
```

---

## Step 7: Verify Contracts (Optional but Recommended)

View on Etherscan and verify source code:

```bash
npx hardhat verify --network sepolia 0xTOKEN_LOCK_ADDRESS
npx hardhat verify --network sepolia 0xPRESALE_FACTORY_ADDRESS 0xTOKEN_LOCK_ADDRESS
npx hardhat verify --network sepolia 0xVESTING_ADDRESS 0xDEPLOYER_ADDRESS
npx hardhat verify --network sepolia 0xTREASURY_TIMELOCK_ADDRESS 0xDEPLOYER_ADDRESS
```

Visit: `https://sepolia.etherscan.io/address/0x...` to see verified contracts

---

## Done! ✅

Your contracts are now live on Sepolia testnet. Next steps:

1. Create a test presale using the PresaleFactory
2. Test contributions and refunds
3. Verify token locking works
4. Test vesting schedules
5. Schedule security audit
6. Deploy to mainnet (when ready)

---

## Troubleshooting

**"Error: Missing environment variables"**
→ Create `.env` file with PRIVATE_KEY and SEPOLIA_RPC_URL

**"Error: Deployer has 0 ETH"**
→ Get Sepolia ETH from faucet (link above)

**"Error: Contract artifact not found"**
→ Run `npm run compile` first in contracts/ folder

**"Deployment failed: transaction reverted"**
→ Check account has enough ETH for gas fees

**Transaction stuck?**
→ Wait 30-60 seconds and check Etherscan

---

**Questions?** Check `DEPLOYMENT_GUIDE.md` for full documentation.
