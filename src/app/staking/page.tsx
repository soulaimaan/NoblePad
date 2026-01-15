'use client'

import { TIER_CONFIG, useTier } from '@/components/providers/TierProvider'
import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { getContractAddress } from '@/lib/contracts'
import { belgraveService } from '@/lib/xrpl/belgraveService'
import { useState, useCallback, useMemo } from 'react'

export default function StakingPage() {
    const { isConnected, chainType, address, signer, chain } = useAccount()
    const { requestSignature } = useUnifiedWallet()
    const { currentTier, totalStaked, refresh } = useTier()
    const [amount, setAmount] = useState('')
    const [isLocking, setIsLocking] = useState(false)

    const handleLock = useCallback(async () => {
        if (!amount || isNaN(Number(amount))) return
        if (!address) return

        setIsLocking(true)
        try {
            // Updated to 6 months (15,555,200 seconds) as per Roadmap
            const txjson = belgraveService.constructLockPayload(address, Number(amount), 15552000)
            const result = await requestSignature(txjson)
            console.log("Xaman Sign Result:", result)

            setTimeout(() => refresh(), 5000)
            setAmount('')
        } catch (e: any) {
            console.error("Lock/Sign failed", e)
        } finally {
            setIsLocking(false)
        }
    }, [amount, address, requestSignature, refresh])

    const handleStakeEVM = useCallback(async () => {
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
        } finally {
            setIsLocking(false)
        }
    }, [amount, signer, chain, address, refresh])

    const tierBadge = useMemo(() => {
        const config = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG] || { color: 'text-gray-500', label: 'None' }
        return (
            <div className={`px-6 py-3 rounded-xl border border-white/10 bg-white/5 ${config.color}`}>
                <p className="text-xs font-bold uppercase tracking-wider">Current Status</p>
                <p className="text-2xl font-bold">{config.label}</p>
            </div>
        )
    }, [currentTier])

    const infoCard = useMemo(() => (
        <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
            <h2 className="text-xl font-bold text-white mb-6">Your Vault</h2>

            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-noble-gold/60">Total {chainType === 'xrpl' ? 'Locked' : 'Staked'}</span>
                    <span className="text-2xl font-bold text-white">{totalStaked.toLocaleString()} <span className="text-sm text-noble-gold">BELGRAVE</span></span>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Tier Requirements</h3>
                    {['GOLD', 'SILVER', 'BRONZE'].map((tier) => (
                        <div key={tier} className="flex justify-between text-sm">
                            <span className={TIER_CONFIG[tier as keyof typeof TIER_CONFIG].color}>{TIER_CONFIG[tier as keyof typeof TIER_CONFIG].label}</span>
                            <span className="text-gray-400">{TIER_CONFIG[tier as keyof typeof TIER_CONFIG].threshold.toLocaleString()} BELGRAVE</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ), [totalStaked, chainType])

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
                {tierBadge}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {chainType === 'xrpl' ? 'Lock Belgrave (XRPL)' : 'Stake Belgrave (EVM)'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-noble-gold/60 mb-2">
                                Amount to {chainType === 'xrpl' ? 'Lock' : 'Stake'} (BELGRAVE)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50"
                                placeholder="0.00"
                            />

                            <div className="bg-blue-500/10 p-4 rounded-lg text-sm text-blue-300 mt-4 mb-4">
                                {chainType === 'xrpl' ? (
                                    <>ℹ️ Tokens will be locked in a <strong>6-month Escrow</strong> to qualify for tiers.</>
                                ) : (
                                    <>ℹ️ Tokens will be staked in the smart contract to qualify for tiers.</>
                                )}
                            </div>

                            <Button
                                className="w-full h-12 text-lg bg-noble-gold text-black hover:bg-noble-gold/90 font-bold"
                                onClick={chainType === 'xrpl' ? handleLock : handleStakeEVM}
                                disabled={isLocking}
                            >
                                {isLocking ? 'Processing...' : chainType === 'xrpl' ? 'Lock BELGRAVE' : 'Stake BELGRAVE'}
                            </Button>

                            {chainType === 'xrpl' && (
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    *Escrow locking cryptographically secures your tokens for 180 days (6 months).
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {infoCard}
            </div>
        </div>
    )
}
