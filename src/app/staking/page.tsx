'use client'
// NoblePad Staking Redesign


import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import stakingService, { StakingInfo } from '@/lib/stakingService'
import { StakingStats } from '@/components/staking/StakingStats'
import { Button } from '@/components/ui/Button'
import { Lock, Unlock, Shield, ArrowRight, CheckCircle, ChevronRight, Activity } from 'lucide-react'

// Tier definitions could be moved to a shared config
const TIERS = [
    { name: 'Bronze', required: 0, multiplier: '1x', color: 'text-noble-gray/80', bg: 'bg-noble-gray/20' },
    { name: 'Silver', required: 1000, multiplier: '1.25x', color: 'text-gray-300', bg: 'bg-gray-400/20' },
    { name: 'Gold', required: 5000, multiplier: '1.5x', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    { name: 'Platinum', required: 20000, multiplier: '2x', color: 'text-cyan-400', bg: 'bg-cyan-400/20' }
]

export default function StakingPage() {
    const { address, isConnected, chainId } = useAccount()
    const { data: walletClient } = useWalletClient()

    const [activeTab, setActiveTab] = useState<'stake' | 'withdraw'>('stake')
    const [amount, setAmount] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
        totalStaked: '0',
        userStaked: '0',
        stakingTokenAddress: '',
        stakingTokenSymbol: 'NPAD',
        stakingTokenDecimals: 18
    })

    const loadStakingInfo = useCallback(async () => {
        if (chainId) {
            const info = await stakingService.getStakingInfo(address, chainId)
            setStakingInfo(info)
        }
    }, [address, chainId])

    useEffect(() => {
        loadStakingInfo()
        // Poll every 15 seconds for updates
        const interval = setInterval(loadStakingInfo, 15000)
        return () => clearInterval(interval)
    }, [loadStakingInfo])

    const handleAction = async () => {
        if (!walletClient || !amount || !chainId) return

        setIsLoading(true)
        try {
            const provider = new ethers.BrowserProvider(walletClient)
            const signer = await provider.getSigner()

            if (activeTab === 'stake') {
                await stakingService.stake(amount, signer, chainId)
                alert('Staking successful!')
            } else {
                await stakingService.withdraw(amount, signer, chainId)
                alert('Withdrawal successful!')
            }
            setAmount('')
            await loadStakingInfo()
        } catch (error: any) {
            console.error('Staking action failed:', error)
            alert(`Transaction failed: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    // Tier Logic
    const getCurrentTier = (stakedAmount: number) => {
        let current = TIERS[0]
        let next = TIERS[1]

        for (let i = 0; i < TIERS.length; i++) {
            if (stakedAmount >= TIERS[i].required) {
                current = TIERS[i]
                next = TIERS[i + 1] || null
            }
        }
        return { current, next }
    }

    const userStakedNum = parseFloat(stakingInfo.userStaked)
    const { current: currentTier, next: nextTier } = getCurrentTier(userStakedNum)

    const progressToNext = nextTier
        ? Math.min(100, Math.max(0, ((userStakedNum - currentTier.required) / (nextTier.required - currentTier.required)) * 100))
        : 100

    // Hardcoded APY for demo (in real app, calculate from contract rewards)
    const MOCK_APY = "12.5"

    if (!isConnected) {
        return (
            <div className="min-h-screen py-20 flex items-center justify-center">
                <div className="text-center">
                    <Shield size={64} className="mx-auto text-noble-gold mb-6 opacity-50" />
                    <h1 className="text-4xl font-bold text-noble-gold mb-4">Connect to Stake</h1>
                    <p className="text-xl text-noble-gold/60 mb-8 max-w-lg mx-auto">
                        Connect your wallet to access the NoblePad Staking Dashboard and earn rewards.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center md:text-left md:flex md:justify-between md:items-end">
                    <div>
                        <h1 className="text-5xl font-bold noble-text-gradient mb-3">Staking Dashboard</h1>
                        <p className="text-xl text-noble-gold/60">
                            Stake {stakingInfo.stakingTokenSymbol} to earn rewards and unlock higher allocation tiers.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <StakingStats
                    totalStaked={parseFloat(stakingInfo.totalStaked).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    userStaked={parseFloat(stakingInfo.userStaked).toLocaleString()}
                    stakingTokenSymbol={stakingInfo.stakingTokenSymbol}
                    apy={MOCK_APY}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Action Center (7/12) */}
                    <div className="lg:col-span-7">
                        <div className="noble-card bg-gradient-to-br from-[#1a1a1a] to-black border-noble-gold/20 h-full">
                            <div className="flex border-b border-noble-gold/10 mb-6">
                                <button
                                    onClick={() => setActiveTab('stake')}
                                    className={`flex-1 py-4 text-center font-bold text-lg transition-colors border-b-2 ${activeTab === 'stake' ? 'text-noble-gold border-noble-gold' : 'text-noble-gold/40 border-transparent hover:text-noble-gold/70'}`}
                                >
                                    Stake
                                </button>
                                <button
                                    onClick={() => setActiveTab('withdraw')}
                                    className={`flex-1 py-4 text-center font-bold text-lg transition-colors border-b-2 ${activeTab === 'withdraw' ? 'text-noble-gold border-noble-gold' : 'text-noble-gold/40 border-transparent hover:text-noble-gold/70'}`}
                                >
                                    Withdraw
                                </button>
                            </div>

                            <div className="px-6 pb-6">
                                <div className="mb-8 p-4 bg-noble-gray/30 rounded-xl border border-noble-gold/10">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium text-noble-gold/70">
                                            Amount to {activeTab === 'stake' ? 'Stake' : 'Withdraw'}
                                        </label>
                                        <span className="text-sm text-noble-gold/50">
                                            Staked Balance: {stakingInfo.userStaked} {stakingInfo.stakingTokenSymbol}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full bg-transparent text-3xl font-bold text-white placeholder-noble-gray/50 focus:outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAmount(activeTab === 'stake' ? '1000' : stakingInfo.userStaked)} // Placeholder for Max
                                        >
                                            MAX
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full text-lg py-8 font-bold noble-gradient shadow-lg hover:shadow-noble-gold/20 transition-all"
                                    onClick={handleAction}
                                    disabled={isLoading || !amount || parseFloat(amount) <= 0}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" /> Processing...</span>
                                    ) : (
                                        activeTab === 'stake' ? 'Approve & Stake' : 'Withdraw Tokens'
                                    )}
                                </Button>

                                <p className="mt-4 text-center text-xs text-noble-gold/40">
                                    {activeTab === 'stake'
                                        ? 'Staking will lock your tokens and grant you Tier status.'
                                        : 'Withdrawing will reduce your Tier status and allocation limits.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tier Progress (5/12) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Current Tier Card */}
                        <div className="noble-card relative overflow-hidden bg-gradient-to-br from-noble-gray/90 to-black/90">
                            <div className={`absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br from-noble-gold to-transparent rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none`} />

                            <h3 className="text-lg font-semibold text-noble-gold/70 mb-4 flex items-center">
                                <Activity className="mr-2" size={18} /> Current Status
                            </h3>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className={`text-4xl font-bold ${currentTier.color} mb-1`}>{currentTier.name} Tier</div>
                                    <div className="text-sm text-noble-gold/60">{currentTier.multiplier} Allocation</div>
                                </div>
                                <div className={`w-16 h-16 rounded-full ${currentTier.bg} flex items-center justify-center border-2 border-white/10`}>
                                    <Shield className={currentTier.color} size={32} />
                                </div>
                            </div>

                            {nextTier ? (
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-noble-gold/60">Next: {nextTier.name}</span>
                                        <span className="text-noble-gold">{userStakedNum.toLocaleString()} / {nextTier.required.toLocaleString()} {stakingInfo.stakingTokenSymbol}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-noble-gold to-yellow-300 transition-all duration-1000"
                                            style={{ width: `${progressToNext}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-noble-gold/40 mt-3 flex items-center">
                                        Stake {(nextTier.required - userStakedNum).toLocaleString()} more to unlock {nextTier.multiplier} allocation! <ArrowRight size={10} className="ml-1" />
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-noble-gold/10 rounded-xl p-4 border border-noble-gold/20 text-center">
                                    <CheckCircle className="mx-auto text-noble-gold mb-2" size={24} />
                                    <h4 className="font-bold text-noble-gold">Max Tier Reached!</h4>
                                    <p className="text-xs text-noble-gold/60">You have the highest possible allocation multiplier.</p>
                                </div>
                            )}
                        </div>

                        {/* Benefits List */}
                        <div className="noble-card bg-transparent border border-noble-gold/10">
                            <h4 className="text-sm font-semibold text-noble-gold/80 mb-4">Tier Benefits</h4>
                            <div className="space-y-3">
                                {TIERS.map((tier) => (
                                    <div key={tier.name} className={`flex items-center justify-between p-2 rounded-lg ${currentTier.name === tier.name ? 'bg-noble-gold/10 border border-noble-gold/20' : 'opacity-60'}`}>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-3 ${tier.name === 'Bronze' ? 'bg-orange-700' : tier.name === 'Silver' ? 'bg-gray-400' : tier.name === 'Gold' ? 'bg-yellow-400' : 'bg-cyan-400'}`} />
                                            <span className="text-sm font-medium text-noble-gold">{tier.name}</span>
                                        </div>
                                        <div className="text-xs text-noble-gold/60 font-mono">
                                            {tier.required > 0 ? `${tier.required}+` : '0+'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
