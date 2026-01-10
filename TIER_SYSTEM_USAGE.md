# Tier System Usage Guide

## 🚀 Quick Start

The Belgrave tier system is now fully integrated into NoblePad. Here's how to use it:

---

## For Users

### 1. Checking Your Tier Status

```tsx
import { useTier } from '@/components/providers/TierProvider'

function MyComponent() {
    const { currentTier, totalStaked, isLoading } = useTier()
    
    return (
        <div>
            <p>Your Tier: {currentTier}</p>
            <p>Staked: {totalStaked} BELGRAVE</p>
        </div>
    )
}
```

### 2. Calculating Allocation

Use the `AllocationCalculator` component in your presale page:

```tsx
import { AllocationCalculator } from '@/components/presale/AllocationCalculator'

<AllocationCalculator 
    baseBronzeAllocation={1000}
    maxAllocationPerWallet={50000}
    totalAllocationPool={1000000}
/>
```

### 3. Monitoring Tier Pools

```tsx
import { TierPoolMonitor } from '@/components/presale/TierPoolMonitor'

<TierPoolMonitor 
    totalAllocationPool={1000000}
    goldAllocated={150000}
    silverAllocated={250000}
    bronzeAllocated={400000}
    goldParticipants={50}
    silverParticipants={120}
    bronzeParticipants={300}
/>
```

### 4. Governance Voting

```tsx
import { GovernanceVoting } from '@/components/presale/GovernanceVoting'

<GovernanceVoting 
    milestoneId="milestone-1"
    milestoneTitle="Initial Development Complete"
    milestoneDescription="Smart contracts audited and deployed"
    snapshot={tierSnapshot}
    existingVotes={votes}
    votingEndTime={Date.now() + 7 * 24 * 60 * 60 * 1000}
    onVoteSubmit={handleVoteSubmit}
/>
```

---

## For Developers

### Creating a Snapshot

```typescript
import { createSnapshot } from '@/lib/snapshotService'

const stakers = [
    { wallet: '0x123...', stakedAmount: 20000000, stakeTimestamp: Date.now() },
    // ... more stakers
]

const snapshot = await createSnapshot('presale-1', stakers)
console.log('Merkle Root:', snapshot.merkleRoot)
```

### Calculating Allocations

```typescript
import { distributeAllocationsWithRolldown } from '@/lib/allocationService'

const participants = [
    { wallet: '0x123...', tier: 'GOLD', stakedAmount: 175000000 },
    // ... more participants
]

const config = {
    totalAllocationPool: 1000000,
    baseBronzeAllocationUnit: 1000,
    maxAllocationPerWallet: 50000
}

const allocations = distributeAllocationsWithRolldown(participants, config)
```

### Verifying Tier Eligibility

```typescript
import { validateTierEligibility } from '@/lib/snapshotService'

const participant = snapshot.participants[0]
const result = validateTierEligibility(participant, snapshot, Date.now())

if (!result.eligible) {
    console.error('Not eligible:', result.error)
}
```

### Tallying Votes

```typescript
import { tallyMilestoneVotes } from '@/lib/governanceService'

const tally = tallyMilestoneVotes('milestone-1', votes, snapshot)

console.log('Approval:', tally.approvalPercentage + '%')
console.log('Approved:', tally.isApproved)
```

---

## Tier Configuration

Current tier thresholds (read-only):

```typescript
import { TIER_CONFIG } from '@/components/providers/TierProvider'

// Bronze: 17,500,000 BELGRAVE (1.0x allocation, 1 vote)
// Silver: 87,500,000 BELGRAVE (2.5x allocation, 2 votes)
// Gold: 175,000,000 BELGRAVE (5.0x allocation, 3 votes)
```

---

## Anti-Whale Protection

Built-in protections:

1. **Hard Cap**: Maximum allocation per wallet
2. **One Tier Per Wallet**: Cannot stack tiers
3. **Proportional Scaling**: Fair distribution in oversubscription
4. **6-Month Lock**: Prevents tier gaming

---

## Security Best Practices

### 1. Always Verify Snapshots

```typescript
import { verifyTierProof } from '@/lib/snapshotService'

const isValid = verifyTierProof(
    wallet, 
    stakedAmount, 
    tier, 
    stakeTimestamp, 
    proof, 
    merkleRoot
)
```

### 2. Check Lock Period

```typescript
import { STAKE_LOCK_PERIOD } from '@/components/providers/TierProvider'

const lockExpiry = stakeTimestamp + (STAKE_LOCK_PERIOD * 1000)
const isLocked = Date.now() < lockExpiry
```

### 3. Detect Early Unstaking

```typescript
import { checkEarlyUnstake } from '@/lib/snapshotService'

const hasUnstaked = await checkEarlyUnstake(
    participant,
    currentStakedAmount,
    Date.now()
)

if (hasUnstaked) {
    // Forfeit allocation
}
```

---

## Common Patterns

### Pattern 1: Presale with Tier Allocation

```typescript
// 1. Create snapshot before presale starts
const snapshot = await createSnapshot(presaleId, stakers)

// 2. Store snapshot in database
await saveSnapshot(snapshot)

// 3. Calculate allocations
const allocations = distributeAllocationsWithRolldown(
    snapshot.participants,
    config
)

// 4. During contribution, verify eligibility
const participant = getParticipantFromSnapshot(snapshot, wallet)
const eligibility = validateTierEligibility(participant, snapshot, Date.now())

if (eligibility.eligible) {
    // Allow contribution up to finalAllocation
    const allocation = allocations.get(wallet)
    allowContribution(wallet, allocation.finalAllocation)
}
```

### Pattern 2: Milestone Voting

```typescript
// 1. Check if user can vote
const participant = getParticipantFromSnapshot(snapshot, wallet)
if (!participant || participant.tier === 'NONE') {
    throw new Error('Not eligible to vote')
}

// 2. Cast vote
const result = await castMilestoneVote(wallet, milestoneId, 'approve', snapshot)

// 3. Store vote
await saveVote(result.voteRecord)

// 4. Tally votes
const tally = tallyMilestoneVotes(milestoneId, allVotes, snapshot)

// 5. Check if approved
if (tally.isApproved) {
    // Release milestone funds
}
```

---

## Troubleshooting

### Issue: User says they can't see their tier

**Solution**: Check if `TierProvider` wraps your app:

```tsx
// app/layout.tsx
<TierProvider>
    <YourApp />
</TierProvider>
```

### Issue: Allocation calculation seems wrong

**Solution**: Verify oversubscription handling:

```typescript
// Check if tier is oversubscribed
const totalRequested = /* sum of all requests */
const tierPool = /* tier pool size */

if (totalRequested > tierPool) {
    // Allocations will be scaled proportionally
    const scalingFactor = tierPool / totalRequested
}
```

### Issue: Snapshot merkle proof fails

**Solution**: Ensure data hasn't changed since snapshot:

```typescript
// Snapshot data must be immutable
const originalData = `${wallet}|${stakedAmount}|${tier}|${stakeTimestamp}`
// Any change will break the proof
```

---

## API Reference

See full API documentation in:

- `allocationService.ts` - Allocation calculations
- `snapshotService.ts` - Tier locking & verification
- `governanceService.ts` - Voting mechanics
- `TierProvider.tsx` - Tier configuration

---

## Next Steps

1. Integrate components into presale pages
2. Add database persistence for snapshots and votes
3. Create admin interface for snapshot creation
4. Add unit tests (see Phase 8 in task.md)
5. Deploy to testnet for validation
