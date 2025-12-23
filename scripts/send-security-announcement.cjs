require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

async function sendAnnouncement() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID; // Channel/Group ID
  const adminId = process.env.TELEGRAM_ADMIN_ID; // User's direct ID
  
  if (!token || !chatId) {
    console.error('Missing Telegram configuration in .env');
    return;
  }

  const bot = new Telegraf(token);
  const badgePath = path.join(process.cwd(), 'public', 'security-badge.png');
  const caption = `🛡️ NOBLEPAD SECURITY CERTIFICATION 🛡️\n\nWe are proud to announce that NoblePad has achieved a "Verified Anti-Rug" status! \n\nKey Security Upgrades:\n✅ Fixed Supply: $NPAD minting is PERMANENTLY disabled.\n✅ MEV Protection: 98% Slippage Safeguards implemented.\n✅ Verified Liquidity: Hardcoded 60% minimum locking.\n\nOur contracts are fortified. Your capital is protected. \n\nCheck it out live: noblepad.netlify.app\n\n#NoblePad #AntiRug #DeFiSecurity #SafeLaunch`;

  try {
    console.log('📤 Sending Security Certification to Telegram...');
    
    // Send to the main channel/group
    await bot.telegram.sendPhoto(chatId, { source: badgePath }, { caption });
    
    // Also send directly to the admin for checking if ID is available
    if (adminId) {
      await bot.telegram.sendPhoto(adminId, { source: badgePath }, { caption: '🔔 PREVIEW: ' + caption });
    }

    console.log('✅ Announcement sent successfully!');
  } catch (error) {
    console.error('❌ Error sending announcement:', error.message);
  }
}

sendAnnouncement();
