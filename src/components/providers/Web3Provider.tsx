'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'
import { WagmiProvider, http } from 'wagmi'

// 1. Get projectId
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8287752aacc658d5fd512030985c490a'

// 4. Create AppKit (Singleton state)
let appKitInitialized = false

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [adapter, setAdapter] = useState<any>(null)
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }))
  
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initWeb3 = async () => {
        try {
            // Late dynamic imports to bypass module evaluation errors and Lit conflicts
            const [{ WagmiAdapter }, { mainnet, polygon, optimism, arbitrum, bsc, base, sepolia }, { createAppKit }] = await Promise.all([
                import('@reown/appkit-adapter-wagmi'),
                import('@reown/appkit/networks'),
                import('@reown/appkit/react')
            ])

            const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
            const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY
            const networks = [mainnet, polygon, optimism, arbitrum, bsc, base, sepolia]
            
            // High-performance RPC configuration with failover
            const transports = {
                // Ethereum Mainnet - Alchemy primary, Infura + public fallbacks
                [mainnet.id]: alchemyKey 
                    ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : infuraKey
                    ? http(`https://mainnet.infura.io/v3/${infuraKey}`)
                    : http('https://eth.llamarpc.com'),
                
                // Sepolia Testnet - Alchemy primary, Infura fallback
                [sepolia.id]: alchemyKey
                    ? http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : infuraKey
                    ? http(`https://sepolia.infura.io/v3/${infuraKey}`)
                    : http('https://rpc.sepolia.org'),
                
                // BSC - Multiple high-performance public RPCs
                [bsc.id]: http('https://bsc-dataseed1.binance.org', {
                    retryCount: 3,
                    retryDelay: 150,
                    timeout: 10_000
                }),
                
                // Polygon - Alchemy primary, public fallback
                [polygon.id]: alchemyKey
                    ? http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : http('https://polygon-rpc.com'),
                
                // Optimism - Alchemy primary, public fallback
                [optimism.id]: alchemyKey
                    ? http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : http('https://mainnet.optimism.io'),
                
                // Arbitrum - Alchemy primary, public fallback
                [arbitrum.id]: alchemyKey
                    ? http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : http('https://arb1.arbitrum.io/rpc'),
                
                // Base - Alchemy primary, public fallback
                [base.id]: alchemyKey
                    ? http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`, {
                        retryCount: 3,
                        retryDelay: 150,
                        timeout: 10_000
                    })
                    : http('https://mainnet.base.org'),
            }

            const newAdapter = new WagmiAdapter({
                projectId,
                networks,
                ssr: true,
                transports
            })

            if (!appKitInitialized) {
                createAppKit({
                    adapters: [newAdapter],
                    networks: networks as any,
                    projectId,
                    metadata: {
                        name: 'NoblePad',
                        description: 'The premier decentralized token launchpad with maximum security, anti-rug protection, and guaranteed allocations.',
                        url: typeof window !== 'undefined' ? window.location.origin : 'https://noblepad.com',
                        icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.jpg` : 'https://noblepad.com/logo.jpg']
                    },
                    features: {
                        analytics: true,
                        email: true,
                        socials: ['google', 'x', 'github', 'discord', 'apple'],
                        onramp: true
                    },
                    themeMode: 'dark',
                    themeVariables: {
                        '--w3m-accent': '#D4AF37',
                        '--w3m-color-mix': '#000000',
                        '--w3m-border-radius-master': '1px',
                        '--w3m-font-family': 'Inter, sans-serif'
                    }
                })
                appKitInitialized = true
            }

            setAdapter(newAdapter)
            setMounted(true)
        } catch (err) {
            console.error("Critical Web3 initialization error:", err)
        }
    }

    initWeb3()
  }, [])

  if (!mounted || !adapter) {
    return (
        <div className="min-h-screen bg-noble-black flex items-center justify-center">
             <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-noble-gold border-t-transparent rounded-full animate-spin" />
                <div className="text-noble-gold font-medium tracking-widest text-xs uppercase">Initialising Protocol</div>
             </div>
        </div>
    )
  }

  return (
    <WagmiProvider config={adapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
