// Test Telegram Script
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Telegraf } = require('telegraf');

async function sendTest() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log('DEBUG: Token loaded - length:', token ? token.length : 0);
  console.log('DEBUG: Chat ID loaded:', chatId);

  if (!token || !chatId) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
    process.exit(1);
  }

  const bot = new Telegraf(token);
  
  try {
    console.log(`📤 Sending test message to Chat ID: ${chatId}...`);
    await bot.telegram.sendMessage(chatId, '🚀 NoblePad Marketing Test: The automated agent is ready! #NoblePad #DeFi');
    console.log('✅ Test message sent successfully!');
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
}

sendTest();
