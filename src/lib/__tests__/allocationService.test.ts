
import {
    calculateUserAllocation,
    calculateTierPools,
    scaleOversubscribedAllocations,
    distributeAllocationsWithRolldown,
    TierParticipant,
    MAX_ALLOCATION_PER_WALLET
} from '../allocationService';
import { TIER_CONFIG } from '../tierConfig';

// Mock TIER_CONFIG if needed, but since it's a constant, we can use it directly
// or mock it if we want to isolate tests from config changes.
// For now, using the actual config is fine as it tests the integration.

describe('Allocation Service', () => {

    describe('calculateUserAllocation', () => {
        const baseUnit = 1000;
        const maxCap = 50000;

        it('should return 0 for NONE tier', () => {
            expect(calculateUserAllocation('NONE', baseUnit, maxCap)).toBe(0);
        });

        it('should apply correct multipliers', () => {
            // Bronze 1.0x
            expect(calculateUserAllocation('BRONZE', baseUnit, maxCap)).toBe(1000);

            // Silver 2.5x
            expect(calculateUserAllocation('SILVER', baseUnit, maxCap)).toBe(2500);

            // Gold 5.0x
            expect(calculateUserAllocation('GOLD', baseUnit, maxCap)).toBe(5000);
        });

        it('should respect max cap', () => {
            const hugeBaseUnit = 20000; // Gold would be 100k
            expect(calculateUserAllocation('GOLD', hugeBaseUnit, maxCap)).toBe(maxCap);
        });
    });

    describe('calculateTierPools', () => {
        it('should split pools correctly by default (50/30/20)', () => {
            const total = 1000000;
            const pools = calculateTierPools(total);

            expect(pools.BRONZE).toBe(500000);
            expect(pools.SILVER).toBe(300000);
            expect(pools.GOLD).toBe(200000);
            expect(pools.NONE).toBe(0);
        });

        it('should support custom splits', () => {
            const total = 1000000;
            const pools = calculateTierPools(total, { bronze: 0.4, silver: 0.4, gold: 0.2 });

            expect(pools.BRONZE).toBe(400000);
            expect(pools.SILVER).toBe(400000);
            expect(pools.GOLD).toBe(200000);
        });
    });

    describe('scaleOversubscribedAllocations', () => {
        it('should not scale if not oversubscribed', () => {
            const requests = new Map([['A', 100], ['B', 200]]);
            const poolSize = 500;
            const result = scaleOversubscribedAllocations(requests, poolSize);

            expect(result.get('A')).toBe(100);
            expect(result.get('B')).toBe(200);
        });

        it('should scale proportionally if oversubscribed', () => {
            const requests = new Map([['A', 100], ['B', 100]]);
            const poolSize = 100; // 50% capacity
            const result = scaleOversubscribedAllocations(requests, poolSize);

            expect(result.get('A')).toBe(50);
            expect(result.get('B')).toBe(50);
        });
    });

    describe('distributeAllocationsWithRolldown', () => {
        const config = {
            totalAllocationPool: 100000,
            baseBronzeAllocationUnit: 100, // Bronze: 100, Silver: 250, Gold: 500
            maxAllocationPerWallet: 50000
        };

        // Pools: Bronze: 50k, Silver: 30k, Gold: 20k

        it('should distribute correctly without rolldown needed', () => {
            const participants: TierParticipant[] = [
                { wallet: 'G1', tier: 'GOLD', stakedAmount: 0 },
                { wallet: 'S1', tier: 'SILVER', stakedAmount: 0 },
                { wallet: 'B1', tier: 'BRONZE', stakedAmount: 0 }
            ];

            const result = distributeAllocationsWithRolldown(participants, config);

            expect(result.get('G1')?.finalAllocation).toBe(500);
            expect(result.get('S1')?.finalAllocation).toBe(250);
            expect(result.get('B1')?.finalAllocation).toBe(100);
        });

        it('should rolldown unused Gold to Silver', () => {
            // Gold pool is 20k. No gold participants.
            // All 20k should roll to Silver.
            // Silver pool becomes 30k + 20k = 50k.

            // Create massive demand in Silver to consume it all
            // 300 silver participants * 250 = 75,000 demand.
            // Pool is 50,000.
            // Scaling should be 50,000 / 75,000 = 0.666...

            const participants: TierParticipant[] = [];
            for (let i = 0; i < 300; i++) {
                participants.push({ wallet: `S${i}`, tier: 'SILVER', stakedAmount: 0 });
            }

            const result = distributeAllocationsWithRolldown(participants, config);
            const s1 = result.get('S0');

            expect(s1?.tier).toBe('SILVER');
            expect(s1?.scalingFactor).toBeCloseTo(50000 / 75000, 4);
        });

        it('should rolldown unused Silver+Gold to Bronze', () => {
            // No gold or silver participants.
            // Bronze pool gets everything: 100k

            // Create demand in Bronze
            // 2000 bronze participants * 100 = 200,000 demand.
            // Pool is 100,000.
            // Scaling 0.5.

            const participants: TierParticipant[] = [];
            for (let i = 0; i < 2000; i++) {
                participants.push({ wallet: `B${i}`, tier: 'BRONZE', stakedAmount: 0 });
            }

            const result = distributeAllocationsWithRolldown(participants, config);
            const b1 = result.get('B0');

            expect(b1?.scalingFactor).toBeCloseTo(0.5, 4);
            expect(b1?.finalAllocation).toBe(50);
        });
    });
});
