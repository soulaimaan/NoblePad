const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

async function testTwitterAPI() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test API connection by getting user's profile
    const user = await client.currentUserV2();
    console.log('✅ Twitter API connection successful!');
    console.log(`Logged in as: ${user.data.name} (@${user.data.username})`);
    
    // Test posting a tweet (commented out for safety)
    // Uncomment to test tweeting
    /*
    const tweet = await client.v2.tweet('Testing NoblePad Twitter integration!');
    console.log('Test tweet posted:', tweet.data.text);
    */
    
  } catch (error) {
    console.error('❌ Twitter API Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.rateLimitError) {
      console.error('Rate limit exceeded. Reset at:', new Date(error.rateLimit.reset * 1000));
    }
    process.exit(1);
  }
}

testTwitterAPI();
