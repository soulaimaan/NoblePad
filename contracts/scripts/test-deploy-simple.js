import { ethers } from 'ethers';
import fs from 'fs';

async function main() {
  const url = 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(url);
  const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbc1c22a0d13a1e7aeda585b', provider);
  console.log('Signer address:', signer.address);
  const balance = await provider.getBalance(signer.address);
  console.log('Signer balance:', ethers.formatEther(balance), 'ETH');
  
  const art = JSON.parse(fs.readFileSync('artifacts/contracts/Greeter.sol/Greeter.json', 'utf8'));
  const factory = new ethers.ContractFactory(art.abi, art.bytecode.object || art.bytecode, signer);
  
  console.log('Deploying Greeter...');
  try {
    const contract = await factory.deploy('Hello');
    await contract.waitForDeployment();
    console.log('Greeter deployed to:', await contract.getAddress());
  } catch (err) {
    console.error('Failed:', err);
  }
}

main();
