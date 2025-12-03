#!/usr/bin/env node

/**
 * Deployment Runner - Sets environment variables from .env and runs deploy-sepolia.js
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envConfig = dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (envConfig.error) {
  console.error('❌ Error loading .env file:', envConfig.error);
  process.exit(1);
}

// Map .env variables to deployment script variables
const env = {
  ...process.env,
  PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
  SEPOLIA_RPC_URL: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY
};

// Validate required variables
if (!env.PRIVATE_KEY) {
  console.error('❌ Error: DEPLOYER_PRIVATE_KEY not found in .env');
  process.exit(1);
}

if (!process.env.INFURA_API_KEY) {
  console.error('❌ Error: INFURA_API_KEY not found in .env');
  process.exit(1);
}

console.log('🚀 Starting NoblePad Sepolia Deployment...\n');
console.log(`📝 Deployer: ${env.PRIVATE_KEY.substring(0, 10)}...${env.PRIVATE_KEY.substring(env.PRIVATE_KEY.length - 4)}`);
console.log(`🔗 RPC: https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY.substring(0, 5)}...${process.env.INFURA_API_KEY.substring(process.env.INFURA_API_KEY.length - 4)}\n`);

// Run the deployment script
const child = spawn('node', ['./scripts/deploy-sepolia.js'], {
  cwd: __dirname,
  env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
