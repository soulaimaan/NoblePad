/**
 * Agent 4: The Stylist (Humanizer)
 * Task: Optimizes for X.com 2026 "View Velocity" and consultative style.
 */
class Humanizer {
    refine(content) {
        // X.com 2026 Rules: Avoid link-spam, maximize technical clarity.
        // Rule: Remove trailing exclamation marks for a cooler, more professional tone.
        let refined = content.replace(/!/g, ".");

        // Add a "Consultative" ending structure if it's missing
        if (!refined.includes("?")) {
            const closings = [
                " How does your framework address these security baselines?",
                " We see this as a requirement for the next phase of adoption.",
                " Optimization of these logic layers remains our primary focus."
            ];
            refined += closings[Math.floor(Math.random() * closings.length)];
        }

        return refined;
    }
}

module.exports = Humanizer;
