const hre = require("hardhat");

async function main() {
  console.log("Starting CJS deployment test...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const TokenLock = await hre.ethers.getContractFactory("TokenLock");
  const lock = await TokenLock.deploy();
  await lock.waitForDeployment();
  console.log("TokenLock deployed to:", await lock.getAddress());
}

main()
  .then(() => {
    console.log("Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error in script:", error);
    process.exit(1);
  });
