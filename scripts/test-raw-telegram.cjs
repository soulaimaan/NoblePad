// Raw Telegram Test
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
    console.error('Missing configuration');
    process.exit(1);
}

const text = encodeURIComponent('🚀 NoblePad Raw Test: If you see this, the token is 100% correct.');
const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;

console.log('Testing raw URL (without showing token)...');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
