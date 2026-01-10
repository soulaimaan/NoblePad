# Multi-Chain Network Testing Guide

## 🎯 Testing Overview

NoblePad is now deployed on **3 mainnets**:

- **Ethereum Mainnet** (Chain ID: 1)
- **BSC Mainnet** (Chain ID: 56)
- **Base Mainnet** (Chain ID: 8453)

## 📋 Pre-Testing Checklist

- [ ] Dev server running at `http://localhost:3000`
- [ ] MetaMask or compatible wallet installed
- [ ] Small amounts of native tokens on each chain:
  - ETH on Ethereum Mainnet
  - BNB on BSC Mainnet
  - ETH on Base Mainnet

## 🧪 Test Scenarios

### Test 1: Network Switching

**Objective**: Verify wallet can connect to all 3 networks

**Steps**:

1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. Select "Browser Wallet (Direct)" or "Other EVM Wallets"
4. In MetaMask, switch to **Ethereum Mainnet**
   - Verify connected network shows "EVM" badge
   - Check balance displays correctly
5. Switch to **BSC Mainnet**
   - Verify connection persists
   - Balance updates
6. Switch to **Base Mainnet**
   - Verify connection persists
   - Balance updates

**Expected Result**: ✅ Seamless switching between all 3 networks

---

### Test 2: Contract Address Verification

**Objective**: Verify correct contract addresses load for each network

**Steps**:

1. Open browser console (F12)
2. Connect wallet to **Ethereum Mainnet**
3. Run in console:

   ```javascript
   // Check if contracts are configured
   console.log('Chain ID:', window.ethereum.chainId)
   ```

4. Navigate to `/create` (Create Presale page)
5. Check console for any contract loading errors
6. Repeat for **BSC** and **Base**

**Expected Contract Addresses**:

- **Ethereum Mainnet (Chain 1)**:
  - PresaleFactory: `0x2285321a0c76695c7E900E951Aa45378843b3BC3`
  - TokenLock: `0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f`

- **BSC Mainnet (Chain 56)**:
  - PresaleFactory: `0x2285321a0c76695c7E900E951Aa45378843b3BC3`
  - TokenLock: `0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f`

- **Base Mainnet (Chain 8453)**:
  - PresaleFactory: `0x2285321a0c76695c7E900E951Aa45378843b3BC3`
  - TokenLock: `0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f`

**Expected Result**: ✅ No errors, correct addresses loaded

---

### Test 3: Read Contract Data

**Objective**: Verify frontend can read from deployed contracts

**Steps**:

1. Connect to **Ethereum Mainnet**
2. Navigate to `/presales`
3. Check if page loads without errors
4. Open console - should see no contract errors
5. Switch to **BSC Mainnet** and refresh
6. Switch to **Base Mainnet** and refresh

**Expected Result**: ✅ Pages load successfully on all networks

---

### Test 4: Network Auto-Detection

**Objective**: Verify app detects network changes

**Steps**:

1. Connect wallet on **Ethereum Mainnet**
2. While on the site, switch network to **BSC** in MetaMask
3. Observe if:
   - Network badge updates
   - Balance updates
   - No errors appear
4. Switch to **Base** - same checks

**Expected Result**: ✅ App updates automatically without refresh

---

### Test 5: Presale Creation Flow (Optional)

**Objective**: Test creating a presale on each network

**⚠️ WARNING**: This will consume gas on mainnet!

**Steps**:

1. Connect to **Base Mainnet** (lowest gas fees)
2. Navigate to `/create`
3. Fill in presale details (use test token if available)
4. Check if PresaleFactory address is correct in transaction
5. **DO NOT CONFIRM** unless you want to create a real presale

**Expected Result**: ✅ Transaction preview shows correct contract

---

## 🔍 What to Look For

### ✅ Success Indicators

- Wallet connects smoothly on all 3 networks
- Balance displays correctly when switching networks
- Network badge shows correct chain (EVM badge)
- No console errors related to contracts
- Contract addresses match deployment records

### ❌ Issues to Report

- Wallet connection fails on specific network
- Balance shows as 0 when it shouldn't
- Console errors mentioning "contract" or "provider"
- Wrong contract addresses loaded
- Network switching causes disconnection

---

## 📊 Testing Checklist

- [ ] **Ethereum Mainnet**
  - [ ] Wallet connects
  - [ ] Balance displays
  - [ ] Can navigate pages
  - [ ] No console errors

- [ ] **BSC Mainnet**
  - [ ] Wallet connects
  - [ ] Balance displays
  - [ ] Can navigate pages
  - [ ] No console errors

- [ ] **Base Mainnet**
  - [ ] Wallet connects
  - [ ] Balance displays
  - [ ] Can navigate pages
  - [ ] No console errors

- [ ] **Network Switching**
  - [ ] Ethereum → BSC works
  - [ ] BSC → Base works
  - [ ] Base → Ethereum works
  - [ ] Auto-detects network changes

---

## 🛠️ Troubleshooting

### Issue: Wallet won't connect

**Solution**:

- Clear MetaMask cache
- Refresh page
- Try "Other EVM Wallets" option

### Issue: Wrong network shown

**Solution**:

- Manually switch in MetaMask
- Refresh page
- Check if network is added to MetaMask

### Issue: Balance shows 0

**Solution**:

- Verify you have native tokens on that chain
- Check MetaMask shows correct balance
- Refresh page

### Issue: "Contract not found" error

**Solution**:

- Verify you're on the correct network
- Check browser console for specific error
- Report exact error message

---

## 📝 Quick Test Commands

Run these in browser console for quick verification:

```javascript
// Check current chain
console.log('Connected Chain:', window.ethereum?.chainId)

// Check wallet address
console.log('Wallet:', window.ethereum?.selectedAddress)

// Check Web3 provider
console.log('Provider ready:', !!window.ethereum)
```

---

## 🎉 Testing Complete

Once all tests pass, your NoblePad is confirmed working on:
✅ Ethereum Mainnet  
✅ BSC Mainnet  
✅ Base Mainnet

Ready for production use! 🚀
