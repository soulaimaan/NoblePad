// Marketing Agent for NoblePad
// Handles Twitter and Telegram content creation and scheduling

const { TwitterApi } = require('twitter-api-v2');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

class MarketingAgent {
  constructor() {
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    
    this.telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    this.contentQueue = [];
    this.mediaQueue = [];
    this.isRunning = false;
  }

  async initialize() {
    console.log('🚀 Starting Marketing Agent...');
    this.setupTelegramBot();
    this.scheduleContent();
    await this.loadScheduledContent();
    this.processQueue();
  }

  setupTelegramBot() {
    this.telegramBot.command('announce', (ctx) => this.handleAnnounceCommand(ctx));
    this.telegramBot.command('schedule', (ctx) => this.handleScheduleCommand(ctx));
    this.telegramBot.launch();
  }

  async loadScheduledContent() {
    try {
      const content = await fs.promises.readFile('scheduled_content.json', 'utf8');
      this.contentQueue = JSON.parse(content);
    } catch (error) {
      console.log('No existing scheduled content found. Starting fresh.');
    }
  }

  async saveScheduledContent() {
    await fs.promises.writeFile(
      'scheduled_content.json',
      JSON.stringify(this.contentQueue, null, 2)
    );
  }

  async createContent() {
    // Content generation logic
    const contentTypes = [
      this.createProjectUpdate,
      this.createMarketAnalysis,
      this.createTeamSpotlight,
      this.createTipOfTheDay,
      this.createCommunitySpotlight
    ];
    
    const randomContent = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    return await randomContent.call(this);
  }

