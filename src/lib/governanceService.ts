/**
 * Governance Service
 * 
 * Implements weighted voting for Belgrave milestone approvals.
 * 
 * Key Features:
 * - Non-linear vote weighting (Bronze: 1, Silver: 2, Gold: 3)
 * - Snapshot-based eligibility
 * - One vote per wallet per milestone
 * - Non-transferable votes
 * - Transparent vote tallying
 */

import { TierLevel, TIER_CONFIG } from '@/lib/tierConfig'
import { TierSnapshot, TierParticipantSnapshot } from './snapshotService'

export interface MilestoneVote {
    milestoneId: string
    presaleId: string
    wallet: string
    tier: TierLevel
    voteWeight: number
    vote: 'approve' | 'reject'
    timestamp: number
    signature?: string                // Optional: cryptographic signature
}

export interface MilestoneVoteTally {
    milestoneId: string
    totalVotes: number
    approveVotes: number
    rejectVotes: number
    approveWeight: number
    rejectWeight: number
    participationRate: number          // % of eligible voters who voted
    approvalPercentage: number         // % weighted approval
    isApproved: boolean
    breakdown: {
        gold: { approve: number; reject: number; weight: number }
        silver: { approve: number; reject: number; weight: number }
        bronze: { approve: number; reject: number; weight: number }
    }
}

/**
 * Calculate vote weight for a tier
 */
export function calculateVoteWeight(tier: TierLevel): number {
    if (tier === 'NONE') return 0
    return TIER_CONFIG[tier].governanceWeight
}

/**
 * Cast a vote on a milestone
 */
export async function castMilestoneVote(
    wallet: string,
    milestoneId: string,
    presaleId: string,
    vote: 'approve' | 'reject',
    snapshot: TierSnapshot
): Promise<{ success: boolean; voteRecord?: MilestoneVote; error?: string }> {
    // Verify voter is in snapshot
    const participant = snapshot.participants.find(
        p => p.wallet.toLowerCase() === wallet.toLowerCase()
    )

    if (!participant || participant.tier === 'NONE') {
        return {
            success: false,
            error: 'Wallet not eligible to vote (not in tier snapshot)'
        }
    }

    // Calculate vote weight
    const voteWeight = calculateVoteWeight(participant.tier)

    // Create vote record
    const voteRecord: MilestoneVote = {
        milestoneId,
        presaleId,
        wallet,
        tier: participant.tier,
        voteWeight,
        vote,
        timestamp: Date.now()
    }

    return {
        success: true,
        voteRecord
    }
}

/**
 * Tally votes for a milestone
 */
export function tallyMilestoneVotes(
    milestoneId: string,
    votes: MilestoneVote[],
    snapshot: TierSnapshot,
    approvalThreshold: number = 0.66  // 66% weighted approval required
): MilestoneVoteTally {
    const breakdown = {
        gold: { approve: 0, reject: 0, weight: 0 },
        silver: { approve: 0, reject: 0, weight: 0 },
        bronze: { approve: 0, reject: 0, weight: 0 }
    }

    let totalApproveWeight = 0
    let totalRejectWeight = 0

    // Tally votes by tier
    for (const vote of votes) {
        const tierKey = vote.tier.toLowerCase() as 'gold' | 'silver' | 'bronze'

        if (vote.vote === 'approve') {
            breakdown[tierKey].approve++
            breakdown[tierKey].weight += vote.voteWeight
            totalApproveWeight += vote.voteWeight
        } else {
            breakdown[tierKey].reject++
            breakdown[tierKey].weight += vote.voteWeight
            totalRejectWeight += vote.voteWeight
        }
    }

    const totalWeight = totalApproveWeight + totalRejectWeight
    const totalVotes = votes.length
    const eligibleVoters = snapshot.participants.filter(p => p.tier !== 'NONE').length

    const participationRate = eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0
    const approvalPercentage = totalWeight > 0 ? (totalApproveWeight / totalWeight) * 100 : 0
    const isApproved = approvalPercentage >= (approvalThreshold * 100)

    return {
        milestoneId,
        totalVotes,
        approveVotes: votes.filter(v => v.vote === 'approve').length,
        rejectVotes: votes.filter(v => v.vote === 'reject').length,
        approveWeight: totalApproveWeight,
        rejectWeight: totalRejectWeight,
        participationRate,
        approvalPercentage,
        isApproved,
        breakdown
    }
}

/**
 * Validate that a wallet has not already voted
 */
export function hasAlreadyVoted(
    wallet: string,
    milestoneId: string,
    existingVotes: MilestoneVote[]
): boolean {
    return existingVotes.some(
        v => v.wallet.toLowerCase() === wallet.toLowerCase() && v.milestoneId === milestoneId
    )
}

/**
 * Get voting power distribution across tiers
 */
export function getVotingPowerDistribution(snapshot: TierSnapshot): {
    total: number
    gold: { count: number; weight: number; percentage: number }
    silver: { count: number; weight: number; percentage: number }
    bronze: { count: number; weight: number; percentage: number }
} {
    const goldCount = snapshot.tierBreakdown.gold
    const silverCount = snapshot.tierBreakdown.silver
    const bronzeCount = snapshot.tierBreakdown.bronze

    const goldWeight = goldCount * TIER_CONFIG.GOLD.governanceWeight
    const silverWeight = silverCount * TIER_CONFIG.SILVER.governanceWeight
    const bronzeWeight = bronzeCount * TIER_CONFIG.BRONZE.governanceWeight

    const totalWeight = goldWeight + silverWeight + bronzeWeight

    return {
        total: totalWeight,
        gold: {
            count: goldCount,
            weight: goldWeight,
            percentage: totalWeight > 0 ? (goldWeight / totalWeight) * 100 : 0
        },
        silver: {
            count: silverCount,
            weight: silverWeight,
            percentage: totalWeight > 0 ? (silverWeight / totalWeight) * 100 : 0
        },
        bronze: {
            count: bronzeCount,
            weight: bronzeWeight,
            percentage: totalWeight > 0 ? (bronzeWeight / totalWeight) * 100 : 0
        }
    }
}

/**
 * Check if voting period is active
 */
export function isVotingPeriodActive(
    milestoneId: string,
    votingStartTime: number,
    votingDurationDays: number
): boolean {
    const now = Date.now()
    const votingEndTime = votingStartTime + (votingDurationDays * 24 * 60 * 60 * 1000)

    return now >= votingStartTime && now <= votingEndTime
}

/**
 * Export votes to JSON for storage/verification
 */
export function exportVotes(votes: MilestoneVote[]): string {
    return JSON.stringify(votes, null, 2)
}

/**
 * Import votes from JSON
 */
export function importVotes(json: string): MilestoneVote[] {
    return JSON.parse(json)
}
