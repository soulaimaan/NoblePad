// start-marketing.js
require('dotenv').config();
const NoblePadMarketingSystem = require('./agents/noblepad-marketing-system.cjs');

// Start the multi-agent system
const marketingSystem = new NoblePadMarketingSystem();
marketingSystem.initialize().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down NoblePad Security System...');
  process.exit();
});
