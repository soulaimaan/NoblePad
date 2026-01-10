import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const NETWORKS = {
    ethereum: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpc: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        explorer: 'https://etherscan.io',
        contracts: {
            TokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
            PresaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3'
        }
    },
    bsc: {
        name: 'BSC Mainnet',
        chainId: 56,
        rpc: 'https://bsc-dataseed.binance.org/',
        explorer: 'https://bscscan.com',
        contracts: {
            TokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
            PresaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3'
        }
    },
    base: {
        name: 'Base Mainnet',
        chainId: 8453,
        rpc: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        contracts: {
            TokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
            PresaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3'
        }
    }
};

async function verifyContract(provider, address, name) {
    try {
        const code = await provider.getCode(address);
        const isDeployed = code !== '0x';

        if (isDeployed) {
            console.log(`   ✅ ${name}: ${address}`);
            console.log(`      Code size: ${code.length} bytes`);
            return true;
        } else {
            console.log(`   ❌ ${name}: ${address} - NOT DEPLOYED`);
            return false;
        }
    } catch (error) {
        console.log(`   ⚠️  ${name}: ${address} - ERROR: ${error.message}`);
        return false;
    }
}

async function checkNetwork(networkKey) {
    const network = NETWORKS[networkKey];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Checking ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`${'='.repeat(60)}`);

    try {
        const provider = new ethers.JsonRpcProvider(network.rpc);

        // Check network connectivity
        const blockNumber = await provider.getBlockNumber();
        console.log(`📡 RPC Connected - Latest Block: ${blockNumber}`);

        // Verify contracts
        console.log(`\n📝 Contract Verification:`);
        const tokenLockOk = await verifyContract(
            provider,
            network.contracts.TokenLock,
            'TokenLock'
        );
        const factoryOk = await verifyContract(
            provider,
            network.contracts.PresaleFactory,
            'PresaleFactory'
        );

        // Explorer links
        console.log(`\n🔗 Explorer Links:`);
        console.log(`   TokenLock: ${network.explorer}/address/${network.contracts.TokenLock}`);
        console.log(`   PresaleFactory: ${network.explorer}/address/${network.contracts.PresaleFactory}`);

        const status = tokenLockOk && factoryOk ? '✅ ALL CONTRACTS VERIFIED' : '⚠️  SOME CONTRACTS MISSING';
        console.log(`\n${status}`);

        return { network: network.name, success: tokenLockOk && factoryOk };
    } catch (error) {
        console.log(`\n❌ Network Check Failed: ${error.message}`);
        return { network: network.name, success: false };
    }
}

async function main() {
    console.log('\n🚀 NoblePad Multi-Chain Deployment Verification');
    console.log('================================================\n');

    const results = [];

    for (const networkKey of Object.keys(NETWORKS)) {
        const result = await checkNetwork(networkKey);
        results.push(result);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log(`${'='.repeat(60)}`);

    results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.network}`);
    });

    const allSuccess = results.every(r => r.success);

    console.log(`\n${'='.repeat(60)}`);
    if (allSuccess) {
        console.log('🎉 ALL NETWORKS VERIFIED SUCCESSFULLY!');
        console.log('✅ NoblePad is live on 3 mainnets');
    } else {
        console.log('⚠️  Some networks need attention');
    }
    console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);
