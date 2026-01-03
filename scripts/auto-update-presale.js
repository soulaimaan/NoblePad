import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deployAndUpdate() {
  console.log('🔍 Checking Hardhat node for deployed presale...');
  
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Get recent transaction from the deployer account
  const deployerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const txCount = await provider.getTransactionCount(deployerAddress);
  
  console.log(`Deployer has ${txCount} transactions`);
  
  // Get the most recent transaction receipt
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  
  if (!block || !block.transactions || block.transactions.length === 0) {
    console.error('❌ No recent transactions found');
    return;
  }
  
  const latestTxHash = block.transactions[block.transactions.length - 1];
  const receipt = await provider.getTransactionReceipt(latestTxHash);
  
  if (!receipt || !receipt.logs || receipt.logs.length === 0) {
    console.error('❌ No logs found in latest transaction');
    return;
  }
  
  // The presale address is typically in the last log
  const presaleAddress = receipt.logs[receipt.logs.length - 1].address;
  
  console.log(`✅ Found deployed presale at: ${presaleAddress}`);
  
  // Update Supabase
  console.log('📝 Updating Noble Test in Supabase...');
  const { error } = await supabase
    .from('presales')
    .update({
      contract_address: presaleAddress,
      chain: 'ETH',
      chain_id: 31337,
      status: 'live'
    })
    .ilike('project_name', '%Noble Test%');
  
  if (error) {
    console.error('❌ Update failed:', error.message);
  } else {
    console.log('✅ Successfully updated Noble Test with contract address');
    console.log(`\n🎉  You can now test contributions at: ${presaleAddress}`);
  }
}

deployAndUpdate();
