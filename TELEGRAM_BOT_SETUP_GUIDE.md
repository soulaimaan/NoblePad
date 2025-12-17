# 🤖 Step-by-Step: Create Your Lord Belgrave NoblePad Bot

## 📱 **STEP 1: Open Telegram & Find BotFather**

1. **Open Telegram** on your phone or computer
2. **Search for**: `@BotFather`
3. **Click on the official BotFather** (blue checkmark ✅)
4. **Click "START"** to begin conversation

---

## 🤖 **STEP 2: Create New Bot**

### **Message to send**: `/newbot`

**BotFather will respond**: 
```
Alright, a new bot. How are we going to call it? 
Please choose a name for your bot.
```

### **Your response**: `Lord Belgrave NoblePad Bot`

**BotFather will respond**:
```
Good. Now let's choose a username for your bot. 
It must end in `bot`. Like this, for example: TetrisBot or tetris_bot.
```

### **Your response**: `belgrave_noblepad_bot`
*(or try: `lordbelgrave_marketing_bot` if that's taken)*

---

## 🎉 **STEP 3: Get Your Bot Token**

**BotFather will respond with something like**:
```
Done! Congratulations on your new bot. You will find it at 
t.me/belgrave_noblepad_bot. You can now add a description, 
about section and profile picture for your bot, see /help for a list of commands.

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456

Keep your token secure and store it safely, it can be used by 
anyone to control your bot.
```

### **🔑 COPY THIS TOKEN!** 
**Write it down or save it safely**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456`

---

## 👑 **STEP 4: Add Bot to Your @belgravelord Channel**

1. **Go to your Telegram channel**: @belgravelord
2. **Click the channel name** at the top
3. **Click "Edit"** (pencil icon)
4. **Click "Administrators"**
5. **Click "Add Administrator"**
6. **Search for your bot**: `@belgrave_noblepad_bot`
7. **Select your bot** from the results
8. **Give permissions**:
   - ✅ **Post Messages**
   - ✅ **Edit Messages** 
   - ✅ **Delete Messages**
   - ❌ **Add Admins** (leave unchecked)
9. **Click "Done"**

---

## 🔧 **STEP 5: Get Channel ID**

### **Method 1: Quick Way**
1. **Forward any message** from your @belgravelord channel to `@userinfobot`
2. **It will show you the channel ID**: `-100123456789`

### **Method 2: Manual Way**
1. **Add your bot to the channel** (already done above)
2. **Send a test message** in the channel
3. **Visit**: `https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates`
4. **Replace {YOUR_TOKEN}** with your actual token
5. **Look for the channel ID** in the response

---

## ⚙️ **STEP 6: Configure Bot in Your System**

### **Create environment file**:
```bash
# In your noblepad folder, create .env file:
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456
TELEGRAM_CHANNEL_ID=@belgravelord
```

### **Or set environment variables**:
**Windows:**
```cmd
set TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456
set TELEGRAM_CHANNEL_ID=@belgravelord
```

**Mac/Linux:**
```bash
export TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456
export TELEGRAM_CHANNEL_ID=@belgravelord
```

---

## ✅ **STEP 7: Test Your Bot**

### **Send test message manually**:
Visit this URL in your browser (replace with YOUR token):
```
https://api.telegram.org/bot{YOUR_TOKEN}/sendMessage?chat_id=@belgravelord&text=🤖 Lord Belgrave NoblePad Bot is now active! 🚀
```

**Example:**
```
https://api.telegram.org/bot1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456/sendMessage?chat_id=@belgravelord&text=🤖 Bot Test Successful! 🚀
```

**If this works, your bot is ready!** ✅

---

## 🚀 **STEP 8: Start Automation**

Once you have your token, run:
```bash
cd noblepad
node agents/social-media-bot-agent.js
```

---

## ⚠️ **Common Issues & Solutions**

### **"Username already taken"**
**Try these alternatives**:
- `lordbelgrave_marketing_bot`
- `belgrave_launchpad_bot` 
- `noblepad_belgrave_bot`
- `belgrave_updates_bot`

### **"Bot can't post to channel"**
**Check**:
- ✅ Bot is added as administrator
- ✅ Bot has "Post Messages" permission
- ✅ Channel ID is correct (@belgravelord)

### **"Invalid token"**
**Verify**:
- ✅ Token copied completely
- ✅ No extra spaces
- ✅ Format: `numbers:letters`

---

## 🎯 **SUCCESS CHECKLIST**

- [ ] ✅ Bot created with @BotFather
- [ ] ✅ Bot token saved securely  
- [ ] ✅ Bot added as admin to @belgravelord
- [ ] ✅ Post Messages permission granted
- [ ] ✅ Test message posted successfully
- [ ] ✅ Environment variables configured
- [ ] ✅ Ready for automation!

---

## 📱 **Sample First Post**

Once your bot is ready, it will post:

```
🏰 Lord Belgrave Community Update! 

🚀 Exciting news: We're building NoblePad - the most advanced launchpad in DeFi!

🤖 Our AI development team is working 24/7:
🎨 Frontend: 67% complete
⚙️ Backend: 34% complete  
📜 Smart Contracts: 45% complete
🛡️ Security: 52% complete

👑 Lord Belgrave holders get VIP early access and exclusive benefits!

#LordBelgrave #NoblePad #AILaunchpad #BuildingTheFuture
```

---

**🎉 Your automated marketing starts as soon as the bot is configured! Let me know when you have the token and I'll help you start posting immediately!**