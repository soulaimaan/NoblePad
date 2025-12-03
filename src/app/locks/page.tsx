'use client'

import { useState } from 'react'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { Lock, Clock, Shield, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LiquidityLock {
  id: string
  projectName: string
  tokenSymbol: string
  lpTokenAddress: string
  amount: string
  unlockDate: Date
  percentage: number
  chain: string
  status: 'locked' | 'unlocked' | 'partially_unlocked'
}

export default function LiquidityLocksPage() {
  const { isConnected } = useAccount()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('all')

  // Mock data - will be replaced with API calls
  const mockLocks: LiquidityLock[] = [
    {
      id: '1',
      projectName: 'NobleSwap',
      tokenSymbol: 'NST',
      lpTokenAddress: '0x742d35cc6bf5d532a0b17e0bfe95e5b4e6a8f9e4',
      amount: '400 BNB',
      unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      percentage: 80,
      chain: 'BSC',
      status: 'locked'
    },
    {
      id: '2',
      projectName: 'CryptoVault',
      tokenSymbol: 'CVT',
      lpTokenAddress: '0x456789abcdef123456789abcdef123456789abcde',
      amount: '225 ETH',
      unlockDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months from now
      percentage: 75,
      chain: 'ETH',
      status: 'locked'
    },
    {
      id: '3',
      projectName: 'MetaSwap',
      tokenSymbol: 'MSP',
      lpTokenAddress: '0xabcdef123456789abcdef123456789abcdef123456',
      amount: '637 MATIC',
      unlockDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months from now
      percentage: 85,
      chain: 'POLYGON',
      status: 'locked'
    },
    {
      id: '4',
      projectName: 'BaseSwap',
      tokenSymbol: 'BSWAP',
      lpTokenAddress: '0x123abc456def789abc123def456abc789def123ab',
      amount: '500 ETH',
      unlockDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months from now
      percentage: 85,
      chain: 'BASE',
      status: 'locked'
    },
    {
      id: '5',
      projectName: 'SolanaFi',
      tokenSymbol: 'SOLF',
      lpTokenAddress: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
      amount: '15,000 SOL',
      unlockDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months from now
      percentage: 80,
      chain: 'SOL',
      status: 'locked'
    }
  ]

  const filteredLocks = mockLocks.filter(lock => {
    const matchesSearch = lock.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lock.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChain = selectedChain === 'all' || lock.chain === selectedChain
    
    return matchesSearch && matchesChain
  })

  const formatTimeLeft = (unlockDate: Date) => {
    const now = new Date()
    const timeDiff = unlockDate.getTime() - now.getTime()
    
    if (timeDiff <= 0) return 'Unlocked'
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)
    
    if (years > 0) return `${years}y ${months % 12}m`
    if (months > 0) return `${months}m ${days % 30}d`
    return `${days}d`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'text-green-400 bg-green-400/20'
      case 'unlocked': return 'text-blue-400 bg-blue-400/20'
      case 'partially_unlocked': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-noble-gold bg-noble-gold/20'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
            Liquidity Locks
          </h1>
          <p className="text-xl text-noble-gold/70 mb-6">
            Track liquidity locks across all presales for maximum transparency
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-noble-gold/50" size={20} />
            <input
              type="text"
              placeholder="Search by project name or token symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="noble-input pl-10 w-full"
            />
          </div>

          {/* Chain Filter */}
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="noble-input min-w-[150px]"
          >
            <option value="all">All Chains</option>
            <option value="BSC">BSC</option>
            <option value="ETH">Ethereum</option>
            <option value="POLYGON">Polygon</option>
            <option value="ARB">Arbitrum</option>
            <option value="BASE">Base</option>
            <option value="SOL">Solana</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="noble-card text-center">
            <Lock className="w-8 h-8 text-noble-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-noble-gold">{mockLocks.length}</div>
            <div className="text-sm text-noble-gold/70">Total Locks</div>
          </div>
          <div className="noble-card text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{mockLocks.filter(l => l.status === 'locked').length}</div>
            <div className="text-sm text-noble-gold/70">Active Locks</div>
          </div>
          <div className="noble-card text-center">
            <Clock className="w-8 h-8 text-noble-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-noble-gold">$2.1M</div>
            <div className="text-sm text-noble-gold/70">Locked Value</div>
          </div>
          <div className="noble-card text-center">
            <div className="w-8 h-8 bg-noble-gold/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-noble-gold font-bold">%</span>
            </div>
            <div className="text-2xl font-bold text-noble-gold">80%</div>
            <div className="text-sm text-noble-gold/70">Avg Lock %</div>
          </div>
        </div>

        {/* Locks Table */}
        <div className="noble-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-noble-gold/20">
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Amount Locked
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Lock %
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Unlock Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                    Chain
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noble-gold/20">
                {filteredLocks.map((lock) => (
                  <tr key={lock.id} className="hover:bg-noble-gray/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-noble-gold/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-noble-gold font-semibold text-sm">
                            {lock.tokenSymbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-noble-gold">{lock.projectName}</div>
                          <div className="text-sm text-noble-gold/60">{lock.tokenSymbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                      {lock.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                      {lock.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                      {lock.unlockDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                      {formatTimeLeft(lock.unlockDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lock.status)}`}>
                        {lock.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                      {lock.chain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLocks.length === 0 && (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-noble-gold/50 mx-auto mb-4" />
            <p className="text-xl text-noble-gold/70 mb-4">No liquidity locks found</p>
            <p className="text-noble-gold/50">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}