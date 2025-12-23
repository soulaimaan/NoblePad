'use client'

import { useTier } from '@/components/providers/TierProvider'
import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { xrplPresaleService } from '@/lib/xrpl/xrplPresaleService'
import { AlertCircle, Clock, Coins, Loader, Shield, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PresaleCommitmentProps {
  presale: any // Will be properly typed later
}

export function PresaleCommitment({ presale }: PresaleCommitmentProps) {
  const { address, isConnected, chainType } = useUnifiedWallet()
  const { currentTier, totalStaked, isLoading: isTierLoading } = useTier()
  const [commitAmount, setCommitAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hasTrustLine, setHasTrustLine] = useState<boolean | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check TrustLine on mount/address change if it's an XRPL presale
  useEffect(() => {
    if (isMounted && chainType === 'xrpl' && address && presale.tokenIssuer && presale.tokenCurrency) {
      const checkTL = async () => {
        const exists = await xrplPresaleService.checkTrustLine(address, presale.tokenIssuer, presale.tokenCurrency)
        setHasTrustLine(exists)
      }
      checkTL()
    }
  }, [isMounted, address, chainType, presale.tokenIssuer, presale.tokenCurrency])
  
  const maxCommitment = parseFloat(presale?.maxContribution?.split(' ')[0] || '0')
  const minCommitment = parseFloat(presale?.minContribution?.split(' ')[0] || '0')
  
  const handleCreateTrustLine = async () => {
    if (!address || !presale.tokenIssuer || !presale.tokenCurrency) return
    setLoading(true)
    try {
      await xrplPresaleService.ensureTrustLine(address, presale.tokenIssuer, presale.tokenCurrency)
      // Re-check after a brief moment
      setTimeout(async () => {
        const exists = await xrplPresaleService.checkTrustLine(address, presale.tokenIssuer, presale.tokenCurrency)
        setHasTrustLine(exists)
        setLoading(false)
      }, 3000)
    } catch (e) {
      console.error("TrustLine creation failed", e)
      setLoading(false)
    }
  }

  const handleCommit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!commitAmount || parseFloat(commitAmount) < minCommitment) {
      alert(`Minimum commitment is ${presale.minContribution}`)
      return
    }

    if (parseFloat(commitAmount) > maxCommitment) {
      alert(`Maximum commitment is ${presale.maxContribution}`)
      return
    }

    setLoading(true)
    
    try {
      if (chainType === 'xrpl') {
        const result = await xrplPresaleService.contribute(address, presale.contractAddress, commitAmount)
        console.log('XRPL Contribution result:', result)
        alert('Contribution transaction created! Please sign it in your Xaman app.')
      } else {
        // EVM implementation logic
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('EVM Commitment successful! (Simulation)')
      }
      
      setCommitAmount('')
    } catch (error) {
      console.error('Commitment failed:', error)
      alert('Commitment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted || isTierLoading) {
    return (
      <div className="noble-card flex items-center justify-center py-12">
        <Loader className="animate-spin text-noble-gold" size={24} />
      </div>
    )
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GOLD': return 'text-yellow-400'
      case 'SILVER': return 'text-gray-300'
      case 'BRONZE': return 'text-orange-400'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="noble-card">
      <h3 className="text-xl font-semibold text-noble-gold mb-6">Join Presale</h3>
      
      {/* Real Tier Info */}
      {isConnected && (
        <div className="mb-6 p-4 bg-noble-gray/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-noble-gold/70">Your Tier</span>
            <span className={`font-semibold ${getTierColor(currentTier)}`}>{currentTier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-noble-gold/70">Total Staked</span>
            <span className="text-noble-gold">{totalStaked.toLocaleString()} BELGRAVE</span>
          </div>
        </div>
      )}

      {/* TrustLine Step for XRPL */}
      {chainType === 'xrpl' && isConnected && hasTrustLine === false && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-2 text-yellow-400 mb-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>TrustLine required to receive <b>{presale.tokenSymbol}</b> after presale ends.</span>
          </div>
          <Button 
            onClick={handleCreateTrustLine} 
            disabled={loading}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            {loading ? 'Creating...' : 'Set TrustLine'}
          </Button>
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
              min={minCommitment}
              max={maxCommitment}
              step="0.01"
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-noble-gold/60 font-medium">
              {presale.chain === 'XRPL' ? 'XRP' : (presale.chain === 'BSC' ? 'BNB' : 'ETH')}
            </div>
          </div>
          <div className="flex justify-between text-xs text-noble-gold/60 mt-1">
            <span>Min: {presale.minContribution}</span>
            <span>Max: {presale.maxContribution}</span>
          </div>
        </div>

        {/* Token Calculation */}
        {commitAmount && !isNaN(parseFloat(commitAmount)) && (
          <div className="p-3 bg-noble-gold/10 rounded-lg border border-noble-gold/20">
            <div className="flex justify-between text-sm">
              <span className="text-noble-gold/70">You will receive:</span>
              <span className="text-noble-gold font-medium">
                {(parseFloat(commitAmount) * (presale.exchangeRate || 1000)).toLocaleString()} {presale.tokenSymbol}
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
      </div>

      {/* Vesting Schedule */}
      <div className="mt-6 pt-6 border-t border-noble-gold/20">
        <h4 className="font-semibold text-noble-gold mb-3 flex items-center">
          <Clock className="mr-2" size={16} />
          Vesting Schedule
        </h4>
        <div className="space-y-2">
          {presale?.vestingSchedule?.map((vesting: any, index: number) => (
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