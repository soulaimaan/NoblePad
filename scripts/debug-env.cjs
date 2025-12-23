// Debug Env Script
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.log('TELEGRAM_BOT_TOKEN not found');
} else {
    console.log('Token Length:', token.length);
    console.log('Token Start:', token.substring(0, 5));
    console.log('Token End:', token.substring(token.length - 5));
    // Check for invisible characters
    console.log('Has spaces:', token.includes(' '));
    console.log('Internal quotes:', token.includes('"') || token.includes("'"));
}
