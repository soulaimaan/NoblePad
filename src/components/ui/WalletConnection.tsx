'use client'

import { useUnifiedWallet, WalletType } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'

export function ConnectWallet() {
  const { connect, isConnecting } = useUnifiedWallet()
  const [showOptions, setShowOptions] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <Button variant="outline">Connect Wallet</Button>

  const handleConnect = async (type: WalletType) => {
    if (!type) return
    await connect(type)
    setShowOptions(false)
  }

  if (showOptions) {
    return (
       <div className="relative">
        <div className="absolute right-0 top-full mt-2 w-64 bg-noble-gray border border-noble-gold/20 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
             <h3 className="text-sm font-medium text-noble-gold mb-3">Select Chain</h3>
             
             {/* EVM */}
             <Button 
                variant="outline" 
                className="w-full justify-start text-left bg-black/20 hover:bg-black/40 border-noble-gold/30"
                onClick={() => handleConnect('evm')}
                disabled={isConnecting}
             >
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">E</div>
                   <div className="flex flex-col">
                       <span className="text-sm font-bold">EVM / Ethereum</span>
                       <span className="text-[10px] text-gray-400">Metamask, Rainbow, etc.</span>
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
    <div className="flex items-center gap-3 bg-noble-gray/40 border border-noble-gold/20 rounded-lg px-3 py-1.5 hover:bg-noble-gray/60 transition-colors">
      
      {/* Network Badge */}
      <div className={`
        flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
        ${chainType === 'xrpl' ? 'bg-black text-white border border-white/10' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}
      `}>
          {chainType === 'xrpl' ? 'XRPL' : 'EVM'}
      </div>

      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-noble-gold">
            {parseFloat(balance.formatted).toFixed(2)} {balance.symbol}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          {address && typeof address === 'string' && !address.includes('[object') 
            ? `${address.slice(0, 4)}...${address.slice(-4)}` 
            : ''}
        </span>
      </div>

      <div className="h-6 w-px bg-white/10 mx-1" />

      <Button 
        variant="ghost" 
        size="sm"
        className="h-6 px-2 text-xs hover:bg-red-500/20 hover:text-red-400"
        onClick={() => disconnect()}
      >
        Disconnect
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
