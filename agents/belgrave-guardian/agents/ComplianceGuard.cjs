/**
 * The Compliance Guard (The Gatekeeper)
 * Enforces Jitter blocks and vocabulary blacklists.
 */
class ComplianceGuard {
    constructor() {
        this.blacklist = [
            'moon', '100x', 'safe', 'gem', 'lambo',
            'financial advice', 'guaranteed', 'launch now', 'urgent', 'pump'
        ];
    }

    check(content) {
        const lowerContent = content.toLowerCase();
        const forbidden = this.blacklist.find(word => lowerContent.includes(word));

        if (forbidden) {
            return { approved: false, reason: `Blacklisted word: ${forbidden}` };
        }
        return { approved: true };
    }
}

module.exports = ComplianceGuard;
