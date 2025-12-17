# Contracts Directory

This folder contains Solidity contracts for NoblePad. Some contracts are skeletons and require full implementation and security review.

Quick start (assumes you have node and npm installed):

1. Install dependencies (if this repo includes a `package.json` at root):

```bash
cd <repo-root>
npm install
```

2. Run Hardhat tests (if configured):

```bash
npx hardhat test --no-compile
```

3. Compile:

```bash
npx hardhat compile
```

Notes:
- Several contracts are intentionally minimal skeletons for faster iteration. Before deploying to testnet/mainnet, run static analyzers (Slither), a formal audit, and ensure all invariants from `ANTI_RUG_SPEC.md` are enforced on-chain.
- For production timelock/multisig consider using Gnosis Safe and OpenZeppelin's TimelockController.
