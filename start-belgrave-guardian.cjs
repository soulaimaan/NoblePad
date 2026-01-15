/**
 * Entry Point for Belgrave Guardian
 */
require('dotenv').config();
const BelgraveGuardian = require('./agents/belgrave-guardian/BelgraveGuardian.cjs');

const system = new BelgraveGuardian();
system.initialize().catch(err => {
    console.error("FATAL SYSTEM ERROR:", err);
    process.exit(1);
});

// Handle kill signals
process.on('SIGINT', () => {
    console.log('\n🛑 Belgrave Guardian Shutting Down...');
    process.exit(0);
});
