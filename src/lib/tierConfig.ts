export type TierLevel = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD'

export const TIER_CONFIG = {
    BRONZE: {
        label: 'Bronze',
        threshold: 17_500_000,      // 17.5M BELGRAVE (~20 XRP)
        multiplier: 1.0,             // 1.0x allocation
        governanceWeight: 1,         // 1 vote
        poolShare: 0.50,             // 50% of allocation pool
        lockPeriodMonths: 6,         // Required lock period
        color: 'text-orange-400',
        benefits: ['Allocated based on availability', 'Basic project access']
    },
    SILVER: {
        label: 'Silver',
        threshold: 87_500_000,      // 87.5M BELGRAVE (~100 XRP)
        multiplier: 2.5,             // 2.5x allocation
        governanceWeight: 2,         // 2 votes
        poolShare: 0.30,             // 30% of allocation pool
        lockPeriodMonths: 6,
        color: 'text-gray-300',
        benefits: ['Top-tier allocation', 'Priority access', 'Community voting rights']
    },
    GOLD: {
        label: 'Gold',
        threshold: 175_000_000,     // 175M BELGRAVE (~200 XRP)
        multiplier: 5.0,             // 5.0x allocation
        governanceWeight: 3,         // 3 votes
        poolShare: 0.20,             // 20% of allocation pool
        lockPeriodMonths: 6,
        color: 'text-yellow-400',
        benefits: ['Guaranteed allocation', 'Priority access', 'Early project voting', 'Reduced fees']
    }
} as const

export const STAKE_LOCK_PERIOD = 6 * 30 * 24 * 60 * 60 // 6 months in seconds
