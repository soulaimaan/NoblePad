'use client'

import { useState } from 'react'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { Button } from '@/components/ui/Button'
import { calculateUserTier } from '@/lib/utils'
import { Coins, TrendingUp, Shield } from 'lucide-react'

interface PresaleCommitmentProps {
  presale: any // Will be properly typed later
}

export function PresaleCommitment({ presale }: PresaleCommitmentProps) {
  const { address, isConnected } = useAccount()
  const [commitAmount, setCommitAmount] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Mock user data - will come from Supabase Edge Function
  const mockUserData = {
    stakedNPAD: 5500, // User's staked $NPAD tokens
    currentCommitment: 2.5, // User's current commitment in BNB
    tierAllocation: 2500, // User's max allocation in USD
  }

  const userTier = calculateUserTier(mockUserData.stakedNPAD)
  const maxCommitmentBNB = parseFloat(presale.maxContribution.split(' ')[0])
  const minCommitmentBNB = parseFloat(presale.minContribution.split(' ')[0])
  
  const handleCommit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!commitAmount || parseFloat(commitAmount) < minCommitmentBNB) {
      alert(`Minimum commitment is ${presale.minContribution}`)
      return
    }

    if (parseFloat(commitAmount) > maxCommitmentBNB) {
      alert(`Maximum commitment is ${presale.maxContribution}`)
      return
    }

    setLoading(true)
    
    try {
      // In real implementation, this would call a Supabase Edge Function
      // that handles the Web3 transaction and updates the database
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Commitment successful! Your tokens will be available for claim after the presale ends.')
      setCommitAmount('')
    } catch (error) {
      console.error('Commitment failed:', error)
      alert('Commitment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="noble-card">
      <h3 className="text-xl font-semibold text-noble-gold mb-6">Join Presale</h3>
      
      {/* User Tier Info */}
      {isConnected && (
        <div className="mb-6 p-4 bg-noble-gray/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-noble-gold/70">Your Tier</span>
            <span className={`font-semibold ${userTier.color}`}>{userTier.tier}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-noble-gold/70">Staked $NPAD</span>
            <span className="text-noble-gold">{mockUserData.stakedNPAD.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-noble-gold/70">Max Allocation</span>
            <span className="text-noble-gold">${userTier.allocation.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Commitment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Commitment Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              value={commitAmount}
              onChange={(e) => setCommitAmount(e.target.value)}
              className="noble-input w-full pr-16"
              min={minCommitmentBNB}
              max={maxCommitmentBNB}
              step="0.01"
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-noble-gold/60 font-medium">
              BNB
            </div>
          </div>
          <div className="flex justify-between text-xs text-noble-gold/60 mt-1">
            <span>Min: {presale.minContribution}</span>
            <span>Max: {presale.maxContribution}</span>
          </div>
        </div>

        {/* Token Calculation */}
        {commitAmount && !isNaN(parseFloat(commitAmount)) && (
          <div className="p-3 bg-noble-gold/10 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-noble-gold/70">You will receive:</span>
              <span className="text-noble-gold font-medium">
                {(parseFloat(commitAmount) * 1000).toLocaleString()} {presale.tokenSymbol}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleCommit}
          disabled={!isConnected || !commitAmount || loading || presale.status !== 'live'}
          className="w-full"
        >
          {loading ? 'Processing...' : 
           !isConnected ? 'Connect Wallet' :
           presale.status !== 'live' ? 'Presale Not Live' :
           'Commit to Presale'}
        </Button>

        {/* Current Commitment */}
        {isConnected && mockUserData.currentCommitment > 0 && (
          <div className="p-3 bg-noble-gray/30 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-noble-gold/70">Your Current Commitment:</span>
              <span className="text-noble-gold">{mockUserData.currentCommitment} BNB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-noble-gold/70">Tokens Allocated:</span>
              <span className="text-noble-gold">
                {(mockUserData.currentCommitment * 1000).toLocaleString()} {presale.tokenSymbol}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Vesting Schedule */}
      <div className="mt-6 pt-6 border-t border-noble-gold/20">
        <h4 className="font-semibold text-noble-gold mb-3 flex items-center">
          <Clock className="mr-2" size={16} />
          Vesting Schedule
        </h4>
        <div className="space-y-2">
          {presale.vestingSchedule.map((vesting: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-noble-gold/70">{vesting.time}</span>
              <span className="text-noble-gold">{vesting.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Info */}
      <div className="mt-6 pt-6 border-t border-noble-gold/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-noble-gold/60" />
              <span className="text-noble-gold/70">Token Price</span>
            </div>
            <span className="text-noble-gold">{presale.tokenPrice}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-noble-gold/60" />
              <span className="text-noble-gold/70">Liquidity Lock</span>
            </div>
            <span className="text-noble-gold">{presale.liquidityLock}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Coins size={16} className="text-noble-gold/60" />
              <span className="text-noble-gold/70">Total Supply</span>
            </div>
            <span className="text-noble-gold">{presale.totalSupply}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fix import
import { Clock } from 'lucide-react'