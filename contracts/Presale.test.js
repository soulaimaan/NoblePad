const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PresaleFactory & Presale', function () {
  let factory, tokenLock, owner, addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    const TokenLock = await ethers.getContractFactory('TokenLock');
    tokenLock = await TokenLock.deploy();
    await tokenLock.deployed();
    const PresaleFactory = await ethers.getContractFactory('PresaleFactory');
    factory = await PresaleFactory.deploy(tokenLock.address);
    await factory.deployed();
  });

  it('should deploy a Presale contract', async function () {
    const tx = await factory.createPresale(
      addr1.address, // token
      addr1.address, // router
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
      [], // teamVesting
      { value: ethers.utils.parseEther('0.01') }
    );
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'PresaleCreated');
    expect(event).to.not.be.undefined;
    expect(event.args.presale).to.not.equal(ethers.constants.AddressZero);
  });

  it('should lock tokens in TokenLock', async function () {
    const tx = await tokenLock.lockTokens(
      addr1.address,
      1000,
      Math.floor(Date.now() / 1000) + 3600,
      'Team lock'
    );
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'TokensLocked');
    expect(event).to.not.be.undefined;
    expect(event.args.lockId).to.equal(0);
  });
});
