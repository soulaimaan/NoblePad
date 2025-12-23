// Check Env Variables
const fs = require('fs');
const dotenv = require('dotenv');

function getVars(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return dotenv.parse(content);
}

const env = getVars('.env');
const local = getVars('.env.local');

const keys = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET'
];

console.log('--- Comparison ---');
keys.forEach(k => {
    const v1 = env[k] || 'MISSING';
    const v2 = local[k] || 'MISSING';
    
    if (v1 === v2) {
        console.log(`${k}: MATCH (Length: ${v1.length})`);
    } else {
        console.log(`${k}: MISMATCH!`);
        console.log(`  .env: length ${v1.length}`);
        console.log(`  .env.local: length ${v2.length}`);
    }
});
