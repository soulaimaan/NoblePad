#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SocialMediaBotAgent {
  constructor() {
    this.name = "📱 Social Media Bot Agent";
    this.status = "initializing";
    this.isActive = false;
    
    // Bot configurations using environment variables
    this.config = {
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        channelId: process.env.TELEGRAM_CHANNEL_ID,
        enabled: false
      },
      
      twitter: {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        enabled: false
      }
    };
    
    // Content queue for scheduling
    this.contentQueue = [];
    this.postHistory = [];
    this.scheduledPosts = new Map();
    
    // Performance tracking
    this.metrics = {
      telegram: {
        postsToday: 0,
        totalViews: 0,
        engagement: 0,
        members: 0
      },
      twitter: {
        tweetsToday: 0,
        impressions: 0,
        engagement: 0,
        followers: 0
      }
    };
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${this.name}: ${message}`);
  }

  async initialize() {
    this.log("🚀 Initializing Social Media Bot Agent...");
    
    // Check if credentials are provided
    this.validateCredentials();
    
    // Initialize bot connections
    await this.initializeTelegramBot();
    await this.initializeTwitterBot();
    
    // Load content queue
    this.loadContentQueue();
    
    this.status = "ready";
    this.log("✅ Social Media Bot Agent initialized!");
  }

  validateCredentials() {
    this.log("🔑 Checking API credentials...");
    
    // Check Telegram credentials
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) {
      this.config.telegram.enabled = true;
      this.log("✅ Telegram bot credentials found");
    } else {
      this.log("⚠️ Telegram bot credentials not fully configured");
    }
    
    // Check Twitter credentials  
    if (process.env.TWITTER_API_KEY && 
        process.env.TWITTER_API_SECRET && 
        process.env.TWITTER_ACCESS_TOKEN && 
        process.env.TWITTER_ACCESS_SECRET && 
        process.env.TWITTER_BEARER_TOKEN) {
      this.config.twitter.enabled = true;
      this.log("✅ Twitter API credentials found");
    } else {
      this.log("⚠️ Twitter API credentials not fully configured");
    }
    
    if (!this.config.telegram.enabled && !this.config.twitter.enabled) {
      this.log("❌ No social media credentials configured! Running in simulation mode.");
    }
  }

  async initializeTelegramBot() {
    if (!this.config.telegram.enabled) {
      this.log("⏭️ Skipping Telegram bot initialization (no credentials)");
      return;
    }

    try {
      this.log("📱 Initializing Telegram bot...");
      
      // Simulate Telegram bot setup (replace with actual node-telegram-bot-api)
      this.telegramBot = {
        async sendMessage(chatId, text, options = {}) {
          console.log(`📱 [TELEGRAM] Would post to ${chatId}: ${text}`);
          return { message_id: Date.now(), chat: { id: chatId } };
        },
        
        async sendPhoto(chatId, photo, options = {}) {
          console.log(`📸 [TELEGRAM] Would post image to ${chatId}: ${options.caption || 'No caption'}`);
          return { message_id: Date.now(), chat: { id: chatId } };
        }
      };
      
      this.log("✅ Telegram bot initialized (simulation mode)");
    } catch (error) {
      this.log(`❌ Telegram bot initialization failed: ${error.message}`);
      this.config.telegram.enabled = false;
    }
  }

  async initializeTwitterBot() {
    if (!this.config.twitter.enabled) {
      this.log("⏭️ Skipping Twitter bot initialization (no credentials)");
      return;
    }

    try {
      this.log("🐦 Initializing Twitter bot...");
      
      // Simulate Twitter API setup (replace with actual twitter-api-v2)
      this.twitterBot = {
        async tweet(content) {
          console.log(`🐦 [TWITTER] Would tweet: ${content}`);
          return { 
            data: { 
              id: Date.now().toString(), 
              text: content,
              public_metrics: {
                like_count: Math.floor(Math.random() * 50 + 10),
                retweet_count: Math.floor(Math.random() * 20 + 5),
                reply_count: Math.floor(Math.random() * 15 + 2)
              }
            } 
          };
        },
        
        async createThread(tweets) {
          console.log(`🧵 [TWITTER] Would post thread with ${tweets.length} tweets`);
          return tweets.map((tweet, index) => ({
            data: { 
              id: (Date.now() + index).toString(), 
              text: tweet,
              conversation_id: Date.now().toString()
            }
          }));
        }
      };
      
      this.log("✅ Twitter bot initialized (simulation mode)");
    } catch (error) {
      this.log(`❌ Twitter bot initialization failed: ${error.message}`);
      this.config.twitter.enabled = false;
    }
  }

  async postToTelegram(content, options = {}) {
    if (!this.config.telegram.enabled) {
      this.log("📱 Telegram posting skipped (not configured)");
      return null;
    }

    try {
      let result;
      
      if (options.image) {
        result = await this.telegramBot.sendPhoto(
          this.config.telegram.channelId,
          options.image,
          { caption: content, parse_mode: 'HTML' }
        );
      } else {
        result = await this.telegramBot.sendMessage(
          this.config.telegram.channelId,
          content,
          { parse_mode: 'HTML' }
        );
      }
      
      this.metrics.telegram.postsToday++;
      this.log(`✅ Posted to Telegram: ${content.substring(0, 50)}...`);
      
      return result;
    } catch (error) {
      this.log(`❌ Telegram posting failed: ${error.message}`);
      return null;
    }
  }

  async postToTwitter(content, options = {}) {
    if (!this.config.twitter.enabled) {
      this.log("🐦 Twitter posting skipped (not configured)");
      return null;
    }

    try {
      let result;
      
      if (options.thread && Array.isArray(content)) {
        result = await this.twitterBot.createThread(content);
      } else {
        result = await this.twitterBot.tweet(content);
      }
      
      this.metrics.twitter.tweetsToday++;
      this.log(`✅ Posted to Twitter: ${Array.isArray(content) ? 'Thread' : content.substring(0, 50)}...`);
      
      return result;
    } catch (error) {
      this.log(`❌ Twitter posting failed: ${error.message}`);
      return null;
    }
  }

  async postToBothPlatforms(content, options = {}) {
    this.log(`📢 Cross-posting content: ${content.substring(0, 50)}...`);
    
    const results = await Promise.allSettled([
      this.postToTelegram(content.telegram || content, options),
      this.postToTwitter(content.twitter || content, options)
    ]);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    this.log(`✅ Posted to ${successCount}/2 platforms successfully`);
    
    return results;
  }

  generateTelegramContent(baseContent) {
    // Telegram allows longer content, HTML formatting
    return baseContent
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')  // Bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>')      // Italic
      .replace(/#(\w+)/g, '#$1');              // Keep hashtags
  }

  generateTwitterContent(baseContent) {
    // Twitter has 280 char limit, different hashtag strategy
    let twitterContent = baseContent;
    
    // Truncate if too long
    if (twitterContent.length > 240) {
      twitterContent = twitterContent.substring(0, 237) + '...';
    }
    
    return twitterContent;
  }

  scheduleContent(content, scheduledTime, platforms = ['telegram', 'twitter']) {
    const scheduleId = Date.now().toString();
    
    const scheduledPost = {
      id: scheduleId,
      content: content,
      scheduledTime: new Date(scheduledTime),
      platforms: platforms,
      status: 'scheduled',
      created: new Date()
    };
    
    this.scheduledPosts.set(scheduleId, scheduledPost);
    this.log(`📅 Content scheduled for ${scheduledTime} on ${platforms.join(', ')}`);
    
    return scheduleId;
  }

  async processScheduledPosts() {
    const now = new Date();
    
    for (const [id, post] of this.scheduledPosts.entries()) {
      if (post.status === 'scheduled' && now >= post.scheduledTime) {
        this.log(`⏰ Processing scheduled post: ${id}`);
        
        try {
          const content = {
            telegram: this.generateTelegramContent(post.content),
            twitter: this.generateTwitterContent(post.content)
          };
          
          await this.postToBothPlatforms(content);
          
          post.status = 'posted';
          post.postedAt = now;
          
          this.postHistory.push(post);
          this.scheduledPosts.delete(id);
          
        } catch (error) {
          this.log(`❌ Failed to process scheduled post ${id}: ${error.message}`);
          post.status = 'failed';
        }
      }
    }
  }

  async connectToMarketingAgent() {
    this.log("🔗 Connecting to Marketing Agent for content feed...");
    
    try {
      // Import marketing agent content
      const MarketingAgent = require('./crypto-marketing-agent');
      const marketingAgent = new MarketingAgent();
      
      // Get today's content
      const dailyContent = await marketingAgent.createDailyContent();
      
      // Schedule posts throughout the day
      const today = new Date();
      const postTimes = [
        new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // 9 AM
        new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0), // 1 PM  
        new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0)  // 6 PM
      ];
      
      const contents = [
        dailyContent.progress,
        dailyContent.insight,
        dailyContent.community
      ];
      
      postTimes.forEach((time, index) => {
        if (time > new Date()) { // Only schedule future posts
          this.scheduleContent(contents[index], time);
        }
      });
      
      this.log(`✅ Connected to Marketing Agent - ${postTimes.length} posts scheduled`);
      
    } catch (error) {
      this.log(`❌ Failed to connect to Marketing Agent: ${error.message}`);
    }
  }

  loadContentQueue() {
    try {
      const queueFile = './marketing-content/content-queue.json';
      if (fs.existsSync(queueFile)) {
        const data = fs.readFileSync(queueFile, 'utf8');
        this.contentQueue = JSON.parse(data);
        this.log(`📚 Loaded ${this.contentQueue.length} items from content queue`);
      }
    } catch (error) {
      this.log("📚 No content queue found, starting fresh");
    }
  }

  saveContentQueue() {
    try {
      const queueFile = './marketing-content/content-queue.json';
      fs.writeFileSync(queueFile, JSON.stringify(this.contentQueue, null, 2));
    } catch (error) {
      this.log(`❌ Failed to save content queue: ${error.message}`);
    }
  }

  displayStatus() {
    console.log("\n" + "=".repeat(60));
    console.log("📱 SOCIAL MEDIA BOT AGENT STATUS");
    console.log("=".repeat(60));
    console.log(`⏰ Last Updated: ${new Date().toLocaleTimeString()}`);
    console.log(`🔄 Status: ${this.status}`);
    
    console.log("\n🔧 PLATFORM STATUS:");
    console.log(`📱 Telegram: ${this.config.telegram.enabled ? '✅ Enabled' : '❌ Not configured'}`);
    console.log(`🐦 Twitter: ${this.config.twitter.enabled ? '✅ Enabled' : '❌ Not configured'}`);
    
    console.log("\n📊 TODAY'S ACTIVITY:");
    console.log(`📱 Telegram Posts: ${this.metrics.telegram.postsToday}`);
    console.log(`🐦 Twitter Posts: ${this.metrics.twitter.tweetsToday}`);
    
    console.log(`\n📅 SCHEDULED POSTS: ${this.scheduledPosts.size}`);
    for (const [id, post] of this.scheduledPosts.entries()) {
      const timeStr = post.scheduledTime.toLocaleTimeString();
      console.log(`   ${timeStr} - ${post.content.substring(0, 30)}... (${post.platforms.join(', ')})`);
    }
    
    console.log("=".repeat(60));
  }

  async run() {
    try {
      await this.initialize();
      this.isActive = true;
      
      // Connect to marketing agent for content
      await this.connectToMarketingAgent();
      
      // Start scheduled post processor (every minute)
      const processorInterval = setInterval(async () => {
        if (this.isActive) {
          await this.processScheduledPosts();
        }
      }, 60000);
      
      // Display status every 5 minutes
      const statusInterval = setInterval(() => {
        if (this.isActive) {
          this.displayStatus();
        }
      }, 5 * 60000);
      
      // Initial status display
      this.displayStatus();
      
      this.log("🤖 Social Media Bot Agent is now active!");
      this.log("📱 Monitoring scheduled posts and connecting to marketing content");
      
    } catch (error) {
      this.log(`❌ Critical error: ${error.message}`);
      this.status = "error";
    }
  }

  stop() {
    this.isActive = false;
    this.saveContentQueue();
    this.log("🛑 Social Media Bot Agent stopped");
  }
}

// Auto-start when run directly
if (require.main === module) {
  const botAgent = new SocialMediaBotAgent();
  
  console.log("🤖 SOCIAL MEDIA BOT AGENT");
  console.log("=".repeat(50));
  console.log("This agent will automate posting to:");
  console.log("📱 Telegram channels/groups");
  console.log("🐦 Twitter/X accounts");
  console.log("=".repeat(50));
  console.log("⚠️  Configure API credentials in environment variables:");
  console.log("   TELEGRAM_BOT_TOKEN=your_telegram_token");
  console.log("   TWITTER_API_KEY=your_twitter_key");
  console.log("   etc...");
  console.log("=".repeat(50));
  
  botAgent.run();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    botAgent.stop();
    process.exit(0);
  });
}

module.exports = SocialMediaBotAgent;