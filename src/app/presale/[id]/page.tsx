'use client'

import { MilestoneDashboard } from '@/components/presale/MilestoneDashboard'
import { PresaleCommitment } from '@/components/presale/PresaleCommitment'
import { PresaleCountdown } from '@/components/presale/PresaleCountdown'
import { PresaleDetail } from '@/components/presale/PresaleDetail'
import { PresaleInfo } from '@/components/presale/PresaleInfo'
import { AIProjectScore } from '@/components/sections/AIProjectScore'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { db } from '@/lib/supabaseClient'
import { ChevronLeft, Loader } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PresaleDetailPage() {
  const params = useParams()
  const id = params?.id
  const [presaleData, setPresaleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Mock data - defined inside useEffect to avoid hydration mismatches with dynamic dates
    const getMockData = () => {
      const now = Date.now()
      const isXrpl = id === 'xrpl-test' || id === '2'

      return {
        id: id as string,
        name: isXrpl ? 'Belgrave XRPL Launch' : 'NobleSwap',
        description: isXrpl 
          ? 'The official XRPL launch of the Belgrave token. Secure your allocation on the XRP Ledger.'
          : 'A revolutionary DEX built on BSC with advanced AMM features and yield farming.',
        logo: '/api/placeholder/128/128',
        banner: '/api/placeholder/800/400',
        hardCap: isXrpl ? '50,000 XRP' : '500 BNB',
        softCap: isXrpl ? '25,000 XRP' : '250 BNB',
        raised: isXrpl ? '12,450 XRP' : '387 BNB',
        progress: isXrpl ? 24 : 77,
        startTime: new Date(now - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now + 5 * 24 * 60 * 60 * 1000),
        status: 'live' as const,
        chain: isXrpl ? 'XRPL' : 'BSC',
        tokenName: isXrpl ? 'Belgrave' : 'NobleSwap Token',
        tokenSymbol: isXrpl ? 'BELGRAVE' : 'NST',
        tokenIssuer: isXrpl ? 'rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG' : undefined,
        tokenCurrency: isXrpl ? 'BELGRAVE' : undefined,
        tokenPrice: isXrpl ? '1 XRP = 1,000 BELGRAVE' : '1 BNB = 1,000 NST',
        exchangeRate: 1000,
        minContribution: isXrpl ? '10 XRP' : '0.1 BNB',
        maxContribution: isXrpl ? '1000 XRP' : '10 BNB',
        liquidityLock: '12 months',
        liquidityPercentage: '80%',
        vestingSchedule: [
          { percentage: 50, time: 'TGE (Token Generation Event)' },
          { percentage: 50, time: '1 month after TGE' }
        ],
        totalSupply: isXrpl ? '1,000,000,000 BELGRAVE' : '1,000,000 NST',
        presaleSupply: isXrpl ? '500,000,000 BELGRAVE' : '500,000 NST',
        website: 'https://nobleswap.com',
        twitter: 'https://twitter.com/nobleswap',
        telegram: 'https://t.me/nobleswap',
        discord: 'https://discord.gg/nobleswap',
        whitepaper: 'https://nobleswap.com/whitepaper.pdf',
        contractAddress: isXrpl ? 'rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG' : '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
        auditReport: 'https://certik.com/audit-report',
        kycVerified: true,
        teamTokens: '10% locked for 24 months',
        marketingTokens: '5% for marketing and partnerships',
      }
    }

    if (id) {
      const fetchPresaleData = async () => {
        setLoading(true)
        try {
          if (id === 'xrpl-test' || id === '2') {
             // Mock data for test cases
             await new Promise(resolve => setTimeout(resolve, 500))
             setPresaleData(getMockData())
             return
          }

          const data = await db.getPresaleById(id as string)
          if (data) {
            // Transform Supabase data to frontend format
            setPresaleData({
              ...data,
              hardCap: data.hard_cap,
              softCap: data.soft_cap,
              raised: data.total_raised,
              progress: (parseFloat(data.total_raised) / parseFloat(data.hard_cap)) * 100,
              startTime: new Date(data.start_time),
              endTime: new Date(data.end_time),
              tokenName: data.token_name,
              tokenSymbol: data.token_symbol,
              tokenPrice: data.token_price,
              minContribution: data.min_contribution,
              maxContribution: data.max_contribution,
              liquidityLock: `${data.liquidity_lock_months} months`,
              liquidityPercentage: `${data.liquidity_percentage}%`,
              vestingSchedule: data.vesting_schedule,
              totalSupply: data.total_supply,
              presaleSupply: data.total_supply, // Simplified
              contractAddress: data.contract_address,
              auditReport: data.audit_report,
              kycVerified: data.kyc_documents && data.kyc_documents.length > 0,
              milestones: data.milestones
            })
          }
        } catch (error) {
          console.error('Error fetching presale data:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchPresaleData()
    }
  }, [id])

  if (!isMounted) {
    return <div className="min-h-screen bg-noble-black" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-noble-gold mx-auto mb-4" />
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
          <p className="text-noble-gold/70">The presale you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/presales">
            <Button variant="ghost" className="text-noble-gold/60 hover:text-noble-gold flex items-center gap-2 pl-0">
              <ChevronLeft size={20} />
              Back to Presales
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="governance">Milestone Governance</TabsTrigger>
                <TabsTrigger value="info">Token Information</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <PresaleDetail presale={presaleData} />
              </TabsContent>

              <TabsContent value="governance">
                <MilestoneDashboard 
                  projectAddress={presaleData.contractAddress} 
                  chain={presaleData.chain || 'EVM'} 
                  totalRaised={presaleData.raised} 
                  milestones={presaleData.milestones}
                />
              </TabsContent>

              <TabsContent value="info">
                <PresaleInfo presale={presaleData} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PresaleCountdown endTime={presaleData.endTime} />
            
            {/* AI SCORE INTEGRATION */}
            <AIProjectScore 
              score={8.8} 
              metadata={{
                githubVerified: true,
                whitepaperAnalyzed: true,
                liquidityLocked: true
              }} 
            />

            <PresaleCommitment presale={presaleData} />
          </div>
        </div>
      </div>
    </div>
  )
}
