'use client'

import { useUnifiedWallet, WalletType } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ConnectWallet() {
  const { connect, isConnecting, connectors } = useUnifiedWallet()
  const [showOptions, setShowOptions] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <Button variant="outline">Connect Wallet</Button>

  const handleConnect = async (type: WalletType, isDirect: boolean = false) => {
    if (!type) return

    try {
      if (type === 'evm' && isDirect && connectors && connectors.length > 0) {
        // Find MetaMask or Injected connector
        const mmConnector = connectors.find(c =>
          c.id === 'io.metamask' ||
          c.id === 'metaMaskSDK' ||
          (c.id === 'injected' && c.name.toLowerCase().includes('metamask'))
        ) || connectors.find(c => c.id === 'injected')

        if (mmConnector) {
          await connect('evm', mmConnector)
          setShowOptions(false)
          return
        }
      }

      await connect(type)
      setShowOptions(false)
    } catch (e) {
      console.error("Wallet connection failed:", e)
    }
  }

  if (showOptions) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-full mt-2 w-64 bg-noble-gray border border-noble-gold/20 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-noble-gold mb-3">Select Chain</h3>

            {/* EVM */}
            {/* Direct Extension Connection (MetaMask/Brave/Opera) */}
            {connectors && connectors.length > 0 && connectors.some(c => c.id === 'injected' || c.id === 'io.metamask') && (
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30"
                onClick={() => handleConnect('evm', true)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <img src="/icons/metamask.svg" alt="MetaMask" className="w-7 h-7" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-orange-400">Browser Wallet (Direct)</span>
                    <span className="text-[10px] text-orange-300/60">MetaMask, Brave, Opera</span>
                  </div>
                </div>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-left bg-black/20 hover:bg-black/40 border-noble-gold/30"
              onClick={() => handleConnect('evm')}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">E</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Other EVM Wallets</span>
                  <span className="text-[10px] text-gray-400">Rainbow, WalletConnect, etc.</span>
                </div>
              </div>
            </Button>

            {/* XRPL */}
            <Button
              variant="outline"
              className="w-full justify-start text-left bg-black/20 hover:bg-black/40 border-noble-gold/30"
              onClick={() => handleConnect('xrpl')}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white/20">X</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">XRP Ledger</span>
                  <span className="text-[10px] text-gray-400">Xaman (Xumm) Wallet</span>
                </div>
              </div>
            </Button>

            {/* Solana - Disabled for current release */}
            {/* <Button
              variant="outline"
              className="w-full justify-start text-left bg-black/20 hover:bg-black/40 border-noble-gold/30"
              onClick={() => handleConnect('solana')}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center text-[10px] text-white font-bold">S</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Solana</span>
                  <span className="text-[10px] text-gray-400">Phantom, Solflare, etc.</span>
                </div>
              </div>
            </Button> */}


            <div className="pt-2 border-t border-noble-gold/10">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowOptions(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowOptions(true)}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}

export function WalletInfo() {
  const { address, balance, disconnect, walletType, chainType } = useUnifiedWallet()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !address) return null

  return (
    <div className="flex items-center gap-1 sm:gap-3 bg-noble-gray/40 border border-noble-gold/20 rounded-lg px-2 sm:px-3 py-1.5 hover:bg-noble-gray/60 transition-colors">

      {/* Network Badge - always visible but smaller on mobile */}
      <div className={`
        flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider
        ${chainType === 'xrpl' ? 'bg-black text-white border border-white/10' :
          chainType === 'solana' ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white' :
            'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}
      `}>
        {chainType === 'xrpl' ? 'XRP' : chainType === 'solana' ? 'SOL' : 'EVM'}
      </div>

      {/* Balance + Address - hidden on very small screens */}
      <div className="hidden xs:flex flex-col items-end">
        <span className="text-xs sm:text-sm font-bold text-noble-gold">
          {parseFloat(balance.formatted).toFixed(2)} {balance.symbol}
        </span>
        <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono">
          {address && typeof address === 'string' && !address.includes('[object')
            ? `${address.slice(0, 4)}...${address.slice(-4)}`
            : ''}
        </span>
      </div>

      <div className="hidden xs:block h-6 w-px bg-white/10 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs hover:bg-red-500/20 hover:text-red-400"
        onClick={() => disconnect()}
      >
        <span className="hidden sm:inline">Disconnect</span>
        <span className="sm:hidden">✕</span>
      </Button>
    </div>
  )
}

export function WalletButton() {
  const { isConnected } = useUnifiedWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="outline">Connect Wallet</Button>
  }

  if (isConnected) {
    return <WalletInfo />
  }

  return <ConnectWallet />
}
