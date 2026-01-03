#!/usr/bin/env node

/**
 * NoblePad Smart Contract Deployment to Sepolia
 * 
 * Usage:
 *   PRIVATE_KEY=0x... SEPOLIA_RPC_URL=https://... npm run deploy:sepolia
 * 
 * Environment Variables Required:
 *   - PRIVATE_KEY: Deployer private key (with Sepolia ETH)
 *   - SEPOLIA_RPC_URL: Sepolia JSON-RPC endpoint (Infura, Alchemy, etc)
 *   - ETHERSCAN_API_KEY: (optional) For contract verification
 */

import 'dotenv/config';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !SEPOLIA_RPC_URL) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: PRIVATE_KEY, SEPOLIA_RPC_URL');
  process.exit(1);
}

// Contract ABIs and Bytecode
function loadContractData(contractName) {
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found: ${artifactPath}`);
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode
  };
}

async function deploy() {
  console.log('🚀 Deploying NoblePad Contracts to Sepolia...\n');
  
  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📝 Deployer Address: ${signer.address}`);
  
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  if (balance === 0n) {
    console.error('❌ Error: Deployer has 0 ETH. Get Sepolia ETH from faucet.');
    process.exit(1);
  }
  
  const deployedContracts = {};
  
  try {
    // Deploy TokenLock
    console.log('1️⃣  Deploying TokenLock...');
    const TokenLockData = loadContractData('TokenLock');
    const TokenLockFactory = new ethers.ContractFactory(TokenLockData.abi, TokenLockData.bytecode, signer);
    const tokenLock = await TokenLockFactory.deploy();
    const tokenLockTx = tokenLock.deploymentTransaction();
    console.log(`   Tx Hash: ${tokenLockTx?.hash}`);
    await tokenLock.waitForDeployment();
    const tokenLockAddr = await tokenLock.getAddress();
    deployedContracts.TokenLock = tokenLockAddr;
    console.log(`   ✅ TokenLock: ${tokenLockAddr}\n`);
    
    // Deploy PresaleFactory
    console.log('2️⃣  Deploying PresaleFactory...');
    const PresaleFactoryData = loadContractData('PresaleFactory');
    const PresaleFactoryFactory = new ethers.ContractFactory(PresaleFactoryData.abi, PresaleFactoryData.bytecode, signer);
    const presaleFactory = await PresaleFactoryFactory.deploy(tokenLockAddr);
    const presaleFactoryTx = presaleFactory.deploymentTransaction();
    console.log(`   Tx Hash: ${presaleFactoryTx?.hash}`);
    await presaleFactory.waitForDeployment();
    const presaleFactoryAddr = await presaleFactory.getAddress();
    deployedContracts.PresaleFactory = presaleFactoryAddr;
    console.log(`   ✅ PresaleFactory: ${presaleFactoryAddr}\n`);
    
    // Deploy Vesting
    console.log('3️⃣  Deploying Vesting...');
    const VestingData = loadContractData('Vesting');
    const VestingFactory = new ethers.ContractFactory(VestingData.abi, VestingData.bytecode, signer);
    const vesting = await VestingFactory.deploy(signer.address);
    const vestingTx = vesting.deploymentTransaction();
    console.log(`   Tx Hash: ${vestingTx?.hash}`);
    await vesting.waitForDeployment();
    const vestingAddr = await vesting.getAddress();
    deployedContracts.Vesting = vestingAddr;
    console.log(`   ✅ Vesting: ${vestingAddr}\n`);
    
    // Deploy TreasuryTimelock
    console.log('4️⃣  Deploying TreasuryTimelock...');
    const TreasuryTimelockData = loadContractData('TreasuryTimelock');
    const TreasuryTimelockFactory = new ethers.ContractFactory(TreasuryTimelockData.abi, TreasuryTimelockData.bytecode, signer);
    const TIMELOCK_DELAY = 7 * 24 * 60 * 60; // 7 days in seconds
    const treasuryTimelock = await TreasuryTimelockFactory.deploy(TIMELOCK_DELAY, signer.address);
    const treasuryTimelockTx = treasuryTimelock.deploymentTransaction();
    console.log(`   Tx Hash: ${treasuryTimelockTx?.hash}`);
    await treasuryTimelock.waitForDeployment();
    const treasuryTimelockAddr = await treasuryTimelock.getAddress();
    deployedContracts.TreasuryTimelock = treasuryTimelockAddr;
    console.log(`   ✅ TreasuryTimelock: ${treasuryTimelockAddr}\n`);
    
    // Save deployment info
    const deploymentInfo = {
      network: 'sepolia',
      timestamp: new Date().toISOString(),
      deployer: signer.address,
      blockNumber: await provider.getBlockNumber(),
      contracts: deployedContracts
    };
    
    const outputFile = path.join(__dirname, '../deployment-sepolia.json');
    fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('✅ Deployment Complete!\n');
    console.log('📊 Deployment Summary:');
    console.log('═'.repeat(50));
    Object.entries(deployedContracts).forEach(([name, addr]) => {
      console.log(`${name.padEnd(20)} ${addr}`);
    });
    console.log('═'.repeat(50));
    console.log(`\n📁 Deployment info saved to: ${outputFile}`);
    console.log(`\n🔍 View on Etherscan: https://sepolia.etherscan.io/address/${signer.address}`);
    console.log('\n⏭️  Next steps:');
    console.log('1. Verify contracts on Etherscan (see DEPLOYMENT_GUIDE.md)');
    console.log('2. Update src/lib/contracts.ts with deployment addresses');
    console.log('3. Run integration tests');
    console.log('4. Schedule security audit');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    process.exit(1);
  }
}

deploy();
