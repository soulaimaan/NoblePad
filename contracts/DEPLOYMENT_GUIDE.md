# Smart Contract Deployment Guide

## Status: ✅ All 6 Contracts Compiled Successfully

### Compiled Contracts
- ✅ Presale.sol
- ✅ PresaleFactory.sol  
- ✅ TokenLock.sol
- ✅ Vesting.sol
- ✅ TreasuryTimelock.sol
- ✅ Greeter.sol

**Compiler Version:** solc 0.8.20 (evm target: shanghai)  
**Optimization:** Enabled (viaIR: true, runs: 200)

---

## Deployment to Sepolia Testnet

### Prerequisites

1. **Environment Variables** (`.env` file in `contracts/` folder):
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# OR
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private key of deployer (with Sepolia ETH)
PRIVATE_KEY=0x...

# Etherscan API key for verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

2. **Funding**: Ensure your deployment account has Sepolia ETH
   - Get Sepolia ETH from faucets:
     - https://sepoliafaucet.com
     - https://www.alchemy.com/faucets/ethereum-sepolia

3. **Install ethers.js if using deployment script**:
```bash
npm install --save ethers
```

### Deployment Scripts

#### Option 1: Using Hardhat with Ethers Plugin (Recommended)

1. Install required packages:
```bash
npm install --save-dev @nomicfoundation/hardhat-ethers ethers
```

2. Update `hardhat.config.js`:
```javascript
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';

export default {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

3. Create deployment script (`scripts/deployToSepolia.js`):
```javascript
import hre from 'hardhat';

async function main() {
  console.log('Deploying to Sepolia...');
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Deploy TokenLock
  const TokenLock = await hre.ethers.getContractFactory('TokenLock');
  const tokenLock = await TokenLock.deploy();
  await tokenLock.waitForDeployment();
  console.log('TokenLock:', await tokenLock.getAddress());
  
  // Deploy PresaleFactory
  const PresaleFactory = await hre.ethers.getContractFactory('PresaleFactory');
  const presaleFactory = await PresaleFactory.deploy(await tokenLock.getAddress());
  await presaleFactory.waitForDeployment();
  console.log('PresaleFactory:', await presaleFactory.getAddress());
  
  // Deploy Vesting
  const Vesting = await hre.ethers.getContractFactory('Vesting');
  const vesting = await Vesting.deploy(deployer.address);
  await vesting.waitForDeployment();
  console.log('Vesting:', await vesting.getAddress());
  
  // Deploy TreasuryTimelock
  const TreasuryTimelock = await hre.ethers.getContractFactory('TreasuryTimelock');
  const treasuryTimelock = await TreasuryTimelock.deploy(deployer.address);
  await treasuryTimelock.waitForDeployment();
  console.log('TreasuryTimelock:', await treasuryTimelock.getAddress());
}

main().catch(console.error);
```

4. Deploy:
```bash
npx hardhat run scripts/deployToSepolia.js --network sepolia
```

#### Option 2: Manual Deployment (Using remix.ethereum.org or Etherscan)

1. Copy contract code
2. Go to https://remix.ethereum.org
3. Create file with `.sol` extension
4. Select compiler version 0.8.20
5. Enable optimizer (200 runs)
6. Compile
7. Deploy to Sepolia via MetaMask

### Verification on Etherscan

After deployment, verify contracts to view source code:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example for TokenLock (no constructor args):
npx hardhat verify --network sepolia 0x... 

# Example for Vesting (takes owner address):
npx hardhat verify --network sepolia 0x... "0xOwnerAddress"
```

### Contract Addresses to Save

After deployment, record these addresses in `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  sepolia: {
    tokenLock: '0x...',
    presaleFactory: '0x...',
    vesting: '0x...',
    treasuryTimelock: '0x...'
  }
};
```

---

## Testing Before Mainnet

### Local Testing (Hardhat Network)
```bash
# Start local node
npx hardhat node

# In another terminal, run deployment against local node
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Testing (Sepolia)
1. Deploy all contracts as above
2. Create a test presale
3. Test contribution flows
4. Test token locking
5. Test vesting schedules
6. Test timelock operations

### Gas Estimation
```bash
npx hardhat test --gas-report
```

---

## Post-Deployment Checklist

- [ ] All 4 contracts deployed to Sepolia
- [ ] Contracts verified on Etherscan
- [ ] Addresses recorded in `src/lib/contracts.ts`
- [ ] Test presale created successfully
- [ ] Contributions working
- [ ] Token locking functional
- [ ] Vesting schedule working
- [ ] Security audit scheduled
- [ ] Ready for mainnet deployment

---

## Troubleshooting

### "Insufficient funds" error
- Ensure deployment account has Sepolia ETH
- Get ETH from faucet (link above)
- Check balance: https://sepolia.etherscan.io (paste address)

### "Contract verification failed"
- Ensure Etherscan API key is correct
- Wait 30 seconds after deployment before verifying
- Check contract compilation settings match deployment

### "Transaction reverted"
- Check contract constructor requirements
- Ensure all dependencies are deployed first
- Verify function parameters are correct

---

## Next Steps

1. ✅ Compile contracts locally (DONE)
2. ⏳ Deploy to Sepolia testnet
3. ⏳ Run integration tests
4. ⏳ Security audit
5. ⏳ Mainnet deployment
