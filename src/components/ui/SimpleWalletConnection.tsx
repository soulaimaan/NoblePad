'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

export function SimpleConnectWallet() {
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything on server side
  if (!isClient) {
    return <Button variant="outline">Connect Wallet</Button>
  }

  // Show wallet info if connected
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium text-noble-gold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  // Show connect button
  return (
    <Button variant="outline" onClick={() => open()}>
      Connect Wallet
    </Button>
  )
}

export function SimpleWalletButton() {
  return <SimpleConnectWallet />
}