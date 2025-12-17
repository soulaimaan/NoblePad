// Compatibility hook to bridge vanilla provider with existing wagmi hook usage
import { useVanillaWeb3 } from '@/components/providers/VanillaWeb3Provider'
import { getChainById } from '@/lib/chains'
import { Connection, PublicKey } from '@solana/web3.js'
import { ethers } from 'ethers'

import { useEffect, useState } from 'react'

export function useAccount() {
  const { wallet } = useVanillaWeb3()

  // EVM provider and signer (async)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    let isMounted = true
    async function setupProvider() {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const p = new ethers.BrowserProvider((window as any).ethereum)
          if (isMounted) setProvider(p)
          try {
            const s = await p.getSigner()
            if (isMounted) setSigner(s)
          } catch (e) {
            if (isMounted) setSigner(null)
          }
        } catch (e) {
          if (isMounted) {
            setProvider(null)
            setSigner(null)
          }
        }
      } else {
        if (isMounted) {
          setProvider(null)
          setSigner(null)
        }
      }
    }
    setupProvider()
    return () => { isMounted = false }
  }, [wallet.address, wallet.chainId])

  // Solana connection
  let solanaConnection: Connection | null = null
  if (wallet.chainId === 'solana') {
    try {
      solanaConnection = new Connection('https://api.mainnet-beta.solana.com')
    } catch (e) {
      solanaConnection = null
    }
  }

  return {
    address: wallet.address as `0x${string}` | string | undefined,
    isConnected: wallet.isConnected,
    provider,
    signer,
    solana: {
      connection: solanaConnection,
      publicKey: wallet.address ? new PublicKey(wallet.address) : undefined,
      adapter: typeof window !== 'undefined' ? ((window as any).solana || (window as any).phantom?.solana || null) : null
    },
    isConnecting: false,
    isDisconnected: !wallet.isConnected,
    status: wallet.isConnected ? 'connected' : 'disconnected',
    chain: wallet.chainId ? parseChain(wallet.chainId) : undefined
  }
}

export function useConnect() {
  const { connectMetaMask, connectPhantom } = useVanillaWeb3()

  return {
    connect: async ({ connector }: any) => {
      if (connector?.id === 'metaMask' || connector?.name?.includes('MetaMask')) {
        await connectMetaMask()
      } else if (connector?.id === 'phantom' || connector?.name?.toLowerCase?.().includes('phantom')) {
        await connectPhantom()
      }
    },
    connectors: [
      { id: 'metaMask', name: 'MetaMask', type: 'injected' },
      { id: 'phantom', name: 'Phantom', type: 'solana' }
    ],
    error: null,
    isLoading: false,
    pendingConnector: null
  }
}

export function useDisconnect() {
  const { disconnect } = useVanillaWeb3()

  return {
    disconnect,
    isLoading: false,
    error: null
  }
}

function parseChain(chainId: string) {
  // EVM hex chain ids such as '0x1' or decimal strings for solana
  if (chainId === 'solana') return { id: 'solana', name: 'Solana' }
  try {
    if (chainId.startsWith('0x')) {
      const id = parseInt(chainId, 16)
      const chain = getChainById(id)
      return chain ? { id: chain.id, name: chain.name } : { id, name: `Chain ${id}` }
    }
    const parsed = parseInt(chainId, 10)
    const chain = getChainById(parsed)
    return chain ? { id: chain.id, name: chain.name } : { id: parsed, name: `Chain ${parsed}` }
  } catch (e) {
    return { id: chainId, name: 'Unknown' }
  }
}