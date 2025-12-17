import { ethers } from 'ethers';
import * as fs from 'fs';

async function main() {
  console.log('Deploying NoblePad contracts...');
  
  // Connect to local Hardhat network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbc1c22a0d13a1e7aeda585b', provider);
  
  console.log(`Deploying contracts with account: ${signer.address}`);
  
  // Deploy TokenLock
  console.log('\n1. Deploying TokenLock...');
  const TokenLockABI = JSON.parse(fs.readFileSync('artifacts/contracts/TokenLock.sol/TokenLock.json', 'utf8')).abi;
  const TokenLockBytecode = JSON.parse(fs.readFileSync('artifacts/contracts/TokenLock.sol/TokenLock.json', 'utf8')).bytecode;
  const TokenLockFactory = new ethers.ContractFactory(TokenLockABI, TokenLockBytecode, signer);
  const tokenLock = await TokenLockFactory.deploy();
  await tokenLock.waitForDeployment?.();
  const tokenLockAddr = await tokenLock.getAddress?.() || tokenLock.address;
  console.log(`✓ TokenLock deployed at: ${tokenLockAddr}`);
  
  // Deploy PresaleFactory
  console.log('\n2. Deploying PresaleFactory...');
  const PresaleFactoryABI = JSON.parse(fs.readFileSync('artifacts/contracts/PresaleFactory.sol/PresaleFactory.json', 'utf8')).abi;
  const PresaleFactoryBytecode = JSON.parse(fs.readFileSync('artifacts/contracts/PresaleFactory.sol/PresaleFactory.json', 'utf8')).bytecode;
  const PresaleFactoryFactory = new ethers.ContractFactory(PresaleFactoryABI, PresaleFactoryBytecode, signer);
  const presaleFactory = await PresaleFactoryFactory.deploy(tokenLockAddr);
  await presaleFactory.waitForDeployment?.();
  const presaleFactoryAddr = await presaleFactory.getAddress?.() || presaleFactory.address;
  console.log(`✓ PresaleFactory deployed at: ${presaleFactoryAddr}`);
  
  // Deploy Vesting
  console.log('\n3. Deploying Vesting...');
  const VestingABI = JSON.parse(fs.readFileSync('artifacts/contracts/Vesting.sol/Vesting.json', 'utf8')).abi;
  const VestingBytecode = JSON.parse(fs.readFileSync('artifacts/contracts/Vesting.sol/Vesting.json', 'utf8')).bytecode;
  const VestingFactory = new ethers.ContractFactory(VestingABI, VestingBytecode, signer);
  const vesting = await VestingFactory.deploy(signer.address);
  await vesting.waitForDeployment?.();
  const vestingAddr = await vesting.getAddress?.() || vesting.address;
  console.log(`✓ Vesting deployed at: ${vestingAddr}`);
  
  // Deploy TreasuryTimelock
  console.log('\n4. Deploying TreasuryTimelock...');
  const TreasuryTimelockABI = JSON.parse(fs.readFileSync('artifacts/contracts/TreasuryTimelock.sol/TreasuryTimelock.json', 'utf8')).abi;
  const TreasuryTimelockBytecode = JSON.parse(fs.readFileSync('artifacts/contracts/TreasuryTimelock.sol/TreasuryTimelock.json', 'utf8')).bytecode;
  const TreasuryTimelockFactory = new ethers.ContractFactory(TreasuryTimelockABI, TreasuryTimelockBytecode, signer);
  const treasuryTimelock = await TreasuryTimelockFactory.deploy(signer.address);
  await treasuryTimelock.waitForDeployment?.();
  const treasuryTimelockAddr = await treasuryTimelock.getAddress?.() || treasuryTimelock.address;
  console.log(`✓ TreasuryTimelock deployed at: ${treasuryTimelockAddr}`);
  
  // Verify all contracts deployed
  console.log('\n✅ All contracts deployed successfully!');
  console.log('\nDeployment Summary:');
  console.log(`  TokenLock:        ${tokenLockAddr}`);
  console.log(`  PresaleFactory:   ${presaleFactoryAddr}`);
  console.log(`  Vesting:          ${vestingAddr}`);
  console.log(`  TreasuryTimelock: ${treasuryTimelockAddr}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: 'hardhat',
    timestamp: new Date().toISOString(),
    deployer: signer.address,
    contracts: {
      TokenLock: tokenLockAddr,
      PresaleFactory: presaleFactoryAddr,
      Vesting: vestingAddr,
      TreasuryTimelock: treasuryTimelockAddr
    }
  };
  
  console.log('\nDeployment Info (save for later):');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
