'use client'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum, base, bsc, hardhat, mainnet, optimism, polygon, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { WagmiProvider, http } from 'wagmi'

// 1. Get projectId
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8287752aacc658d5fd512030985c490a'

// 2. Configure Networks
export const networks = [mainnet, polygon, optimism, arbitrum, bsc, base, sepolia, hardhat]

// 3. Configure Transports
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY

const transports = {
    [mainnet.id]: alchemyKey 
        ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)
        : infuraKey ? http(`https://mainnet.infura.io/v3/${infuraKey}`) : http('https://eth.llamarpc.com'),
    
    [sepolia.id]: alchemyKey
        ? http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`)
        : infuraKey ? http(`https://sepolia.infura.io/v3/${infuraKey}`) : http('https://rpc.sepolia.org'),
    
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [polygon.id]: alchemyKey ? http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`) : http('https://polygon-rpc.com'),
    [optimism.id]: alchemyKey ? http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`) : http('https://mainnet.optimism.io'),
    [arbitrum.id]: alchemyKey ? http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`) : http('https://arb1.arbitrum.io/rpc'),
    [base.id]: alchemyKey ? http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`) : http('https://mainnet.base.org'),
}

// 4. Create Adapter
export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    transports,
    ssr: false
})

// 5. Create AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks: networks as any,
    projectId,
    metadata: {
        name: 'Noblepad',
        description: 'Anti-Rug Launchpad',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://noblepad.netlify.app', 
        icons: ['https://noblepad.com/logo.jpg']
    },
    features: {
        analytics: true,
        email: false, // Disabled to prevent localhost auth errors
        socials: [], // Disabled to prevent localhost auth errors
        onramp: true
    },
    enableInjected: false, // Remove "Browser Wallet"
    enableEIP6963: false, // Remove specific injected wallets like MetaMask
    enableCoinbase: false, // Remove Coinbase Wallet
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#D4AF37',
        '--w3m-color-mix': '#000000',
        '--w3m-border-radius-master': '1px',
        '--w3m-font-family': 'Inter, sans-serif'
    }
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }))

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
