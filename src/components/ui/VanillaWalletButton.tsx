'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { useVanillaWeb3 } from '@/components/providers/VanillaWeb3Provider'

export function VanillaWalletButton() {
  const [isClient, setIsClient] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const { wallet, connectMetaMask, connectPhantom, disconnect, isLoading, error } = useVanillaWeb3()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Button variant="outline">Connect Wallet</Button>
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
            {wallet.walletType}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnect}
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  // Show wallet selection
  if (showWalletOptions) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-full mt-2 w-64 bg-noble-gray border border-noble-gold/20 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-noble-gold mb-3">Connect Wallet</h3>

            {/* MetaMask */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                console.log('🔘 MetaMask button clicked')
                connectMetaMask()
                  .then(() => {
                    console.log('✅ MetaMask connection successful')
                    setShowWalletOptions(false)
                  })
                  .catch((err) => {
                    console.log('❌ MetaMask connection failed:', err.message)
                  })
              }}
              disabled={isLoading}
              title="Connect to MetaMask wallet"
              aria-label="Connect to MetaMask wallet"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                MetaMask
                {isLoading && <div className="ml-auto text-xs">Connecting...</div>}
              </div>
            </Button>

            {/* Phantom */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                connectPhantom()
                  .then(() => setShowWalletOptions(false))
                  .catch(() => {}) // Error is handled by provider
              }}
              disabled={isLoading}
              title="Connect to Phantom wallet for Solana"
              aria-label="Connect to Phantom wallet for Solana"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                Phantom (Solana)
                {isLoading && <div className="ml-auto text-xs">Connecting...</div>}
              </div>
            </Button>

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
              <div className="text-red-400 text-xs mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                <div className="font-medium mb-1">❌ {error}</div>
                <div className="text-xs text-noble-gold/60 mt-1">
                  {error.includes('MetaMask not detected') && (
                    <>💡 Install MetaMask extension → Refresh page</>
                  )}
                  {error.includes('rejected') && (
                    <>💡 Click "Connect" in MetaMask popup</>
                  )}
                  {error.includes('pending') && (
                    <>💡 Check MetaMask for pending request</>
                  )}
                  {error.includes('internal error') && (
                    <>💡 Refresh page (Ctrl+F5) → Try again</>
                  )}
                  {!error.includes('MetaMask not detected') && !error.includes('rejected') && !error.includes('pending') && !error.includes('internal error') && (
                    <>💡 Try: <a href="/debug" className="underline text-blue-400">Debug Page</a> for help</>
                  )}
                </div>
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
      title="Open wallet connection options"
      aria-label="Connect your cryptocurrency wallet"
    >
      Connect Wallet
    </Button>
  )
}