import { useState } from 'react'
import { TierSnapshot } from '@/lib/snapshotService'
import { MilestoneVote, castMilestoneVote, tallyMilestoneVotes, hasAlreadyVoted } from '@/lib/governanceService'
import { TIER_CONFIG } from '@/lib/tierConfig'
import { useTier } from '@/components/providers/TierProvider'


interface GovernanceVotingProps {
    milestoneId: string
    milestoneTitle: string
    milestoneDescription: string
    snapshot: TierSnapshot
    existingVotes: MilestoneVote[]
    votingEndTime: number
    onVoteSubmit: (vote: MilestoneVote) => Promise<void>
}

export function GovernanceVoting({
    milestoneId,
    milestoneTitle,
    milestoneDescription,
    snapshot,
    existingVotes,
    votingEndTime,
    onVoteSubmit
}: GovernanceVotingProps) {
    const { currentTier } = useTier()
    const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    const now = Date.now()
    const isVotingActive = now < votingEndTime
    const timeRemaining = votingEndTime - now
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    // Calculate tally
    const tally = tallyMilestoneVotes(milestoneId, existingVotes, snapshot)

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'GOLD': return 'text-yellow-400'
            case 'SILVER': return 'text-gray-300'
            case 'BRONZE': return 'text-amber-600'
            default: return 'text-gray-500'
        }
    }

    const handleVote = async (vote: 'approve' | 'reject') => {
        if (!isVotingActive || hasVoted || isSubmitting) return

        setIsSubmitting(true)
        try {
            // This would normally get the wallet address from the wallet provider
            const walletAddress = '0x...' // TODO: Get from wallet context

            const result = await castMilestoneVote(
                walletAddress,
                milestoneId,
                snapshot.presaleId,
                vote,
                snapshot
            )

            if (result.success && result.voteRecord) {
                await onVoteSubmit(result.voteRecord)
                setHasVoted(true)
                setSelectedVote(vote)
            }
        } catch (error) {
            console.error('Failed to cast vote:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-noble-gray border border-noble-gold/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-noble-gold">
                    🗳️ Milestone Voting
                </h3>
                {isVotingActive ? (
                    <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                        ● Active
                    </span>
                ) : (
                    <span className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                        ● Closed
                    </span>
                )}
            </div>

            {/* Milestone Info */}
            <div className="bg-black/30 border border-noble-gold/10 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">{milestoneTitle}</h4>
                <p className="text-gray-400 text-sm">{milestoneDescription}</p>

                {isVotingActive && (
                    <div className="mt-3 text-xs text-gray-500">
                        ⏱️ Voting ends in {daysRemaining}d {hoursRemaining}h
                    </div>
                )}
            </div>

            {/* Your Voting Power */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Your Voting Power</p>
                        <p className={`text-3xl font-bold ${getTierColor(currentTier)}`}>
                            {currentTier !== 'NONE' ? TIER_CONFIG[currentTier].governanceWeight : 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {currentTier} Tier
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Vote Type</p>
                        <p className="text-lg font-semibold text-white">
                            {selectedVote ? (
                                <span className={selectedVote === 'approve' ? 'text-green-400' : 'text-red-400'}>
                                    {selectedVote === 'approve' ? '✅ Approve' : '❌ Reject'}
                                </span>
                            ) : (
                                <span className="text-gray-500">Not voted</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Vote Buttons */}
            {!hasVoted && isVotingActive && currentTier !== 'NONE' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => handleVote('approve')}
                        disabled={isSubmitting}
                        className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : '✅ Approve'}
                    </button>
                    <button
                        onClick={() => handleVote('reject')}
                        disabled={isSubmitting}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : '❌ Reject'}
                    </button>
                </div>
            )}

            {/* Current Results */}
            <div className="bg-black/30 border border-noble-gold/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Current Results</h4>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Approve: {tally.approvalPercentage.toFixed(1)}%</span>
                        <span>Reject: {(100 - tally.approvalPercentage).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                            className="progress-fill bg-green-400"
                            ref={(el) => { if (el) el.style.setProperty('--progress', `${tally.approvalPercentage}%`) }}
                        />
                        <div
                            className="progress-fill bg-red-400"
                            ref={(el) => { if (el) el.style.setProperty('--progress', `${100 - tally.approvalPercentage}%`) }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Total Votes</p>
                        <p className="text-white font-semibold">{tally.totalVotes}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Weighted Approve</p>
                        <p className="text-green-400 font-semibold">{tally.approveWeight}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Weighted Reject</p>
                        <p className="text-red-400 font-semibold">{tally.rejectWeight}</p>
                    </div>
                </div>

                {/* Tier Breakdown */}
                <div className="mt-4 pt-4 border-t border-noble-gold/10">
                    <p className="text-xs text-gray-500 mb-2">Breakdown by Tier:</p>
                    <div className="space-y-2">
                        {(['gold', 'silver', 'bronze'] as const).map((tier) => (
                            <div key={tier} className="flex items-center justify-between text-xs">
                                <span className={getTierColor(tier.toUpperCase())}>
                                    {tier.toUpperCase()}
                                </span>
                                <div className="flex gap-4">
                                    <span className="text-green-400">
                                        ✓ {tally.breakdown[tier].approve}
                                    </span>
                                    <span className="text-red-400">
                                        ✗ {tally.breakdown[tier].reject}
                                    </span>
                                    <span className="text-gray-400">
                                        ({tally.breakdown[tier].weight} weight)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approval Status */}
                <div className="mt-4 pt-4 border-t border-noble-gold/10">
                    {tally.isApproved ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <p className="text-sm text-green-400 font-semibold">
                                ✅ Milestone Approved (≥66% weighted approval)
                            </p>
                        </div>
                    ) : (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <p className="text-sm text-orange-400 font-semibold">
                                ⏳ Needs ≥66% weighted approval to pass
                            </p>
                        </div>
                    )}
                </div>

                {/* Participation Rate */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                    Participation: {tally.participationRate.toFixed(1)}% of eligible voters
                </div>
            </div>

            {/* Ineligible Notice */}
            {currentTier === 'NONE' && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">
                        ⚠️ You are not eligible to vote. Only Bronze, Silver, and Gold tier holders can vote on milestones.
                    </p>
                </div>
            )}

            {/* Already Voted Notice */}
            {hasVoted && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-400">
                        ✅ You have successfully cast your vote. Thank you for participating!
                    </p>
                </div>
            )}
        </div>
    )
}
