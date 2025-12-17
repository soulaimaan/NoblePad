'use client'

import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { calculateUserTier } from '@/lib/utils'
import { Award, Clock, Coins, Eye, Shield, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserCommitment {
  id: string
  presaleId: string
  projectName: string
  tokenSymbol: string
  amount: number
  tokenAllocation: number
  status: 'pending' | 'confirmed' | 'claimed'
  commitDate: Date
  chain: string
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [userStake, setUserStake] = useState(5500) // Mock staked amount
  const [loading, setLoading] = useState(true)

  // Mock user data - would come from API
  const mockCommitments: UserCommitment[] = [
    {
      id: '1',
      presaleId: 'presale-1',
      projectName: 'NobleSwap',
      tokenSymbol: 'NST',
      amount: 2.5,
      tokenAllocation: 2500,
      status: 'confirmed',
      commitDate: new Date('2024-03-10'),
      chain: 'BSC'
    },
    {
      id: '2',
      presaleId: 'presale-2',
      projectName: 'CryptoVault',
      tokenSymbol: 'CVT',
      amount: 1.0,
      tokenAllocation: 800,
      status: 'confirmed',
      commitDate: new Date('2024-03-05'),
      chain: 'ETH'
    },
    {
      id: '3',
      presaleId: 'presale-3',
      projectName: 'MetaSwap',
      tokenSymbol: 'MSP',
      amount: 0.5,
      tokenAllocation: 600,
      status: 'pending',
      commitDate: new Date('2024-03-12'),
      chain: 'POLYGON'
    }
  ]

  const userTier = calculateUserTier(userStake)
  const totalCommitted = mockCommitments.reduce((sum, c) => sum + c.amount, 0)
  const totalTokens = mockCommitments.reduce((sum, c) => sum + c.tokenAllocation, 0)
  const confirmedCommitments = mockCommitments.filter(c => c.status === 'confirmed')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-noble-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-noble-gold" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-noble-gold mb-4">Connect Your Wallet</h1>
          <p className="text-noble-gold/70 mb-6">
            Connect your wallet to view your dashboard with presale commitments, staking rewards, and portfolio overview.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-noble-gold mx-auto mb-4"></div>
          <p className="text-noble-gold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'claimed': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-noble-gold bg-noble-gold/20'
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-noble-gold/70">
            Welcome back! Track your presale investments and staking rewards.
          </p>
        </div>

        {/* User Info */}
        <div className="noble-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-noble-gold mb-2">Account Overview</h2>
              <p className="text-noble-gold/70 font-mono text-sm">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${userTier.color.replace('text-', 'bg-')}/20`}>
              <div className={`text-lg font-semibold ${userTier.color}`}>
                {userTier.tier} Tier
              </div>
              <div className="text-sm text-noble-gold/70">
                ${userTier.allocation.toLocaleString()} allocation
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Coins className="w-8 h-8 text-noble-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-noble-gold">{userStake.toLocaleString()}</div>
              <div className="text-sm text-noble-gold/70">$NPAD Staked</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{totalCommitted.toFixed(2)}</div>
              <div className="text-sm text-noble-gold/70">Total Committed</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{totalTokens.toLocaleString()}</div>
              <div className="text-sm text-noble-gold/70">Tokens Allocated</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">{confirmedCommitments.length}</div>
              <div className="text-sm text-noble-gold/70">Active Presales</div>
            </div>
          </div>
        </div>

        {/* Staking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="noble-card">
              <h3 className="text-xl font-semibold text-noble-gold mb-4">$NPAD Staking</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-noble-gold/70">Current Stake:</span>
                  <span className="text-noble-gold font-semibold">{userStake.toLocaleString()} $NPAD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-noble-gold/70">Current Tier:</span>
                  <span className={`font-semibold ${userTier.color}`}>{userTier.tier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-noble-gold/70">Max Allocation:</span>
                  <span className="text-noble-gold font-semibold">${userTier.allocation.toLocaleString()}</span>
                </div>
                
                {/* Tier Progress */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-noble-gold/70 mb-2">
                    <span>Progress to Gold Tier</span>
                    <span>{Math.min(100, (userStake / 10000) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-noble-gray rounded-full h-2">
                    <div 
                      className="bg-noble-gold-gradient h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (userStake / 10000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-noble-gold/60 mt-1">
                    <span>0</span>
                    <span>10,000 $NPAD</span>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Stake More $NPAD
                </Button>
              </div>
            </div>
          </div>

          <div className="noble-card">
            <h3 className="text-xl font-semibold text-noble-gold mb-4">Tier Benefits</h3>
            <div className="space-y-3">
              {userTier.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-noble-gold rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-noble-gold/70">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commitments */}
        <div className="noble-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-noble-gold">My Presale Commitments</h3>
            <Button variant="outline" size="sm">
              View All History
            </Button>
          </div>

          {mockCommitments.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-noble-gold/50 mx-auto mb-4" />
              <p className="text-xl text-noble-gold/70 mb-4">No presale commitments yet</p>
              <p className="text-noble-gold/50 mb-6">Start investing in vetted presales to see them here</p>
              <Button>
                Explore Presales
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-noble-gold/20">
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Committed
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Tokens Allocated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-noble-gold/20">
                  {mockCommitments.map((commitment) => (
                    <tr key={commitment.id} className="hover:bg-noble-gray/30 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-noble-gold/20 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-noble-gold font-semibold text-sm">
                              {commitment.tokenSymbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-noble-gold">{commitment.projectName}</div>
                            <div className="text-sm text-noble-gold/60">{commitment.tokenSymbol} • {commitment.chain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                        {commitment.amount} {commitment.chain === 'ETH' ? 'ETH' : 'BNB'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                        {commitment.tokenAllocation.toLocaleString()} {commitment.tokenSymbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(commitment.status)}`}>
                          {commitment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-noble-gold">
                        {commitment.commitDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}