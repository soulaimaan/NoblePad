# 🛡️ NoblePad Autonomous Marketing System

> **"Patterns matter more than promises."**

This system implements the **NoblePad Security Voice** persona through a multi-agent architectural approach, designed to protect the brand while creating educational content.

## 🤖 System Architecture

The system is composed of 5 specialist agents working in concert:

### 1. Content Agent 📝

- **Role**: Drafts educational threads and tweets.
- **Focus**: Rug mechanics, wallet patterns, risk analysis.
- **Voice**: Analytical, neutral, skeptical.
- **Templates**: Included in `agents/noblepad-marketing-system.cjs`.

### 2. Humanizer Agent 🧠

- **Role**: Refines raw drafts to avoid AI detection.
- **Technique**: Adds variations, sentence structure changes, and nuance.
- **Goal**: "Imperfection is human."

### 3. Compliance Guard 👮

- **Role**: The final gatekeeper.
- **Authority**: Can BLOCK any action.
- **Checks**:
  - **Rate Limits**: Min 90 minutes between actions.
  - **Vocabulary**: Blocks hype words ("moon", "safe", "100x").
  - **Frequency**: Max 1 thread/day, 2 tweets/day.

### 4. Crisis Monitor 🚨

- **Role**: System override switch.
- **Trigger**: Market crash, exploit event.
- **Effect**: Halts all automated posting immediately.

### 5. Reply Agent 💬

- **Role**: Contextual replies (Stubbed in current version).
- **Rule**: Never redirects traffic, never sells.

---

## 🚀 How to Run

The system is integrated into the NoblePad repo.

```bash
npm run marketing
```

**Output:**

- If API Keys are present in `.env`: The system **executes** (posts to Twitter/Telegram).
- If API Keys are missing: The system runs in **SIMULATION MODE**, logging proposed drafts to the console for manual review.

## ⚙️ Configuration

Located in `agents/noblepad-marketing-system.cjs`:

```javascript
const IDENTITY = {
  blacklist: ['launch now', 'moon', '100x'...],
  dialects: ["Hard to prove intent...", "Patterns matter..."]
};

const HARD_LIMITS = {
  minIntervalMinutes: 90,
  maxDailyThreads: 1,
  ...
};
```

## ⚠️ Fail-Safe Principle

> **"If uncertain -> generate draft for manual review."**

By default, the system is configured to **propose** actions (via Telegram Admin message or Console Log) rather than auto-posting, unless you explicitly uncomment the `postToTwitter` call in `executeAction()`.

---

**Status**: ✅ Active & Compliant
