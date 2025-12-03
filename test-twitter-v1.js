// test-twitter-v1.js
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

async function testTwitterAPI() {
  try {
    console.log('🔍 Testing Twitter API v1.1...');
    
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test with v1.1 API
    const user = await client.v1.verifyCredentials();
    console.log('✅ Twitter API v1.1 credentials are valid!');
    console.log('🤖 Authenticated as:', user.screen_name);
    console.log('👤 User ID:', user.id_str);
    
    // Test posting a tweet
    console.log('🐦 Testing tweet posting...');
    const tweet = await client.v1.tweet('🚀 Testing NoblePad Marketing Bot with v1.1 API - This is a test tweet!');
    console.log('✅ Test tweet posted successfully!');
    console.log('🔗 Tweet URL:', `https://twitter.com/${user.screen_name}/status/${tweet.id_str}`);
    
  } catch (error) {
    console.error('❌ Error testing Twitter API v1.1:');
    console.error('Message:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.errors) {
      console.error('Error details:', error.errors);
    }
  }
}

testTwitterAPI();
