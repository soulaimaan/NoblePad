'use client'

import { useAccount } from '@/hooks/useCompatibleAccount'
import { Copy, Gift, Share2 } from 'lucide-react'
import { useState } from 'react'

interface ReferralCardProps {
  presaleId: string
  referralPercentage?: number
}

export function ReferralCard({ presaleId, referralPercentage = 2 }: ReferralCardProps) {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/presale/${presaleId}?ref=${isConnected ? address : 'connect-wallet'}`
    : ''

  const handleCopy = () => {
    if (!isConnected) {
      alert('Please connect your wallet to generate your unique referral link.')
      return
    }
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-noble-black/40 border border-noble-gold/20 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
          <Gift className="text-green-400" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white">Earn {referralPercentage}% Rewards</h3>
          <p className="text-xs text-noble-gold/60">Share and earn crypto for every buyer</p>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-white/5 flex items-center justify-between mb-4">
        <div className="truncate text-sm text-gray-400 font-mono pr-4">
          {isConnected ? referralLink : 'Connect wallet to generate link'}
        </div>
        <button 
          onClick={handleCopy}
          className="bg-noble-gold/10 hover:bg-noble-gold/20 p-2 rounded-md transition-colors"
          title="Copy Link"
        >
          {copied ? <Share2 size={16} className="text-green-400" /> : <Copy size={16} className="text-noble-gold" />}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500">
        Rewards are automatically sent to your wallet when the presale concludes.
      </p>
    </div>
  )
}
