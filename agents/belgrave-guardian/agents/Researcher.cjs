/**
 * Agent 1: The Scout (Strategic Researcher)
 * Identifies Market Pain Points and Scans High-Value Targets.
 */
const targets = require('../data/TargetList.cjs');
const sentimentVault = require('../data/SentimentVault.cjs');

class Researcher {
    constructor() {
        this.painPoints = [
            "Lack of institutional-grade security in decentralized launches",
            "Regulatory uncertainty and the need for compliant DeFi infrastructure",
            "Fragmentation of trust in multi-chain ecosystems",
            "The absence of sophisticated, BlackRock-ready capital gateways",
            "Retail investors getting sidelined by VCs in top-tier launches"
        ];
        this.targetKeywords = [
            "Institutional DeFi",
            "Launchpad security",
            "Web3 infrastructure",
            "Liquidity locks",
            "Token launch problems",
            "High-Conviction Plays"
        ];
    }

    async scan() {
        // 1. Analyze Sentiment before picking a target
        sentimentVault.updateSentiment();
        const mood = sentimentVault.currentMood;

        // 2. Pick target based on mood
        const allTargets = [
            ...targets.institutional,
            ...targets.developers,
            ...targets.narrative
        ];

        const target = allTargets[Math.floor(Math.random() * allTargets.length)];

        // 3. Select pain point that aligns with the "Koller" alpha strategy
        const painPoint = mood === "ALPHA_SEEKING"
            ? "Retail investors getting sidelined by VCs in top-tier launches"
            : this.painPoints[Math.floor(Math.random() * (this.painPoints.length - 1))];

        return {
            target,
            painPoint,
            mood,
            alphaTip: sentimentVault.getAlphaTip(),
            intent: "Institutional Growth & Global Adoption",
            signalTimestamp: new Date().toISOString()
        };
    }
}

module.exports = Researcher;
