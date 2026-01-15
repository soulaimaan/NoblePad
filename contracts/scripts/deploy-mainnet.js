
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.INFURA_API_KEY) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const args = process.argv.slice(2);
const networkArgIndex = args.indexOf('--network');
const networkName = networkArgIndex !== -1 ? args[networkArgIndex + 1] : 'mainnet';

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;

const NETWORKS = {
  mainnet: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  sepolia: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
  bsc: "https://bsc-dataseed.binance.org/",
  polygon: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  arbitrum: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
  base: "https://mainnet.base.org"
};

const rpcUrl = NETWORKS[networkName];

if (!rpcUrl) {
  console.error(`❌ Error: Unknown network ${networkName}`);
  process.exit(1);
}

if (!DEPLOYER_PRIVATE_KEY) {
  console.error(`❌ Error: Missing DEPLOYER_PRIVATE_KEY in .env`);
  process.exit(1);
}

function loadArtifact(name) {
  const artifactPath = path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
  if (!fs.existsSync(artifactPath)) {
    console.warn(`⚠️ Artifact not found for ${name} at ${artifactPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}

async function main() {
  console.log(`\n🚀 Deploying to ${networkName}...`);
  console.log(`📡 RPC: ${rpcUrl}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  console.log(`📝 Deployer: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH/Native`);

  if (balance === 0n) {
    console.warn("⚠️ Warning: Balance is 0.");
  }

  // 1. Deploy TokenLock
  console.log('\n1️⃣ Deploying TokenLock...');
  const TokenLock = loadArtifact("TokenLock");
  const tokenLockFactory = new ethers.ContractFactory(TokenLock.abi, TokenLock.bytecode, wallet);
  const tokenLock = await tokenLockFactory.deploy();
  await tokenLock.waitForDeployment();
  const tokenLockAddr = await tokenLock.getAddress();
  console.log(`   ✅ TokenLock: ${tokenLockAddr}`);

  // 2. BelgraveToken (SKIPPED)
  console.log('\n2️⃣ BelgraveToken: SKIPPED (XRPL Integration)');

  // 3. Deploy PresaleFactory
  console.log('\n3️⃣ Deploying PresaleFactory...');
  const PresaleFactory = loadArtifact("PresaleFactory");
  const presaleFactoryFactory = new ethers.ContractFactory(PresaleFactory.abi, PresaleFactory.bytecode, wallet);
  const presaleFactory = await presaleFactoryFactory.deploy(tokenLockAddr);
  await presaleFactory.waitForDeployment();
  const presaleFactoryAddr = await presaleFactory.getAddress();
  console.log(`   ✅ PresaleFactory: ${presaleFactoryAddr}`);

  // 4. BelgraveStaking (SKIPPED)
  console.log('\n4️⃣ BelgraveStaking: SKIPPED (XRPL Staking)');

  // Save Deployment Data
  const deploymentPath = path.join(__dirname, `../deployment-${networkName}.json`);
  const deploymentData = {
    network: networkName,
    timestamp: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      TokenLock: tokenLockAddr,
      PresaleFactory: presaleFactoryAddr
    }
  };

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n📁 Deployment info saved to: ${deploymentPath}`);
  console.log("\n✅ Deployment process completed!");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exit(1);
});
