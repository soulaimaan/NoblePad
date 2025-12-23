// Basic Twitter Debug
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { TwitterApi } = require('twitter-api-v2');

async function debug() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const user = await client.v2.me();
    console.log('✅ Connection Successful!');
    console.log('Logged in as:', user.data.username);
    
    console.log('Trying to post a tweet...');
    await client.v2.tweet('Verification Test');
    console.log('✅ Post Successful!');
  } catch (e) {
    console.log('❌ Error Code:', e.code);
    console.log('❌ Error Message:', e.message);
    if (e.data) {
        console.log('❌ Error Data:', JSON.stringify(e.data));
    }
  }
}
debug();
