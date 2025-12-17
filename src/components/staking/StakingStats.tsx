import { Activity, Users, Wallet, TrendingUp } from 'lucide-react'

interface StakingStatsProps {
    totalStaked: string;
    userStaked: string;
    stakingTokenSymbol: string;
    apy: string;
}

export const StakingStats = ({ totalStaked, userStaked, stakingTokenSymbol, apy }: StakingStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Value Locked */}
            <div className="noble-card relative overflow-hidden group hover:border-noble-gold/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={48} className="text-noble-gold" />
                </div>
                <div className="relative z-10">
                    <div className="text-noble-gold/60 text-sm font-medium mb-1 flex items-center">
                        <Activity size={14} className="mr-2" />
                        Total Staked
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {totalStaked} <span className="text-xs text-noble-gold/70 font-normal">{stakingTokenSymbol}</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center">
                        <TrendingUp size={10} className="mr-1" />
                        Active Pool
                    </div>
                </div>
            </div>

            {/* APY */}
            <div className="noble-card relative overflow-hidden group hover:border-noble-gold/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={48} className="text-green-400" />
                </div>
                <div className="relative z-10">
                    <div className="text-noble-gold/60 text-sm font-medium mb-1 flex items-center">
                        <TrendingUp size={14} className="mr-2" />
                        Dynamic APY
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                        {apy}%
                    </div>
                    <div className="text-xs text-noble-gold/50">
                        Based on rewards
                    </div>
                </div>
            </div>

            {/* My Stake */}
            <div className="noble-card relative overflow-hidden group hover:border-noble-gold/40 transition-all duration-300 bg-noble-gold/5 border-noble-gold/30">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet size={48} className="text-noble-gold" />
                </div>
                <div className="relative z-10">
                    <div className="text-noble-gold/80 text-sm font-medium mb-1 flex items-center">
                        <Wallet size={14} className="mr-2" />
                        Your Stake
                    </div>
                    <div className="text-2xl font-bold text-noble-gold mb-1">
                        {userStaked}
                    </div>
                    <div className="text-xs text-noble-gold/60">
                        {stakingTokenSymbol}
                    </div>
                </div>
            </div>

            {/* Stakers Count - Placeholder/Static for now */}
            <div className="noble-card relative overflow-hidden group hover:border-noble-gold/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users size={48} className="text-blue-400" />
                </div>
                <div className="relative z-10">
                    <div className="text-noble-gold/60 text-sm font-medium mb-1 flex items-center">
                        <Users size={14} className="mr-2" />
                        Total Stakers
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        --
                    </div>
                    <div className="text-xs text-noble-gold/50">
                        Growing community
                    </div>
                </div>
            </div>
        </div>
    )
}
