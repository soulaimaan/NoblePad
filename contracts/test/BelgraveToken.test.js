import { expect } from 'chai';
import hre from 'hardhat';

const { ethers } = hre;

describe('Belgrave Contracts', function () {
    let presaleFactory, tokenLock, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy TokenLock
        const TokenLock = await ethers.getContractFactory('TokenLock');
        tokenLock = await TokenLock.deploy();
        await tokenLock.waitForDeployment();

        // Deploy PresaleFactory
        const PresaleFactory = await ethers.getContractFactory('PresaleFactory');
        presaleFactory = await PresaleFactory.deploy(await tokenLock.getAddress());
        await presaleFactory.waitForDeployment();
    });

    describe('PresaleFactory', function () {
        it('should deploy successfully', async function () {
            expect(await presaleFactory.getAddress()).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe('TokenLock', function () {
        it('should deploy successfully', async function () {
            expect(await tokenLock.getAddress()).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe('Vesting', function () {
        it('should deploy successfully', async function () {
            const Vesting = await ethers.getContractFactory('Vesting');
            const vesting = await Vesting.deploy(owner.address);
            await vesting.waitForDeployment();

            expect(await vesting.getAddress()).to.not.equal(ethers.ZeroAddress);
        });
    });
});
