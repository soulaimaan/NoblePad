'use client'

import { MilestoneDashboard } from '@/components/presale/MilestoneDashboard'
import { PresaleComments } from '@/components/presale/PresaleComments'
import { PresaleCommitment } from '@/components/presale/PresaleCommitment'
import { PresaleCountdown } from '@/components/presale/PresaleCountdown'
import { PresaleDetail } from '@/components/presale/PresaleDetail'
import { PresaleInfo } from '@/components/presale/PresaleInfo'
import { QuestSection } from '@/components/presale/QuestSection'
import { ReferralCard } from '@/components/presale/ReferralCard'
import { AIProjectScore } from '@/components/sections/AIProjectScore'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { getChainById } from '@/lib/chains'
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
        name: isXrpl ? 'Belgrave XRPL Launch' : 'BelgraveSwap',
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
        tokenName: isXrpl ? 'Belgrave' : 'BelgraveSwap Token',
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


          const { data: rawData, error: fetchError } = await db.getPresaleById(id as string)

          if (fetchError) {
            console.error('Database fetch error:', fetchError)
            throw new Error(fetchError.message)
          }

          if (rawData) {
            // Get chain info to format currency
            // Handle legacy 'chain' (string) vs modern 'chain_id' (number)
            let chainId = 56 // Default to BSC
            let chainName = 'Unknown Chain'

            if (rawData.project_name === 'Belgrave Test' || rawData.name === 'Belgrave Test') {
              chainId = 31337
              chainName = 'Localhost'
            } else if (rawData.chain && typeof rawData.chain === 'string') {
              const chainMap: Record<string, number> = { 'ETH': 1, 'BSC': 56, 'POLYGON': 137, 'ARB': 42161, 'BASE': 8453, 'XRPL': 144, 'LOCALHOST': 31337 }
              chainId = chainMap[rawData.chain.toUpperCase()] || 56
              chainName = rawData.chain
            } else if (rawData.chain_id) {
              chainId = rawData.chain_id
              const chainConfig = getChainById(chainId)
              chainName = chainConfig?.name || 'Unknown Chain'
            }

            const chainConfig = getChainById(chainId)
            const currencySymbol = chainConfig?.nativeCurrency?.symbol || 'BNB'

            // Helper to append currency if missing
            const formatCurrency = (val: any) => {
              if (val === undefined || val === null) return '0 ' + currencySymbol
              const sVal = val.toString()
              if (sVal.includes(currencySymbol)) return sVal
              if (sVal.includes('ETH') || sVal.includes('BNB') || sVal.includes('MATIC') || sVal.includes('XRP')) return sVal
              return `${sVal} ${currencySymbol}`
            }

            const isLocalTest = String(rawData.project_name || rawData.name || '').toLowerCase().includes('noble test');
            const finalChainId = isLocalTest ? 31337 : chainId;
            const finalChainName = isLocalTest ? 'Localhost' : chainName;

            // Transform data (Supporting both Legacy and Modern schemas)
            setPresaleData({
              ...rawData,
              id: rawData.id,
              name: rawData.project_name || rawData.name || 'Unnamed Project',
              description: rawData.description || '',
              chain: finalChainName,
              chain_id: finalChainId,
              hardCap: formatCurrency(rawData.hard_cap),
              softCap: formatCurrency(rawData.soft_cap),
              raised: formatCurrency(rawData.total_raised || rawData.current_raised || '0'),
              progress: (parseFloat(rawData.total_raised || rawData.current_raised || '0') / parseFloat(rawData.hard_cap || '1')) * 100,
              startTime: new Date(rawData.start_date || rawData.start_time),
              endTime: new Date(rawData.end_date || rawData.end_time),
              tokenName: rawData.token_name,
              tokenSymbol: rawData.token_symbol,
              tokenPrice: (rawData.token_price || '').toString().includes('=')
                ? rawData.token_price
                : `1 ${currencySymbol} = ${rawData.token_price} ${rawData.token_symbol}`,
              minContribution: formatCurrency(rawData.min_contribution || '0'),
              maxContribution: formatCurrency(rawData.max_contribution || '0'),
              liquidityLock: `${rawData.liquidity_lock_months} months`,
              liquidityPercentage: `${rawData.liquidity_percentage}%`,
              vestingSchedule: rawData.vesting_schedule || [],
              totalSupply: rawData.total_supply,
              presaleSupply: rawData.total_supply,
              contractAddress: (rawData.contract_address || (rawData.id && rawData.id.startsWith('0x') ? rawData.id : null) || rawData.token_address || '').toString().trim(),
              auditReport: rawData.audit_report_url || rawData.audit_report,
              kycVerified: rawData.kyc_verified || (rawData.kyc_documents && rawData.kyc_documents.length > 0),
              milestones: rawData.milestones || []
            })
          }
        } catch (error) {
          console.error('Error fetching presale data:', error)
          // Fallback to mock data on error for demo purposes
          setPresaleData(getMockData())
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
                <TabsTrigger value="quests">Community Quests</TabsTrigger>
                <TabsTrigger value="info">Token Information</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
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

              <TabsContent value="quests">
                <QuestSection presaleId={id as string} />
              </TabsContent>

              <TabsContent value="info">
                <PresaleInfo presale={presaleData} />
              </TabsContent>

              <TabsContent value="discussion">
                <PresaleComments presaleId={id as string} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PresaleCountdown endTime={presaleData.endTime} />

            {/* AI SCORE INTEGRATION */}
            <AIProjectScore presaleId={id as string} />

            <ReferralCard presaleId={id as string} />

            <PresaleCommitment presale={presaleData} />
          </div>
        </div>
      </div>
    </div>
  )
}
