# Frontend Integration Guide

## Overview

After contracts are deployed to Sepolia, integrate them into the NoblePad frontend for:
- Creating presales
- Participating in presales
- Managing token locks
- Tracking vesting schedules

---

## Step 1: Update Contract Addresses

**File**: `src/lib/contracts.ts`

```typescript
export const CONTRACTS = {
  sepolia: {
    presaleFactory: '0x...', // From deploy output
    tokenLock: '0x...',
    vesting: '0x...',
    treasuryTimelock: '0x...'
  },
  // Add other chains as deployed
};

export const CURRENT_NETWORK = 'sepolia'; // Change for mainnet
```

---

## Step 2: Create Contract Interaction Hooks

**File**: `src/hooks/usePresaleFactory.ts`

```typescript
import { useContract } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACTS, CURRENT_NETWORK } from '@/lib/contracts';

export function usePresaleFactory() {
  const address = CONTRACTS[CURRENT_NETWORK].presaleFactory;
  
  // Import ABI from compiled contracts
  const abi = [ /* PresaleFactory ABI */ ];
  
  return useContract({
    address,
    abi,
    functionName: 'createPresale'
  });
}
```

---

## Step 3: Create Presale Form

**File**: `src/app/presales/create/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import presaleFactoryAbi from '@/abis/PresaleFactory.json';

export default function CreatePresalePage() {
  const [formData, setFormData] = useState({
    token: '',
    router: '',
    softCap: '',
    hardCap: '',
    presaleRate: '',
    listingRate: '',
    liquidityPercent: '60',
    maxSpendPerBuyer: '',
    lockDays: '365',
  });

  const { write: createPresale } = useContractWrite({
    address: CONTRACTS.sepolia.presaleFactory as `0x${string}`,
    abi: presaleFactoryAbi,
    functionName: 'createPresale',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + (7 * 24 * 60 * 60); // 7 days
    const lockPeriod = parseInt(formData.lockDays) * 24 * 60 * 60;
    
    createPresale({
      args: [
        formData.token,
        formData.router,
        BigInt(formData.softCap),
        BigInt(formData.hardCap),
        BigInt(formData.presaleRate),
        BigInt(formData.listingRate),
        BigInt(formData.liquidityPercent),
        BigInt(startTime),
        BigInt(endTime),
        BigInt(lockPeriod),
        BigInt(formData.maxSpendPerBuyer),
        BigInt('0') // initialLiquidity
      ]
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Presale</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Project Token Address
          </label>
          <input
            type="text"
            required
            value={formData.token}
            onChange={(e) => setFormData({...formData, token: e.target.value})}
            className="w-full px-3 py-2 border rounded"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Uniswap Router Address
          </label>
          <input
            type="text"
            required
            value={formData.router}
            onChange={(e) => setFormData({...formData, router: e.target.value})}
            className="w-full px-3 py-2 border rounded"
            placeholder="0x..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Soft Cap (ETH)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.softCap}
              onChange={(e) => setFormData({...formData, softCap: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Hard Cap (ETH)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.hardCap}
              onChange={(e) => setFormData({...formData, hardCap: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Presale Rate (tokens/ETH)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.presaleRate}
              onChange={(e) => setFormData({...formData, presaleRate: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Listing Rate (tokens/ETH)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.listingRate}
              onChange={(e) => setFormData({...formData, listingRate: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Liquidity Lock Days (minimum 365)
          </label>
          <input
            type="number"
            required
            min="365"
            value={formData.lockDays}
            onChange={(e) => setFormData({...formData, lockDays: e.target.value})}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
        >
          Create Presale
        </button>
      </form>
    </div>
  );
}
```

---

## Step 4: Create Presale Participation UI

**File**: `src/app/presales/[id]/participate/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useContractRead, useContractWrite, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import presaleAbi from '@/abis/Presale.json';
import { formatEther, parseEther } from 'ethers';

interface PresaleDetailProps {
  params: {
    id: string;
  };
}

export default function PresaleDetailPage({ params }: PresaleDetailProps) {
  const { address } = useAccount();
  const [contribution, setContribution] = useState('0');
  
  const presaleAddress = params.id as `0x${string}`;

  // Fetch presale details
  const { data: presaleData } = useContractRead({
    address: presaleAddress,
    abi: presaleAbi,
    functionName: 'getPresaleDetails',
  });

  // Fetch user's contribution
  const { data: userContribution } = useContractRead({
    address: presaleAddress,
    abi: presaleAbi,
    functionName: 'contributions',
    args: [address],
    enabled: !!address,
  });

  // Contribute to presale
  const { write: contribute, isLoading: isContributing } = useContractWrite({
    address: presaleAddress,
    abi: presaleAbi,
    functionName: 'contribute',
  });

  const handleContribute = () => {
    if (!contribution || parseFloat(contribution) <= 0) return;
    
    contribute({
      value: parseEther(contribution),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Presale Details</h1>

      {presaleData && (
        <div className="bg-gray-900 rounded-lg p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Soft Cap</p>
              <p className="text-xl font-bold text-yellow-500">
                {formatEther(presaleData.softCap)} ETH
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hard Cap</p>
              <p className="text-xl font-bold text-yellow-500">
                {formatEther(presaleData.hardCap)} ETH
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Presale Rate</p>
              <p className="text-xl font-bold">
                {presaleData.presaleRate.toString()} tokens/ETH
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Liquidity %</p>
              <p className="text-xl font-bold">
                {presaleData.liquidityPercent.toString()}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Participate</h2>

        {userContribution && (
          <div>
            <p className="text-gray-400 text-sm">Your Contribution</p>
            <p className="text-lg font-bold text-green-500">
              {formatEther(userContribution)} ETH
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Contribution Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className="w-full px-3 py-2 border rounded bg-gray-800 text-white"
            placeholder="0.1"
          />
        </div>

        <button
          onClick={handleContribute}
          disabled={isContributing || !contribution || parseFloat(contribution) <= 0}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded"
        >
          {isContributing ? 'Processing...' : 'Contribute'}
        </button>
      </div>
    </div>
  );
}
```

