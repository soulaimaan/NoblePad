Send a test Telegram message

This folder contains a simple script to send a test Telegram message using your bot.

Requirements:
- Node.js 18+ (preferred) or install `node-fetch` locally (`npm install node-fetch`).
- A Telegram Bot token (from BotFather) and the chat ID you want to send the message to.

PowerShell (Windows) example:

```powershell
$env:TELEGRAM_BOT_TOKEN = "123456:ABC-DEF"
$env:TELEGRAM_CHAT_ID = "987654321"
node .\scripts\send-telegram-test.js "A test message from NoblePad"
```

Bash example:

```bash
export TELEGRAM_BOT_TOKEN="123456:ABC-DEF"
export TELEGRAM_CHAT_ID="987654321"
node scripts/send-telegram-test.js "A test message from NoblePad"
```

Notes:
- If sending to a group, `TELEGRAM_CHAT_ID` must be the group's chat id. For private chats, it is the user's numeric id.
- Ensure the bot has been added to the group or has started a conversation with the recipient.
- Do not commit your bot token to source control. Use environment variables or a secrets manager.
