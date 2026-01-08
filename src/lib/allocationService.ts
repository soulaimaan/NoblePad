/**
 * Allocation Service
 * 
 * Implements deterministic, fair allocation mechanics for Belgrave tier system.
 * 
 * Key Features:
 * - Tier-based allocation multipliers (1.0x, 2.5x, 5.0x)
 * - Proportional oversubscription scaling (no lottery)
 * - Anti-whale hard caps
 * - Tier pool distribution (50% Bronze, 30% Silver, 20% Gold)
 * - Rolldown logic (unused Gold → Silver → Bronze)
 */

import { TIER_CONFIG, TierLevel } from '@/lib/tierConfig'

// Anti-whale: Maximum allocation per wallet (in tokens)
export const MAX_ALLOCATION_PER_WALLET = 50_000  // Adjust per presale

export interface TierAllocation {
    tier: TierLevel
    baseAllocation: number
    multipliedAllocation: number
    finalAllocation: number
    isOversubscribed: boolean
    scalingFactor: number
}

export interface PresaleAllocationConfig {
    totalAllocationPool: number        // Total tokens for presale
    baseBronzeAllocationUnit: number   // Base unit for Bronze tier
    maxAllocationPerWallet: number     // Hard cap per wallet
    tierPoolSplit?: {                  // Optional custom split
        bronze: number                 // Default: 0.50
        silver: number                 // Default: 0.30
        gold: number                   // Default: 0.20
    }
}

export interface TierParticipant {
    wallet: string
    tier: TierLevel
    stakedAmount: number
}

/**
 * Calculate user's allocation based on tier
 */
export function calculateUserAllocation(
    userTier: TierLevel,
    baseUnit: number,
    maxCap: number
): number {
    if (userTier === 'NONE') return 0

    const tierConfig = TIER_CONFIG[userTier]
    const multipliedAllocation = baseUnit * tierConfig.multiplier

    // Apply hard cap
    return Math.min(multipliedAllocation, maxCap)
}

/**
 * Calculate tier pool sizes based on total allocation
 */
export function calculateTierPools(
    totalPool: number,
    customSplit?: { bronze: number; silver: number; gold: number }
): Record<TierLevel, number> {
    const split = customSplit || {
        bronze: TIER_CONFIG.BRONZE.poolShare,
        silver: TIER_CONFIG.SILVER.poolShare,
        gold: TIER_CONFIG.GOLD.poolShare
    }

    return {
        BRONZE: totalPool * split.bronze,
        SILVER: totalPool * split.silver,
        GOLD: totalPool * split.gold,
        NONE: 0
    }
}

/**
 * Handle oversubscription with proportional scaling
 * NO LOTTERY - Deterministic outcome
 */
export function scaleOversubscribedAllocations(
    requests: Map<string, number>,  // wallet -> requested allocation
    tierPoolSize: number
): Map<string, number> {
    const totalRequested = Array.from(requests.values()).reduce((sum, val) => sum + val, 0)

    if (totalRequested <= tierPoolSize) {
        // No oversubscription
        return requests
    }

    // Calculate scaling factor
    const scalingFactor = tierPoolSize / totalRequested

    // Scale all allocations proportionally
    const scaledAllocations = new Map<string, number>()
    for (const [wallet, requested] of requests.entries()) {
        scaledAllocations.set(wallet, requested * scalingFactor)
    }

    return scaledAllocations
}

/**
 * Distribute allocations with rolldown logic
 * Unused allocation rolls Gold → Silver → Bronze
 */
