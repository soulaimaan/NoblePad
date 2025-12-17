# 📋 Task Assignment Template

## How to Use This

When you have work to assign, copy the template below and fill it out. This ensures both agents understand what's needed.

---

## Template: Feature Task

```
═══════════════════════════════════════════════════════════════
FEATURE: [Feature Name]
PRIORITY: [Critical/High/Medium/Low]
DEADLINE: [Date]
═══════════════════════════════════════════════════════════════

DESCRIPTION:
[What is being built and why?]
[Who will use it?]
[Success criteria?]

───────────────────────────────────────────────────────────────
TASK BREAKDOWN:
───────────────────────────────────────────────────────────────

TASK 1 - [Smart Contract/Backend/Frontend]
Assigned to: [COPILOT/WINDSURF]
Description: [What to build]
Requirements:
  - [Requirement 1]
  - [Requirement 2]
  - [Requirement 3]
Files affected:
  - [file1.sol]
  - [file2.ts]
Dependencies: [If depends on other tasks]
Preview needed: [Yes/No]
Estimated time: [Hours]

TASK 2 - [...]
Assigned to: [COPILOT/WINDSURF]
...

───────────────────────────────────────────────────────────────
INTEGRATION POINTS:
───────────────────────────────────────────────────────────────

Smart Contract ↔ API:
  [Contract exposes X function]
  [API calls it with Y parameters]
  [Returns Z result]

API ↔ Frontend:
  [API returns X data structure]
  [UI displays it as Y]
  [User can interact with Z]

───────────────────────────────────────────────────────────────
TESTING:
───────────────────────────────────────────────────────────────

Unit Tests: [Required/Optional]
Integration Tests: [Required/Optional]
E2E Tests: [Required/Optional]
Manual Testing: [Required/Optional]
Test cases:
  - [Test case 1]
  - [Test case 2]

───────────────────────────────────────────────────────────────
DELIVERABLES:
───────────────────────────────────────────────────────────────

[ ] Code complete
[ ] Tests passing
[ ] Integrations working
[ ] Documentation updated
[ ] Code reviewed (by you)
[ ] Ready to merge

═══════════════════════════════════════════════════════════════
```

---

## Example: Presale Vesting Feature

```
═══════════════════════════════════════════════════════════════
FEATURE: Presale Vesting System
PRIORITY: High
DEADLINE: December 10, 2025
═══════════════════════════════════════════════════════════════

DESCRIPTION:
Implement token vesting for presale team/advisors.
After presale ends, tokens vest linearly over time (e.g., 365 days)
with optional cliff period (e.g., 30 days before vesting starts).
Used by: Project creators, team members, advisors.
Success: Can create vesting schedules, track vesting progress, 
claim tokens when ready.

───────────────────────────────────────────────────────────────
TASK BREAKDOWN:
───────────────────────────────────────────────────────────────

TASK 1 - Smart Contract
Assigned to: COPILOT
Description: Implement Vesting.sol contract
Requirements:
  - Function: createVesting(recipient, amount, startTime, cliff, duration)
  - Function: releasableAmount(vestingId) → returns claimable tokens
  - Function: release(vestingId) → transfers claimable tokens
  - Events: VestingCreated, TokensReleased
  - Support: Multiple recipients, multiple schedules
  - Security: Ownable, no double-claims
Files affected:
  - contracts/contracts/Vesting.sol (NEW)
  - contracts/test/Vesting.test.js (NEW)
Dependencies: None
Preview needed: Yes (show contract logic)
Estimated time: 4 hours

TASK 2 - API Routes
Assigned to: WINDSURF
Description: Create backend endpoints for vesting
Requirements:
  - POST /api/vesting/create
    Input: {presaleId, recipients[], amounts[], cliff, duration}
    Output: {vestingId, txHash}
  - GET /api/vesting/[vestingId]
    Output: {amount, claimed, releasable, nextReleaseTime}
  - POST /api/vesting/[vestingId]/release
    Input: {}
    Output: {txHash, amountReleased}
  - Validate inputs, error handling, database storage
Files affected:
  - src/pages/api/vesting/create.ts (NEW)
  - src/pages/api/vesting/[id].ts (NEW)
  - src/lib/vestingService.ts (NEW)
  - Database schema (add vesting table)
Dependencies: TASK 1 (need contract ABI)
Preview needed: No
Estimated time: 6 hours

TASK 3 - Frontend Components
Assigned to: WINDSURF
Description: Build vesting UI components
Requirements:
  - VestingForm: Input recipients, amounts, cliff, duration
  - VestingScheduleDisplay: Show vesting progress (visual timeline)
  - VestingCard: Show vesting summary on dashboard
  - ReleaseButton: Claim tokens when available
  - Responsive design, dark theme (Gold/Black/Purple)
Files affected:
  - src/app/components/VestingForm.tsx (NEW)
  - src/app/components/VestingSchedule.tsx (NEW)
  - src/app/components/VestingCard.tsx (NEW)
  - src/app/dashboard/page.tsx (UPDATE)
Dependencies: TASK 2 (need API endpoints)
Preview needed: Yes (show component designs before implementing)
Estimated time: 8 hours

───────────────────────────────────────────────────────────────
INTEGRATION POINTS:
───────────────────────────────────────────────────────────────

Smart Contract ↔ API:
  [Contract] createVesting(recipient, amount, startTime, cliff, duration)
  [API] POST /api/vesting/create
    - Calls contract.createVesting()
    - Stores event receipt in database
    - Returns vestingId

  [Contract] releasableAmount(vestingId)
  [API] GET /api/vesting/[vestingId]
    - Calls contract.releasableAmount()
    - Returns to frontend
    - Shows in UI

  [Contract] release(vestingId)
  [API] POST /api/vesting/[vestingId]/release
    - Calls contract.release()
    - Updates database
    - Triggers event listener

API ↔ Frontend:
  [API] POST /api/vesting/create
  [Frontend] VestingForm submits form data
    - Sends recipients, amounts, schedule params
    - Shows loading/success/error
    - Navigates to vesting detail

  [API] GET /api/vesting/[vestingId]
  [Frontend] VestingScheduleDisplay fetches and displays
    - Shows timeline with cliff + vesting periods
    - Shows claimed vs releasable vs locked
    - Real-time updates

  [API] POST /api/vesting/[vestingId]/release
  [Frontend] ReleaseButton triggers claim
    - Shows confirmation
    - Displays transaction status
    - Updates balance after confirmation

───────────────────────────────────────────────────────────────
TESTING:
───────────────────────────────────────────────────────────────

Unit Tests: Required
  - Vesting contract: createVesting, releasableAmount, release
  - API routes: input validation, error handling
  - Frontend components: render correctly, handle states

Integration Tests: Required
  - Create vesting via API → verify stored in DB
  - Get vesting → compare on-chain vs DB
  - Release vesting → verify tokens transferred

E2E Tests: Required
  - User creates vesting schedule
  - User sees vesting progress
  - User claims tokens after cliff
  - Verify tokens received

Manual Testing: Required
  - Deploy to Sepolia
  - Create test vesting
  - Wait for cliff (or mock time)
  - Claim tokens, verify balance

Test cases:
  - TC1: Create vesting with 30-day cliff, 365-day duration
  - TC2: Try to claim before cliff → should fail
  - TC3: Claim after cliff → should work
  - TC4: Create multiple vestings for same person
  - TC5: Edge case: duration = 0 (immediate release)

───────────────────────────────────────────────────────────────
DELIVERABLES:
───────────────────────────────────────────────────────────────

[ ] Vesting.sol compiles without errors
[ ] Vesting contract deployed to Sepolia
[ ] All unit tests pass
[ ] API endpoints tested and working
[ ] Frontend components render correctly
[ ] Integration tests pass
[ ] E2E test completes successfully
[ ] Documentation updated
[ ] Code reviewed (by YOU)
[ ] Ready to merge to main

═══════════════════════════════════════════════════════════════
```

