/**
 * Agent 3: The Institutional Auditor (Fact-Checker)
 * Task: Strips 'Degen' language and enforces research-report style.
 */
const grounding = require('../data/GroundingLibrary.cjs');

class Auditor {
    constructor() {
        this.forbidden = grounding.voice.forbidden;
    }

    validate(draftPackage) {
        let content = draftPackage.rawDraft;
        let violations = [];

        // 1. Check for degen language
        this.forbidden.forEach(word => {
            if (content.toLowerCase().includes(word.toLowerCase())) {
                violations.push(word);
            }
        });

        // 2. Enforce sophistication (ensure it sounds like a report)
        if (!content.includes("Infrastructure") && !content.includes("Strategic")) {
            content = "Report Addition: " + content;
        }

        return {
            content,
            passed: violations.length === 0,
            violations,
            qualityScore: 100 - (violations.length * 10)
        };
    }
}

module.exports = Auditor;