export function distributeAllocationsWithRolldown(
    participants: TierParticipant[],
    config: PresaleAllocationConfig
): Map<string, TierAllocation> {
    const results = new Map<string, TierAllocation>()

    // Calculate tier pools
    const tierPools = calculateTierPools(
        config.totalAllocationPool,
        config.tierPoolSplit
    )

    // Group participants by tier
    const tierGroups: Record<TierLevel, TierParticipant[]> = {
        GOLD: [],
        SILVER: [],
        BRONZE: [],
        NONE: []
    }

    for (const participant of participants) {
        tierGroups[participant.tier].push(participant)
    }

    // Calculate requested allocations per tier
    const tierRequests: Record<TierLevel, Map<string, number>> = {
        GOLD: new Map(),
        SILVER: new Map(),
        BRONZE: new Map(),
        NONE: new Map()
    }

    for (const tier of ['GOLD', 'SILVER', 'BRONZE'] as TierLevel[]) {
        for (const participant of tierGroups[tier]) {
            const allocation = calculateUserAllocation(
                tier,
                config.baseBronzeAllocationUnit,
                config.maxAllocationPerWallet
            )
            tierRequests[tier].set(participant.wallet, allocation)
        }
    }

    // Process allocations with rolldown
    let unusedGold = 0
    let unusedSilver = 0

    // 1. Process GOLD tier
    const goldAllocations = scaleOversubscribedAllocations(
        tierRequests.GOLD,
        tierPools.GOLD
    )
    const goldUsed = Array.from(goldAllocations.values()).reduce((sum, val) => sum + val, 0)
    unusedGold = tierPools.GOLD - goldUsed

    for (const [wallet, allocation] of goldAllocations.entries()) {
        const requested = tierRequests.GOLD.get(wallet)!
        results.set(wallet, {
            tier: 'GOLD',
            baseAllocation: config.baseBronzeAllocationUnit,
            multipliedAllocation: requested,
            finalAllocation: allocation,
            isOversubscribed: goldUsed > tierPools.GOLD,
            scalingFactor: allocation / requested
        })
    }

    // 2. Process SILVER tier (with Gold rolldown)
    const silverPoolWithRolldown = tierPools.SILVER + unusedGold
    const silverAllocations = scaleOversubscribedAllocations(
        tierRequests.SILVER,
        silverPoolWithRolldown
    )
    const silverUsed = Array.from(silverAllocations.values()).reduce((sum, val) => sum + val, 0)
    unusedSilver = silverPoolWithRolldown - silverUsed

    for (const [wallet, allocation] of silverAllocations.entries()) {
        const requested = tierRequests.SILVER.get(wallet)!
        results.set(wallet, {
            tier: 'SILVER',
            baseAllocation: config.baseBronzeAllocationUnit,
            multipliedAllocation: requested,
            finalAllocation: allocation,
            isOversubscribed: silverUsed > silverPoolWithRolldown,
            scalingFactor: allocation / requested
        })
    }

    // 3. Process BRONZE tier (with Silver + Gold rolldown)
    const bronzePoolWithRolldown = tierPools.BRONZE + unusedSilver
    const bronzeAllocations = scaleOversubscribedAllocations(
        tierRequests.BRONZE,
        bronzePoolWithRolldown
    )

    for (const [wallet, allocation] of bronzeAllocations.entries()) {
        const requested = tierRequests.BRONZE.get(wallet)!
        results.set(wallet, {
            tier: 'BRONZE',
            baseAllocation: config.baseBronzeAllocationUnit,
            multipliedAllocation: requested,
            finalAllocation: allocation,
            isOversubscribed: Array.from(bronzeAllocations.values()).reduce((sum, val) => sum + val, 0) > bronzePoolWithRolldown,
            scalingFactor: allocation / requested
        })
    }

    return results
}

/**
 * Validate anti-whale rules
 */
export function validateAllocation(
    wallet: string,
    allocation: number,
    maxCap: number,
    existingAllocations: Map<string, TierAllocation>
): { valid: boolean; error?: string } {
    // Rule 1: One allocation per wallet
    if (existingAllocations.has(wallet)) {
        return {
            valid: false,
            error: 'Wallet already has an allocation (one tier per wallet)'
        }
    }

    // Rule 2: Hard cap enforcement
    if (allocation > maxCap) {
        return {
            valid: false,
            error: `Allocation exceeds maximum cap of ${maxCap}`
        }
    }

    return { valid: true }
}

/**
 * Get allocation multiplier for a tier
 */
export function getTierMultiplier(tier: TierLevel): number {
    if (tier === 'NONE') return 0
    return TIER_CONFIG[tier].multiplier
}

/**
 * Get governance weight for a tier
 */
export function getGovernanceWeight(tier: TierLevel): number {
    if (tier === 'NONE') return 0
    return TIER_CONFIG[tier].governanceWeight
}
