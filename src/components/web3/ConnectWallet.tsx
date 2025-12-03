'use client'

import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Show EVM wallet if connected
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 noble-button-outline text-sm"
        >
          <span>{truncateAddress(address)}</span>
          <ChevronDown size={16} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 noble-card py-2 z-50">
            <button
              onClick={() => {
                disconnect()
                setIsDropdownOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-noble-gold hover:bg-noble-gray-light transition-colors duration-200"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  const handleConnect = async () => {
    console.log('Connect button clicked!')
    console.log('Available connectors:', connectors)
    
    try {
      if (connectors.length === 0) {
        alert('No Web3 wallet detected. Please install MetaMask.')
        return
      }
      
      const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0]
      console.log('Using connector:', connector?.name)
      
      if (connector) {
        await connect({ connector })
        console.log('Connection successful!')
      } else {
        alert('Please install MetaMask or another Web3 wallet')
      }
    } catch (error) {
      console.error('Connection failed:', error)
      alert(`Failed to connect wallet: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <Button
      onClick={handleConnect}
      className="noble-button text-sm"
    >
      Connect Wallet
    </Button>
  )
}