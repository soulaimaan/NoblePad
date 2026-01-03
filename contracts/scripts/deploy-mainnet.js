import fs from "fs";
import hardhat from "hardhat";
import path from "path";
import { fileURLToPath } from 'url';
const { ethers, network, run } = hardhat;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(`\n🚀 Starting deployment to network: ${network.name}`);
  
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deployer Address:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.warn('⚠️  Warning: Balance is 0. Deployment might fail if not on a local fork.');
  }

  const deployed = {};

  const deploy = async (name, ...args) => {
    console.log(`\n📦 Deploying ${name}...`);
    const factory = await ethers.getContractFactory(name);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log(`✅ ${name} at: ${addr}`);
    deployed[name] = addr;
    
    // Wait for confirmations on live networks
    if (network.name !== 'localhost' && network.name !== 'hardhat') {
        console.log('   Waiting for 5 confirmations...');
        await contract.deploymentTransaction().wait(5);
        
        console.log('   Verifying contract...');
        try {
            await run("verify:verify", {
                address: addr,
                constructorArguments: args,
            });
            console.log('   ✅ Verified.');
        } catch (e) {
            console.log('   ❌ Verification failed:', e.message);
        }
    }
    
    return contract;
  };

  try {
    // 1. Deploy Core Locks
    const tokenLock = await deploy('TokenLock');

    // 2. Deploy Presale Factory
    await deploy('PresaleFactory', await tokenLock.getAddress());

    // 3. Deploy Vesting
    await deploy('Vesting', deployer.address);

    // 4. Deploy Treasury Timelock (48 hours)
    const TIMELOCK_DELAY = 172800;
    await deploy('TreasuryTimelock', TIMELOCK_DELAY, deployer.address);

    // 5. Deploy Token Factory
    await deploy('TokenFactory', deployer.address);

    // 6. Deploy Native Ecosystem Token (NoblePad / Belgrave)
    const npad = await deploy('NoblePadToken', deployer.address);

    // 7. Deploy Staking
    await deploy('NPADStaking', await npad.getAddress(), deployer.address);

    // Save Deployment info
    const info = {
      network: network.name,
      chainId: Number((await ethers.provider.getNetwork()).chainId),
      timestamp: new Date().toISOString(),
      contracts: deployed
    };

    const outputPath = path.join(__dirname, '..', `deployment-${network.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
    console.log(`\n🎉 Deployment Complete! Info saved to: ${outputPath}`);

  } catch (err) {
    console.error('\n❌ Deployment Failed:', err);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
