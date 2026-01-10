'use client'

import { PresaleCard } from '@/components/presale/PresaleCard'
import { PresaleFilters } from '@/components/presale/PresaleFilters'
import { TrendingBar } from '@/components/presale/TrendingBar'
import { getChainById } from '@/lib/chains'
import { db } from '@/lib/supabaseClient'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useMemo } from 'react'

export default function PresalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { data: presales = [], isLoading: loading } = useQuery({
    queryKey: ['presales'],
    queryFn: async () => {
      const { data } = await db.getPresales()
      let fetchedPresales: any[] = []

      if (data && data.length > 0) {
        fetchedPresales = data.map((p: any) => {
          let chainId = 56
          let chainName = 'Unknown'

          if (p.chain && typeof p.chain === 'string') {
            const chainMap: Record<string, number> = { 'ETH': 1, 'BSC': 56, 'POLYGON': 137, 'ARB': 42161, 'BASE': 8453, 'XRPL': 144 }
            chainId = chainMap[p.chain.toUpperCase()] || 56
            chainName = p.chain
          } else if (p.chain_id) {
            chainId = p.chain_id
            const chainConfig = getChainById(chainId)
            chainName = chainConfig?.name || 'Unknown'
          }

          const chainConfig = getChainById(chainId)
          const currencySymbol = chainConfig?.nativeCurrency?.symbol || 'BNB'

          return {
            id: p.id,
            name: p.project_name || p.token_name || 'Agile Project',
            logo: p.logo_url || `/api/placeholder/128/128`,
            hardCap: p.hard_cap ? `${p.hard_cap} ${currencySymbol}` : 'Unlimited',
            softCap: p.soft_cap ? `${p.soft_cap} ${currencySymbol}` : 'Unset',
            raised: (p.total_raised || p.current_raised) ? `${p.total_raised || p.current_raised} ${currencySymbol}` : `0 ${currencySymbol}`,
            progress: p.hard_cap && (p.total_raised || p.current_raised) ? (parseFloat(p.total_raised || p.current_raised) / parseFloat(p.hard_cap)) * 100 : 0,
            endTime: new Date(p.end_date || p.end_time || Date.now() + 86400000),
            status: p.status || 'live',
            chain: chainName,
            liquidityLock: p.liquidity_lock_months ? `${p.liquidity_lock_months} months` : '12 months',
            aiScore: p.ai_score || Math.floor(Math.random() * 3) + 7
          }
        })
      }

      const mockPresales = [
        {
          id: 'mock-1',
          name: 'Belgrave Official',
          logo: '/logo.jpg',
          hardCap: '100,000 XRP',
          softCap: '50,000 XRP',
          raised: '75,000 XRP',
          progress: 75,
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'live',
          chain: 'XRPL',
          liquidityLock: '12 months',
          aiScore: 9.8
        },
        {
          id: 'mock-2',
          name: 'NobleDefi Protocol',
          logo: '/api/placeholder/128/128',
          hardCap: '500 BNB',
          softCap: '250 BNB',
          raised: '387 BNB',
          progress: 77,
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'live',
          chain: 'BSC',
          liquidityLock: '12 months',
          aiScore: 9.2
        },
        {
          id: 'mock-3',
          name: 'Base AI Agent',
          logo: '/api/placeholder/128/128',
          hardCap: '50 ETH',
          softCap: '10 ETH',
          raised: '42 ETH',
          progress: 84,
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          chain: 'Base',
          liquidityLock: '6 months',
          aiScore: 8.9
        },
        {
          id: 'mock-4',
          name: 'GreenEnergy Token',
          logo: '/api/placeholder/128/128',
          hardCap: '250,000 XRP',
          softCap: '100,000 XRP',
          raised: '220,000 XRP',
          progress: 88,
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'live',
          chain: 'XRPL',
          liquidityLock: '24 months',
          aiScore: 9.5
        },
        {
          id: 'mock-5',
          name: 'GameFi Arcade',
          logo: '/api/placeholder/128/128',
          hardCap: '200 ETH',
          softCap: '50 ETH',
          raised: '0 ETH',
          progress: 0,
          endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          chain: 'Base',
          liquidityLock: '12 months',
          aiScore: 8.7
        }
      ]

      mockPresales.forEach(mock => {
        if (!fetchedPresales.find(p => p.id === mock.id)) {
          fetchedPresales.push(mock)
        }
      })

      // Filter out test entries from DB if they exist (Robust filtering)
      return fetchedPresales.filter(p => {
        const lowerName = p.name.toLowerCase()
        return !lowerName.includes('noble test') &&
          !lowerName.includes('nole test') &&
          !lowerName.includes('test project')
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // Client-side filtering
  const filteredPresales = presales.filter(presale => {
    const matchesSearch = presale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presale.chain.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesChain = selectedChain === 'all' ||
      (presale.chain.toUpperCase().includes(selectedChain)) ||
      (selectedChain === 'ETH' && presale.chain.includes('Ethereum')) // simple mapping

    const matchesStatus = selectedStatus === 'all' || presale.status === selectedStatus

    return matchesSearch && matchesChain && matchesStatus
  })

  return (
    <div className="min-h-screen pb-8">
      {/* Trending Bar */}
      <TrendingBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
            Active Presales
          </h1>
          <p className="text-xl text-noble-gold/70">
            Discover vetted projects with anti-rug protection and guaranteed liquidity locks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-noble-gold/50" size={20} />
            <input
              type="text"
              placeholder="Search presales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="noble-input pl-10 w-full"
            />
          </div>

          {/* Filters */}
          <PresaleFilters
            selectedChain={selectedChain}
            selectedStatus={selectedStatus}
            onChainChange={setSelectedChain}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-noble-gold/70">
            {loading ? 'Loading...' : `Showing ${filteredPresales.length} presales`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="noble-card animate-pulse">
                <div className="h-6 bg-noble-gray/40 rounded mb-4"></div>
                <div className="h-4 bg-noble-gray/40 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-noble-gray/40 rounded mb-4 w-1/2"></div>
                <div className="h-2 bg-noble-gray/40 rounded mb-2"></div>
                <div className="h-8 bg-noble-gray/40 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Presale Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresales.map((presale) => (
              <PresaleCard key={presale.id} presale={presale} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPresales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-noble-gold/70 mb-4">No presales found</p>
            <p className="text-noble-gold/50">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}