#!/usr/bin/env node

/**
 * NoblePad NPAD Token and Staking Deployment to Sepolia
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validate environment variables
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !SEPOLIA_RPC_URL) {
  console.error('❌ Error: Missing environment variables');
  if (!PRIVATE_KEY) console.error('Required: DEPLOYER_PRIVATE_KEY or PRIVATE_KEY');
  if (!SEPOLIA_RPC_URL) console.error('Required: SEPOLIA_RPC_URL');
  process.exit(1);
}

// Contract ABIs and Bytecode
function loadContractData(contractName) {
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found: ${artifactPath}. Did you run 'npx hardhat compile'?`);
  }
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode
  };
}

async function deploy() {
  console.log('🚀 Deploying NPAD Token and Staking to Sepolia...\n');
  
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📝 Deployer Address: ${signer.address}`);
  
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  if (balance === 0n) {
    console.error('❌ Error: Deployer has 0 ETH.');
    process.exit(1);
  }
  
  try {
    // 1. Deploy NPAD Token
    console.log('1️⃣  Deploying NoblePadToken (NPAD)...');
    const tokenData = loadContractData('NoblePadToken');
    const tokenFactory = new ethers.ContractFactory(tokenData.abi, tokenData.bytecode, signer);
    const token = await tokenFactory.deploy(signer.address);
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();
    console.log(`   ✅ NPAD Token: ${tokenAddr}\n`);
    
    // 2. Deploy Staking Contract
    console.log('2️⃣  Deploying NPADStaking...');
    const stakingData = loadContractData('NPADStaking');
    const stakingFactory = new ethers.ContractFactory(stakingData.abi, stakingData.bytecode, signer);
    const staking = await stakingFactory.deploy(tokenAddr, signer.address);
    await staking.waitForDeployment();
    const stakingAddr = await staking.getAddress();
    console.log(`   ✅ Staking: ${stakingAddr}\n`);
    
    // Save deployment info
    const deploymentInfo = {
      network: 'sepolia',
      timestamp: new Date().toISOString(),
      deployer: signer.address,
      npadToken: tokenAddr,
      staking: stakingAddr
    };
    
    const outputFile = path.join(__dirname, '../deployment-npad-staking.json');
    fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('✅ Deployment Complete!\n');
    console.log('═'.repeat(50));
    console.log(`NPAD Token:         ${tokenAddr}`);
    console.log(`Staking Contract:   ${stakingAddr}`);
    console.log('═'.repeat(50));
    console.log(`\n📁 Deployment info saved to: ${outputFile}`);
    console.log('\n⏭️  Next steps:');
    console.log('1. Update src/lib/contracts.ts with these addresses');
    console.log('2. Send some NPAD to test accounts using the deployer wallet');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
