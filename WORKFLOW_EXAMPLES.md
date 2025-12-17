# 🔄 Practical Workflow Examples

## Example 1: Build Complete Presale Feature (In Parallel)

### Timeline: 2 Days

```
DAY 1 MORNING:
├─ YOU: Define requirements
├─ YOU → COPILOT: "Create deploy-sepolia.js"
├─ YOU → WINDSURF: "Start building presale UI components"
└─ YOU: Create .env file, get Sepolia ETH

DAY 1 AFTERNOON:
├─ COPILOT: Finish deploy script
├─ WINDSURF: Show UI component previews
├─ YOU: Review both, request changes if needed
└─ COPILOT: Starts creating API integration tests

DAY 1 EVENING:
├─ WINDSURF: Complete presale creation form
├─ WINDSURF: Complete presale list page
└─ YOU: Run `npm run deploy:sepolia`

DAY 2 MORNING:
├─ YOU: Test deployment on Sepolia
├─ COPILOT: Create event listener for contract interactions
├─ WINDSURF: Connect frontend to API routes
└─ YOU: Verify contracts deployed correctly

DAY 2 AFTERNOON:
├─ WINDSURF: Test frontend ↔ API integration
├─ YOU: Test full end-to-end flow
├─ COPILOT: Generate deployment report
└─ YOU: Approve for mainnet planning

DAY 2 EVENING:
└─ YOU: Merge all PRs to main
```

**Result**: Feature complete in 2 days with parallel work! ⚡

---

## Example 2: Smart Contract + Backend + Frontend

### Scenario: Implement Vesting Feature

```
REQUEST:
You: "We need full vesting functionality:
- COPILOT: Create Vesting.sol contract
- WINDSURF: Create /api/vesting routes + frontend
- ME: Test deployment to Sepolia"

┌─────────────────────────────────────────────┐
│ COPILOT (Contract)                          │
├─────────────────────────────────────────────┤
│ 1. Create Vesting.sol with:                 │
│    - createVesting(recipient, amount, ...)  │
│    - releasableAmount(vestingId)            │
│    - release(vestingId)                     │
│ 2. Deploy to local Hardhat                  │
│ 3. Export ABI to src/abis/                  │
│ 4. Create test suite                        │
└─────────────────────────────────────────────┘
         ↓ PROVIDE ABI
         
┌─────────────────────────────────────────────┐
│ WINDSURF (Backend + Frontend)               │
├─────────────────────────────────────────────┤
│ 1. Create API routes:                       │
│    POST /api/vesting/create                 │
│    GET /api/vesting/[id]                    │
│    POST /api/vesting/[id]/release           │
│ 2. Create frontend components:              │
│    - VestingForm                            │
│    - VestingSchedule display                │
│    - ReleaseButton                          │
│ 3. Connect frontend to API                  │
│ 4. Add real-time updates                    │
└─────────────────────────────────────────────┘
         ↓ TEST INTEGRATION
         
┌─────────────────────────────────────────────┐
│ YOU (Integration Testing)                   │
├─────────────────────────────────────────────┤
│ 1. Deploy Vesting.sol to Sepolia            │
│ 2. Create test vesting via API              │
│ 3. Verify database storage                  │
│ 4. Test frontend showing vesting            │
│ 5. Test release functionality               │
│ 6. Check gas costs                          │
│ 7. APPROVE & MERGE                          │
└─────────────────────────────────────────────┘

RESULT: Full feature integrated in 3 days ✅
```

---

## Example 3: Handle a Bug Report

### Scenario: "Balance not showing correctly on presale cards"

```
YOU: "Bug: Presale card showing incorrect balance.
Expected: 5.5 ETH, Showing: 5.50000000 ETH (too many decimals)"

DECISION TREE:
├─ Single file? → Yes, presale-card.tsx
├─ UI change? → Yes, formatting
├─ Route to WINDSURF? → Yes
│
└─ WINDSURF:
   1. Find balance display in presale-card.tsx
   2. Check formatEther() function
   3. Update to: formatEther(balance).slice(0, 5) + " ETH"
   4. Show diff to you
   5. YOU approve
   6. Commit: "fix: format presale balance to 2 decimals"
```

**Time: 15 minutes** ⚡

---

## Example 4: Add New Test Network

### Scenario: "Support Mumbai testnet"

```
YOU: "Add Mumbai network support"

BREAKDOWN:
1. Smart contract side (COPILOT)
   - Create deploy-mumbai.js
   - Add Mumbai RPC to hardhat config
   - Test deploy to Mumbai
   
2. Frontend side (WINDSURF)
   - Add Mumbai to network selector
   - Update contract addresses for Mumbai
   - Test UI with Mumbai
   
3. You coordinate

COPILOT:
$ Create scripts/deploy-mumbai.js
$ Test with `npm run deploy:mumbai`
$ Export addresses

WINDSURF:
$ Update src/lib/networks.ts
$ Update network selector component
$ Update contract addresses

YOU:
$ Review both changes
$ Test network switching in UI
$ Deploy addresses to contracts.ts
$ Approve & merge

RESULT: Multi-chain support added ✅
```

---

## Example 5: Refactor Authentication System

### Scenario: "Migrate from basic auth to OAuth"

```
YOU: "Refactor authentication to use OAuth2"

This is COMPLEX → Assign to WINDSURF (multi-file refactoring)

WINDSURF handles:
├─ Update auth middleware
├─ Update login/signup pages
├─ Update user model in database
├─ Update session handling
├─ Update protected routes
└─ Show you the complete diff before committing

COPILOT handles (in parallel):
├─ Create OAuth configuration script
├─ Create environment variable template
└─ Create migration guide doc

YOU do:
├─ Review proposed changes
├─ Test OAuth flow
├─ Test API authentication
└─ Approve merge

RESULT: Auth refactor complete with minimal conflicts ✅
```

