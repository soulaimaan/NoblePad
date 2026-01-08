# BELGRAVE TIER SYSTEM

## The Allocation Protocol for Decentralized Finance

### Version 1.0

---

## 1. Executive Summary

The **Belgrave System** is a high-precision staking and allocation protocol designed to restore fairness to decentralized fundraising. By enforcing strict capitalization requirements and time-locked commitments, Belgrave eliminates the "gas wars" and "lottery" mechanics that plague traditional launchpads in favor of a deterministic, merit-based access model.

At its core is the **BELGRAVE** token. Staking BELGRAVE is the only method to unlock allocation rights within the ecosystem. The protocol employs a triple-tier architecture (Bronze, Silver, Gold) to categorize participants, assigning guaranteed multipliers and governance weight based on proven commitment.

---

## 2. Core Architecture

### 2.1 The Staking Vaults

Access to the protocol is binary: you are either Staked or you are defined as a Guest. To become a Member, users must lock a fixed amount of BELGRAVE tokens into the Belgrave Staking Contract for a mandatory period of **6 months**.

This lock period is non-negotiable and serves as a cryptographic "Proof of Commitment," ensuring that only long-term participants influence the governance and allocation pools.

### 2.2 Tier Thresholds & Multipliers

The system defines three distinct classes of membership. Each tier grants a specific "Allocation Multiplier," which acts as a scalar for the maximum capital a user can deploy into a fundraising round.

| Tier Class | Requirement | Allocation Multiplier | Governance Weight | Pool Share |
| :--- | :--- | :--- | :--- | :--- |
| **BRONZE** | **17,500,000 BELGRAVE** | **1.0x** (Base) | 1 Vote | 50% |
| **SILVER** | **87,500,000 BELGRAVE** | **2.5x** (Enhanced) | 2 Votes | 30% |
| **GOLD** | **175,000,000 BELGRAVE** | **5.0x** (Maximum) | 3 Votes | 20% |

* **Bronze (The Base)**: Represents the majority of the community. Receives the largest aggregate pool share (50%) but lower individual caps.
* **Silver (The Core)**: High-conviction participants receiving 2.5x the base allocation.
* **Gold (The Elite)**: Institutional-grade members. Requires significant capital (175M BELGRAVE) but grants maximum voting power and 5x allocation capacity.

---

## 3. Allocation Mechanics

The Belgrave System utilizes a **Proportional Oversubscription Model**. There are no "first-come, first-served" (FCFS) gas wars, and there are no lotteries. If a fundraising round is oversubscribed, allocations are adjusted mathematically to ensure every staked participant receives a fair share.

### 3.1 The Rolldown Protocol

To maximize capital efficiency, the system employs "Rolldown Logic":

1. **Gold Priority**: The Gold pool (20% of total raise) is filled first.
2. **Unused Flow**: Any unclaimed allocation from the Gold pool automatically flows down to the Silver pool.
3. **Final Aggregation**: Any unclaimed Silver allocation flows down to Bronze.

This ensures that "Whale" inactivity benefits the wider community, increasing the effective allocation for smaller stakers.

### 3.2 Anti-Whale Protection

To prevent centralization, the protocol enforces strict hard caps:

* **One Tier Per Wallet**: A single address cannot stack multiple tier benefits.
* **Round Caps**: Each fundraising event defines a "Maximum Allocation Per Wallet" (e.g., $5,000 USDC), which applies *after* tier multipliers are calculated.

---

## 4. Snapshot & Verification

The integrity of the system relies on the **Belgrave Snapshot Engine**:

1. **Capture**: At the exact block height of a round announcement, the engine records the `(Wallet Address, Staked Amount)` state of the network.
2. **Classification**: Wallets are mapped to their eligible Tier (Bronze/Silver/Gold) based on the strict thresholds.
3. **Merkle Generation**: A cryptographic proof (Merkle Tree) is generated, allowing the fundraising contract to verify a user's eligibility on-chain without storing the entire specific database.
4. **Enforcement**: During the purchase transaction, the contract verifies the Merkle Proof and enforces the Tier Lock, rejecting any attempt to unstake during an active round.

---

## 5. Governance

The Belgrave System is community-led. Stakers do not just get access; they get a voice.

* **Weighted Voting**: Influence is proportional to commitment (Gold = 3x Bronze).
* **Milestone Voting**: One vote per wallet for key protocol decisions.
* **Proposal Scope**: Voting covers fee usage, new pool parameters, and protocol upgrades.

---

## 6. Technology Stack & Performance

The Belgrave System is built on a high-performance, security-first architecture designed to withstand high-concurrency events.

### 6.1 Performance Optimization

* **Bundle Efficiency**: Heavy cryptographic libraries have been replaced with lightweight alternatives (viem), significantly reducing initial load times.
* **Resource Loading**: Implemented intelligent lazy loading, route pre-fetching, and provider nesting optimization to ensure sub-second dashboard interactivity.
* **Connectivity**: Enhanced Native support for **Ethereum**, **Base**, **BSC**, **Solana**, and **XRPL**, with fixed Xaman/Browser Wallet integrations and unified error handling.

### 6.2 Security & Verification

* **Logic Verification**: The core allocation engine has been rigorously simulated against "Real World" constraints, verifying proportional oversubscription, tier thresholds, and multi-tier rolldown mechanics.
* **Automated Testing**: Continuous integration pipelines validate snapshot generation, merkle proof consistency, and governance weight calculations.

---

## 7. Roadmap & Implementation Status

The Belgrave System is executing a phased rollout to ensure maximum stability and security.

### 7.1 Completed Milestones

* **Tier System Implementation**: Full deployment of Bronze (17.5M), Silver (87.5M), and Gold (175M) logic.
* **Allocation Engine**: Verification of proportional scaling and rolldown (Gold → Silver → Bronze).
* **Governance**: Implementation of weighted voting rights (1:2:3 logic) and snapshot-based eligibility.
* **Anti-Whale Mechanics**: Deployment of wallet caps and tier-stacking prevention.
* **Wallet & UI**: Resolution of Xaman connectivity, icon fixes, and removal of blocking CSS warnings.

### 7.2 Current Focus: Optimization & Launch

* **Performance Tuning**: Continuous reduction of bundle sizes and optimization of data fetching strategies.
* **Documentation**: Finalizing the whitepaper and executive summaries for public release.
* **Deployment Readiness**: Final audit of all systems prior to mainnet launch.

---

**Belgrave System**
*Documentation Version 1.0*

### *Strictly Confidential - For Allocation Protocol Use Only*
