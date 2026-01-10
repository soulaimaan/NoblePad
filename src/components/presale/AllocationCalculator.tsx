import { useTier } from '@/components/providers/TierProvider'
import { TIER_CONFIG } from '@/lib/tierConfig'
import { useState, useMemo } from 'react'


interface AllocationCalculatorProps {
    baseBronzeAllocation: number  // Base allocation unit for Bronze tier
    maxAllocationPerWallet: number
    totalAllocationPool: number
}

export function AllocationCalculator({
    baseBronzeAllocation,
    maxAllocationPerWallet,
    totalAllocationPool
}: AllocationCalculatorProps) {
    const { currentTier, totalStaked } = useTier()
    const [customStakeAmount, setCustomStakeAmount] = useState<string>('')

    const calculateTierFromAmount = (amount: number) => {
        if (amount >= TIER_CONFIG.GOLD.threshold) return 'GOLD'
        if (amount >= TIER_CONFIG.SILVER.threshold) return 'SILVER'
        if (amount >= TIER_CONFIG.BRONZE.threshold) return 'BRONZE'
        return 'NONE'
    }

    const calculateAllocation = (tier: string) => {
        if (tier === 'NONE') return 0
        const tierKey = tier as keyof typeof TIER_CONFIG
        const multiplier = TIER_CONFIG[tierKey].multiplier
        const allocation = baseBronzeAllocation * multiplier
        return Math.min(allocation, maxAllocationPerWallet)
    }

    const previewTier = useMemo(() => {
        const amount = customStakeAmount ? parseFloat(customStakeAmount) : totalStaked
        return calculateTierFromAmount(amount)
    }, [customStakeAmount, totalStaked])

    const previewAllocation = useMemo(() => {
        return calculateAllocation(previewTier)
    }, [previewTier])

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'GOLD': return 'text-yellow-400'
            case 'SILVER': return 'text-gray-300'
            case 'BRONZE': return 'text-amber-600'
            default: return 'text-gray-500'
        }
    }

    const getTierBgGradient = (tier: string) => {
        switch (tier) {
            case 'GOLD': return 'from-yellow-500/20 to-amber-500/10'
            case 'SILVER': return 'from-gray-400/20 to-gray-500/10'
            case 'BRONZE': return 'from-amber-600/20 to-orange-500/10'
            default: return 'from-gray-700/20 to-gray-800/10'
        }
    }

    return (
        <div className="bg-noble-gray border border-noble-gold/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-noble-gold mb-4">
                🧮 Allocation Calculator
            </h3>

            {/* Current Status */}
            <div className={`bg-gradient-to-r ${getTierBgGradient(currentTier)} border border-noble-gold/10 rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Your Current Tier</p>
                        <p className={`text-2xl font-bold ${getTierColor(currentTier)}`}>
                            {currentTier}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Staked Amount</p>
                        <p className="text-lg font-semibold text-white">
                            {totalStaked.toLocaleString()} BELGRAVE
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Calculator */}
            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                    Preview Different Stake Amount
                </label>
                <input
                    type="number"
                    value={customStakeAmount}
                    onChange={(e) => setCustomStakeAmount(e.target.value)}
                    placeholder="Enter BELGRAVE amount..."
                    className="w-full bg-black/30 border border-noble-gold/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-noble-gold"
                />
            </div>

            {/* Tier Breakdown */}
            <div className="space-y-3">
                {(['GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => {
                    const config = TIER_CONFIG[tier]
                    const isCurrentPreview = previewTier === tier
                    const allocation = calculateAllocation(tier)
                    const poolShare = (allocation / totalAllocationPool) * 100

                    return (
                        <div
                            key={tier}
                            className={`bg-gradient-to-r ${getTierBgGradient(tier)} border rounded-lg p-4 transition-all ${isCurrentPreview ? 'border-noble-gold ring-2 ring-noble-gold/50' : 'border-noble-gold/10'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className={`text-lg font-bold ${getTierColor(tier)}`}>
                                    {tier}
                                </h4>
                                {isCurrentPreview && (
                                    <span className="text-xs bg-noble-gold text-black px-2 py-1 rounded-full font-bold">
                                        YOUR TIER
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Required Stake</p>
                                    <p className="text-white font-semibold">
                                        {config.threshold.toLocaleString()} BELGRAVE
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Multiplier</p>
                                    <p className="text-white font-semibold">
                                        {config.multiplier}x
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Your Allocation</p>
                                    <p className="text-white font-semibold">
                                        {allocation.toLocaleString()} tokens
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Pool Share</p>
                                    <p className="text-white font-semibold">
                                        {config.poolShare * 100}%
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-400">Governance Weight</p>
                                    <p className="text-white font-semibold">
                                        {config.governanceWeight} {config.governanceWeight === 1 ? 'vote' : 'votes'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Lock Period Notice */}
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-xs text-orange-300">
                    ⚠️ <strong>Lock Period:</strong> Staked BELGRAVE is locked for 6 months.
                    Early unstaking forfeits your tier status and allocation.
                </p>
            </div>

            {/* Max Allocation Notice */}
            {previewAllocation >= maxAllocationPerWallet && (
                <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                        ℹ️ <strong>Max Cap:</strong> Your allocation is capped at {maxAllocationPerWallet.toLocaleString()} tokens per wallet (anti-whale protection).
                    </p>
                </div>
            )}
        </div>
    )
}
