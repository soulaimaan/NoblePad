// test-twitter.js
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

async function testTwitterAPI() {
  try {
    console.log('🔍 Testing Twitter API credentials...');
    
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test authentication by getting the current user
    const user = await client.v2.me();
    console.log('✅ Twitter API credentials are valid!');
    console.log('🤖 Authenticated as:', user.data.username);
    console.log('👤 User ID:', user.data.id);
    
    // Test posting a tweet
    console.log('🐦 Testing tweet posting...');
    const tweet = await client.v2.tweet('🚀 Testing NoblePad Marketing Bot - This is a test tweet!');
    console.log('✅ Test tweet posted successfully!');
    console.log('🔗 Tweet URL:', `https://twitter.com/${user.data.username}/status/${tweet.data.id}`);
    
  } catch (error) {
    console.error('❌ Error testing Twitter API:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Error details:', error.errors || 'No additional error details');
    }
  }
}

testTwitterAPI();
