// Marketing Agent for NoblePad - Enhanced Version
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
      this.processQueue();
      
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
        `- Media: ${this.mediaQueue.length} pending media`
      ].join('\n');
      ctx.reply(status);
    });

    this.telegramBot.launch()
      .then(() => console.log('🤖 Telegram bot is running'))
      .catch(err => console.error('❌ Telegram bot error:', err.message));
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
    // Schedule content to be posted at specific times
    schedule.scheduleJob('0 9,12,15,18 * * *', async () => {
      if (this.contentQueue.length > 0) {
        const content = this.contentQueue.shift();
        await this.postContent(content);
        // Save the updated queue
        await this.saveQueue();
      }
    });
    console.log('⏰ Content scheduler is active');
  }

  async postContent(content) {
    console.log(`📤 Posting content: ${content.substring(0, 50)}...`);
    
    try {
      // Post to Twitter if client is available
      if (this.twitterClient) {
        await this.postToTwitter(content);
      }
      
      // Post to Telegram if bot is available
      if (this.telegramBot && this.chatId) {
        await this.telegramBot.telegram.sendMessage(this.chatId, content);
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
        const mediaData = await fs.readFile(mediaPath);
        const mediaIdResponse = await this.twitterClient.v1.uploadMedia(mediaData, { type: 'image/jpeg' });
        mediaId = mediaIdResponse.media_id_string;
      }

      const tweet = await this.twitterClient.v2.tweet(content, {
        ...(mediaId && { media: { media_ids: [mediaId] } })
      });

      console.log('✅ Tweet posted successfully:', tweet.data.text);
      return tweet;
    } catch (error) {
      console.error('❌ Error posting to Twitter:', error.message);
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

  processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🔄 Starting content processing queue...');
    
    // Process queue every 30 seconds
    this.queueInterval = setInterval(async () => {
      if (this.contentQueue.length > 0) {
        const content = this.contentQueue.shift();
        await this.postContent(content);
        await this.saveQueue();
      }
    }, 30000);
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
