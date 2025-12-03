const { ethers, InfuraProvider } = require('ethers');
require('dotenv').config();

async function testBlockchain() {
  try {
    // Set up provider
    console.log('🔗 Connecting to Ethereum network via Infura...');
    const provider = new InfuraProvider('sepolia', process.env.INFURA_API_KEY);
    
    // Test connection
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected to Ethereum network');
    console.log(`Current block number: ${blockNumber}`);
    
    // Test wallet connection
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    console.log(`\n🔑 Wallet connected:`);
    console.log(`   Address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance);
    console.log(`   Balance: ${ethBalance} ETH`);
    
    // Test Etherscan API (if available)
    if (process.env.ETHERSCAN_API_KEY) {
      console.log('\n🔍 Etherscan API key is configured');
      console.log('   Note: To verify contract deployment, you can use:');
      console.log(`   npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor arg 1"`);
    }
    
    console.log('\n✅ Blockchain configuration test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Blockchain connection error:');
    if (error.code === 'INVALID_ARGUMENT') {
      console.error('   Invalid argument detected. Please check your environment variables.');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('   Network error. Please check your internet connection and Infura API key.');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('   Insufficient funds for deployment. Please add ETH to your wallet.');
    }
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

testBlockchain();
