// Marketing Agent for NoblePad - Enhanced Version
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { TwitterApi } = require('twitter-api-v2');
const { Telegraf } = require('telegraf');
const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');

class MarketingAgent {
  constructor() {
    this.initializeClients();
    this.contentQueue = [];
    this.mediaQueue = [];
    this.isRunning = false;
  }

  initializeClients() {
    try {
      // Initialize Twitter client
      if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
        this.twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_API_KEY,
          appSecret: process.env.TWITTER_API_SECRET,
          accessToken: process.env.TWITTER_ACCESS_TOKEN,
          accessSecret: process.env.TWITTER_ACCESS_SECRET,
        });
        console.log('✅ Twitter client initialized');
      } else {
        console.warn('⚠️ Twitter API credentials not found. Twitter features will be disabled.');
      }

      // Initialize Telegram bot
      if (process.env.TELEGRAM_BOT_TOKEN) {
        this.telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        this.chatId = process.env.TELEGRAM_CHAT_ID;
        console.log('✅ Telegram bot initialized');
      } else {
        console.warn('⚠️ Telegram bot token not found. Telegram features will be disabled.');
      }
    } catch (error) {
      console.error('❌ Error initializing clients:', error.message);
      throw error;
    }
  }

  async initialize() {
    console.log('🚀 Starting Marketing Agent...');
    
    try {
      if (this.telegramBot) {
        this.setupTelegramBot();
      }
      
      await this.loadScheduledContent();
      this.scheduleContent();
      
      console.log('✅ Marketing Agent is running');
    } catch (error) {
      console.error('❌ Failed to initialize Marketing Agent:', error.message);
      process.exit(1);
    }
  }

  setupTelegramBot() {
    if (!this.telegramBot) return;

    this.telegramBot.command('start', (ctx) => {
      ctx.reply('🤖 Welcome to NoblePad Marketing Bot!\n\n' +
        'Available commands:\n' +
        '/announce [message] - Make an announcement\n' +
        '/schedule [time] [message] - Schedule a post\n' +
        '/status - Check bot status');
    });

    this.telegramBot.command('status', (ctx) => {
      const status = [
        '🟢 Marketing Bot Status',
        `- Twitter: ${this.twitterClient ? 'Connected' : 'Disabled'}`,
        `- Queue: ${this.contentQueue.length} pending posts`,
        '',
        `👤 Your Telegram ID: ${ctx.from.id}`,
        `🔑 Admin ID set: ${process.env.TELEGRAM_ADMIN_ID || 'NOT SET'}`
      ].join('\n');
      ctx.reply(status);
    });

    // Logger for EVERY message to debug connectivity
    this.telegramBot.on('message', (ctx, next) => {
      console.log(`📩 Message received from ${ctx.from.id} (${ctx.from.username || 'no user'}): ${ctx.message.text || '[Media]'}`);
      return next();
    });

    // Implement the /announce command
    this.telegramBot.command('announce', async (ctx) => {
      const senderId = ctx.from.id.toString();
      const adminId = process.env.TELEGRAM_ADMIN_ID;
      
      if (!adminId || senderId !== adminId) {
        return ctx.reply(`❌ Unauthorized. ID: ${senderId}`);
      }

      const text = ctx.message.text.split(' ').slice(1).join(' ');
      if (!text) {
        return ctx.reply('⚠️ Please provide a message: /announce Your message here');
      }

      ctx.reply('⏳ Posting announcement to Twitter & Telegram...');
      const success = await this.postContent(text);
      if (success) {
        ctx.reply('✅ Announcement posted!');
      } else {
        ctx.reply('❌ Failed to post.');
      }
    });

    // Handle manual announcements with photos
    this.telegramBot.on('photo', async (ctx) => {
      const senderId = ctx.from.id.toString();
      const adminId = process.env.TELEGRAM_ADMIN_ID;
      
      console.log(`📸 Photo received from ID: ${senderId}`);
      console.log(`🔐 Configured Admin ID: ${adminId}`);

      if (!adminId || senderId !== adminId) {
        console.warn('❌ Authorization failed.');
        return ctx.reply(`❌ Unauthorized. Your ID (${senderId}) does not match the Admin ID in settings.`);
      }
      
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      const link = await ctx.telegram.getFileLink(fileId);
      const caption = ctx.message.caption || '';
      
      ctx.reply('⏳ Uploading image to Twitter & Telegram...');
      
      const tempPath = path.join(process.cwd(), `temp_${Date.now()}.jpg`);
      
      try {
        // More robust download using fetch/buffer
        const response = await fetch(link.href);
        const buffer = await response.arrayBuffer();
        await fs.writeFile(tempPath, Buffer.from(buffer));
        
        const success = await this.postContent({ text: caption, media: tempPath });
        
        if (success) {
          ctx.reply('✅ Post successful with image!');
        } else {
          ctx.reply('❌ Error: Could not post to all channels.');
        }
        
        // Clean up safely
        try { await fs.unlink(tempPath); } catch (e) {}
      } catch (error) {
        console.error('Photo handler error:', error);
        ctx.reply('❌ Error processing photo: ' + error.message);
        try { await fs.unlink(tempPath); } catch (e) {}
      }
    });

    this.telegramBot.launch({
      polling: {
        timeout: 30,
        limit: 100
      }
    })
    .then(() => console.log('🤖 Telegram bot is running (Auto-reconnect enabled)'))
    .catch(err => {
      console.error('❌ Telegram start error:', err.message);
      // Retry logic for connection issues
      setTimeout(() => this.setupTelegramBot(), 5000);
    });
    
    // Enable graceful stop
    process.once('SIGINT', () => this.telegramBot.stop('SIGINT'));
    process.once('SIGTERM', () => this.telegramBot.stop('SIGTERM'));
  }

  async loadScheduledContent() {
    try {
      const content = await fs.readFile('scheduled_content.json', 'utf8');
      this.contentQueue = JSON.parse(content);
      console.log(`📋 Loaded ${this.contentQueue.length} scheduled posts`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️ No scheduled content found. Starting with an empty queue.');
        this.contentQueue = [];
      } else {
        throw error;
      }
    }
  }

  scheduleContent() {
    // Schedule content to be posted twice a day (10:00 AM and 6:00 PM)
    schedule.scheduleJob('0 10,18 * * *', async () => {
      if (this.contentQueue.length > 0) {
        const content = this.contentQueue.shift();
        await this.postContent(content);
        // Save the updated queue
        await this.saveQueue();
      }
    });
    console.log('⏰ Content scheduler is active: Twice daily at 10 AM and 6 PM');
  }

  async postContent(content) {
    const text = typeof content === 'string' ? content : content.text;
    const mediaPath = typeof content === 'object' ? content.media : null;
    
    console.log(`📤 Posting content: ${text.substring(0, 50)}...`);
    if (mediaPath) console.log(`🖼️ With media: ${mediaPath}`);
    
    try {
      // Post to Twitter if client is available
      if (this.twitterClient) {
        await this.postToTwitter(text, mediaPath);
      }
      
      // Post to Telegram if bot is available
      if (this.telegramBot && this.chatId) {
        if (mediaPath) {
          const isVideo = mediaPath.toLowerCase().endsWith('.mp4');
          if (isVideo) {
            await this.telegramBot.telegram.sendVideo(this.chatId, { source: mediaPath }, { caption: text });
          } else {
            await this.telegramBot.telegram.sendPhoto(this.chatId, { source: mediaPath }, { caption: text });
          }
        } else {
          await this.telegramBot.telegram.sendMessage(this.chatId, text);
        }
      }
      
      console.log('✅ Content posted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error posting content:', error.message);
      // Re-add to queue if failed
      this.contentQueue.unshift(content);
      return false;
    }
  }

  async postToTwitter(content, mediaPath = null) {
    if (!this.twitterClient) {
      console.warn('Twitter client not initialized. Skipping Twitter post.');
      return;
    }

    try {
      let mediaId;
      if (mediaPath) {
        console.log(`🛠️ Uploading media to Twitter: ${mediaPath}`);
        // Read file as Buffer
        const mediaData = await fs.readFile(mediaPath);
        // Upload via v1 (standard for media)
        mediaId = await this.twitterClient.v1.uploadMedia(mediaData, { type: 'jpg' });
        console.log('✅ Twitter Media ID generated:', mediaId);
      }

      const tweet = await this.twitterClient.v2.tweet(content, {
        ...(mediaId && { media: { media_ids: [mediaId] } })
      });

      console.log('✅ Tweet posted successfully:', tweet.data.text);
      return tweet;
    } catch (error) {
      console.error('❌ Error posting to Twitter:', error.message);
      if (error.data) console.error('Error details:', JSON.stringify(error.data));
      throw error;
    }
  }

  async saveQueue() {
    try {
      await fs.writeFile('scheduled_content.json', JSON.stringify(this.contentQueue, null, 2));
    } catch (error) {
      console.error('❌ Error saving content queue:', error.message);
    }
  }

  // Manual queue processing if needed
  async forcePostNext() {
    if (this.contentQueue.length > 0) {
      const content = this.contentQueue.shift();
      await this.postContent(content);
      await this.saveQueue();
      return true;
    }
    return false;
  }

  stop() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
    }
    this.isRunning = false;
    console.log('🛑 Marketing Agent stopped');
  }
}

// Start the agent
const marketingAgent = new MarketingAgent();
marketingAgent.initialize().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Marketing Agent...');
  marketingAgent.stop();
  if (marketingAgent.telegramBot) {
    await marketingAgent.telegramBot.stop();
  }
  process.exit(0);
});
