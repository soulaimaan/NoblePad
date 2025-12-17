'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface WalletState {
  isConnected: boolean
  address: string | null
  chain: string | null
  walletType: string | null
}

interface Web3ContextType {
  wallet: WalletState
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  isLoading: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function SimpleWeb3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chain: null,
    walletType: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setWallet({
            isConnected: true,
            address: accounts[0],
            chain: getChainName(chainId),
            walletType: getWalletType()
          })
        }
      }
    } catch (error) {
      console.error('Error checking existing connection:', error)
    }
  }

  const getWalletType = () => {
    if (window.ethereum?.isMetaMask) return 'MetaMask'
    if (window.ethereum?.isTrust) return 'Trust Wallet'
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet'
    return 'Injected Wallet'
  }

  const getChainName = (chainId: string) => {
    switch (chainId) {
      case '0x1': return 'Ethereum'
      case '0x38': return 'BSC'
      case '0x89': return 'Polygon'
      case '0xa4b1': return 'Arbitrum'
      case '0x2105': return 'Base'
      default: return 'Unknown'
    }
  }

  const connect = async (walletType: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (walletType === 'phantom') {
        await connectPhantom()
      } else {
        await connectEthereum(walletType)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const connectPhantom = async () => {
    const phantom = window.solana || window.phantom?.solana
    
    if (!phantom || !phantom.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom.')
    }

    try {
      // Check if already connected
      if (phantom.isConnected) {
        const response = await phantom.connect({ onlyIfTrusted: true })
        setWallet({
          isConnected: true,
          address: response.publicKey.toString(),
          chain: 'Solana',
          walletType: 'Phantom'
        })
        return
      }

      // Request new connection
      const response = await phantom.connect()
      setWallet({
        isConnected: true,
        address: response.publicKey.toString(),
        chain: 'Solana',
        walletType: 'Phantom'
      })
    } catch (error: any) {
      console.error('Phantom connection error:', error)
      
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection in Phantom.')
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user')
      }
      
      throw new Error(`Phantom connection failed: ${error.message || 'Unknown error'}`)
    }
  }

  const connectEthereum = async (walletType: string) => {
    if (!window.ethereum) {
      throw new Error(`${walletType} not found. Please install the wallet extension.`)
    }

    // Import debug utility
    const { debugWallet, testMetaMaskConnection } = await import('../../utils/walletDebug')
    
    try {
      debugWallet() // Log current state
      
      // Use our test function which handles MetaMask quirks
      const accounts = await testMetaMaskConnection()
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available. Please unlock your wallet and try again.')
      }

      // Get the current chain
      let chainId
      try {
        chainId = await window.ethereum.request({ method: 'eth_chainId' })
      } catch (chainError) {
        console.warn('Could not get chain ID, using default')
        chainId = '0x1' // Default to Ethereum mainnet
      }
      
      setWallet({
        isConnected: true,
        address: accounts[0],
        chain: getChainName(chainId),
        walletType: getWalletType()
      })

    } catch (error: any) {
      console.error('Ethereum connection error:', error)
      
      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection in your wallet.')
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check your wallet for a popup.')
      } else if (error.code === -32603) {
        throw new Error('Internal wallet error. Please try refreshing the page.')
      } else if (error.code === -32000) {
        throw new Error('Wallet is locked. Please unlock your wallet and try again.')
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user')
      } else if (error.message?.includes('Already processing')) {
        throw new Error('Connection already in progress. Please wait.')
      } else if (error.message?.includes('Request of type')) {
        throw new Error('Wallet is busy. Please wait a moment and try again.')
      }
      
      throw new Error(`Please unlock your wallet and try again. (${error.message || 'Unknown error'})`)
    }
  }

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      chain: null,
      walletType: null
    })
    setError(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => ({ ...prev, chain: getChainName(chainId) }))
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value = {
    wallet,
    connect,
    disconnect,
    isLoading,
    error
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useSimpleWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useSimpleWeb3 must be used within a SimpleWeb3Provider')
  }
  return context
}