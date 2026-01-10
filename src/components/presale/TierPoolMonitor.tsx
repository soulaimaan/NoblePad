'use client'

import { TIER_CONFIG } from '@/lib/tierConfig'
import { useMemo } from 'react'


interface TierPoolMonitorProps {
    totalAllocationPool: number
    goldAllocated: number
    silverAllocated: number
    bronzeAllocated: number
    goldParticipants: number
    silverParticipants: number
    bronzeParticipants: number
}

export function TierPoolMonitor({
    totalAllocationPool,
    goldAllocated,
    silverAllocated,
    bronzeAllocated,
    goldParticipants,
    silverParticipants,
    bronzeParticipants
}: TierPoolMonitorProps) {
    const poolData = useMemo(() => {
        const goldPool = totalAllocationPool * TIER_CONFIG.GOLD.poolShare
        const silverPool = totalAllocationPool * TIER_CONFIG.SILVER.poolShare
        const bronzePool = totalAllocationPool * TIER_CONFIG.BRONZE.poolShare

        return {
            gold: {
                total: goldPool,
                allocated: goldAllocated,
                remaining: goldPool - goldAllocated,
                fillPercentage: (goldAllocated / goldPool) * 100,
                participants: goldParticipants
            },
            silver: {
                total: silverPool,
                allocated: silverAllocated,
                remaining: silverPool - silverAllocated,
                fillPercentage: (silverAllocated / silverPool) * 100,
                participants: silverParticipants
            },
            bronze: {
                total: bronzePool,
                allocated: bronzeAllocated,
                remaining: bronzePool - bronzeAllocated,
                fillPercentage: (bronzeAllocated / bronzePool) * 100,
                participants: bronzeParticipants
            }
        }
    }, [totalAllocationPool, goldAllocated, silverAllocated, bronzeAllocated, goldParticipants, silverParticipants, bronzeParticipants])

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'gold': return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500' }
            case 'silver': return { text: 'text-gray-300', bg: 'bg-gray-400', border: 'border-gray-400' }
            case 'bronze': return { text: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600' }
            default: return { text: 'text-gray-500', bg: 'bg-gray-500', border: 'border-gray-500' }
        }
    }

    return (
        <div className="bg-noble-gray border border-noble-gold/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-noble-gold mb-4">
                📊 Tier Pool Availability
            </h3>

            {/* Overall Stats */}
            <div className="bg-black/30 border border-noble-gold/10 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-400">Total Pool</p>
                        <p className="text-lg font-semibold text-white">
                            {totalAllocationPool.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Allocated</p>
                        <p className="text-lg font-semibold text-green-400">
                            {(goldAllocated + silverAllocated + bronzeAllocated).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Remaining</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {(totalAllocationPool - (goldAllocated + silverAllocated + bronzeAllocated)).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tier Pools */}
            <div className="space-y-4">
                {(['gold', 'silver', 'bronze'] as const).map((tier) => {
                    const data = poolData[tier]
                    const colors = getTierColor(tier)
                    const isOversubscribed = data.fillPercentage > 100

                    return (
                        <div
                            key={tier}
                            className={`bg-gradient-to-r from-${tier === 'gold' ? 'yellow' : tier === 'silver' ? 'gray' : 'amber'}-500/20 to-transparent border ${colors.border}/30 rounded-lg p-4`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className={`text-lg font-bold ${colors.text} uppercase`}>
                                    {tier}
                                </h4>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Pool Share</p>
                                    <p className="text-white font-semibold">
                                        {TIER_CONFIG[tier.toUpperCase() as keyof typeof TIER_CONFIG].poolShare * 100}%
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Allocated: {data.allocated.toLocaleString()}</span>
                                    <span>{Math.min(data.fillPercentage, 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`${colors.bg} ${isOversubscribed ? 'opacity-100' : 'opacity-70'} progress-fill h-full`}
                                        ref={(el) => { if (el) el.style.setProperty('--progress', `${Math.min(data.fillPercentage, 100)}%`) }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Total Pool</p>
                                    <p className="text-white font-semibold">
                                        {data.total.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Remaining</p>
                                    <p className={`font-semibold ${isOversubscribed ? 'text-red-400' : 'text-blue-400'}`}>
                                        {isOversubscribed ? '0 (Oversubscribed)' : data.remaining.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Participants</p>
                                    <p className="text-white font-semibold">
                                        {data.participants}
                                    </p>
                                </div>
                            </div>

                            {/* Oversubscription Notice */}
                            {isOversubscribed && (
                                <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
                                    <p className="text-xs text-orange-400">
                                        ⚠️ <strong>Oversubscribed:</strong> Allocations will be scaled proportionally.
                                        Scaling factor: {(100 / data.fillPercentage).toFixed(3)}x
                                    </p>
                                </div>
                            )}

                            {/* Low availability warning */}
                            {!isOversubscribed && data.fillPercentage > 80 && (
                                <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                                    <p className="text-xs text-yellow-400">
                                        ⏰ <strong>Limited Availability:</strong> Only {data.remaining.toLocaleString()} tokens remaining in this tier pool.
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Rolldown Notice */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                    ℹ️ <strong>Rolldown Logic:</strong> Unused allocation from higher tiers automatically rolls down to lower tiers (Gold → Silver → Bronze).
                </p>
            </div>
        </div>
    )
}
