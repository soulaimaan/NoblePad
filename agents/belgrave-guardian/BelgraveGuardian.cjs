/**
 * BELGRAVE GUARDIAN ORCHESTRATOR: GROWTH ARCHITECT EDITION
 * Coordinates the 6-agent autonomous ecosystem for Institutional Growth.
 */

const schedule = require('node-schedule');
const Researcher = require('./agents/Researcher.cjs');
const ContentLead = require('./agents/ContentLead.cjs');
const Auditor = require('./agents/Auditor.cjs');
const Humanizer = require('./agents/Humanizer.cjs');
const Networker = require('./agents/Networker.cjs');
const ComplianceGuard = require('./agents/ComplianceGuard.cjs');

class BelgraveGuardian {
    constructor() {
        this.scout = new Researcher();
        this.visionary = new ContentLead();
        this.institutionalAuditor = new Auditor();
        this.stylist = new Humanizer();
        this.networker = new Networker();
        this.algorithmGuard = new ComplianceGuard();

        // Operational State
        this.nextRunTime = null;
        this.status = "GROWTH MODE ACTIVE";

        // Ratio Tracking (3:1 Reply-to-Post)
        this.stats = {
            originalPosts: 0,
            replies: 0
        };
    }

    async initialize() {
        const isManual = process.argv.includes('--manual') || process.argv.includes('--once');

        console.log("🚀 NOBLEPAD: INSTITUTIONAL GROWTH & ADOPTION STARTING [v2.1]");
        console.log(`    - Mode: ${isManual ? "MANUAL EXECUTION" : "GROWTH ARCHITECT AUTOMATION"}`);
        console.log("    - Internal Logic: Gemini 3 Flash Auditor [SECURED]");
        console.log("    - Ratio Protocol: Enforcing 3:1 Reply-to-Post Ratio");

        await this.runCycle();

        if (!isManual) {
            this.scheduleNextRun();
        } else {
            console.log("✅ Manual cycle complete. Shutting down.");
            process.exit(0);
        }
    }

    scheduleNextRun() {
        // Enforce "Organic Jitter": 90m + random(1-45m)
        const delayMinutes = 90 + Math.floor(Math.random() * 45);
        const nextDate = new Date(Date.now() + delayMinutes * 60000);
        this.nextRunTime = nextDate;

        console.log(`🕒 Next Growth Cycle scheduled for: ${nextDate.toLocaleTimeString()}`);

        schedule.scheduleJob(nextDate, async () => {
            await this.runCycle();
            this.scheduleNextRun();
        });
    }

    async runCycle() {
        console.log("\n🔄 STARTING GROWTH EXECUTION LOOP");

        // Determine if this cycle should be a 'Reply' or an 'Original Thread'
        // Strategy: We want a 3:1 ratio. 
        // If replies < (originalPosts * 3), then we prioritize a Reply.
        const isReply = (this.stats.replies < this.stats.originalPosts * 3) || this.stats.originalPosts === 0 && this.stats.replies < 3;

        console.log(`📡 Interaction Mode: ${isReply ? "Consultative Reply (Networking)" : "Original Narrative Thread"}`);

        // 1. Strategic Signal (The Scout)
        console.log("🔍 [1/6] The Scout identifying market pain points...");
        const signal = await this.scout.scan();
        signal.isReply = isReply; // Pass intent to other agents
        console.log(`    Target: ${signal.target.name} (${signal.target.handle})`);
        console.log(`    Pain Point: ${signal.painPoint}`);

        // 2. Narrative Draft (The Visionary)
        console.log("📝 [2/6] The Visionary drafting technical storytelling...");
        const draftPackage = this.visionary.draft(signal);

        // 3. Quality Audit (The Institutional Auditor)
        console.log("🛡️  [3/6] The Institutional Auditor stripping 'Degen' language...");
        const auditResult = this.institutionalAuditor.validate(draftPackage);
        console.log(`    Quality Score: ${auditResult.qualityScore}%`);

        if (!auditResult.passed) {
            console.log(`🛑 BLOCKED by Institutional Auditor: Forbidden language detected (${auditResult.violations.join(', ')})`);
            return;
        }

        // 4. Humanize (The Stylist)
        console.log("🎨 [4/6] The Stylist optimizing for 'View Velocity'...");
        const refinedContent = this.stylist.refine(auditResult.content);

        // 5. Networking Hook (The Networker)
        console.log("🤝 [5/6] The Networker drafting consultative reply...");
        const interactionPackage = this.networker.generateHook(signal, refinedContent);
        console.log(`    Networking Hook: "${interactionPackage.hook}"`);

        // 6. Algorithm Check (The Algorithm Guard)
        console.log("👮 [6/6] The Algorithm Guard enforcing shadow-ban protection...");
        const complianceResult = this.algorithmGuard.check(interactionPackage);

        if (complianceResult.approved) {
            // Confidence Score Check (Must be >95% or it triggers Simulation Mode)
            if (interactionPackage.confidenceScore < 95) {
                console.log(`⚠️  [SIMULATION MODE] Confidence Score (${interactionPackage.confidenceScore}%) below threshold. Postponing live broadcast.`);
                return;
            }

            // Update Stats
            if (signal.isReply) this.stats.replies++;
            else this.stats.originalPosts++;

            await this.publish(interactionPackage);
        } else {
            console.log(`🛑 BLOCKED by Algorithm Guard: ${complianceResult.reason}`);
        }
    }

