# BELGRAVE GUARDIAN: MARKETING SPECIFICATION

## 1. The Auditor's Technical Checklist

The Auditor Agent MUST validate all drafts against these technical rules.

| Rule ID | Name | Constraint |
| :--- | :--- | :--- |
| **L-01** | **Liquidity Lock** | Must be locked in reputable vaults (Unicrypt, Team Finance, PinkSale). Flag if `removeLiquidity` is owner-accessible. |
| **M-01** | **Minting** | Mint function `mint()` must NOT exist or be renounced. Capability to print tokens = instant rejection. |
| **H-01** | **Honeypot Checks** | No `setTax` functions without hard caps (max 10-25%). No `transferFrom` restrictions preventing sells. |
| **C-01** | **Wallet Clustering** | Top 5 wallets must hold < 20% of supply (excluding locked liquidity/staking). |
| **P-01** | **Proxy Risks** | Upgradeable proxies must have a 48-hour Timelock visible on-chain. |

## 2. Case Study Pattern Library

The Content Lead and Auditor use these historical precedents to explain risks neutrally.

### SQUID Pattern (Honeypot)

* **Mechanism**: Buy-only logic implemented in the contract. Sells revert.
* **Signatures**: `_approve` checks that fail specifically on sells, or `marketingFee` set to 100%.

### AnubisDAO Pattern (LP Drain)

* **Mechanism**: Liquidity tokens sent to an external, unverified wallet instead of a lock contract.
* **Signatures**: Deployment script sends LP to `msg.sender` or "Treasury" without timelock.

### Luna Yield Pattern (Backdoor)

* **Mechanism**: Hidden "Emergency Withdrawal" function that ignores user balances.
* **Signatures**: `onlyOwner` function capable of withdrawing `address(this).balance` or arbitrary tokens.

### Compounder Pattern (Proxy Rug)

* **Mechanism**: Contract logic swapped via Proxy Admin upgrade to a malicious implementation.
* **Signatures**: TransparentUpgradeProxy with an EOA (Externally Owned Account) as admin.

### Snowdog Pattern (LP Manipulation)

* **Mechanism**: Internal "buy-back" function used to drain liquidity to a private wallet under the guise of "support".
* **Signatures**: `buyBack` functions that route swapped ETH to dev wallets.

## 3. Compliance & Identity

### The Blacklist

* **Prohibited**: `moon`, `100x`, `safe`, `gem`, `lambo`, `financial advice`, `guaranteed`, `launch now`, `urgent`, `pump`.

### The Whitelist (Preferred Vocab)

* `pattern`, `signal`, `risk`, `behavior`, `context`, `gatekeeping`, `trust`, `verification`, `audit`, `latency`.

### Jitter Protocol

* **Base Delay**: 90 minutes.
* **Jitter**: Random 0-45 minutes added.
* **Purpose**: Prevent predictable algorithmic detection.

## 4. Crisis Protocols

* **Trigger**: Market volatility > 10% in 1h OR specific exploit alerts.
* **Action**: "Lockdown Mode" (Halt all posting).
* **Dynamic Urgency**: Only during active verified exploits, send 15-min educational bursts.
