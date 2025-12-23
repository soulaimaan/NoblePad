'use client'

import { CreateTokenLock } from '@/components/locks/CreateTokenLock'
import { TokenLockManager } from '@/components/locks/TokenLockManager'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { Clock, Coins, Loader, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TokenLocksPage() {
  const { isConnected, isHydrated } = useAccount()
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCreateClick = () => {
    setCurrentView('create')
  }

  const handleLockCreated = (lockId: number) => {
    setCurrentView('list')
  }

  const handleCancelCreate = () => {
    setCurrentView('list')
  }

  // Show nothing during SSR or while waiting for client hydration
  if (!isMounted || !isHydrated) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
          <Loader className="animate-spin text-noble-gold" size={32} />
        </div>
      </div>
    )
  }

  // Once hydrated and mounted, check if connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 noble-card">
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
                    Support for Ethereum Ledger, BSC, Polygon, and XRPL networks
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
