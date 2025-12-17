const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy TokenLock
  const TokenLock = await ethers.getContractFactory('TokenLock');
  const tokenLock = await TokenLock.deploy();
  await tokenLock.deployed();
  console.log('TokenLock deployed to:', tokenLock.address);

  // Deploy PresaleFactory
  const PresaleFactory = await ethers.getContractFactory('PresaleFactory');
  const presaleFactory = await PresaleFactory.deploy(tokenLock.address);
  await presaleFactory.deployed();
  console.log('PresaleFactory deployed to:', presaleFactory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
