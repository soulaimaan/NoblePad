// [v3-unified-fix] Unified Wallet Hook with Multi-Chain Support
import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Connection } from '@solana/web3.js'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'


export function useAccount() {
  const { address, isConnected, chainType } = useUnifiedWallet()
  const wagmiAccount = useWagmiAccount()

  // EVM provider and signer (async)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [rawProvider, setRawProvider] = useState<any>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    let isMounted = true
    async function setupProvider() {
      // ONLY initialize EVM provider/signer if we have a valid EVM address
      if (!address || !address.startsWith('0x') || chainType !== 'evm') {
        if (isMounted) {
          setProvider(null)
          setRawProvider(null)
          setSigner(null)
        }
        return
      }

      try {
        // Use the provider from the active connector to avoid conflicts with multiple wallets (e.g. OKX)
        // This is the most robust way to ensure we only talk to the wallet the user selected
        const connector = wagmiAccount.connector
        if (connector) {
          const raw = await connector.getProvider()
          if (!raw) throw new Error("No provider found from connector")
          
          if (isMounted) {
            setRawProvider(raw)
            const p = new ethers.BrowserProvider(raw as any)
            setProvider(p)
            
            // Attempt signer access
            try {
              const s = await p.getSigner()
              if (isMounted) setSigner(s)
            } catch (signerError) {
              console.warn("Signer access failed:", signerError)
              if (isMounted) setSigner(null)
            }
          }
        } else if (typeof window !== 'undefined' && (window as any).ethereum) {
           // Fallback if no connector but ethereum exists - though wagmi usually should have it
           const raw = (window as any).ethereum
           const p = new ethers.BrowserProvider(raw)
           if (isMounted) {
             setRawProvider(raw)
             setProvider(p)
           }
        }
      } catch (e) {
        console.warn("EVM Provider setup failed (safely handled):", e)
        if (isMounted) {
          setProvider(null)
          setSigner(null)
        }
      }
    }
    setupProvider()
    return () => { isMounted = false }
  }, [address, chainType, wagmiAccount.connector, wagmiAccount.status])

  // Solana connection
  let solanaConnection: Connection | null = null
  // TODO: Add Solana support to UnifiedWalletProvider if needed
  // if (chainType === 'solana') { ... }

  const isActive = isConnected
  
  // Debug log to ensure state changes are seen
  useEffect(() => {
    if (isConnected) {
      console.log('✅ Wallet connected in useAccount:', address)
    }
  }, [isConnected, address])

  return {
    address: address || undefined,
    isConnected: isActive,
    isHydrated: true, // UnifiedProvider ensures client-side rendering
    provider,
    rawProvider,
    signer,
    solana: {
      connection: solanaConnection,
      publicKey: undefined, 
      adapter: null
    },
    isConnecting: false, 
    isDisconnected: !isActive,
    status: isActive ? 'connected' : 'disconnected',
    chain: wagmiAccount.chain,
    chainType: chainType
  }
}

export function useConnect() {
  const { connect } = useUnifiedWallet()

  return {
    connect: async ({ connector }: any) => {
      // Direct unified connect
      await connect('evm')
    },
    connectors: [
      { id: 'metaMask', name: 'MetaMask', type: 'injected' },
    ],
    error: null,
    isLoading: false,
    pendingConnector: null
  }
}

export function useDisconnect() {
  const { disconnect } = useUnifiedWallet()

  return {
    disconnect,
    isLoading: false,
    error: null
  }
}
