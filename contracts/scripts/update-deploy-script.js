
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'deploy-mainnet.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace NoblePadToken section
const tokenSection = `  // 2. Deploy NoblePadToken
  console.log('\\n2️⃣  Deploying NoblePadToken (NPAD)...');
  const NoblePadToken = loadArtifact("NoblePadToken");
  const npadTokenFactory = new ethers.ContractFactory(NoblePadToken.abi, NoblePadToken.bytecode, wallet);
  const initialOwner = wallet.address;
  const npadToken = await npadTokenFactory.deploy(initialOwner);
  await npadToken.waitForDeployment();
  const npadTokenAddr = await npadToken.getAddress();
  console.log(\`   ✅ NoblePadToken: \${npadTokenAddr}\`);`;

const tokenReplacement = `  // 2. NoblePadToken (SKIPPED)
  console.log('\\n2️⃣  NoblePadToken: SKIPPED (XRPL Integration using Belgrave)');
  const npadTokenAddr = "0x0000000000000000000000000000000000000000"; // Dummy address`;

content = content.replace(tokenSection, tokenReplacement);

// Replace NPADStaking section
const stakingSection = `  // 4. Deploy NPADStaking
  console.log('\\n4️⃣  Deploying NPADStaking...');
  const NPADStaking = loadArtifact("NPADStaking");
  const stakingFactory = new ethers.ContractFactory(NPADStaking.abi, NPADStaking.bytecode, wallet);
  const staking = await stakingFactory.deploy(npadTokenAddr, initialOwner);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log(\`   ✅ NPADStaking: \${stakingAddr}\`);`;

const stakingReplacement = `  // 4. NPADStaking (SKIPPED)
  console.log('\\n4️⃣  NPADStaking: SKIPPED (XRPL Staking)');
  const stakingAddr = "0x0000000000000000000000000000000000000000"; // Dummy address`;

content = content.replace(stakingSection, stakingReplacement);

// Update JSON structure to comments
content = content.replace('NoblePadToken: npadTokenAddr,', '// NoblePadToken: npadTokenAddr,');
content = content.replace('NPADStaking: stakingAddr', '// NPADStaking: stakingAddr');

fs.writeFileSync(filePath, content);
console.log("Updated deploy-mainnet.js");
