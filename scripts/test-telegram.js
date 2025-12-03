const { Telegraf } = require('telegraf');
require('dotenv').config();

async function testTelegramBot() {
  try {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    
    // Get bot info
    const botInfo = await bot.telegram.getMe();
    console.log('✅ Telegram Bot connected successfully!');
    console.log(`Bot username: @${botInfo.username}`);
    console.log(`Bot name: ${botInfo.first_name}`);
    
    // Test sending a message to the chat
    await bot.telegram.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      '🔔 NoblePad Test Notification\n✅ Telegram bot is working correctly!'
    );
    console.log('✅ Test message sent to Telegram chat');
    
  } catch (error) {
    console.error('❌ Telegram Bot Error:', error.message);
    if (error.response) {
      console.error('Error details:', error.response);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testTelegramBot();