---

## Step 5: Extract Contract ABIs

After deployment, copy ABIs from compiled contracts:

**Location**: `contracts/artifacts/contracts/`

Create: `src/abis/`

```bash
# Copy from contracts folder
cp contracts/artifacts/contracts/PresaleFactory.sol/PresaleFactory.json src/abis/
cp contracts/artifacts/contracts/Presale.sol/Presale.json src/abis/
cp contracts/artifacts/contracts/TokenLock.sol/TokenLock.json src/abis/
cp contracts/artifacts/contracts/Vesting.sol/Vesting.json src/abis/
```

Or manually extract the `abi` field from each artifact JSON file.

---

## Step 6: Display Presales List

**File**: `src/app/presales/page.tsx`

```typescript
'use client';

import { useContractRead } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import presaleFactoryAbi from '@/abis/PresaleFactory.json';
import Link from 'next/link';

export default function PresalesPage() {
  // Fetch all presales created
  const { data: presales } = useContractRead({
    address: CONTRACTS.sepolia.presaleFactory as `0x${string}`,
    abi: presaleFactoryAbi,
    functionName: 'getAllPresales',
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Active Presales</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presales?.map((presale: any, index: number) => (
          <Link
            key={index}
            href={`/presales/${presale.presaleAddress}`}
            className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-bold mb-2">{presale.name || `Presale #${index + 1}`}</h2>
            <p className="text-gray-400 text-sm mb-4">{presale.description || 'No description'}</p>
            
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-400">Status:</span>{' '}
                <span className="font-bold">Active</span>
              </p>
              <p>
                <span className="text-gray-400">Hard Cap:</span>{' '}
                <span className="font-bold">{presale.hardCap} ETH</span>
              </p>
            </div>

            <button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
              Participate →
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 7: Add Navigation

**File**: `src/app/layout.tsx` (Navigation section)

```typescript
<nav className="flex space-x-4">
  <Link href="/presales" className="hover:text-yellow-500">
    Presales
  </Link>
  <Link href="/presales/create" className="hover:text-yellow-500">
    Create Presale
  </Link>
  <Link href="/dashboard" className="hover:text-yellow-500">
    Dashboard
  </Link>
</nav>
```

---

## Step 8: Setup WalletConnect/MetaMask

**File**: `src/app/providers.tsx`

```typescript
'use client';

import { WagmiConfig, createConfig, sepolia } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector(),
    new WalletConnectConnector({
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      },
    }),
  ],
  publicClient: publicProvider(),
  chains: [sepolia],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
```

---

## Step 9: Environment Variables

**File**: `.env.local`

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_NETWORK=sepolia
```

---

## Step 10: Testing

After implementing:

1. ✅ Connect wallet with MetaMask
2. ✅ Navigate to "Create Presale"
3. ✅ Fill form and submit
4. ✅ Confirm transaction in MetaMask
5. ✅ Wait for confirmation
6. ✅ See presale appear in list
7. ✅ Click presale and contribute
8. ✅ Verify transaction recorded

---

## Common Issues & Fixes

### "Contract not found at address"
- Check `src/lib/contracts.ts` has correct deployed address
- Verify address is for Sepolia network

### "Transaction reverted"
- Check you have Sepolia ETH
- Verify form inputs are valid
- Check gas limits

### "Contract ABI mismatch"
- Re-export ABIs from latest compiled contracts
- Check ABI version matches contract version

### "User not connected to Sepolia"
- Add Sepolia network to MetaMask
- Or use WalletConnect to auto-connect

---

## Next Steps

1. Deploy contracts to Sepolia (see QUICK_DEPLOY.md)
2. Copy deployed addresses to `src/lib/contracts.ts`
3. Implement this integration
4. Test all flows end-to-end
5. Deploy frontend to production

---

**Questions?** Check full guide at `contracts/DEPLOYMENT_GUIDE.md`
