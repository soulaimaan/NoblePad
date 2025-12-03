// Send a test Telegram message using BOT token and CHAT ID from environment variables
// Usage: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID, then run:
//   node scripts/send-telegram-test.js "Your message here"

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID || process.env.CHAT_ID;
const text = process.argv.slice(2).join(' ') || 'Test message from NoblePad';

if (!token || !chatId) {
  console.error('Missing env vars. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/sendMessage`;

async function send() {
  // Use global fetch if available (Node 18+), otherwise try dynamic import of node-fetch
  let fetchFn = global.fetch;
  if (!fetchFn) {
    try {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default;
    } catch (err) {
      console.error('Fetch is not available and node-fetch could not be imported. Install node-fetch or use Node 18+.');
      console.error(err);
      process.exit(1);
    }
  }

  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  const json = await res.json();
  if (!json.ok) {
    console.error('Telegram API responded with error:', json);
    process.exit(1);
  }

  console.log('Message sent successfully:', json.result && json.result.message_id ? `message_id=${json.result.message_id}` : json);
}

send().catch(err => { console.error('Failed to send message:', err); process.exit(1); });
