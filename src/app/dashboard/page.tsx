'use client'

import { CreatorDashboard } from '@/components/dashboard/CreatorDashboard'
import { TIER_THRESHOLDS, useTier } from '@/components/providers/TierProvider'
import { AIScoreBadge } from '@/components/ui/AIScoreBadge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { db } from '@/lib/supabaseClient'
import { Award, Clock, Coins, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { TIER_CONFIG } from '@/lib/tierConfig'

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
    aiScore: number
}

export default function DashboardPage() {
    const { address, isConnected } = useAccount()
    const { currentTier, totalStaked, isLoading } = useTier()
    const [commitments, setCommitments] = useState<UserCommitment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('investor')

    // Map TierLevel to Display Data
    const tierData = useMemo(() => {
        if (currentTier === 'NONE') {
            return {
                tier: 'None',
                color: 'text-gray-500',
                benefits: ['Public sale access only'],
                multiplier: 1
            }
        }
        const config = TIER_CONFIG[currentTier]
        return {
            tier: config.label,
            color: config.color,
            benefits: config.benefits,
            multiplier: config.multiplier
        }
    }, [currentTier])

    const totalCommitted = commitments.reduce((sum, c) => sum + c.amount, 0)
    const totalTokens = commitments.reduce((sum, c) => sum + c.tokenAllocation, 0)
    const confirmedCommitments = commitments.filter(c => c.status === 'confirmed')

    useEffect(() => {
        if (!address) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: dbCommitments } = await db.getUserCommitments(address)

                if (dbCommitments && dbCommitments.length > 0) {
                    const mapped = dbCommitments.map((c: any) => {
                        const p = c.presales || {}
                        return {
                            id: c.id,
                            presaleId: c.presale_id,
                            projectName: p.project_name || p.name || 'Untitled Project',
                            tokenSymbol: p.token_symbol || 'TKN',
                            amount: parseFloat(c.amount || '0'),
                            tokenAllocation: parseFloat(c.token_allocation || '0'),
                            status: c.status || 'confirmed',
                            commitDate: new Date(c.created_at),
                            chain: p.chain || 'ETH',
                            aiScore: p.ai_score || 8.5
                        }
                    })
                    setCommitments(mapped)
                }
            } catch (e) {
                console.error('Failed to fetch dashboard data:', e)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [address])

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

                {/* Tabs Switcher */}
                <div className="mb-8">
                    <Tabs value={activeTab} className="w-full">
                        <TabsList className="mb-8">
                            <TabsTrigger
                                value="investor"
                                data-state={activeTab === 'investor' ? 'active' : 'inactive'}
                                onClick={() => setActiveTab('investor')}
                            >
                                Investor View
                            </TabsTrigger>
                            <TabsTrigger
                                value="creator"
                                data-state={activeTab === 'creator' ? 'active' : 'inactive'}
                                onClick={() => setActiveTab('creator')}
                            >
                                Creator View (Beta)
                            </TabsTrigger>
                        </TabsList>

                        {/* Investor View Content */}
                        {activeTab === 'investor' && (
                            <TabsContent value="investor">
                                {/* Header */}
                                <div className="mb-8">
                                    <h1 className="text-4xl md:text-5xl font-bold noble-text-gradient mb-4">
                                        Dashboard
                                    </h1>
                                    <p className="text-xl text-noble-gold/70">
                                        Welcome back! Track your presale investments and tier status.
                                    </p>
                                </div>

                                {/* User Info */}
                                <div className="noble-card mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-noble-gold mb-2">Account Overview</h2>
                                            <p className="text-noble-gold/70 font-mono text-sm">
                                                {address}
                                            </p>
                                        </div>
                                        <div className="px-4 py-2 rounded-lg bg-noble-gold/10">
                                            <div className={`text-lg font-semibold ${tierData.color}`}>
                                                {tierData.tier} Tier
                                            </div>
                                            <div className="text-sm text-noble-gold/70">
                                                {tierData.multiplier}x multiplier
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <Coins className="w-8 h-8 text-noble-gold mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-noble-gold">{totalStaked.toLocaleString()}</div>
                                            <div className="text-sm text-noble-gold/70">Total Staked</div>
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
                                            <h3 className="text-xl font-semibold text-noble-gold mb-4">Staking Status</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-noble-gold/70">Current Stake:</span>
                                                    <span className="text-noble-gold font-semibold">{totalStaked.toLocaleString()} Tokens</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-noble-gold/70">Tier:</span>
                                                    <span className={`font-semibold ${tierData.color}`}>{tierData.tier}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-noble-gold/70">Max Multiplier:</span>
                                                    <span className="text-noble-gold font-semibold">{tierData.multiplier}x</span>
                                                </div>

                                                {/* Tier Progress */}
                                                <div className="mt-6">
                                                    <div className="flex justify-between text-sm text-noble-gold/70 mb-2">
                                                        <span>Progress to Next Tier</span>
                                                        <span>{Math.min(100, (totalStaked / TIER_THRESHOLDS.GOLD) * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-noble-gray rounded-full h-2">
                                                        <div
                                                            className="bg-noble-gold-gradient h-2 rounded-full transition-all duration-500"
                                                            // eslint-disable-next-line react-dom/no-unsafe-inline-style
                                                            style={{ width: `${Math.min(100, (totalStaked / TIER_THRESHOLDS.GOLD) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-noble-gold/60 mt-1">
                                                        <span>0</span>
                                                        <span>{TIER_THRESHOLDS.GOLD.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <Button className="w-full mt-4" onClick={() => window.location.href = '/staking'}>
                                                    Go to Staking Hub
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="noble-card">
                                        <h3 className="text-xl font-semibold text-noble-gold mb-4">Tier Benefits</h3>
                                        <div className="space-y-3">
                                            {tierData.benefits.map((benefit: string, index: number) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 bg-noble-gold rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-sm text-noble-gold/70">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Commitments Table */}
                                <div className="noble-card">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-semibold text-noble-gold">My Presale Commitments</h3>
                                    </div>

                                    {commitments.length === 0 ? (
                                        <div className="text-center py-12">
                                            <TrendingUp className="w-16 h-16 text-noble-gold/50 mx-auto mb-4" />
                                            <p className="text-xl text-noble-gold/70 mb-4">No presale commitments yet</p>
                                            <Button onClick={() => window.location.href = '/presales'}>
                                                Explore Presales
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-noble-gold/20">
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Project</th>
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Belgrave AI</th>
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Committed</th>
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Tokens</th>
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-4 text-left text-sm font-medium text-noble-gold/70 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-noble-gold/20">
                                                    {commitments.map((commitment) => (
                                                        <tr key={commitment.id} className="hover:bg-noble-gray/30 transition-colors duration-200">
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-noble-gold">
                                                                <Link href={`/presale/${commitment.presaleId}`} className="hover:underline">
                                                                    {commitment.projectName}
                                                                </Link>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <AIScoreBadge score={commitment.aiScore} size="sm" />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-noble-gold">{commitment.amount} {commitment.chain}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-noble-gold">{commitment.tokenAllocation.toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(commitment.status)}`}>
                                                                    {commitment.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-noble-gold">{commitment.commitDate.toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        )}

                        {/* Creator View Content */}
                        {activeTab === 'creator' && (
                            <TabsContent value="creator">
                                <CreatorDashboard />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}