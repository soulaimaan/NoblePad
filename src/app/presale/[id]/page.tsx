'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PresaleDetail } from '@/components/presale/PresaleDetail'
import { PresaleCommitment } from '@/components/presale/PresaleCommitment'
import { PresaleInfo } from '@/components/presale/PresaleInfo'
import { PresaleCountdown } from '@/components/presale/PresaleCountdown'

export default function PresaleDetailPage() {
  const { id } = useParams()
  const [presaleData, setPresaleData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data - will be replaced with Supabase query
  const mockPresaleData = {
    id: id as string,
    name: 'NobleSwap',
    description: 'A revolutionary DEX built on BSC with advanced AMM features and yield farming.',
    logo: '/api/placeholder/128/128',
    banner: '/api/placeholder/800/400',
    hardCap: '500 BNB',
    softCap: '250 BNB',
    raised: '387 BNB',
    progress: 77,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'live' as const,
    chain: 'BSC',
    tokenName: 'NobleSwap Token',
    tokenSymbol: 'NST',
    tokenPrice: '1 BNB = 1,000 NST',
    minContribution: '0.1 BNB',
    maxContribution: '10 BNB',
    liquidityLock: '12 months',
    liquidityPercentage: '80%',
    vestingSchedule: [
      { percentage: 50, time: 'TGE (Token Generation Event)' },
      { percentage: 50, time: '1 month after TGE' }
    ],
    totalSupply: '1,000,000 NST',
    presaleSupply: '500,000 NST',
    website: 'https://nobleswap.com',
    twitter: 'https://twitter.com/nobleswap',
    telegram: 'https://t.me/nobleswap',
    discord: 'https://discord.gg/nobleswap',
    whitepaper: 'https://nobleswap.com/whitepaper.pdf',
    contractAddress: '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
    auditReport: 'https://certik.com/audit-report',
    kycVerified: true,
    teamTokens: '10% locked for 24 months',
    marketingTokens: '5% for marketing and partnerships',
  }

  useEffect(() => {
    // Simulate API call
    const fetchPresaleData = async () => {
      setLoading(true)
      try {
        // In real implementation, fetch from Supabase Edge Function
        // const response = await supabase.functions.invoke('get-presale-details', { body: { id } })
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPresaleData(mockPresaleData)
      } catch (error) {
        console.error('Error fetching presale data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPresaleData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-noble-gold mx-auto mb-4"></div>
          <p className="text-noble-gold">Loading presale details...</p>
        </div>
      </div>
    )
  }

  if (!presaleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-noble-gold mb-4">Presale Not Found</h1>
          <p className="text-noble-gold/70">The presale you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PresaleDetail presale={presaleData} />
            <PresaleInfo presale={presaleData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PresaleCountdown endTime={presaleData.endTime} />
            <PresaleCommitment presale={presaleData} />
          </div>
        </div>
      </div>
    </div>
  )
}