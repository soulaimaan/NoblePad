import { ethers } from 'ethers';

async function main() {
  const url = 'http://127.0.0.1:8545';
  console.log('Connecting to:', url);
  const provider = new ethers.JsonRpcProvider(url);
  
  try {
    const network = await provider.getNetwork();
    console.log('ChainId:', network.chainId.toString());
    const balance = await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
  } catch (err) {
    console.error('Check failed:', err.message);
  }
}

main();
