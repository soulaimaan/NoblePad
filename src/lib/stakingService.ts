import { ethers } from 'ethers';
import { STAKING_ABI, ERC20_ABI, getContractAddress } from './contracts';
import { getChainById } from './chains';

export interface StakingInfo {
    totalStaked: string;
    userStaked: string;
    stakingTokenAddress: string;
    stakingTokenSymbol: string;
    stakingTokenDecimals: number;
}

export class StakingService {
    private getProvider(chainId: number) {
        const chain = getChainById(chainId);
        if (!chain) throw new Error(`Chain ${chainId} not supported`);
        return new ethers.JsonRpcProvider(chain.rpcUrls[0]);
    }

    async getStakingInfo(userAddress: string | undefined, chainId: number): Promise<StakingInfo> {
        try {
            const stakingAddress = getContractAddress(chainId, 'staking');
            if (!stakingAddress) throw new Error("Staking contract not found for this chain");

            const provider = this.getProvider(chainId);
            const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);

            const [totalSupply, stakingTokenAddr] = await Promise.all([
                stakingContract.totalSupply(),
                stakingContract.stakingToken()
            ]);

            let userStaked = 0n;
            if (userAddress) {
                userStaked = await stakingContract.stakedBalance(userAddress);
            }

            // Get Token Info
            const tokenContract = new ethers.Contract(stakingTokenAddr, ERC20_ABI, provider);
            const [symbol, decimals] = await Promise.all([
                tokenContract.symbol(),
                tokenContract.decimals()
            ]);

            return {
                totalStaked: ethers.formatUnits(totalSupply, decimals),
                userStaked: ethers.formatUnits(userStaked, decimals),
                stakingTokenAddress: stakingTokenAddr,
                stakingTokenSymbol: symbol,
                stakingTokenDecimals: Number(decimals)
            };
        } catch (error) {
            console.error("Error fetching staking info:", error);
            return {
                totalStaked: '0',
                userStaked: '0',
                stakingTokenAddress: '',
                stakingTokenSymbol: '',
                stakingTokenDecimals: 18
            };
        }
    }

    async stake(amount: string, signer: ethers.Signer, chainId: number) {
        const stakingAddress = getContractAddress(chainId, 'staking');
        if (!stakingAddress) throw new Error("Staking contract not found");

        const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, signer);

        // Check Allowance First
        const tokenAddress = await stakingContract.stakingToken();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const weiAmount = ethers.parseUnits(amount, decimals);

        const userAddress = await signer.getAddress();
        const allowance = await tokenContract.allowance(userAddress, stakingAddress);

        if (allowance < weiAmount) {
            console.log("Approving staking token...");
            const txApprove = await tokenContract.approve(stakingAddress, weiAmount);
            await txApprove.wait();
            console.log("Approved");
        }

        const tx = await stakingContract.stake(weiAmount);
        return tx.wait();
    }

    async withdraw(amount: string, signer: ethers.Signer, chainId: number) {
        const stakingAddress = getContractAddress(chainId, 'staking');
        if (!stakingAddress) throw new Error("Staking contract not found");

        const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, signer);

        // We need decimals to parse amount correctly
        const tokenAddress = await stakingContract.stakingToken();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer); // Provider is enough for decimals but we have signer
        const decimals = await tokenContract.decimals();

        const weiAmount = ethers.parseUnits(amount, decimals);
        const tx = await stakingContract.withdraw(weiAmount);
        return tx.wait();
    }
}

const stakingService = new StakingService();
export default stakingService;