---

## Template: Bug Fix Task

```
═══════════════════════════════════════════════════════════════
BUG FIX: [Bug Title]
PRIORITY: [Critical/High/Medium/Low]
REPORTED BY: [Who found it?]
═══════════════════════════════════════════════════════════════

DESCRIPTION:
[What is broken?]
[How to reproduce?]
[Expected behavior?]
[Actual behavior?]

IMPACT:
[Who is affected?]
[Severity? 1-10]

───────────────────────────────────────────────────────────────
ROOT CAUSE:
───────────────────────────────────────────────────────────────
[What's causing it?]
[File(s) involved?]

───────────────────────────────────────────────────────────────
SOLUTION:
───────────────────────────────────────────────────────────────
Assigned to: [COPILOT/WINDSURF]
Fix: [How to fix it]
Files affected:
  - [file1]
  - [file2]
Testing:
  - [How to verify fix works]
  - [Regression tests needed?]

═══════════════════════════════════════════════════════════════
```

---

## Template: Quick Task (Copilot)

```
QUICK TASK

TO: COPILOT
TASK: [What to build]
REQUIREMENTS:
  - [Req 1]
  - [Req 2]
OUTPUT: [Where to save, what format]
DEADLINE: [When]
```

**Example:**
```
QUICK TASK

TO: COPILOT
TASK: Create deploy-arbitrum.js script
REQUIREMENTS:
  - Deploy all 4 contracts to Arbitrum
  - Save addresses to deployment-arbitrum.json
  - Add error handling
OUTPUT: contracts/scripts/deploy-arbitrum.js
DEADLINE: Tomorrow
```

---

## Template: Review Request

```
═══════════════════════════════════════════════════════════════
CODE REVIEW REQUEST
═══════════════════════════════════════════════════════════════

FROM: [COPILOT/WINDSURF]
FEATURE: [What was built]
PR: [Link to PR or branch]
CHANGES:
  - [File: What changed]
  - [File: What changed]

TESTING DONE:
  - [Test 1: Passed]
  - [Test 2: Passed]

QUESTIONS FOR REVIEWER:
  - [Q1?]
  - [Q2?]

READY FOR:
  - [ ] Review
  - [ ] Merge to main
  - [ ] Deploy to testnet
  - [ ] Deploy to mainnet

═══════════════════════════════════════════════════════════════
```

---

## Using These Templates

1. **Copy the template** for your task type
2. **Fill in all fields** clearly
3. **Assign to** COPILOT or WINDSURF (or both)
4. **Share in chat/file**
5. **Agent works** on it
6. **You review** when complete
7. **Request changes** or **approve & merge**

---

## Pro Tips

✅ **Be specific** - More detail = better results  
✅ **Set deadlines** - Helps prioritize  
✅ **Explain why** - Agents work better with context  
✅ **Link references** - Design docs, API specs, etc.  
✅ **List requirements** - Prevents back-and-forth  
✅ **Define success** - How to know it's done?  

❌ **Don't be vague** - "Build something" → Too unclear  
❌ **Don't overload** - One feature per task  
❌ **Don't assume** - Explain what you need  
❌ **Don't skip integration** - Test together  

---

**Use these templates to keep everyone aligned and productive!** 🎯
