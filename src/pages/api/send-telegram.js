// Next.js API route to send a Telegram message using server-side env vars.
// POST body: { "message": "Your message here" }
// Requires env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const body = req.body || {};
  const message = body.message || body.text || req.query.message || 'Test message from NoblePad (server)';

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in server env' });
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    // Next.js (Node 18+) provides global fetch; fallback not needed on server
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    const json = await resp.json();
    if (!json.ok) {
      return res.status(502).json({ error: 'Telegram API error', details: json });
    }

    return res.status(200).json({ ok: true, result: json.result });
  } catch (err) {
    console.error('send-telegram error', err);
    return res.status(500).json({ error: 'Failed to send message', details: String(err) });
  }
}
