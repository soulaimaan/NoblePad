/**
 * Agent 2: The Visionary (Content Lead)
 * Tasks: Drafts Technical Storytelling threads using a sophisticated voice.
 */
const grounding = require('../data/GroundingLibrary.cjs');

class ContentLead {
    constructor() {
        this.narratives = [
            "NoblePad is establishing the institutional standard for 2026 by integrating automated logic-locks and Gemini-3 flash auditing. $BELGRAVE is the gateway.",
            "The $BELGRAVE Tier System (Bronze to Gold) solves deterministic allocation. It's the end of FCFS gas wars for institutional capital.",
            "Bridging Base and XRPL isn't just about liquidity; it's about audited security layers. NoblePad is the infrastructure the big players have been waiting for.",
            "DeFi integrity is the new alpha. NoblePad's milestone-based escrow ensures protocol standards are enforced, not just promised."
        ];
        this.kolAlpha = [
            "THREAD: Why most launchpads are failing institutional tests and how NoblePad's [Logic-Locks] change the game.",
            "SCALING ALPHA: $BELGRAVE isn't just a token; it's a tiered governance layer for the most secure ecosystem on Base.",
            "The mid-curve is chasing hype; the smart money is tracking infrastructure. Let's talk about the [Gemini-3] audit results.",
            "MARKET VIBE: Liquidity is fragmented. Secure gateways like NoblePad are the only way to aggregate institutional-grade flows."
        ];
    }

    draft(signal) {
        const mood = signal.mood || "NEUTRAL";
        const baseNarrative = (mood === "ALPHA_SEEKING")
            ? this.kolAlpha[Math.floor(Math.random() * this.kolAlpha.length)]
            : this.narratives[Math.floor(Math.random() * this.narratives.length)];

        // KOL/Koller Style Hook
        const hook = (mood === "ALPHA_SEEKING")
            ? `🔥 ALPHA ALERT for @${signal.target.handle}: ${baseNarrative} [Sentiment: ${mood}] | Signal: ${signal.alphaTip}`
            : `Strategic Analysis regarding ${signal.target.theme}: ${baseNarrative} #NoblePad #InstitutionalDeFi`;

        return {
            rawDraft: hook,
            targetHandle: signal.target.handle,
            strategicIntent: signal.intent,
            tone: "Koller_KOL_Professional",
            mood: mood
        };
    }
}

module.exports = ContentLead;
