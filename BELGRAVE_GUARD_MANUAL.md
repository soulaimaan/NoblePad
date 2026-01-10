# BELGRAVE GUARD: THE USER MANUAL

## Security-Enforced Participation & Protocol Standards

---

## 1. Introduction

The **Belgrave Guard** serves as the operational manual for the Belgrave System. While the Whitepaper defines the mathematical model, this document defines the user experience, security protocols, and safety standards that protect every $BELGRAVE staker.

Our mission is simple: **Eliminate the rugpull.** Through automated code enforcement, AI-driven auditing, and decentralized governance, Belgrave ensures that "Code is Law" is not just a slogan, but a technical reality.

---

## 2. The Security Stack

### 2.1 Gemini 3 Flash Auditor (AI-Driven Vetting)

Every project seeking to launch on the Belgrave System undergoes a real-time deep-scan by our proprietary **Gemini 3 Flash Auditor**:

* **Backdoor Detection**: Identifying hidden mint functions or ownership backdoors.
* **Blacklist Protection**: Flagging contracts that can freeze user funds.
* **Tax Analysis**: Automatically rejecting "honeypot" contracts with unchangeable 100% sell taxes.
* **Instant Rejection**: Any code that fails the audit is blocked from deployment.

### 2.2 Milestone-Based Escrow

Liquidity is not released to developers in a single lump sum. The Belgrave System utilizes **Milestone Escrow**:

* **Proof of Progress**: Funds are unlocked only after predefined development milestones are met.
* **Governance Oversight**: Stakers can vote to halt funding if a team fails to deliver.

### 2.3 The Hard-Coded Kill-Switch

To protect against "abandon-ware," the system includes an immutable expiration protocol:

* **Automatic Refund**: If a project shows zero on-chain activity for **6 consecutive months**, the contract triggers an automatic refund to all participants.
* **No Intermediation**: This is a direct smart contract function requiring no human intervention.

---

## 3. How to Participate

### 3.1 Step-by-Step Security Protocol

1. **Wallet Connection**: Connect via **EVM**, **Solana**, or **XRPL (Xaman)** using our unified, bundle-optimized provider.
2. **Staking**: Lock $BELGRAVE into the protocol for the mandatory 6-month period.
3. **Tier Classification**: The system automatically assigns your tier (Bronze, Silver, Gold) based on the snapshot block height.
4. **Allocation Window**: Access the "Belgrave Agent Dashboard" to view available presales and your calculated allocation.
5. **Deterministic Contribution**: Use your allocation without fear of FCFS gas wars. The proportional scaling handles oversubscription automatically.

### 3.2 Tier Mechanics Recap

| Tier | Stake Requirement | Multiplier | Governance |
| :--- | :--- | :--- | :--- |
| **Bronze** | 17,500,000 $BELGRAVE | 1.0x | 1 Vote |
| **Silver** | 87,500,000 $BELGRAVE | 2.5x | 2 Votes |
| **Gold** | 175,000,000 $BELGRAVE | 5.0x | 3 Votes |

---

## 4. The Education Hub & Safety Checker

Belgrave provides tools to empower investors:

* **The Safety Checker**: A diagnostic tool where users can input external contract addresses to run a simulated Belgrave Audit.
* **Education Hub**: A repository of research on DeFi security, explaining red flags like proxy patterns and liquidity manipulation.

---

## 5. System Standards

The Belgrave System adheres to maximum transparency and performance standards:

* **Anti-Whale Protection**: Strict per-wallet caps are enforced to prevent single-entity dominance.
* **Snapshot Integrity**: All eligibility is based on verifiable Merkle Proofs captured at the round announcement.
* **Performance**: Optimized for speed with removed heavy dependencies and lazy-loaded components.

---
**Belgrave System: The Standard for Decentralized Allocation**
*Manual Version 1.1 - Fully Rebranded & Logic-Verified*