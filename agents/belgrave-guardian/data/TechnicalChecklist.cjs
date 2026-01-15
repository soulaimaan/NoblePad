/**
 * Technical Checklist for the Auditor Agent.
 * Rules derived from BELGRAVE_MARKETING_SPEC.md
 */

module.exports = {
    rules: [
        {
            id: 'L-01',
            name: 'Liquidity Lock Check',
            description: 'Funds must be locked in reputable vaults (Unicrypt, Team Finance, PinkSale). Flag if removeLiquidity is owner-accessible.',
            check: (data) => {
                // Mock logic: In a real scenario, this checks the liquidity provider contract
                if (!data.liquidityLocked) return { passed: false, reason: "Liquidity not locked" };
                if (data.liquidityDuration < 30) return { passed: false, reason: "Lock duration < 30 days" };
                return { passed: true };
            }
        },
        {
            id: 'M-01',
            name: 'Minting Capability',
            description: 'Mint function must NOT exist or be renounced.',
            check: (data) => {
                if (data.canMint) return { passed: false, reason: "Mint function detected and active" };
                return { passed: true };
            }
        },
        {
            id: 'H-01',
            name: 'Honeypot Logic',
            description: 'Tax cannot exceed 25%. TransferFrom must be clear.',
            check: (data) => {
                if (data.buyTax > 25 || data.sellTax > 25) return { passed: false, reason: "Taxes exceed 25%" };
                if (data.isHoneypot) return { passed: false, reason: "Honeypot mechanism detected" };
                return { passed: true };
            }
        },
        {
            id: 'C-01',
            name: 'Wallet Clustering',
            description: 'Top 5 wallets must hold < 20% of supply.',
            check: (data) => {
                if (data.topHoldersConcentration > 20) return { passed: false, reason: `Top 5 holders own ${data.topHoldersConcentration}% (>20%)` };
                return { passed: true };
            }
        },
        {
            id: 'P-01',
            name: 'Proxy Risk',
            description: 'Upgradeable contracts must have Timelock.',
            check: (data) => {
                if (data.isUpgradeable && !data.hasTimelock) return { passed: false, reason: "Upgradeable proxy without 48h timelock" };
                return { passed: true };
            }
        }
    ]
};
