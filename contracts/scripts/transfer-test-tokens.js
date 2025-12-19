#!/usr/bin/env node

/**
 * NoblePad NPAD Token Transfer Utility
 * 
 * Usage:
 *   node scripts/transfer-test-tokens.js <recipient_address> <amount_in_npad>
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !SEPOLIA_RPC_URL) {
  console.error('❌ Error: Missing environment variables (DEPLOYER_PRIVATE_KEY, SEPOLIA_RPC_URL)');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/transfer-test-tokens.js <recipient_address> <amount_in_npad>');
  process.exit(1);
}

const [recipient, amount] = args;

async function transfer() {
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // Load token address from deployment file
    const deploymentPath = path.join(__dirname, '../deployment-npad-staking.json');
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('Deployment file not found. Run deploy:npad-staking first.');
    }
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const tokenAddress = deployment.npadToken;

    console.log(`🚀 Transferring ${amount} NPAD to ${recipient}...`);

    const tokenAbi = [
      "function transfer(address to, uint256 amount) public returns (bool)",
      "function decimals() public view returns (uint8)"
    ];

    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const decimals = await token.decimals();
    const weiAmount = ethers.parseUnits(amount, decimals);

    const tx = await token.transfer(recipient, weiAmount);
    console.log(`   Tx Hash: ${tx.hash}`);
    await tx.wait();

    console.log(`✅ Transfer successful!`);
  } catch (error) {
    console.error(`❌ Transfer failed:`, error.message);
  }
}

transfer();
