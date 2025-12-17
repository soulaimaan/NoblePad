'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: string | null
  walletType: string | null
}

interface VanillaWeb3ContextType {
  wallet: WalletState
  connectMetaMask: () => Promise<void>
  connectPhantom: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
  error: string | null
}

const VanillaWeb3Context = createContext<VanillaWeb3ContextType | undefined>(undefined)

export function VanillaWeb3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    walletType: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle wallet extension conflicts
  useEffect(() => {
    const handleEthereumError = (event: any) => {
      if (event.error?.message?.includes('Cannot redefine property: ethereum')) {
        console.warn('⚠️ Multiple wallet extensions detected. Using MetaMask as primary.')
        event.preventDefault()
        return true
      }
    }

    window.addEventListener('error', handleEthereumError)
    return () => window.removeEventListener('error', handleEthereumError)
  }, [])

  // Check for existing connection on page load
  useEffect(() => {
    checkExistingConnections()
    setupEventListeners()
  }, [])

  const checkExistingConnections = async () => {
    try {
      console.log('🔍 Checking for existing connections...')
      // Check Ethereum wallets
      if (window.ethereum) {
        console.log('🔍 Ethereum provider detected, checking accounts...')
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        console.log('📋 Found accounts:', accounts)
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          console.log('✅ Auto-connecting to existing session:', accounts[0])
          setWallet({
            isConnected: true,
            address: accounts[0],
            chainId,
            walletType: detectWalletType()
          })
        } else {
          console.log('ℹ️ No accounts found - user needs to connect')
        }
      } else {
        console.log('⚠️ No Ethereum provider detected')
      }
    } catch (error) {
      console.log('❌ Error checking existing connections:', error)
    }
  }

  const setupEventListeners = () => {
    if (window.ethereum) {
      console.log('🎧 Setting up MetaMask event listeners...')

      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 Accounts changed:', accounts)
        if (accounts.length === 0) {
          console.log('🔌 User disconnected from MetaMask')
          setWallet({
            isConnected: false,
            address: null,
            chainId: null,
            walletType: null
          })
        } else {
          console.log('👤 User switched accounts:', accounts[0])
          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true
          }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log('⛓️ Chain changed to:', chainId)
        setWallet(prev => ({
          ...prev,
          chainId
        }))
        // Reload the page when chain changes to avoid issues
        window.location.reload()
      }

      const handleDisconnect = () => {
        console.log('🔌 MetaMask disconnected')
        setWallet({
          isConnected: false,
          address: null,
          chainId: null,
          walletType: null
        })
      }

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up MetaMask event listeners')
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }

  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) return 'MetaMask'
    if (window.ethereum?.isTrust) return 'Trust Wallet'
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet'
    return 'Browser Wallet'
  }

  const connectMetaMask = async () => {
    console.log('🦊 Starting FORCED MetaMask connection...')
    
    // AGGRESSIVE MetaMask detection and selection
    let metamaskProvider = null
    
    // Strategy 1: Check if window.ethereum is MetaMask directly
    if (window.ethereum?.isMetaMask && !window.ethereum?.isOkxWallet) {
      metamaskProvider = window.ethereum
      console.log('✅ Direct MetaMask provider found')
    }
    
    // Strategy 2: Search through providers array
    else if (window.ethereum?.providers?.length) {
      console.log('🔄 Searching through', window.ethereum.providers.length, 'providers...')
      
      // Log all available providers
      window.ethereum.providers.forEach((p: any, index: number) => {
        console.log(`Provider ${index}:`, {
          isMetaMask: p.isMetaMask,
          isOkxWallet: p.isOkxWallet,
          isCoinbaseWallet: p.isCoinbaseWallet,
          isTrust: p.isTrust
        })
      })
      
      // Find MetaMask specifically (exclude OKX even if it claims to be MetaMask)
      metamaskProvider = window.ethereum.providers.find((p: any) => 
        p.isMetaMask && !p.isOkxWallet && !p.isCoinbaseWallet
      )
      
      if (metamaskProvider) {
        console.log('✅ Found genuine MetaMask provider in array')
      }
    }
    
    // Strategy 3: Try to access MetaMask directly via window.ethereum.providers
    if (!metamaskProvider && typeof window !== 'undefined') {
      // Check for ethereum.providers specifically
      const providers = (window as any).ethereum?.providers
      if (providers) {
        for (let i = 0; i < providers.length; i++) {
          const provider = providers[i]
          if (provider.isMetaMask && !provider.isOkxWallet) {
            metamaskProvider = provider
            console.log(`✅ Found MetaMask at providers[${i}]`)
            break
          }
        }
      }
    }
    
    // Strategy 4: Direct window.ethereum access with strict checking
    if (!metamaskProvider && window.ethereum) {
      if (window.ethereum.isMetaMask && !window.ethereum.isOkxWallet) {
        metamaskProvider = window.ethereum
        console.log('✅ Using window.ethereum (verified as MetaMask only)')
      } else {
        console.warn('⚠️ window.ethereum is not pure MetaMask:', {
          isMetaMask: window.ethereum.isMetaMask,
          isOkxWallet: window.ethereum.isOkxWallet,
          isCoinbaseWallet: window.ethereum.isCoinbaseWallet
        })
      }
    }
    
    // Final check - do we have MetaMask?
    if (!metamaskProvider) {
      const errorMessage = window.ethereum?.isOkxWallet 
        ? 'OKX Wallet is blocking MetaMask access. Please:\n1. Disable OKX Wallet extension temporarily, OR\n2. Open MetaMask extension directly and connect manually'
        : 'MetaMask not found. Please install MetaMask and disable other wallet extensions.'
      
      console.error('❌ MetaMask provider not found!')
      throw new Error(errorMessage)
    }
    
    console.log('🎯 Using MetaMask provider:', {
      isMetaMask: metamaskProvider.isMetaMask,
      isOkxWallet: metamaskProvider.isOkxWallet || false,
      selectedAddress: metamaskProvider.selectedAddress
    })

    // Check if MetaMask is locked
    try {
      const isUnlocked = await window.ethereum._metamask?.isUnlocked?.()
      if (isUnlocked === false) {
        throw new Error('MetaMask is locked. Please unlock MetaMask and try again.')
      }
    } catch (unlockError) {
      console.log('Could not check MetaMask unlock status:', unlockError)
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🦊 Attempting to connect to MetaMask...')
      console.log('MetaMask detected:', {
        isMetaMask: window.ethereum.isMetaMask,
        selectedAddress: window.ethereum.selectedAddress,
        isConnected: window.ethereum.isConnected?.(),
        chainId: window.ethereum.chainId
      })

      // Force MetaMask to show popup - always use eth_requestAccounts
      console.log('📝 Requesting accounts from VERIFIED MetaMask provider...')
      console.log('Final provider check:', {
        isMetaMask: metamaskProvider.isMetaMask,
        isOkxWallet: metamaskProvider.isOkxWallet || false,
        selectedAddress: metamaskProvider.selectedAddress
      })
      
      // Use the specifically found MetaMask provider
      const accounts = await metamaskProvider.request({ 
        method: 'eth_requestAccounts' 
      })
      
      console.log('📋 MetaMask returned accounts:', accounts)

      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask returned no accounts. Please unlock MetaMask and try again.')
      }

      // Get chain info using the verified MetaMask provider
      let chainId = '0x1' // Default to mainnet
      try {
        chainId = await metamaskProvider.request({ method: 'eth_chainId' })
        console.log('🌐 Connected to chain:', chainId)
      } catch (chainError) {
        console.warn('Could not get chain ID:', chainError)
      }

      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId,
        walletType: 'MetaMask'
      })

      console.log('✅ Successfully connected to MetaMask:', accounts[0])

    } catch (error: any) {
      console.error('❌ MetaMask connection error:', error)
      
      let errorMessage = 'Failed to connect to MetaMask'
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection in MetaMask.'
      } else if (error.code === -32002) {
        errorMessage = 'MetaMask request pending. Please check MetaMask for a popup.'
      } else if (error.code === -32603) {
        errorMessage = 'MetaMask internal error. Please try refreshing the page.'
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Connection was rejected by user'
      } else if (error.message?.includes('MetaMask')) {
        errorMessage = `MetaMask error: ${error.message}`
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const connectPhantom = async () => {
    const phantom = window.solana || window.phantom?.solana
    
    if (!phantom) {
      window.open('https://phantom.app/', '_blank')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await phantom.connect()
      setWallet({
        isConnected: true,
        address: response.publicKey.toString(),
        chainId: 'solana',
        walletType: 'Phantom'
      })
    } catch (error: any) {
      const errorMessage = error.code === 4001 ? 'User rejected connection' : 'Failed to connect to Phantom'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      walletType: null
    })
    setError(null)
  }

  // Listen for account/network changes
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
        setWallet(prev => ({ ...prev, chainId }))
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
    connectMetaMask,
    connectPhantom,
    disconnect,
    isLoading,
    error
  }

  return (
    <VanillaWeb3Context.Provider value={value}>
      {children}
    </VanillaWeb3Context.Provider>
  )
}

export function useVanillaWeb3() {
  const context = useContext(VanillaWeb3Context)
  if (context === undefined) {
    throw new Error('useVanillaWeb3 must be used within a VanillaWeb3Provider')
  }
  return context
}