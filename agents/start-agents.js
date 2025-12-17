console.log('🚀 Starting Anti-Rug Launchpad Development...');
console.log('======================================');

// Import the coordinator
const { startDevelopment } = require('./launchpad-coordinator');

// Start the development process
startDevelopment();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development environment...');
  process.exit(0);
});
