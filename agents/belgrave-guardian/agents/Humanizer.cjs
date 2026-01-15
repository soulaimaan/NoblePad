/**
 * The Humanizer (The Stylist)
 * Adds linguistic nuance and "street-smart" security expertise.
 */
class Humanizer {
    refine(content) {
        const variations = [
            content,
            `Start Quote: "${content}" End Quote.`, // Stylistic choice
            content.replace("Exercise caution", "Stay sharp"),
            content + " Patterns matter."
        ];
        return variations[Math.floor(Math.random() * variations.length)];
    }
}

module.exports = Humanizer;
