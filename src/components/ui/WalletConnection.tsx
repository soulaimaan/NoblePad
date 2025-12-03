'use client'

import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { Button } from './button'
import { useEffect, useState } from 'react'
import { injected, metaMask } from 'wagmi/connectors'

export function ConnectWallet() {
  const [isClient, setIsClient] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  
  // Always call hooks (React rule)
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if WalletConnect is properly configured
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
  const isValidProjectId = projectId && 
    projectId.length > 0 && 
    !projectId.includes('project-id') && 
    !projectId.includes('placeholder')

  // Don't render anything on server side to avoid hydration mismatch
  if (!isClient) {
    return <Button variant="outline">Connect Wallet</Button>
  }

  // If WalletConnect is configured, use Web3Modal
  if (isValidProjectId) {
    return <w3m-button />
  }

  // Use Wagmi connectors for proper wallet detection
  const connectWallet = async (connectorId: string) => {
    try {
      // Handle Phantom (Solana) separately since it's not an Ethereum wallet
      if (connectorId === 'phantom') {
        const phantom = window.solana || window.phantom?.solana
        if (!phantom || !phantom.isPhantom) {
          window.open('https://phantom.app/', '_blank')
          return
        }
        
        try {
          const response = await phantom.connect()
          console.log('Connected to Phantom:', response.publicKey.toString())
          setShowWalletOptions(false)
          return
        } catch (error) {
          console.error('Phantom connection failed:', error)
          alert('Failed to connect to Phantom wallet')
          return
        }
      }

      // Find the connector by ID
      const connector = connectors.find(c => c.id === connectorId || c.name.toLowerCase().includes(connectorId))
      
      if (!connector) {
        alert(`${connectorId} wallet not found`)
        return
      }

      // Connect using Wagmi
      await connect({ connector })
      setShowWalletOptions(false)
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      if (error.code === 4001 || error.message?.includes('rejected')) {
        alert('Wallet connection was rejected by user')
      } else {
        alert(`Failed to connect to wallet. Please try again.`)
      }
    }
  }

  // Check what connectors are available
  const getAvailableWallets = () => {
    const wallets = []
    
    // Debug: log available connectors
    if (isClient) {
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, type: c.type })))
      console.log('Window ethereum:', window.ethereum ? {
        isMetaMask: window.ethereum.isMetaMask,
        isTrust: window.ethereum.isTrust,
        isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
        providers: window.ethereum.providers?.length || 0
      } : 'Not found')
    }
    
    // Add connectors that are actually available
    connectors.forEach(connector => {
      if (connector.id === 'metaMask') {
        wallets.push({ id: 'metaMask', name: 'MetaMask', color: 'bg-orange-500', icon: 'M' })
      } else if (connector.id === 'injected') {
        wallets.push({ id: 'injected', name: 'Injected Wallet', color: 'bg-blue-500', icon: 'W' })
      } else if (connector.id === 'walletConnect') {
        wallets.push({ id: 'walletConnect', name: 'WalletConnect', color: 'bg-blue-600', icon: 'W' })
      }
    })
    
    // Add Phantom for Solana (always available as it's external)
    wallets.push({ id: 'phantom', name: 'Phantom (Solana)', color: 'bg-purple-500', icon: 'P' })
    
    // If no wallets detected but ethereum exists, add a generic option
    if (wallets.length === 1 && isClient && window.ethereum) { // Only Phantom
      wallets.unshift({ id: 'injected', name: 'Browser Wallet', color: 'bg-gray-500', icon: 'B' })
    }
    
    return wallets
  }

  if (showWalletOptions) {
    const availableWallets = getAvailableWallets()
    
    return (
      <div className="relative">
        <div className="absolute right-0 top-full mt-2 w-64 bg-noble-gray border border-noble-gold/20 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-noble-gold mb-3">Connect Wallet</h3>
            
            {availableWallets.map((wallet) => (
              <Button 
                key={wallet.id}
                variant="outline" 
                className="w-full justify-start"
                onClick={() => connectWallet(wallet.id)}
                disabled={isLoading && pendingConnector?.id === wallet.id}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${wallet.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {wallet.icon}
                  </div>
                  {wallet.name}
                  {isLoading && pendingConnector?.id === wallet.id && (
                    <div className="ml-auto text-xs">Connecting...</div>
                  )}
                </div>
              </Button>
            ))}

            {availableWallets.length === 0 && (
              <div className="text-center py-4 text-noble-gold/60 text-sm">
                No wallets detected. Please install a wallet extension.
              </div>
            )}

            <div className="pt-2 border-t border-noble-gold/10">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setShowWalletOptions(false)}
              >
                Cancel
              </Button>
            </div>

            {error && (
              <div className="text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button 
      variant="outline"
      onClick={() => setShowWalletOptions(true)}
    >
      Connect Wallet
    </Button>
  )
}

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !isConnected || !address) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <div className="font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        {chain && (
          <div className="text-xs text-muted-foreground">
            {chain.name}
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => disconnect()}
      >
        Disconnect
      </Button>
    </div>
  )
}

export function WalletButton() {
  const { isConnected } = useAccount()
  
  if (isConnected) {
    return <WalletInfo />
  }
  
  return <ConnectWallet />
}