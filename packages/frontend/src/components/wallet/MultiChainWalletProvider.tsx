'use client'

import React, { ReactNode } from 'react'
import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { wagmiConfig, chains } from '@/lib/web3/wagmi-config'

// Solana wallet adapters
const wallets = [
  new PhantomWalletAdapter(),
]

const solanaEndpoint = clusterApiUrl('devnet') // Use mainnet in production

interface MultiChainWalletProviderProps {
  children: ReactNode
}

/**
 * Unified wallet provider that supports both EVM and Solana chains
 */
export function MultiChainWalletProvider({ children }: MultiChainWalletProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        <ConnectionProvider endpoint={solanaEndpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}