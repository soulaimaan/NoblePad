// Twitter Verification
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { TwitterApi } = require('twitter-api-v2');

async function verify() {
  console.log('--- Twitter Credential Verification ---');
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    // account/verify_credentials is v1.1
    const user = await client.v1.verifyCredentials();
    console.log('✅ Success! Account Verified.');
    console.log('User Name:', user.name);
    console.log('Screen Name:', user.screen_name);
  } catch (e) {
    console.log('❌ Verification Failed');
    console.log('Status Code:', e.code);
    console.log('Message:', e.message);
    if (e.data) console.log('Data:', JSON.stringify(e.data));
  }
}

verify();
