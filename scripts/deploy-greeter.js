import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Greeter contract to Sepolia...");
  
  // Deploy the contract with an initial greeting
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, NoblePad!");
  
  // Wait for deployment to complete
  await greeter.waitForDeployment();
  
  console.log(`✅ Greeter deployed to: ${await greeter.getAddress()}`);
  
  // Get the greeting to verify it's set correctly
  const greeting = await greeter.greet();
  console.log(`📝 Initial greeting: "${greeting}"`);
  
  console.log("\n🔍 To verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${await greeter.getAddress()} "Hello, NoblePad!"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
