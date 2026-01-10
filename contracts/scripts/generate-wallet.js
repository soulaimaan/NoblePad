
import { ethers } from 'ethers';

function main() {
    const wallet = ethers.Wallet.createRandom();

    console.log("=================================================================");
    console.log("🔐 NEW MAINNET DEPLOYER WALLET GENERATED");
    console.log("=================================================================");
    console.log("");
    console.log(`Address:     ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log("");
    console.log("=================================================================");
    console.log("⚠️  IMPORTANT SAFETY INSTRUCTIONS:");
    console.log("1. Copy the 'Private Key' above.");
    console.log("2. Open your .env file.");
    console.log("3. Replace DEPLOYER_PRIVATE_KEY with the new key.");
    console.log("4. DELETE this terminal history or this script output immediately.");
    console.log("5. Fund the 'Address' above with ETH/BNB/MATIC.");
    console.log("=================================================================");
    console.log("");
}

main();
