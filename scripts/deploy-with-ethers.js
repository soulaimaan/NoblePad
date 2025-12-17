import { ethers } from "ethers";
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

// Get the current file's directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function main() {
  console.log("🚀 Deploying Greeter contract to Sepolia...");

  // Connect to the network
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  );
  
  // Get the signer
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  console.log(`🔑 Using wallet: ${wallet.address}`);

  // Read the contract ABI and bytecode
  const contractPath = path.resolve(__dirname, '../artifacts/contracts/Greeter.sol/Greeter.json');
  const contractData = JSON.parse(readFileSync(contractPath, 'utf8'));
  
  // Create a contract factory
  const Greeter = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet
  );
  
  // Deploy the contract
  console.log("⏳ Deploying Greeter contract...");
  const greeter = await Greeter.deploy("Hello, NoblePad!");
  
  // Wait for deployment to complete
  await greeter.waitForDeployment();
  const address = await greeter.getAddress();
  
  console.log(`✅ Greeter deployed to: ${address}`);
  
  // Get the greeting to verify it's set correctly
  const greeting = await greeter.greet();
  console.log(`📝 Initial greeting: "${greeting}"`);
  
  console.log("\n🔍 To verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${address} "Hello, NoblePad!"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
