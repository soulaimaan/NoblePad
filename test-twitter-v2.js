const { TwitterApi } = require('twitter-api-v2');

// Direct credentials from .env file
const credentials = {
  appKey: 'DNWbOIK57uxxgY8BbMlfxm5c6',
  appSecret: 'QyZNRNHj4pqDqplUg1h1owesLJMSKZgfLO6IfXx5UJBwoGvyd5',
  accessToken: '1968429595910135808-s0TJTft6Q4Ymw1g48f1dGmGl5HgYvk',
  accessSecret: '1MQrDaH7a01ZgXUMP48louL85lHW4QYnPPMHTmFCnkNam'
};

async function testTwitterV2() {
  try {
    console.log('🔍 Starting Twitter API v2 Test with OAuth 1.0a...');
    console.log('----------------------------------------------');
    
    // 1. Initialize client with OAuth 1.0a credentials
    console.log('\n1. Initializing Twitter client with OAuth 1.0a...');
    const client = new TwitterApi(credentials);

    // 2. Test getting user info (v2 API)
    console.log('\n2. Testing authentication by fetching user info...');
    const user = await client.v2.me({
      'user.fields': ['id', 'name', 'username', 'created_at']
    });
    
    console.log('✅ Authentication successful!');
    console.log('   User:', user.data.username);
    console.log('   Name:', user.data.name);
    console.log('   ID:', user.data.id);
    
    // 3. Test a simple tweet (v1.1 API)
    console.log('\n3. Testing tweet retrieval...');
    const timeline = await client.v1.userTimeline(user.data.id, { count: 1 });
    console.log('✅ Latest tweet:', timeline.tweets[0]?.text?.substring(0, 50) + '...' || 'No tweets found');
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('--------------------------------');
    
    // Detailed error information
    console.error('Error message:', error.message);
    console.error('Error code:', error.code || 'N/A');
    
    // Rate limit information
    if (error.rateLimit) {
      console.error('\n🔒 Rate limit info:');
      console.error('   Limit:', error.rateLimit.limit);
      console.error('   Remaining:', error.rateLimit.remaining);
      console.error('   Reset at:', new Date(error.rateLimit.reset * 1000).toLocaleString());
    }
    
    // Twitter API errors
    if (error.errors) {
      console.error('\n🔍 Twitter API Errors:');
      error.errors.forEach((err, i) => {
        console.error(`   ${i + 1}. Code ${err.code}: ${err.message}`);
      });
    }
    
    // Environment info
    console.log('\n🔍 Environment Info:');
    console.log('- Node.js version:', process.version);
    console.log('- twitter-api-v2 version: 1.28.0');
    console.log('- OS:', process.platform, process.arch);
    
    // Debug info
    console.log('\n🔧 Debug Info:');
    console.log('- API Key present:', !!process.env.TWITTER_API_KEY);
    console.log('- API Secret present:', !!process.env.TWITTER_API_SECRET);
    console.log('- Access Token present:', !!process.env.TWITTER_ACCESS_TOKEN);
    console.log('- Access Secret present:', !!process.env.TWITTER_ACCESS_SECRET);
  }
}

// Run the test
testTwitterV2();
