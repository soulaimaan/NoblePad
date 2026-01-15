/**
 * The Researcher (The Scout)
 * Scans for suspicious patterns.
 * In a real scenario, this would connect to on-chain data APIs.
 * For this implementation, it uses mock data to demonstrate the pipeline.
 */
class Researcher {
    constructor() {
        this.mockData = [
            {
                contractAddress: "0xMockSuspicious",
                liquidityLocked: false,
                liquidityDuration: 0,
                canMint: true,
                buyTax: 5,
                sellTax: 5,
                isHoneypot: false,
                topHoldersConcentration: 15,
                isUpgradeable: true,
                hasTimelock: false
            },
            {
                contractAddress: "0xMockSafe",
                liquidityLocked: true,
                liquidityDuration: 180,
                canMint: false,
                buyTax: 5,
                sellTax: 5,
                isHoneypot: false,
                topHoldersConcentration: 10,
                isUpgradeable: false,
                hasTimelock: false
            }
        ];
    }

    async scan() {
        // Forcing suspicious findings to demonstrate tweet generation
        // const index = Math.floor(Math.random() * this.mockData.length);
        const index = 0; // Always find the suspicious contract
        return this.mockData[index];
    }
}

module.exports = Researcher;
