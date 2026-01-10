'use client'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, bsc, mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { WagmiProvider, http } from 'wagmi'

// 1. Get projectId
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8287752aacc658d5fd512030985c490a'

// 2. Configure Networks
export const networks = [mainnet, bsc, base]

// 3. Configure Transports
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY

const transports = {
  [mainnet.id]: alchemyKey
    ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)
    : infuraKey ? http(`https://mainnet.infura.io/v3/${infuraKey}`) : http('https://eth.llamarpc.com'),

  [bsc.id]: http('https://bsc-dataseed1.binance.org'),
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
    name: 'Belgrave System',
    description: 'Anti-Rug Launchpad',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://belgrave.system',
    icons: ['https://belgrave.system/logo.jpg']
  },
  features: {
    analytics: false, // Disabled for performance
    email: false,
    socials: [],
    onramp: false // Disabled for performance
  },
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false,
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
