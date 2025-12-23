import { ethers } from 'ethers';
import { getChainById } from './chains';
import { ERC20_ABI, getContractAddress, STAKING_ABI } from './contracts';

export interface StakingInfo {
    totalStaked: string;
    userStaked: string;
    userBalance: string; // Added wallet balance
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

    async getStakingInfo(userAddress: string | undefined, chainId: string | number): Promise<StakingInfo> {
        // Mock return for XRPL for now to prevent crash
        // XRPL Implementation
        if (chainId === 'xrpl') {
            let userBalance = '0'
            const userStaked = '0' // Staking logic to be defined (e.g. Escrow or AMM LP)

            if (userAddress) {
                try {
                    // Dynamic import to avoid cycles or server-side issues if applicable
                    const { xamanService } = await import('./xrpl/xamanService')
                    const bal = await xamanService.getBalance(userAddress)
                    userBalance = bal.toString()
                } catch (e) {
                    console.error("Failed to fetch XRPL balance for staking info", e)
                }
            }

            return {
                totalStaked: '1000000', // Mock global staked for now
                userStaked: userStaked,
                userBalance: userBalance,
                stakingTokenAddress: 'rNoblePad...Token', // Needs actual Issuer Address
                stakingTokenSymbol: 'NPAD',
                stakingTokenDecimals: 6
            }
        }

        try {
            // Ensure numeric chain ID for EVM logic
            const numericId = typeof chainId === 'string' ? parseInt(chainId) : chainId
            if (isNaN(numericId)) throw new Error(`Invalid EVM Chain ID: ${chainId}`)

            const stakingAddress = getContractAddress(numericId, 'staking');
            if (!stakingAddress) throw new Error("Staking contract not found for this chain");

            const provider = this.getProvider(numericId);
            const stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);

            const [totalSupply, stakingTokenAddr] = await Promise.all([
                stakingContract.totalSupply(),
                stakingContract.stakingToken()
            ]);

            // Get Token Info
            const tokenContract = new ethers.Contract(stakingTokenAddr, ERC20_ABI, provider);
            const [symbol, decimals] = await Promise.all([
                tokenContract.symbol(),
                tokenContract.decimals()
            ]);

            let userStaked = BigInt(0);
            let userBalance = BigInt(0);
            if (userAddress) {
                const [staked, balance] = await Promise.all([
                    stakingContract.stakedBalance(userAddress),
                    tokenContract.balanceOf(userAddress)
                ]);
                userStaked = staked;
                userBalance = balance;
            }

            return {
                totalStaked: ethers.formatUnits(totalSupply, decimals),
                userStaked: ethers.formatUnits(userStaked, decimals),
                userBalance: ethers.formatUnits(userBalance, decimals),
                stakingTokenAddress: stakingTokenAddr,
                stakingTokenSymbol: symbol,
                stakingTokenDecimals: Number(decimals)
            };
        } catch (error) {
            console.error("Error fetching staking info:", error);
            return {
                totalStaked: '0',
                userStaked: '0',
                userBalance: '0',
                stakingTokenAddress: '',
                stakingTokenSymbol: '',
                stakingTokenDecimals: 18
            };
        }
    }

    async stake(amount: string, signer: ethers.Signer, chainId: string | number) {
        if (chainId === 'xrpl') {
            console.log("XRPL Staking not implemented yet")
            return
        }
        
        const numericId = typeof chainId === 'string' ? parseInt(chainId) : chainId
        if (isNaN(numericId)) throw new Error(`Invalid EVM Chain ID: ${chainId}`)

        const stakingAddress = getContractAddress(numericId, 'staking');
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

    async withdraw(amount: string, signer: ethers.Signer, chainId: string | number) {
        if (chainId === 'xrpl') {
            console.log("XRPL Withdraw not implemented yet")
            return
        }
        
        const numericId = typeof chainId === 'string' ? parseInt(chainId) : chainId
        if (isNaN(numericId)) throw new Error(`Invalid EVM Chain ID: ${chainId}`)

        const stakingAddress = getContractAddress(numericId, 'staking');
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
