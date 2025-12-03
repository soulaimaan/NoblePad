const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  // Connect to the Sepolia network
  const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  );

  // Get the wallet address from the private key
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const address = await wallet.getAddress();
  
  console.log(`🔍 Checking balance for address: ${address}`);
  
  // Get the balance
  const balance = await provider.getBalance(address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log(`💰 Balance: ${balanceInEth} ETH`);
  
  if (parseFloat(balanceInEth) < 0.001) {
    console.log("\n⚠️  Low balance! You'll need some test ETH for deployment.");
    console.log("   Get test ETH from a Sepolia faucet:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://faucet.sepolia.dev/");
  } else {
    console.log("\n✅ You have enough ETH to deploy contracts!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
