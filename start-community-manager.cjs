require('dotenv').config();
const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');
const EngagementLead = require('./agents/belgrave-guardian/agents/EngagementLead.cjs');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
const agent = new EngagementLead();

console.log("🚀 NoblePad Community Manager Starting...");
console.log(`🤖 Bot Active. Monitoring Chat: ${chatId}`);

// --- SCHEDULED TASKS ---

// 1. Morning Greeting (08:00)
schedule.scheduleJob('0 8 * * *', async () => {
    console.log("📅 Triggering: Morning Greeting (08:00)");
    const msg = agent.generateMorningGreeting();
    await bot.telegram.sendMessage(chatId, msg);
});

// 2. Early Content (09:30 - 1.5h after morning)
schedule.scheduleJob('30 9 * * *', async () => {
    console.log("📅 Triggering: Morning Insight (09:30)");
    const msg = agent.generateContentChunk('quote');
    await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
});

// 3. Afternoon Engagement (14:00)
schedule.scheduleJob('0 14 * * *', async () => {
    console.log("📅 Triggering: Afternoon Question/Poll (14:00)");
    const msg = agent.generateContentChunk('question');
    await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
});

// 4. Evening Comparison (20:00)
schedule.scheduleJob('0 20 * * *', async () => {
    console.log("📅 Triggering: Evening Comparison (20:00)");
    const msg = agent.generateContentChunk('comparison');
    await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
});

// --- INTERACTIVE MODE (REPLY TO MEMBERS) ---

bot.on('message', async (ctx) => {
    // Only respond to messages in the target chat or DMs
    if (ctx.chat.id.toString() !== chatId.toString() && ctx.chat.type !== 'private') return;

    const text = ctx.message.text;
    if (!text) return;

    // Check if it's a question or mentions the bot/noblepad
    const isQuestion = text.includes('?') || text.toLowerCase().includes('noblepad') || text.toLowerCase().includes('belgrave');

    // Don't reply to our own messages or common commands
    if (text.startsWith('/') || ctx.from.is_bot) return;

    if (isQuestion) {
        console.log(`💬 Member asked: "${text}"`);
        const reply = await agent.handleMemberQuestion(text);

        // Add a small delay to look "smart/natural"
        setTimeout(async () => {
            await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
            console.log("✅ Auto-reply sent.");
        }, 3000);
    }
});

// --- MANUAL TEST TRIGGER ---
if (process.argv.includes('--test')) {
    console.log("🧪 Running test sequence...");
    (async () => {
        await bot.telegram.sendMessage(chatId, "🛠️ *System Test:* Starting Community Manager engagement cycle.");
        await bot.telegram.sendMessage(chatId, agent.generateMorningGreeting());
        await bot.telegram.sendMessage(chatId, agent.generateContentChunk('quote'), { parse_mode: 'Markdown' });
        console.log("✅ Test messages sent to Telegram.");
        process.exit(0);
    })();
} else {
    bot.launch();
    console.log("✅ Community Manager is now monitoring and scheduled.");
}

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
