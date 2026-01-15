const hre = require("hardhat");
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

async function main() {
  console.log("🚀 Deploying a local Test Presale for you...");

  const [deployer] = await hre.ethers.getSigners();
  const localhost = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/deployment-localhost.json')));

  const factoryAddr = localhost.contracts.PresaleFactory;
  const tokenAddr = localhost.contracts.BelgraveToken;

  const Factory = await hre.ethers.getContractAt("PresaleFactory", factoryAddr);

  // Settings for the test presale
  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60; // Starts in 1 min
  const endTime = now + 86400; // Lasts 1 day

  console.log("📝 Creating Presale via Factory...");
  const tx = await Factory.createPresale(
    tokenAddr,
    hre.ethers.parseEther("100"), // softcap
    hre.ethers.parseEther("200"), // hardcap
    hre.ethers.parseEther("0.1"), // min
    hre.ethers.parseEther("10.0"), // max
    startTime,
    endTime,
    80, // 80% liquidity
    12 // 12 months lock
  );

  const receipt = await tx.wait();

  // Find the PresaleCreated event to get the address
  const event = receipt.logs.find(log => {
    try {
      return Factory.interface.parseLog(log).name === 'PresaleCreated';
    } catch (e) { return false; }
  });

  const presaleAddress = Factory.interface.parseLog(event).args.presaleAddress;
  console.log(`✅ Local Presale Deployed at: ${presaleAddress}`);

  // Update Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("💾 Updating Supabase 'Noble Test' with new local address...");
  const { error } = await supabase
    .from('presales')
    .update({
      contract_address: presaleAddress,
      chain: 'ETH', // MetaMask Localhost usually identifies as Ethereum/31337
      status: 'live',
      start_date: new Date(startTime * 1000).toISOString(),
      end_date: new Date(endTime * 1000).toISOString()
    })
    .eq('project_name', 'Noble Test');

  if (error) {
    console.error("❌ Supabase Update Failed:", error);
  } else {
    console.log("🎉 Done! Refresh the 'Noble Test' page and use MetaMask to commit.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
