'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react'

export function WalletDetector() {
  const [wallets, setWallets] = useState<any[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  useEffect(() => {
    detectWallets()
    const interval = setInterval(detectWallets, 2000)
    return () => clearInterval(interval)
  }, [])

  const detectWallets = () => {
    const detectedWallets = []

    if (window.ethereum) {
      if (window.ethereum.providers?.length) {
        // Multiple providers
        window.ethereum.providers.forEach((provider: any, index: number) => {
          detectedWallets.push({
            id: `provider_${index}`,
            name: getWalletName(provider),
            isActive: provider === window.ethereum,
            isMetaMask: provider.isMetaMask,
            isOkxWallet: provider.isOkxWallet,
            isCoinbaseWallet: provider.isCoinbaseWallet,
            selectedAddress: provider.selectedAddress,
            provider: provider
          })
        })
      } else {
        // Single provider
        detectedWallets.push({
          id: 'single_provider',
          name: getWalletName(window.ethereum),
          isActive: true,
          isMetaMask: window.ethereum.isMetaMask,
          isOkxWallet: window.ethereum.isOkxWallet,
          isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
          selectedAddress: window.ethereum.selectedAddress,
          provider: window.ethereum
        })
      }
    }

    setWallets(detectedWallets)
  }

  const getWalletName = (provider: any) => {
    if (provider.isMetaMask) return 'MetaMask'
    if (provider.isOkxWallet) return 'OKX Wallet'
    if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
    if (provider.isTrust) return 'Trust Wallet'
    return 'Unknown Wallet'
  }

  const testWalletConnection = async (wallet: any) => {
    setSelectedWallet(wallet.id)
    try {
      const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' })
      alert(`✅ ${wallet.name} connected: ${accounts[0]}`)
    } catch (error: any) {
      alert(`❌ ${wallet.name} connection failed: ${error.message}`)
    }
    setSelectedWallet(null)
  }

  const openExtensionsPage = () => {
    const isChrome = navigator.userAgent.includes('Chrome')
    const isEdge = navigator.userAgent.includes('Edge')
    
    if (isChrome) {
      window.open('chrome://extensions/', '_blank')
    } else if (isEdge) {
      window.open('edge://extensions/', '_blank')
    } else {
      alert('Open your browser extensions page and disable unused wallet extensions')
    }
  }

  return (
    <div className="noble-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-noble-gold">🔍 Wallet Extension Detector</h3>
        <Button size="sm" variant="outline" onClick={openExtensionsPage}>
          <Settings className="mr-2" size={16} />
          Manage Extensions
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
        <div className="font-medium text-blue-400 mb-1">Detected Wallet Extensions:</div>
        <div className="text-noble-gold/70">
          {wallets.length === 0 
            ? 'No wallet extensions detected' 
            : `Found ${wallets.length} wallet extension${wallets.length > 1 ? 's' : ''}`
          }
        </div>
      </div>

      {wallets.length > 0 && (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                wallet.isMetaMask 
                  ? 'border-green-500/40 bg-green-500/10' 
                  : 'border-noble-gold/20 bg-noble-gray/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    wallet.isActive ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-noble-gold">{wallet.name}</span>
                  {wallet.isMetaMask && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Target Wallet
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testWalletConnection(wallet)}
                  disabled={selectedWallet === wallet.id}
                >
                  {selectedWallet === wallet.id ? 'Testing...' : 'Test'}
                </Button>
              </div>

              <div className="text-sm space-y-1">
                <div className="text-noble-gold/70">
                  Status: {wallet.isActive ? '🟢 Active Provider' : '⚪ Available'}
                </div>
                {wallet.selectedAddress && (
                  <div className="text-noble-gold/70 font-mono text-xs">
                    Connected: {wallet.selectedAddress}
                  </div>
                )}
                <div className="text-noble-gold/70">
                  Properties: {[
                    wallet.isMetaMask && 'MetaMask',
                    wallet.isOkxWallet && 'OKX',
                    wallet.isCoinbaseWallet && 'Coinbase'
                  ].filter(Boolean).join(', ') || 'Unknown'}
                </div>
              </div>

              {wallet.name === 'OKX Wallet' && (
                <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-sm">
                  <div className="flex items-center space-x-2 text-orange-400">
                    <AlertTriangle size={16} />
                    <span className="font-medium">Conflicting Wallet Detected</span>
                  </div>
                  <div className="text-noble-gold/70 text-xs mt-1">
                    This wallet may intercept MetaMask connection requests. Consider disabling temporarily.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {wallets.filter(w => !w.isMetaMask).length > 0 && (
        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-orange-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-medium">Multiple Wallets Detected</span>
          </div>
          <div className="text-sm text-noble-gold/70 mb-3">
            You have multiple wallet extensions that may conflict with each other.
          </div>
          <div className="text-xs space-y-1 text-noble-gold/60">
            <div>💡 <strong>Recommended:</strong> Disable unused wallet extensions temporarily</div>
            <div>💡 <strong>Alternative:</strong> Use the enhanced provider selection (already implemented)</div>
          </div>
        </div>
      )}
    </div>
  )
}