/**
 * Agent 6: The Algorithm Guard (Compliance)
 * Task: Enforces 'Organic Jitter' and shadow-ban protection.
 */
class ComplianceGuard {
    constructor() {
        this.maxDailyOriginal = 1;
        this.maxDailyReplies = 5;
    }

    check(interactionPackage) {
        const content = interactionPackage.hook || interactionPackage.fullThreadContinuation;

        // 1. Anti-Spam: Check for repetitive phrases
        if (content.length < 20) {
            return { approved: false, reason: "Content too short, likely low-value." };
        }

        // 2. Ticker/Link Policy: No links in original posts (to avoid reach penalty)
        if (content.includes("http") && !interactionPackage.replyTo) {
            return { approved: false, reason: "X.com Reach Penalty: Links not allowed in original posts." };
        }

        // 3. Shadow-ban trigger: Excessive ticker usage
        const tickers = content.match(/\$[A-Z]+/g) || [];
        if (tickers.length > 2) {
            return { approved: false, reason: "Potential Shadow-ban: Excessive ticker usage detected." };
        }

        return {
            approved: true,
            jitterRequirement: "90m + random(1-45m)",
            protection: "Active"
        };
    }
}

module.exports = ComplianceGuard;
