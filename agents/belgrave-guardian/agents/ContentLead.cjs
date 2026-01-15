/**
 * The Content Lead (The Draftsman)
 * Converts research data into neutral risk analysis drafts.
 */
class ContentLead {
    constructor() {
        this.templates = [
            "We detected {RISK}. This pattern is often associated with {PATTERN}. Exercise caution.",
            "Technical Audit: Contract at {ADDRESS} flagged for {RISK}. Verification is key.",
            "Analysis: {RISK} detected. Liquidity locking status: {LOCK_STATUS}. Always verify manually."
        ];
    }

    draft(researchData, auditResult) {
        let risk = "Unknown Risk";
        if (!auditResult.passed) {
            risk = auditResult.reason;
        } else {
            return null; // No risk, no post? Or post "Clean Audit"?
            // Strategy: Only post about RISKS or high-signal warnings.
        }

        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        const lockStatus = researchData.liquidityLocked ? "Locked" : "UNLOCKED";

        return template
            .replace("{RISK}", risk)
            .replace("{ADDRESS}", researchData.contractAddress)
            .replace("{LOCK_STATUS}", lockStatus)
            .replace("{PATTERN}", "high-risk behavior");
    }
}

module.exports = ContentLead;
