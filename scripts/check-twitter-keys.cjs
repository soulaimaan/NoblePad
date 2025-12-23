// Twitter Key Diagnostic
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

function check(name) {
    const val = process.env[name];
    if (!val) {
        console.log(`❌ ${name}: NOT FOUND`);
    } else {
        console.log(`✅ ${name}:`);
        console.log(`   Length: ${val.length}`);
        console.log(`   Starts with: ${val.substring(0, 5)}...`);
        console.log(`   Ends with: ...${val.substring(val.length - 5)}`);
        console.log(`   Check: No spaces: ${!val.includes(' ')}, No quotes: ${!val.includes('"') && !val.includes("'")}`);
    }
}

console.log('--- Twitter Key Diagnostic ---');
check('TWITTER_API_KEY');
check('TWITTER_API_SECRET');
check('TWITTER_ACCESS_TOKEN');
check('TWITTER_ACCESS_SECRET');
