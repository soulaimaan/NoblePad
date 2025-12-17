const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NoblePad Contracts', function () {
  let presaleFactory, tokenLock, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy TokenLock
    const TokenLock = await ethers.getContractFactory('TokenLock');
    tokenLock = await TokenLock.deploy();

    // Deploy PresaleFactory
    const PresaleFactory = await ethers.getContractFactory('PresaleFactory');
    presaleFactory = await PresaleFactory.deploy(tokenLock.target);
  });

  describe('PresaleFactory', function () {
    it('should create a presale', async function () {
      const tx = await presaleFactory.createPresale(
        addr1.address, // token
        addr2.address, // router
        100, // softCap
        200, // hardCap
        1, // presaleRate
        1, // listingRate
        60, // liquidityPercent
        Math.floor(Date.now() / 1000) + 3600, // startTime
        Math.floor(Date.now() / 1000) + 7200, // endTime
        12 * 30 * 24 * 60 * 60, // lockPeriod
        10, // maxSpendPerBuyer
        1000, // amount
        { value: ethers.parseEther('0.01') }
      );

      const receipt = await tx.wait();
      const logs = receipt.logs;
      expect(logs.length).to.be.greaterThan(0);
    });
  });

  describe('TokenLock', function () {
    it('should lock tokens', async function () {
      const unlockTime = Math.floor(Date.now() / 1000) + 3600;
      const tx = await tokenLock.lockTokens(
        addr1.address, // token
        1000n, // amount (BigInt)
        unlockTime, // unlockTime
        'Test lock'
      );
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
    });
  });

  describe('Vesting', function () {
    it('should create a vesting schedule', async function () {
      const Vesting = await ethers.getContractFactory('Vesting');
      const vesting = await Vesting.deploy(owner.address);

      const start = Math.floor(Date.now() / 1000);
      const cliff = 30 * 24 * 60 * 60; // 30 days
      const duration = 365 * 24 * 60 * 60; // 365 days

      const tx = await vesting.createVesting(
        addr1.address,
        addr2.address,
        1000n,
        start,
        cliff,
        duration
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
    });
  });
});
