'use client'

import { useTier } from '@/components/providers/TierProvider'
import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { getContractAddress } from '@/lib/contracts'
import { belgraveService } from '@/lib/xrpl/belgraveService'
import { useState } from 'react'

export default function StakingPage() {
    const { isConnected, chainType, address, signer, chain } = useAccount()
    const { requestSignature } = useUnifiedWallet()
    const { currentTier, totalStaked, refresh } = useTier()
    const [amount, setAmount] = useState('')
    const [isLocking, setIsLocking] = useState(false)

    const handleLock = async () => {
        if (!amount || isNaN(Number(amount))) return
        if (!address) return
        
        setIsLocking(true)
        try {
            // Lock for 1 year (31536000 seconds) or custom duration
            // For now hardcoded to 3 months (7776000) for demo
            
            // New Flow: Construct Payload -> Request Signature via Xaman
            const txjson = belgraveService.constructLockPayload(address, Number(amount), 7776000)
            const result = await requestSignature(txjson)
            console.log("Xaman Sign Result:", result)
            
            // Wait a bit for ledger propagation then refresh
            setTimeout(() => refresh(), 5000)
            setAmount('')
        } catch (e: any) {
            console.error("Lock/Sign failed", e)
            alert(`Failed to lock tokens: ${e.message || e}`)
        } finally {
            setIsLocking(false)
        }
    }

    const handleStakeEVM = async () => {
        if (!amount || isNaN(Number(amount)) || !signer) return
        setIsLocking(true)
        try {
            const { ethers } = await import('ethers')
            const chainId = chain?.id || 31337
            const stakingAddr = getContractAddress(chainId, 'staking')
            const belgraveAddr = getContractAddress(chainId, 'belgrave')
            
            if (!stakingAddr || !belgraveAddr) throw new Error("Staking addresses not found for this network")
            
            const erc20Abi = ["function approve(address spender, uint256 amount) returns (bool)", "function allowance(address owner, address spender) view returns (uint256)"]
            const stakingAbi = ["function stake(uint256 amount)"]
            
            const belgraveContract = new ethers.Contract(belgraveAddr, erc20Abi, signer)
            const stakingContract = new ethers.Contract(stakingAddr, stakingAbi, signer)
            
            const amountWei = ethers.parseEther(amount)
            
            // Check allowance
            const allowance = await belgraveContract.allowance(address, stakingAddr)
            if (allowance < amountWei) {
                const tx = await belgraveContract.approve(stakingAddr, amountWei)
                await tx.wait()
            }
            
            const tx = await stakingContract.stake(amountWei)
            await tx.wait()
            
            await refresh()
            setAmount('')
        } catch (e) {
            console.error("EVM Staking failed", e)
            alert("Staking failed. Make sure you are on the right network.")
        } finally {
            setIsLocking(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-noble-gold">
                <h1 className="text-3xl font-bold mb-4">Belgrave Staking Vault</h1>
                <p className="mb-8 text-noble-gold/60">Connect your wallet to access the Inner Circle.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Staking Hub</h1>
                    <p className="text-noble-gold/60">Manage your Belgrave Holdings and Tier Status</p>
                </div>
                
                <div className={`
                    px-6 py-3 rounded-xl border border-white/10
                    ${currentTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500' : 
                      currentTier === 'SILVER' ? 'bg-gray-400/20 text-gray-300' :
                      currentTier === 'BRONZE' ? 'bg-amber-700/20 text-amber-600' : 'bg-white/5 text-gray-500'}
                `}>
                    <p className="text-xs font-bold uppercase tracking-wider">Current Status</p>
                    <p className="text-2xl font-bold">{currentTier}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {chainType === 'xrpl' ? 'Lock Belgrave (XRPL)' : 'Stake Belgrave (EVM)'}
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            {chainType === 'xrpl' ? (
                                <div className="p-6 bg-noble-dark-gray/50 rounded-xl border border-noble-gold/20 text-center">
                                    <h3 className="text-xl font-bold text-noble-gold mb-2">XRPL Staking is currently "Hold-to-Earn"</h3>
                                    <p className="text-gray-300 mb-4">
                                        Due to pending Mainnet amendments, native token locking is temporarily unavailable. 
                                        Simply holding <strong>BELGRAVE</strong> in your wallet automatically qualifies you for Tiers.
                                    </p>
                                    <div className="flex justify-center mb-6">
                                        <div className="px-4 py-2 bg-noble-gold/10 rounded-lg border border-noble-gold/30">
                                            <span className="text-sm text-gray-400">Your Qualifying Balance:</span>
                                            <div className="text-2xl font-bold text-white mt-1">{totalStaked.toLocaleString()} BELGRAVE</div>
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full h-12 text-lg bg-noble-gold text-black hover:bg-noble-gold/90 font-bold"
                                        onClick={() => refresh()}
                                        disabled={false}
                                    >
                                        Verify Tier Status
                                    </Button>

                                    <p className="text-xs text-gray-500 mt-4">
                                        *Native Escrow Locking will be enabled once the XRPL 'TokenEscrow' amendment is live.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <label className="block text-sm text-noble-gold/60 mb-2">
                                        Amount to Stake (BELGRAVE)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50"
                                        placeholder="0.00"
                                    />
                                    
                                    <div className="bg-blue-500/10 p-4 rounded-lg text-sm text-blue-300 mt-4 mb-4">
                                        ℹ️ Tokens will be staked in the smart contract to qualify for tiers.
                                    </div>

                                    <Button 
                                        className="w-full h-12 text-lg bg-noble-gold text-black hover:bg-noble-gold/90 font-bold"
                                        onClick={handleStakeEVM}
                                        disabled={isLocking}
                                    >
                                        {isLocking ? 'Processing...' : 'Stake BELGRAVE'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
                     <h2 className="text-xl font-bold text-white mb-6">Your Vault</h2>
                     
                     <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-noble-gold/60">Total {chainType === 'xrpl' ? 'Locked' : 'Staked'}</span>
                            <span className="text-2xl font-bold text-white">{totalStaked.toLocaleString()} <span className="text-sm text-noble-gold">BELGRAVE</span></span>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white">Tier Requirements</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-yellow-500">Gold</span>
                                <span className="text-gray-400">100,000 BELGRAVE</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Silver</span>
                                <span className="text-gray-400">50,000 BELGRAVE</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600">Bronze</span>
                                <span className="text-gray-400">10,000 BELGRAVE</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    )
}
