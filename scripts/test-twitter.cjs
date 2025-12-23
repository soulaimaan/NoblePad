// Test Twitter Script
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { TwitterApi } = require('twitter-api-v2');

async function sendTest() {
  const config = {
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  };

  if (!config.appKey || !config.appSecret || !config.accessToken || !config.accessSecret) {
    console.error('❌ Missing one or more Twitter API keys in .env');
    console.log('Required keys: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET');
    process.exit(1);
  }

  const client = new TwitterApi(config);
  
  try {
    console.log('📤 Sending test tweet...');
    // We use v2 for tweeting
    const tweet = await client.v2.tweet('🚀 NoblePad Twitter Test: Automating the future of decentralized launchpads. #NoblePad #DeFi #Web3');
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet text:', tweet.data.text);
    console.log('Tweet ID:', tweet.data.id);
  } catch (error) {
    console.error('❌ Error posting tweet:', JSON.stringify(error, null, 2));
    if (error.code === 401) {
      console.error('\n💡 Tip: Your API keys might be invalid or permissions are not set to "Read and Write".');
    } else if (error.code === 403) {
      console.error('\n💡 Tip: This usually means your app does not have "Write" permissions on Twitter Developer Portal.');
    }
  }
}

sendTest();
