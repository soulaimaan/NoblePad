
import {
    calculateVoteWeight,
    castMilestoneVote,
    tallyMilestoneVotes,
    MilestoneVote,
    MilestoneVoteTally
} from '../governanceService';
import { TierSnapshot, TierParticipantSnapshot } from '../snapshotService';
import { TIER_CONFIG } from '../tierConfig';

describe('Governance Service', () => {

    // Helper to create a mock snapshot
    const createMockSnapshot = (): TierSnapshot => {
        const participants: TierParticipantSnapshot[] = [
            { wallet: '0xGold', stakedAmount: 175000000, tier: 'GOLD', allocationMultiplier: 5, governanceWeight: 3, stakeTimestamp: 100, lockExpiryTimestamp: 1000, snapshotProof: [] },
            { wallet: '0xSilver', stakedAmount: 87500000, tier: 'SILVER', allocationMultiplier: 2.5, governanceWeight: 2, stakeTimestamp: 100, lockExpiryTimestamp: 1000, snapshotProof: [] },
            { wallet: '0xBronze1', stakedAmount: 17500000, tier: 'BRONZE', allocationMultiplier: 1, governanceWeight: 1, stakeTimestamp: 100, lockExpiryTimestamp: 1000, snapshotProof: [] },
            { wallet: '0xBronze2', stakedAmount: 17500000, tier: 'BRONZE', allocationMultiplier: 1, governanceWeight: 1, stakeTimestamp: 100, lockExpiryTimestamp: 1000, snapshotProof: [] },
            { wallet: '0xNone', stakedAmount: 0, tier: 'NONE', allocationMultiplier: 0, governanceWeight: 0, stakeTimestamp: 100, lockExpiryTimestamp: 1000, snapshotProof: [] }
        ];

        return {
            presaleId: 'test-presale',
            snapshotTimestamp: 1000,
            merkleRoot: 'mock-root',
            totalParticipants: 5,
            tierBreakdown: { gold: 1, silver: 1, bronze: 2 },
            participants
        };
    };

    const snapshot = createMockSnapshot();

    describe('getVoteWeight', () => {
        it('should return correct weights for each tier', () => {
            expect(calculateVoteWeight('GOLD')).toBe(3);
            expect(calculateVoteWeight('SILVER')).toBe(2);
            expect(calculateVoteWeight('BRONZE')).toBe(1);
            expect(calculateVoteWeight('NONE')).toBe(0);
        });
    });

    describe('castMilestoneVote', () => {
        it('should allow valid participant to vote', async () => {
            const result = await castMilestoneVote('0xGold', 'milestone-1', 'test-presale', 'approve', snapshot);

            expect(result.success).toBe(true);
            expect(result.voteRecord).toBeDefined();
            expect(result.voteRecord?.voteWeight).toBe(3);
            expect(result.voteRecord?.tier).toBe('GOLD');
            expect(result.voteRecord?.vote).toBe('approve');
        });

        it('should reject voter not in snapshot', async () => {
            const result = await castMilestoneVote('0xUnknown', 'milestone-1', 'test-presale', 'approve', snapshot);

            expect(result.success).toBe(false);
            expect(result.error).toContain('not in tier snapshot');
        });

        it('should reject voter with no voting power', async () => {
            const result = await castMilestoneVote('0xNone', 'milestone-1', 'test-presale', 'approve', snapshot);
            expect(result.success).toBe(false);
        });
    });

    describe('tallyMilestoneVotes', () => {
        it('should correctly tally mixed votes', () => {
            const votes: MilestoneVote[] = [
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xGold', tier: 'GOLD', voteWeight: 3, vote: 'approve', timestamp: 100 },
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xSilver', tier: 'SILVER', voteWeight: 2, vote: 'reject', timestamp: 100 },
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xBronze1', tier: 'BRONZE', voteWeight: 1, vote: 'approve', timestamp: 100 },
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xBronze2', tier: 'BRONZE', voteWeight: 1, vote: 'approve', timestamp: 100 },
            ];

            // Total weight: 3 (gold) + 2 (silver) + 1 (bronze) + 1 (bronze) = 7
            // Approve: 3 + 1 + 1 = 5
            // Reject: 2
            // Approval %: 5/7 = 71.4%
            // Threshold: 66% -> Should be approved

            const tally = tallyMilestoneVotes('m1', votes, snapshot, 0.66);

            expect(tally.totalVotes).toBe(4);
            expect(tally.approveWeight + tally.rejectWeight).toBe(7);
            expect(tally.approveWeight).toBe(5);
            expect(tally.rejectWeight).toBe(2);
            expect(tally.approvalPercentage).toBeCloseTo(71.42, 1);
            expect(tally.isApproved).toBe(true);

            expect(tally.breakdown.gold.approve).toBe(1);
            expect(tally.breakdown.silver.reject).toBe(1);
            expect(tally.breakdown.bronze.approve).toBe(2);
        });

        it('should fail if threshold not met', () => {
            const votes: MilestoneVote[] = [
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xGold', tier: 'GOLD', voteWeight: 3, vote: 'reject', timestamp: 100 }, // 3 reject
                { milestoneId: 'm1', presaleId: 'test-presale', wallet: '0xBronze1', tier: 'BRONZE', voteWeight: 1, vote: 'approve', timestamp: 100 }, // 1 approve
            ];
            // Total: 4. Approve: 1 (25%). Reject: 3.

            const tally = tallyMilestoneVotes('m1', votes, snapshot, 0.66);
            expect(tally.isApproved).toBe(false);
        });
    });
});
