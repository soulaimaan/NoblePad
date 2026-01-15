/**
 * The Auditor (The Expert)
 * Validates drafts against the Technical Checklist.
 */
const Checklist = require('../data/TechnicalChecklist.cjs');

class Auditor {
    constructor() { }

    validate(data) {
        // Iterate through all rules in the checklist
        for (const rule of Checklist.rules) {
            const result = rule.check(data);
            if (!result.passed) {
                return {
                    passed: false,
                    reason: `${rule.name}: ${result.reason}`,
                    ruleId: rule.id
                };
            }
        }
        return { passed: true };
    }
}

module.exports = Auditor;