    async publish(pkg) {
        console.log(`\n✅ [GROWTH ACTION] EXECUTING STRATEGIC ${pkg.replyTo ? "OUTREACH" : "NARRATIVE"}`);
        console.log("---------------------------------------------------");
        console.log(`TARGET/REPLY: ${pkg.replyTo || "Original Thread"}`);
        console.log(`NETWORK HOOK: ${pkg.hook || "N/A"}`);
        console.log(`CONTENT: ${pkg.fullThreadContinuation}`);
        console.log(`CONFIDENCE SCORE: ${pkg.confidenceScore}%`);
        console.log(`RATIO STATUS: ${this.stats.replies} Replies / ${this.stats.originalPosts} Posts`);
        console.log("---------------------------------------------------");

        // Simulation Mode Logging
        console.log("    => Signal processed. Ready for broadcast.");

        // Real Broadcast (if environment vars present)
        let broadcasted = false;

        // 1. Telegram Broadcast (Operations Center)
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
                const { Telegraf } = require('telegraf');
                const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
                await bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID,
                    `🚀 *NoblePad Growth Action*\n\n*Target:* ${pkg.replyTo}\n*Reply:* ${pkg.hook}\n\n*Thread:* ${pkg.fullThreadContinuation}`,
                    { parse_mode: 'Markdown' }
                );
                console.log("    => Broadcasted to Operations Center (Telegram) ✅");
                broadcasted = true;
            } catch (err) {
                console.error("    => Telegram Broadcast Failed:", err.message);
            }
        }

        // 2. Twitter/X Broadcast (Live Deployment)
        if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) {
            try {
                const { TwitterApi } = require('twitter-api-v2');
                const twitterClient = new TwitterApi({
                    appKey: process.env.TWITTER_API_KEY,
                    appSecret: process.env.TWITTER_API_SECRET,
                    accessToken: process.env.TWITTER_ACCESS_TOKEN,
                    accessSecret: process.env.TWITTER_ACCESS_SECRET,
                });

                // Format: Hook + Content (keeping it under 280 for now or using thread if possible)
                // For simplicity, we post the hook/reply first.
                const tweetText = `${pkg.hook}\n\n${pkg.fullThreadContinuation}`.substring(0, 280);

                await twitterClient.v2.tweet(tweetText);
                console.log("    => Broadcasted to X.com (Twitter) ✅");
                broadcasted = true;
            } catch (err) {
                console.error("    => X.com Broadcast Failed:", err.message);
            }
        }

        if (!broadcasted) {
            console.log("    ⚠️  No broadcast channels configured (Check .env for Telegram/Twitter keys).");
        }
    }
}

module.exports = BelgraveGuardian;
