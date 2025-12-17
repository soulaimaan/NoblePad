# 🤖 Quick Collaboration Reference

## Three-Way Collaboration Model

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│     YOU     │    │  WINDSURF    │    │  COPILOT    │
│  (You)      │◄──►│ (Editor AI)  │◄──►│   (me)      │
│             │    │              │    │             │
│ • Architect │    │ • UI Designer│    │ • Scripts   │
│ • Reviewer  │    │ • Bulk Edits │    │ • Contracts │
│ • Tester    │    │ • Refactor   │    │ • Docs      │
│ • Git Mgr   │    │ • Components │    │ • Tooling   │
└─────────────┘    └──────────────┘    └─────────────┘
```

---

## Quick Decision Tree: Who Does What?

```
START: I need something done
  │
  ├─→ Multi-file refactoring?
  │   YES → WINDSURF (visual, bulk edits)
  │   NO  → Continue
  │
  ├─→ Frontend/UI work?
  │   YES → WINDSURF (components, styling)
  │   NO  → Continue
  │
  ├─→ Single file script/contract?
  │   YES → COPILOT (focused, quick)
  │   NO  → Continue
  │
  ├─→ Documentation/writing?
  │   YES → COPILOT (fast content)
  │   NO  → Continue
  │
  └─→ Uncertain?
      → Ask: "Windsurf for UI, Copilot for logic"
      → Default: Start with simple (Copilot), 
                 expand to complex (Windsurf)
```

---

## Task Routing Chart

| I Need to... | Route to | Command Pattern |
|---|---|---|
| Create smart contract | COPILOT | "Create [Name].sol that..." |
| Refactor 5+ files | WINDSURF | "Refactor these files..." |
| Build UI component | WINDSURF | "Build [Component]..." |
| Write deployment script | COPILOT | "Create deploy-[network].js..." |
| Fix TypeScript errors | WINDSURF | "Find and fix type errors..." |
| Update documentation | COPILOT | "Write docs for..." |
| Database schema | WINDSURF | "Design schema for..." |
| API endpoint | COPILOT | "Create /api/[route]..." |
| Dashboard redesign | WINDSURF | "Update dashboard with..." |
| Test suite | COPILOT | "Create tests for..." |

---

## Today's Priority

### 🎯 Immediate (Next 2 Days)

**1. Deploy to Sepolia (COPILOT)**
```
COPILOT: Create sepolia deployment automation
- Verify script ready
- All env vars checked
- Save deployment log
```

**2. Frontend Presale UI (WINDSURF)**
```
WINDSURF: Build presale creation & participation UIs
- Create presale form
- Create contribution form
- Add real-time status updates
```

**3. Backend Integration (WINDSURF)**
```
WINDSURF: Create API routes for:
- POST /api/presales/create
- POST /api/presales/[id]/participate
- GET /api/presales/[id]
```

**4. You: Test & Approve**
```
YOU: 
- Test deployment on Sepolia
- Test UI/API integration
- Approve for mainnet planning
```

---

## How to Request Work

### To COPILOT (Quick Tasks)
```
Short, focused:
"Create [X] that [does Y] with [requirements]"

Example:
"Create deploy-mumbai.js that deploys all contracts 
to Mumbai testnet and saves addresses to deployment-mumbai.json"
```

### To WINDSURF (Complex Tasks)
```
Detailed, with context:
"Build [X] that [does Y]. It should:
- Requirement 1
- Requirement 2
- Requirement 3
Show me before implementing."
```

### To YOU (Coordinator)
```
Sync point:
"OK, I'm ready for testing. When you have Sepolia ETH 
and .env file, we can deploy."
```

---

## Current State

### ✅ DONE (By Copilot)
- 6 smart contracts (compiled)
- Deployment scripts (ready)
- Documentation (complete)
- VS Code config (done)

### ⏳ NEXT (By Windsurf)
- Presale creation UI
- Presale participation UI
- API routes for contract interaction
- Dashboard presale cards

### ⏳ NEXT (By Copilot)
- Deploy to Sepolia
- Contract verification
- Integration tests
- Event listener setup

### 🎯 YOUR JOB
- Get Sepolia ETH
- Create .env file
- Test deployments
- Review code
- Approve merges
- Coordinate both agents

---

## Communication Shortcuts

### Start a Copilot Task
**In Terminal or Chat:**
```
"Copilot, create [what] that [does what]"
```

### Start a Windsurf Task
**In Windsurf Editor:**
```
"Windsurf, build [what] that [does what]. 
Show me a preview first."
```

### Coordinate Both
**You say:**
```
"Copilot: Deploy to Sepolia and create verification script.
Windsurf: Build presale UI components.
Me: I'll review both tomorrow."
```

---

## Success Criteria

✅ Both agents know their role  
✅ Clear task boundaries  
✅ You review before merge  
✅ Integration points tested  
✅ No conflicting edits  
✅ Fast, parallel development  
✅ Quality output  

---

## Emergency: Conflicting Edits

If both agents edit same file:
1. **YOU**: Decide which version is correct
2. **COPILOT**: Accept your decision
3. **WINDSURF**: Accept your decision
4. **Git**: You merge the correct version

**How to avoid:**
- Tell each agent what files they own
- Use separate files when possible
- Coordinate before starting

---

## One-Pager: The Model

```
┌──────────────────────────────────────────────┐
│  COPILOT        WINDSURF         YOU         │
│  ────────        ────────         ───        │
│  • Scripts       • UI              • Review   │
│  • Contracts     • Refactor        • Decide   │
│  • Tests         • Components      • Merge    │
│  • Docs          • Multi-file      • Deploy   │
│                                               │
│  SYNC: Smart files (contracts.ts, env)       │
│  SIGNAL: "Ready for testing"                 │
│  SUCCESS: All 3 working together             │
└──────────────────────────────────────────────┘
```

---

## Next Step

**Read**: `WINDSURF_COPILOT_COLLABORATION.md` (full guide)  
**Then**: Tell me what's next:
- "Deploy to Sepolia"
- "Build presale UI"
- "Create backend API"
- All of the above in parallel?

**I'm ready when you are!** ✅
