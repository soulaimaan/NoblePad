/**
 * BELGRAVE GUARDIAN ORCHESTRATOR
 * Coordinates the 6-agent autonomous workflow.
 */

const schedule = require('node-schedule');
const Researcher = require('./agents/Researcher.cjs');
const ContentLead = require('./agents/ContentLead.cjs');
const Auditor = require('./agents/Auditor.cjs');
const Humanizer = require('./agents/Humanizer.cjs');
const ComplianceGuard = require('./agents/ComplianceGuard.cjs');
const CrisisMonitor = require('./agents/CrisisMonitor.cjs');

class BelgraveGuardian {
    constructor() {
        this.researcher = new Researcher();
        this.contentLead = new ContentLead();
        this.auditor = new Auditor();
        this.humanizer = new Humanizer();
        this.compliance = new ComplianceGuard();
        this.crisisMonitor = new CrisisMonitor();

        // Jitter State
        this.nextRunTime = null;
    }

    async initialize() {
        console.log("🛡️  BELGRAVE GUARDIAN SYSTEM STARTING [PRODUCTION]");
        console.log("    - Agents: ACTIVE");
        console.log("    - Jitter Protocol: ENABLED (90-135m intervals)");
        console.log("    - Mode: PENDING LIVE KEYS (Simulated Data/Output)");

        // Initial run immediately on startup
        await this.runCycle();
        this.scheduleNextRun();
    }

    scheduleNextRun() {
        // Real Production Jitter: 90 mins base + random(45 mins)
        const delayMinutes = 90 + Math.floor(Math.random() * 45);

        const nextDate = new Date(Date.now() + delayMinutes * 60000);
        this.nextRunTime = nextDate;

        console.log(`🕒 Next scan scheduled for: ${nextDate.toLocaleTimeString()}`);

        schedule.scheduleJob(nextDate, async () => {
            await this.runCycle();
            this.scheduleNextRun(); // Recursive schedule
        });
    }

    async runCycle() {
        console.log("\n🔄 STARTING SECURITY SCAN CYCLE");

        // 0. Safety Check
        if (this.crisisMonitor.checkVolatility()) {
            this.crisisMonitor.activateLockdown();
            return;
        }

        if (this.crisisMonitor.isLockdown) {
            console.log("⛔ System in Lockdown. Skipping cycle.");
            return;
        }

        // 1. Research
        console.log("🔍 [1/5] Researcher scanning...");
        const data = await this.researcher.scan();
        console.log(`    Found Contract: ${data.contractAddress}`);

        // 2. Audit
        console.log("🛡️  [2/5] Auditor verifying...");
        const auditResult = this.auditor.validate(data);
        console.log(`    Audit Result: ${auditResult.passed ? "PASSED" : "FAILED"}`);
        if (!auditResult.passed) console.log(`    Reason: ${auditResult.reason}`);

        // 3. Draft
        console.log("📝 [3/5] Content Lead drafting...");
        const rawDraft = this.contentLead.draft(data, auditResult);

        if (!rawDraft) {
            console.log("    No significant risk/signal found. Skipping post.");
            return;
        }
        console.log(`    Draft: "${rawDraft}"`);

        // 4. Humanize
        console.log("🎨 [4/5] Humanizer refining...");
        const finalContent = this.humanizer.refine(rawDraft);
        console.log(`    Refined: "${finalContent}"`);

        // 5. Compliance
        console.log("👮 [5/5] Compliance checking...");
        const complianceResult = this.compliance.check(finalContent);

        if (complianceResult.approved) {
            this.publish(finalContent, auditResult);
        } else {
            console.log(`🛑 BLOCKED by Compliance: ${complianceResult.reason}`);
        }
    }

    async publish(content, auditContext) {
        // PRODUCTION: Live Twitter & Telegram Integration
        console.log("\n✅ [ACTION] PUBLISHING TWEET/POST (Broadcast Mode)");
        console.log("---------------------------------------------------");
        console.log(content);
        console.log("---------------------------------------------------");

        // Telegram Broadcast
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
                const { Telegraf } = require('telegraf');
                const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
                await bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID,
                    `${content}\n\n🕵️ Technical Context: ${auditContext.reason || "Clean verified audit."}`
                );
                console.log("    => Sent to Telegram ✅");
            } catch (err) {
                console.error("    => Telegram Failed:", err.message);
            }
        } else {
            console.log("    => Telegram Tokens Missing (Skipped)");
        }

        // Twitter Broadcast
        if (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN) {
            try {
                const { TwitterApi } = require('twitter-api-v2');
                const client = new TwitterApi({
                    appKey: process.env.TWITTER_API_KEY,
                    appSecret: process.env.TWITTER_API_SECRET,
                    accessToken: process.env.TWITTER_ACCESS_TOKEN,
                    accessSecret: process.env.TWITTER_ACCESS_SECRET,
                });
                await client.v2.tweet(content);
                console.log("    => Sent to Twitter ✅");
            } catch (err) {
                console.error("    => Twitter Failed:", err.message);
                if (err.code === 401) console.error("       (Check API Key/Secret/Access Token permissions)");
            }
        } else {
            console.log("    => Twitter Tokens Missing (Skipped)");
        }

        // Log to file (mock)
        // fs.appendFile('antigravity_actions.json', ...)
    }
}

module.exports = BelgraveGuardian;
