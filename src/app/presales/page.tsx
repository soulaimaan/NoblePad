'use client'

import { PresaleCard } from '@/components/presale/PresaleCard'
import { PresaleFilters } from '@/components/presale/PresaleFilters'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PresalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [presales, setPresales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Mock data for demo - in production, remove this and use API
  const mockPresales = [
    {
      id: '1',
      name: 'NobleSwap',
      logo: '/api/placeholder/64/64',
      hardCap: '500 BNB',
      softCap: '250 BNB',
      raised: '387 BNB',
      progress: 77,
      endTime: new Date('2024-12-31'),
      status: 'live' as const,
      chain: 'BSC',
      liquidityLock: '12 months'
    },
    {
      id: '2',
      name: 'CryptoVault',
      logo: '/api/placeholder/64/64',
      hardCap: '300 BNB',
      softCap: '150 BNB',
      raised: '142 BNB',
      progress: 47,
      endTime: new Date('2024-12-25'),
      status: 'live' as const,
      chain: 'BSC',
      liquidityLock: '6 months'
    },
    {
      id: '3',
      name: 'DeFiGems',
      logo: '/api/placeholder/64/64',
      hardCap: '750 ETH',
      softCap: '400 ETH',
      raised: '0 ETH',
      progress: 0,
      endTime: new Date('2025-01-15'),
      status: 'upcoming' as const,
      chain: 'ETH',
      liquidityLock: '18 months'
    },
    {
      id: '4',
      name: 'MetaVault',
      logo: '/api/placeholder/64/64',
      hardCap: '200 MATIC',
      softCap: '100 MATIC',
      raised: '200 MATIC',
      progress: 100,
      endTime: new Date('2023-11-20'),
      status: 'ended' as const,
      chain: 'POLYGON',
      liquidityLock: '24 months'
    },
    {
      id: '5',
      name: 'TokenLaunch',
      logo: '/api/placeholder/64/64',
      hardCap: '1000 BNB',
      softCap: '500 BNB',
      raised: '650 BNB',
      progress: 65,
      endTime: new Date('2024-12-30'),
      status: 'live' as const,
      chain: 'BSC',
      liquidityLock: '12 months'
    },
    {
      id: '6',
      name: 'NextGenDeFi',
      logo: '/api/placeholder/64/64',
      hardCap: '400 ETH',
      softCap: '200 ETH',
      raised: '0 ETH',
      progress: 0,
      endTime: new Date('2025-02-01'),
      status: 'upcoming' as const,
      chain: 'ETH',
      liquidityLock: '12 months'
    },
    {
      id: '7',
      name: 'BaseSwap Protocol',
      logo: '/api/placeholder/64/64',
      hardCap: '800 ETH',
      softCap: '400 ETH',
      raised: '120 ETH',
      progress: 15,
      endTime: new Date('2025-02-15'),
      status: 'upcoming' as const,
      chain: 'BASE',
      liquidityLock: '18 months'
    },
    {
      id: '8',
      name: 'SolanaFi Protocol',
      logo: '/api/placeholder/64/64',
      hardCap: '50,000 SOL',
      softCap: '25,000 SOL',
      raised: '8,750 SOL',
      progress: 17,
      endTime: new Date('2025-03-01'),
      status: 'live' as const,
      chain: 'SOL',
      liquidityLock: '12 months'
    }
  ]

  // Load presales on mount and when filters change
  useEffect(() => {
    const loadPresales = async () => {
      setLoading(true)
      try {
        // Uncomment this for production with real API
        // const { presales, total_count } = await presalesAPI.getPresales({
        //   status: selectedStatus !== 'all' ? selectedStatus : undefined,
        //   chain: selectedChain !== 'all' ? selectedChain : undefined,
        //   search: searchTerm || undefined,
        //   limit: 50
        // })
        // setPresales(presales)
        // setTotalCount(total_count)
        
        // Demo: Use mock data with filtering
        const filteredMockPresales = mockPresales.filter(presale => {
          const matchesSearch = presale.name.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesChain = selectedChain === 'all' || presale.chain === selectedChain
          const matchesStatus = selectedStatus === 'all' || presale.status === selectedStatus
          
          return matchesSearch && matchesChain && matchesStatus
        })
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setPresales(filteredMockPresales)
        setTotalCount(filteredMockPresales.length)
      } catch (error) {
        console.error('Failed to load presales:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPresales()
  }, [searchTerm, selectedChain, selectedStatus])

  const filteredPresales = presales

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
            All Presales
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
            {loading ? 'Loading...' : `Showing ${filteredPresales.length} of ${totalCount} presales`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="noble-card animate-pulse">
                <div className="h-6 bg-noble-gray rounded mb-4"></div>
                <div className="h-4 bg-noble-gray rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-noble-gray rounded mb-4 w-1/2"></div>
                <div className="h-2 bg-noble-gray rounded mb-2"></div>
                <div className="h-8 bg-noble-gray rounded"></div>
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
        {filteredPresales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-noble-gold/70 mb-4">No presales found</p>
            <p className="text-noble-gold/50">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}