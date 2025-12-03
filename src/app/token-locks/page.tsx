'use client'

import { useState } from 'react'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { CreateTokenLock } from '@/components/locks/CreateTokenLock'
import { TokenLockManager } from '@/components/locks/TokenLockManager'
import { Coins, Clock, Shield, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TokenLock {
  id: string
  projectName: string
  tokenSymbol: string
  tokenAddress: string
  lockedAmount: string
  unlockDate: Date
  lockType: 'Team' | 'Marketing' | 'Development' | 'Advisors'
  beneficiary: string
  chain: string
  status: 'locked' | 'unlocked' | 'partially_unlocked'
}

export default function TokenLocksPage() {
  const { isConnected } = useAccount()
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list')

  const handleCreateClick = () => {
    setCurrentView('create')
  }

  const handleLockCreated = (lockId: number) => {
    setCurrentView('list')
    // Could show a success message or redirect to the specific lock
  }

  const handleCancelCreate = () => {
    setCurrentView('list')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-noble-gold" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-noble-gold mb-4">Connect Your Wallet</h1>
          <p className="text-noble-gold/70 mb-6">
            You need to connect your wallet to create and manage token locks.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {currentView === 'list' && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
              Token Locks
            </h1>
            <p className="text-xl text-noble-gold/70 mb-6">
              Secure token locking with time-based release mechanisms
            </p>
            
            {/* Features */}
            <div className="noble-card max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="text-noble-gold" size={24} />
                  </div>
                  <h3 className="font-semibold text-noble-gold mb-2">Secure Locking</h3>
                  <p className="text-sm text-noble-gold/70">
                    Lock tokens for team, advisors, marketing with smart contract security
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="text-noble-gold" size={24} />
                  </div>
                  <h3 className="font-semibold text-noble-gold mb-2">Vesting Schedules</h3>
                  <p className="text-sm text-noble-gold/70">
                    Create custom vesting schedules with multiple unlock periods
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Coins className="text-noble-gold" size={24} />
                  </div>
                  <h3 className="font-semibold text-noble-gold mb-2">Multi-Chain</h3>
                  <p className="text-sm text-noble-gold/70">
                    Support for Ethereum, BSC, Polygon, Arbitrum, and Base networks
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentView === 'list' ? (
          <TokenLockManager 
            showCreateButton={true} 
            onCreateClick={handleCreateClick}
          />
        ) : (
          <CreateTokenLock 
            onLockCreated={handleLockCreated}
            onCancel={handleCancelCreate}
          />
        )}
      </div>
    </div>
  )

}

/*
// Legacy interface - keeping for reference
interface TokenLock {
  id: string
  projectName: string
  tokenSymbol: string
  tokenAddress: string
  lockedAmount: string
  unlockDate: Date
  lockType: 'Team' | 'Marketing' | 'Development' | 'Advisors'
  beneficiary: string
  chain: string
  status: 'locked' | 'unlocked' | 'partially_unlocked'
}

*/
