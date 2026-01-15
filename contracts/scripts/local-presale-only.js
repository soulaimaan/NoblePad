import fs from "fs";
import hre from "hardhat";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying a local Test Presale for you...");

  const [deployer] = await hre.ethers.getSigners();
  const deploymentPath = path.join(__dirname, '../deployment-localhost.json');

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment-localhost.json not found in contracts/ folder.");
    return;
  }

  const localhost = JSON.parse(fs.readFileSync(deploymentPath));

  const factoryAddr = localhost.contracts.PresaleFactory;
  const tokenAddr = localhost.contracts.BelgraveToken;
  const routerAddr = "0x000000000000000000000000000000000000dEaD"; // Mock router for testing

  console.log(`Using Factory: ${factoryAddr}`);
  console.log(`Using Token: ${tokenAddr}`);

  const Factory = await hre.ethers.getContractAt("PresaleFactory", factoryAddr);

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60;
  const endTime = now + 86400;

  // Presale Settings
  const softCap = hre.ethers.parseEther("5");
  const hardCap = hre.ethers.parseEther("10");
  const presaleRate = 1000n; // 1000 tokens per ETH
  const listingRate = 800n; // 800 tokens per ETH
  const liquidityPercentage = 80n;
  const maxSpend = hre.ethers.parseEther("2");

  // Calculate tokens needed (as per Presale.sol line 90)
  // require(_amount >= (_hardCap * _presaleRate) + ((_hardCap * _liquidityPercent / 100) * _listingRate), "...")
  const tokensForPresale = hardCap * presaleRate;
  const tokensForLiquidity = (hardCap * liquidityPercentage / 100n) * listingRate;
  const totalTokensNeeded = tokensForPresale + tokensForLiquidity;

  console.log("📝 Creating Presale via Factory...");
  const tx = await Factory.createPresale(
    tokenAddr,
    routerAddr,
    softCap,
    hardCap,
    presaleRate,
    listingRate,
    liquidityPercentage,
    startTime,
    endTime,
    12, // lockPeriod
    maxSpend,
    totalTokensNeeded,
    { value: hre.ethers.parseEther("0.1") } // Higher than 0.01 fee
  );

  const receipt = await tx.wait();

  // Find the address from the logs
  let presaleAddress = "";
  for (const log of receipt.logs) {
    try {
      const parsed = Factory.interface.parseLog(log);
      if (parsed && parsed.name === 'PresaleCreated') {
        presaleAddress = parsed.args.presale; // In PresaleFactory.sol, the event param is 'presale'
        break;
      }
    } catch (e) { }
  }

  if (!presaleAddress && receipt.logs.length > 0) {
    presaleAddress = receipt.logs[receipt.logs.length - 1].address;
  }

  if (presaleAddress) {
    console.log(`\n✅ Local Presale Deployed at: ${presaleAddress}`);
    console.log("--------------------------------------------------");
    console.log("IMPORTANT: Copy the address above and run this SQL in Supabase:");
    console.log(`
    UPDATE presales 
    SET contract_address = '${presaleAddress}', 
        chain = 'ETH', 
        status = 'live' 
    WHERE project_name = 'Noble Test';
    `);
  } else {
    console.error("❌ Could not determine presale address from logs.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
