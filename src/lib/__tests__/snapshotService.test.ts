
import {
    createSnapshot,
    verifyTierProof,
    validateTierEligibility,
    TierSnapshot,
    STAKE_LOCK_PERIOD
} from '../snapshotService';
import { TIER_CONFIG } from '@/lib/tierConfig';

describe('Snapshot Service', () => {
    // Mock Date.now
    const NOW = 1000000000000;

    beforeAll(() => {
        jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    const stakers = [
        { wallet: '0xGold1', stakedAmount: 175000000, stakeTimestamp: NOW - 10000 },
        { wallet: '0xSilver1', stakedAmount: 87500000, stakeTimestamp: NOW - 20000 },
        { wallet: '0xBronze1', stakedAmount: 17500000, stakeTimestamp: NOW - 30000 },
        { wallet: '0xNone1', stakedAmount: 1000, stakeTimestamp: NOW - 40000 }
    ];

    let snapshot: TierSnapshot;

    it('should create a valid snapshot', async () => {
        snapshot = await createSnapshot('presale-1', stakers);

        expect(snapshot.totalParticipants).toBe(4);
        expect(snapshot.tierBreakdown.gold).toBe(1);
        expect(snapshot.tierBreakdown.silver).toBe(1);
        expect(snapshot.tierBreakdown.bronze).toBe(1);
    });

    it('should assign correct tiers', () => {
        const gold = snapshot.participants.find(p => p.wallet === '0xGold1');
        const silver = snapshot.participants.find(p => p.wallet === '0xSilver1');
        const bronze = snapshot.participants.find(p => p.wallet === '0xBronze1');
        const none = snapshot.participants.find(p => p.wallet === '0xNone1');

        expect(gold?.tier).toBe('GOLD');
        expect(silver?.tier).toBe('SILVER');
        expect(bronze?.tier).toBe('BRONZE');
        expect(none?.tier).toBe('NONE');
    });

    it('should generate valid merkle proofs', () => {
        const gold = snapshot.participants.find(p => p.wallet === '0xGold1');
        if (!gold) throw new Error('Gold participant not found');

        const isValid = verifyTierProof(
            gold.wallet,
            gold.stakedAmount,
            gold.tier,
            gold.stakeTimestamp,
            gold.snapshotProof,
            snapshot.merkleRoot
        );

        expect(isValid).toBe(true);
    });

    it('should fail verification for tampered data', () => {
        const gold = snapshot.participants.find(p => p.wallet === '0xGold1');
        if (!gold) throw new Error('Gold participant not found');

        // Tamper with staked amount
        const isValid = verifyTierProof(
            gold.wallet,
            gold.stakedAmount + 1, // Tampered
            gold.tier,
            gold.stakeTimestamp,
            gold.snapshotProof,
            snapshot.merkleRoot
        );

        expect(isValid).toBe(false);
    });

    it('should validate eligibility during lock period', () => {
        const gold = snapshot.participants.find(p => p.wallet === '0xGold1');
        if (!gold) throw new Error('Gold participant not found');

        // Within lock period (lock is 6 months)
        const checkTime = NOW + 100000;
        const result = validateTierEligibility(gold, snapshot, checkTime);

        expect(result.eligible).toBe(true);
    });

    it('should validate eligibility after lock period', () => {
        const gold = snapshot.participants.find(p => p.wallet === '0xGold1');
        if (!gold) throw new Error('Gold participant not found');

        // After lock period
        const checkTime = NOW + (STAKE_LOCK_PERIOD * 1000) + 100000;
        const result = validateTierEligibility(gold, snapshot, checkTime);

        // Should still be eligible (snapshot logic assumes holding)
        // In real app, we'd check current balance too, but service just checks snapshot rules
        expect(result.eligible).toBe(true);
    });
});
