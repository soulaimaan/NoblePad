// start-marketing.js
require('dotenv').config();
const MarketingAgent = require('./agents/marketing-agent');

// Start the agent
const marketingAgent = new MarketingAgent();
marketingAgent.initialize().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down marketing agent...');
  process.exit();
});