  async createProjectUpdate() {
    const updates = [
      "🚀 Exciting progress on NoblePad! We've just implemented new security features to protect our users.",
      "🔒 Security Update: Enhanced our smart contract audits for better protection against rug pulls.",
      "✨ New Feature Alert: Multi-chain support is coming to NoblePad! Stay tuned for updates.",
      "📈 Market Analysis: The launchpad space is growing, and we're leading the charge with innovative features.",
      "🎯 Just shipped a major update to our token creation interface. Faster, smoother, and more secure!"
    ];
    
    return {
      text: updates[Math.floor(Math.random() * updates.length)],
      media: null,
      platforms: ['twitter', 'telegram'],
      schedule: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 4) // Within 4 hours
    };
  }

  async createMarketAnalysis() {
    // This would typically fetch real market data
    const analyses = [
      "📊 Market Watch: The launchpad sector has seen 47% growth this quarter. NoblePad is positioned for success!",
      "🔍 Deep Dive: How NoblePad's anti-rug features set us apart from competitors.",
      "💡 Industry Insight: The future of multi-chain launchpads and where NoblePad fits in."
    ];
    
    return {
      text: analyses[Math.floor(Math.random() * analyses.length)],
      media: 'market-analysis.png',
      platforms: ['twitter', 'telegram'],
      schedule: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 6) // Within 6 hours
    };
  }

  async createTeamSpotlight() {
    const teamMembers = [
      { name: "Alex", role: "Lead Developer", funFact: "Loves solving complex blockchain puzzles" },
      { name: "Jordan", role: "Security Expert", funFact: "White hat hacker turned blockchain guardian" },
      { name: "Taylor", role: "Community Manager", funFact: "Connects with every community member personally" }
    ];
    
    const member = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    
    return {
      text: `👥 Team Spotlight: Meet ${member.name}, our ${member.role}! ${member.funFact}. #NobleTeam`,
      media: `team-${member.name.toLowerCase()}.jpg`,
      platforms: ['twitter', 'telegram'],
      schedule: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24) // Within 24 hours
    };
  }

  async createTipOfTheDay() {
    const tips = [
      "💡 Tip: Always verify token contracts before investing. Use NoblePad's built-in verification tool!",
      "🔐 Security Tip: Use hardware wallets for storing large amounts of crypto. Better safe than sorry!",
      "📈 Trading Tip: DYOR (Do Your Own Research) is not just advice - it's a necessity in DeFi.",
      "🛡️ Safety Tip: Never share your private keys or seed phrases with anyone, not even us!"
    ];
    
    return {
      text: tips[Math.floor(Math.random() * tips.length)],
      media: null,
      platforms: ['twitter', 'telegram'],
      schedule: new Date() // Post immediately
    };
  }

  async createCommunitySpotlight() {
    // This would typically fetch from community mentions
    return {
      text: "🌟 Community Highlight: Shoutout to @CryptoEnthusiast for their amazing contribution to our community! #NobleCommunity",
      media: null,
      platforms: ['twitter'],
      schedule: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 12) // Within 12 hours
    };
  }

  async postToTwitter(content, mediaPath = null) {
    try {
      let mediaId;
      if (mediaPath) {
        const mediaData = fs.readFileSync(mediaPath);
        const mediaIdResponse = await this.twitterClient.v1.uploadMedia(mediaData, { mimeType: 'image/png' });
        mediaId = mediaIdResponse;
      }
      
      const tweet = await this.twitterClient.v2.tweet(content, {
        media: mediaId ? { media_ids: [mediaId] } : undefined
      });
      
      console.log(`✅ Posted to Twitter: ${content.substring(0, 30)}...`);
      return tweet;
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      throw error;
    }
  }

  async postToTelegram(content, mediaPath = null) {
    try {
      if (mediaPath) {
        await this.telegramBot.telegram.sendPhoto(this.chatId, { source: mediaPath }, { caption: content });
      } else {
        await this.telegramBot.telegram.sendMessage(this.chatId, content);
      }
      console.log(`✅ Posted to Telegram: ${content.substring(0, 30)}...`);
    } catch (error) {
      console.error('Error posting to Telegram:', error);
      throw error;
    }
  }

  async scheduleContent() {
    // Schedule content creation every 3 hours
    schedule.scheduleJob('0 */3 * * *', async () => {
      console.log('🔄 Generating new content...');
      const newContent = await this.createContent();
      this.contentQueue.push(newContent);
      await this.saveScheduledContent();
    });
  }

  async processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      const now = new Date();
      const toProcess = [];
      
      // Find content ready to post
      let i = this.contentQueue.length;
      while (i--) {
        if (new Date(this.contentQueue[i].schedule) <= now) {
          toProcess.push(this.contentQueue.splice(i, 1)[0]);
        }
      }
      
      // Process content
      for (const content of toProcess) {
        try {
          if (content.platforms.includes('twitter')) {
            await this.postToTwitter(content.text, content.media);
          }
          
          if (content.platforms.includes('telegram')) {
            await this.postToTelegram(content.text, content.media);
          }
          
          // Add some delay between posts
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error) {
          console.error(`Error processing content: ${content.text}`, error);
          // Re-add failed content to queue
          this.contentQueue.push({
            ...content,
            schedule: new Date(Date.now() + 1000 * 60 * 15) // Retry in 15 minutes
          });
        }
      }
      
      await this.saveScheduledContent();
      
    } catch (error) {
      console.error('Error in processQueue:', error);
    } finally {
      this.isRunning = false;
      
      // Process queue again in 1 minute
      setTimeout(() => this.processQueue(), 60000);
    }
  }

  // Command handlers for Telegram
  async handleAnnounceCommand(ctx) {
    const message = ctx.message.text.replace('/announce', '').trim();
    if (!message) {
      return ctx.reply('Please provide a message to announce. Example: /announce Big news coming soon!');
    }
    
    try {
      await this.postToTwitter(message);
      await this.postToTelegram(message);
      ctx.reply('✅ Announcement posted to all platforms!');
    } catch (error) {
      console.error('Error in announce command:', error);
      ctx.reply('❌ Failed to post announcement. Please try again.');
    }
  }

  async handleScheduleCommand(ctx) {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) {
      return ctx.reply('Usage: /schedule "MM/DD/YYYY HH:MM" Your message here');
    }
    
    const [dateStr, timeStr, ...messageParts] = args;
    const message = messageParts.join(' ');
    
    try {
      const scheduleDate = new Date(`${dateStr} ${timeStr}`);
      if (isNaN(scheduleDate.getTime())) {
        return ctx.reply('Invalid date format. Use: MM/DD/YYYY HH:MM');
      }
      
      this.contentQueue.push({
        text: message,
        media: null,
        platforms: ['twitter', 'telegram'],
        schedule: scheduleDate
      });
      
      await this.saveScheduledContent();
      ctx.reply(`✅ Message scheduled for ${scheduleDate.toString()}`);
      
    } catch (error) {
      console.error('Error in schedule command:', error);
      ctx.reply('❌ Failed to schedule message. Please try again.');
    }
  }
}

// Start the agent
const marketingAgent = new MarketingAgent();
marketingAgent.initialize().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping Marketing Agent...');
  await marketingAgent.telegramBot.stop();
  process.exit(0);
});