---

## Example 6: Performance Optimization

### Scenario: "Dashboard is slow, optimize queries"

```
YOU: "Dashboard loads in 3s, should be <1s"

INVESTIGATION:
├─ COPILOT: Create performance profiling script
├─ YOU: Run script, find bottleneck (N+1 queries)
└─ WINDSURF: Fix database queries in API routes

COPILOT:
- Create scripts/profile-dashboard.js
- Measure API response times
- Export report: "5 endpoints taking >500ms each"

WINDSURF:
- Add database indexes
- Fix N+1 queries in /api/dashboard
- Implement caching
- Test performance

YOU:
- Review changes
- Run profiling again (now <500ms)
- Approve merge

RESULT: Dashboard now loads in 700ms ✅
```

---

## Example 7: Release to Mainnet

### Timeline: 1 Day (After Sepolia testing)

```
MORNING: Prepare
├─ COPILOT: Create deploy-mainnet.js
├─ COPILOT: Create pre-flight checks script
├─ YOU: Review, double-check addresses
└─ YOU: Get security sign-off

MID-DAY: Execute
├─ YOU: Run deploy script
├─ COPILOT: Monitor deployment, save logs
├─ WINDSURF: Stand by for UI updates
└─ YOU: Verify on Etherscan

AFTERNOON: Activate
├─ YOU: Update contract addresses in UI
├─ WINDSURF: Test UI with mainnet contracts
├─ YOU: Announcement/launch
└─ COPILOT: Monitor for errors

RESULT: Mainnet live 🚀
```

---

## Example 8: Code Review Process

### When You Review Code

```
FROM COPILOT:
├─ Smart Contract
│  ├─ Check: Security vulnerabilities?
│  ├─ Check: Gas optimized?
│  └─ Check: Tests included?
│
└─ Script/Documentation
   ├─ Check: Works as described?
   └─ Check: Error handling?

FROM WINDSURF:
├─ Components
│  ├─ Check: UI matches design?
│  ├─ Check: Responsive?
│  └─ Check: Accessible (WCAG)?
│
└─ API Routes
   ├─ Check: Input validation?
   ├─ Check: Error handling?
   └─ Check: Database queries efficient?

DECISION:
├─ Approve → Merge to main
├─ Request changes → Feedback to agent
└─ Hold for discussion → Schedule call
```

---

## Real-Time Communication Template

### For Complex Coordination

**YOU (via chat):**
```
"Team status check:

COPILOT: How's the deployment script?
WINDSURF: Can you show me presale UI draft?
ME: I'll get Sepolia ETH today and test tomorrow.

Timeline: Ship to testnet by Friday?
```

**COPILOT:**
```
"Deploy script complete and tested. 
Ready for Sepolia whenever you have keys.
Estimated gas: 775K, cost: ~$0.58"
```

**WINDSURF:**
```
"Presale components done. 
[Shows screenshot]
Ready for API integration. When do you have 
contract addresses?"
```

**YOU:**
```
"Perfect! Deploy tomorrow morning, 
Windsurf integrates, I test by EOD.
Ready for mainnet Friday."
```

---

## Key Success Patterns

### ✅ DO THIS

1. **Clear Boundaries**
   ```
   "COPILOT: You own the smart contracts
   WINDSURF: You own the UI
   ME: I'll integrate them"
   ```

2. **Share Context**
   ```
   "Here's the design:
   [link to design doc]
   Here's the API spec:
   [link to API spec]"
   ```

3. **Preview Before Commit**
   ```
   "Windsurf, show me the component before you save"
   "Copilot, show me the contract before you deploy"
   ```

4. **Test Integration**
   ```
   "Now let's test them together"
   "Does the UI connect to the API correctly?"
   "Does the API call the contract correctly?"
   ```

5. **Document Changes**
   ```
   git commit -m "feature: add presale vesting UI"
   git commit -m "contract: implement vesting logic"
   git commit -m "api: add vesting endpoints"
   ```

### ❌ DON'T DO THIS

1. ❌ Both agents edit same file simultaneously
2. ❌ Unclear task boundaries
3. ❌ No previews before major changes
4. ❌ Skip integration testing
5. ❌ Conflicting decisions without resolution
6. ❌ Merge without review
7. ❌ Poor commit messages

---

## Troubleshooting

### Problem: Different code styles between Copilot and Windsurf

**Solution:**
```
1. YOU define code style guide
2. Both agents follow it
3. Use prettier/eslint enforcement
4. Pre-commit hooks validate
```

### Problem: Duplicate work / Conflicting changes

**Solution:**
```
1. Define clear file ownership
2. Communicate before starting
3. Check Git for in-progress work
4. YOU mediate conflicts
```

### Problem: API not matching UI expectations

**Solution:**
```
1. Create API spec document first
2. WINDSURF (UI) and COPILOT (API) both follow spec
3. Test integration early
4. YOU verify spec compliance
```

### Problem: Slow integration

**Solution:**
```
1. Work in parallel on separate concerns
2. Define interfaces upfront
3. Mock APIs while building
4. Test integration early and often
```

---

## Next Steps

1. **Read** `WINDSURF_COPILOT_COLLABORATION.md` (full guide)
2. **Use** `COLLABORATION_QUICKREF.md` (quick lookup)
3. **Follow** examples above for your tasks
4. **Communicate** clearly what each should do
5. **Review** before merging
6. **Deploy** with confidence

---

**Ready to ship NoblePad with all three of us working in sync? Let's go!** 🚀
