// test-connection.js
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

async function testConnection() {
  try {
    console.log('🔍 Testing Twitter API connection...');
    
    // Log environment variables (mask sensitive data)
    console.log('Environment variables:');
    console.log('- TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? '***' + process.env.TWITTER_API_KEY.slice(-4) : 'Not set');
    console.log('- TWITTER_API_SECRET:', process.env.TWITTER_API_SECRET ? '***' + process.env.TWITTER_API_SECRET.slice(-4) : 'Not set');
    console.log('- TWITTER_ACCESS_TOKEN:', process.env.TWITTER_ACCESS_TOKEN ? '***' + process.env.TWITTER_ACCESS_TOKEN.slice(-4) : 'Not set');
    console.log('- TWITTER_ACCESS_SECRET:', process.env.TWITTER_ACCESS_SECRET ? '***' + process.env.TWITTER_ACCESS_SECRET.slice(-4) : 'Not set');
    
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
      throw new Error('Missing Twitter API key or secret');
    }

    // Create client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test connection
    console.log('🔄 Testing API connection...');
    const user = await client.v2.me();
    
    console.log('✅ Successfully connected to Twitter API!');
    console.log('🤖 Authenticated as:', user.data.username);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.errors) console.error('Details:', error.errors);
    console.log('\n🔧 Common solutions:');
    console.log('1. Verify your API keys in the Twitter Developer Portal');
    console.log('2. Ensure OAuth 1.0a is enabled in your app settings');
    console.log('3. Check that your app has "Read and Write" permissions');
    console.log('4. Make sure there are no extra spaces in your .env file');
  }
}

testConnection();
