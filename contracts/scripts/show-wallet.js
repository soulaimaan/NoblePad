
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.INFURA_API_KEY) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

async function main() {
    const key = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!key) {
        console.error("No private key found in .env");
        return;
    }
    const wallet = new ethers.Wallet(key);
    console.log(`\n👛 Deployer Address: ${wallet.address}`);

    // Check Mainnet Balance
    const infuraKey = process.env.INFURA_API_KEY;
    if (infuraKey) {
        try {
            const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraKey}`);
            const balance = await provider.getBalance(wallet.address);
            console.log(`💰 Mainnet Balance: ${ethers.formatEther(balance)} ETH`);
        } catch (e) {
            console.log("Could not fetch balance (Infura key might be invalid or network error)");
        }
    }
}

main();
