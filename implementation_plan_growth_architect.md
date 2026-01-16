# Implementation Plan: NoblePad Growth Architect Transition

Pivot the NoblePad marketing system from a blockchain-based rug monitor to an institutional-grade 'Growth Architect' ecosystem.

## 1. Process Cleanup

- [ ] Forcefully terminate any remaining `node.exe` and `python.exe` processes related to the old marketing bot.
- [ ] Ensure `pm2` has no active processes.

## 2. Core Orchestrator Update (`agents/belgrave-guardian/BelgraveGuardian.cjs`)

- [ ] Remove blockchain/rug listener logic.
- [ ] Implement X.com keyword monitoring for targeted growth keywords:
  - `Institutional DeFi`
  - `Launchpad security`
  - `Web3 infrastructure`
  - `Liquidity locks`
  - `Token launch problems`
- [ ] Enforce 3:1 Reply-to-Post ratio.
- [ ] Implement/Verify 'Organic Jitter' (90-135 minute delay).

## 3. Agent Re-engineering

- [ ] **Agent 1: The Scout**: Change focus from rug pulls to monitoring high-tier accounts (@saylor, @balajis, @vitalikdoteth) for trust/infrastructure pain points.
- [ ] **Agent 2: The Visionary (Content Lead)**: Update narratives to position $BELGRAVE as an ecosystem-stabilizing asset.
- [ ] **Agent 3: The Institutional Auditor**: Update to reject any mentions of "0x" addresses, "rugs," or "alerts." Enforce "BlackRock-ready" tone.
- [ ] **Agent 4: The Networker (Outreach)**: Refine drafting logic to: Validate point -> Technical insight -> Bridge to NoblePad.
- [ ] **Agent 5: The Humanizer (Stylist)**: Ensure professional/street-smart tone and avoid ticker-spam.
- [ ] **Agent 6: The Algorithm Guard**: Enforce posting rhythms and shadow-ban protection.

## 4. Legacy Logic Removal

- [ ] Strip `agents/belgrave-guardian/data/TechnicalChecklist.cjs` of 'Liquidity not locked' and other 'rug-alert' mock data.
- [ ] Update frontend components (`src/app/marketing/page.tsx` or build output in `out/`) if they rely on hardcoded 'failed audit' mock data.

## 5. Verification

- [ ] Run the system in manual mode: `node start-belgrave-guardian.cjs --manual`.
- [ ] Confirm no rug-alert messages are generated.
- [ ] Verify contextual replies follow the new institutional guidelines.
