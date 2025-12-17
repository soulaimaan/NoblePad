# NoblePad Anti-Rug Specification

This document describes the anti-rug requirements and acceptance criteria for NoblePad launchpad presales. It is authoritative for both on-chain contract behaviour and off-chain validation performed by backend services.

## Goals
- Prevent or drastically reduce rug-pulls and malicious liquidity removal.
- Ensure team tokens are time-locked and vested over a long period.
- Provide transparent audit trail for investors and community.
- Enable refunds and escrow-based milestone releases when projects fail to meet obligations.

## Core Rules (Enforced On-chain or Server-side)
1. Minimum Liquidity Percent
   - Presale must lock a minimum of 60% of raised funds as liquidity at listing time (configurable to 60-100%).
   - Enforcement: Factory / Presale contract must require `liquidityPercent >= MIN_LIQUIDITY_PERCENT` before enabling `addLiquidity` or finalization.

2. Liquidity Lock Duration
   - Liquidity must be locked on a timelock / locker contract for at least 12 months. Recommended default: 24 months.
   - Enforcement: `TokenLock` contract logs `TokensLocked` with `unlockTimestamp` and prevents withdrawal until unlocked by timelock+multisig.

3. Team Token Lock & Vesting
   - Team & advisor tokens must be locked for minimum 24 months with at least quarterly vesting.
   - Vesting schedules supported: linear, cliff, custom tranches.
   - Enforcement: `Vesting` contract that releases team tokens per schedule; transfer of team allocation to vesting contract is required.

4. Refund / Escrow Flow
   - If the presale fails to reach softCap by deadline or specified milestones fail, investors can claim refunds from escrow.
   - Escrow-based milestone releases: funds are held and only released when admin or an oracle verifies milestone completion.

5. KYC / Project Verification
   - Projects must provide KYC/AML documentation for verification; platform flags projects as `KYC_REQUIRED` where jurisdictionally mandated.
   - Backend stores signed verification artifacts and audit certificates (hash and upload location).

6. Triple Audit Requirement
   - Projects must complete 2 paid audits + 1 community audit to receive the `VERIFIED` badge.
   - `Presale` stores audit metadata (audit firms, reports hash, timestamp).

7. Anti-Sniper & Anti-Whale Protections
   - Contract-level anti-sniper measures during initial blocks (configurable); max wallet purchase sizes for first N blocks.
   - Anti-whale per-address purchase caps enforceable by `Presale` before whitelist stages.

8. On-chain Verification & Audit Trail
   - All important actions emit events for indexers: `PresaleCreated`, `LiquidityAdded`, `TokensLocked`, `VestingCreated`, `RefundClaimed`, `MilestoneReleased`.
   - Backend preserves events and signs snapshots for tamper-proof audit trails.

9. Admin Controls & Governance
   - Admin actions (pause, release escrow, mark milestone complete) require multisig confirmation for production.
   - Critical actions are subject to timelocks where appropriate.

## Acceptance Tests (Examples)
- Creating a presale with `liquidityPercent < 60` must revert on `finalize` or `addLiquidity`.
- Locking liquidity for less than 12 months must revert on lock attempt (if enforced on-chain).
- Attempt to withdraw locked liquidity before `unlockTimestamp` must revert.
- Team token transfer to vesting contract should prevent immediate transfers to team wallets.
- If `softCap` not reached by `endTime`, `claimRefund` should succeed and return correct investor balances.
- Events for each key lifecycle step must be emitted and indexable.

## Server-side Validation
- `POST /api/create-presale` will perform checks before initiating factory transaction:
  - Check `liquidityPercent >= 60`
  - Confirm `lockPeriod >= 12 months` (configurable)
  - Validate team vesting schedule is present and enforces >= 24 months lock
  - Ensure audit metadata fields are present
  - Validate KYC metadata where required

## Alerts & Monitoring
- Create alert rules for:
  - Liquidity pool transfers to unknown addresses
  - Sudden ownership transfers of presale or router contracts
  - Large token transfers from team wallets
- Alerts feed into dashboard and notify via Slack/email

## Data & Persistence
- Store all event hashes, audit file hashes, and proof-of-identity materials in PostgreSQL/Supabase and IPFS (optional) with metadata.

## Notes & Recommendations
- Prefer on-chain enforcement for critical invariants (liquidity minimum, lock duration, team lock). Use server-side validation to stop mis-configured presales before chain ops.
- Use multisig/Gnosis Safe and timelocks for treasury controls and any admin-driven releases.


## Appendix: Relevant Events
- `PresaleCreated(address indexed presale, address indexed token, address owner, uint256 startTime, uint256 endTime)`
- `LiquidityAdded(address indexed presale, uint256 tokenAmount, uint256 nativeAmount)`
- `TokensLocked(uint256 indexed lockId, address token, uint256 amount, uint256 unlockTimestamp)`
- `VestingCreated(uint256 indexed vestingId, address beneficiary, uint256 totalAmount, uint256 start, uint256 cliff)`
- `RefundClaimed(address indexed buyer, uint256 amount)`

