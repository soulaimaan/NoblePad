'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { arbitrum, mainnet, bsc, polygon, base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSupabase } from './SupabaseProvider'
import { injected, metaMask } from 'wagmi/connectors'

const queryClient = new QueryClient()

const chains = [mainnet, bsc, polygon, arbitrum, base] as const

// Simple Wagmi config that always works
const config = createConfig({
  chains,
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})

// Auth wrapper component
function AuthWrapper({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { supabase } = useSupabase()

  useEffect(() => {
    if (isConnected && address) {
      // Create/update user session with wallet address
      const createSession = async () => {
        try {
          // In production, implement proper JWT creation with wallet signature verification
          const mockJWT = btoa(JSON.stringify({
            wallet_address: address.toLowerCase(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          }))
          
          // Store JWT for Edge Function calls
          localStorage.setItem('noble_auth_token', mockJWT)
        } catch (error) {
          console.error('Session creation error:', error)
        }
      }
      
      createSession()
    } else {
      // Clear session on disconnect
      localStorage.removeItem('noble_auth_token')
    }
  }, [address, isConnected, supabase])

  return <>{children}</>
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
}