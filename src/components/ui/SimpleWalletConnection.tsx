'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { useSimpleWeb3 } from '@/components/providers/SimpleWeb3Provider'

export function SimpleConnectWallet() {
  const [isClient, setIsClient] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const { wallet, connect, disconnect, isLoading, error } = useSimpleWeb3()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything on server side
  if (!isClient) {
    return <Button variant="outline">Connect Wallet</Button>
  }

  const detectAvailableWallets = () => {
    const wallets = []

    // Check for Ethereum wallets
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        wallets.push({ id: 'metamask', name: 'MetaMask', color: 'bg-orange-500', icon: 'M' })
      } else if (window.ethereum.isTrust) {
        wallets.push({ id: 'trust', name: 'Trust Wallet', color: 'bg-blue-500', icon: 'T' })
      } else if (window.ethereum.isCoinbaseWallet) {
        wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', color: 'bg-blue-600', icon: 'C' })
      } else {
        wallets.push({ id: 'injected', name: 'Browser Wallet', color: 'bg-gray-500', icon: 'W' })
      }
    }

    // Check for Phantom (Solana)
    const phantom = window.solana || window.phantom?.solana
    if (phantom && phantom.isPhantom) {
      wallets.push({ id: 'phantom', name: 'Phantom (Solana)', color: 'bg-purple-500', icon: 'P' })
    }

    // If no wallets detected, show installation options
    if (wallets.length === 0) {
      wallets.push(
        { id: 'install-metamask', name: 'Install MetaMask', color: 'bg-orange-500', icon: 'M' },
        { id: 'install-phantom', name: 'Install Phantom', color: 'bg-purple-500', icon: 'P' }
      )
    }

    return wallets
  }

  const handleWalletConnect = async (walletId: string) => {
    try {
      if (walletId === 'install-metamask') {
        window.open('https://metamask.io/download/', '_blank')
        return
      }
      
      if (walletId === 'install-phantom') {
        window.open('https://phantom.app/', '_blank')
        return
      }

      // Pre-check for common issues
      if ((walletId === 'metamask' || walletId === 'injected') && window.ethereum) {
        // Give user a heads up about what to expect
        console.log('Requesting wallet connection. MetaMask popup should appear...')
      }

      // Add timeout to prevent hanging connections (shorter for better UX)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout. Please unlock your wallet and try again.')), 15000)
      )

      await Promise.race([connect(walletId), timeoutPromise])
      setShowWalletOptions(false)
    } catch (error: any) {
      console.error('Connection failed:', error)
      // Error is handled by the provider and shown in UI
    }
  }

  // Show wallet info if connected
  if (wallet.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">
            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {wallet.chain} ({wallet.walletType})
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  // Show wallet selection dropdown
  if (showWalletOptions) {
    const availableWallets = detectAvailableWallets()

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
                onClick={() => handleWalletConnect(wallet.id)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${wallet.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {wallet.icon}
                  </div>
                  {wallet.name}
                  {isLoading && (
                    <div className="ml-auto text-xs">Connecting...</div>
                  )}
                </div>
              </Button>
            ))}

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
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show connect button
  return (
    <Button variant="outline" onClick={() => setShowWalletOptions(true)}>
      Connect Wallet
    </Button>
  )
}

export function SimpleWalletButton() {
  return <SimpleConnectWallet />
}