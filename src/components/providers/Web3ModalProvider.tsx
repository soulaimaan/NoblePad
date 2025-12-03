'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, bsc, polygon, base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSupabase } from './SupabaseProvider'

const queryClient = new QueryClient()

// Get projectId from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Check if projectId is valid (not empty and not a placeholder)
const isValidProjectId = projectId && 
  projectId.length > 0 && 
  !projectId.includes('project-id') && 
  !projectId.includes('placeholder')

if (!isValidProjectId) {
  console.warn('WalletConnect Project ID not found or invalid. Please add a valid NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your environment variables.')
}

// Define the chains
const chains = [mainnet, bsc, polygon, arbitrum, base] as const

// Create Web3Modal config
const metadata = {
  name: 'NoblePad',
  description: 'Anti-Rug Token Launchpad - Secure Token Creation & Trading',
  url: 'https://noblepad.com',
  icons: ['https://noblepad.com/logo.png']
}

const config = defaultWagmiConfig({
  chains,
  projectId: isValidProjectId ? projectId : '1', // Provide fallback ID
  metadata,
  enableWalletConnect: isValidProjectId,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  }
})

// Create modal only if we have a valid project ID
if (isValidProjectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-color-mix': '#00BB7F',
      '--w3m-color-mix-strength': 40,
      '--w3m-accent': '#00BB7F',
      '--w3m-border-radius-master': '10px'
    }
  })
}

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
          
          // Optional: Store user in Supabase
          await supabase.from('users').upsert({
            wallet_address: address.toLowerCase(),
            last_login: new Date().toISOString()
          }, { onConflict: 'wallet_address' })
          
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

export function Web3ModalProvider({ children }: { children: ReactNode }) {
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