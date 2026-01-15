'use client'

import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { getContractAddress } from '@/lib/contracts'
import { belgraveService } from '@/lib/xrpl/belgraveService'
import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react'
// TODO: Import EVM Staking hooks when available

import { TIER_CONFIG, TierLevel, STAKE_LOCK_PERIOD } from '@/lib/tierConfig'
export { TIER_CONFIG, type TierLevel, STAKE_LOCK_PERIOD }


// TIER_THRESHOLDS removed in favor of direct TIER_CONFIG usage

// Lock period imported from config

interface TierContextType {
    currentTier: TierLevel
    totalStaked: number
    isLoading: boolean
    refresh: () => Promise<void>
}

const TierContext = createContext<TierContextType | null>(null)

export function TierProvider({ children }: { children: ReactNode }) {
    const { address, isConnected, chainType } = useUnifiedWallet()
    const [currentTier, setCurrentTier] = useState<TierLevel>('NONE')
    const [totalStaked, setTotalStaked] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const calculateTier = useCallback((amount: number): TierLevel => {
        if (amount >= TIER_CONFIG.GOLD.threshold) return 'GOLD'
        if (amount >= TIER_CONFIG.SILVER.threshold) return 'SILVER'
        if (amount >= TIER_CONFIG.BRONZE.threshold) return 'BRONZE'
        return 'NONE'
    }, [])

    const refresh = useCallback(async () => {
        if (!isConnected || !address) {
            setTotalStaked(prev => prev !== 0 ? 0 : prev)
            setCurrentTier(prev => prev !== 'NONE' ? 'NONE' : prev)
            return
        }

        setIsLoading(true)

        // Safety timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tier fetch timeout')), 10000)
        )

        try {
            await Promise.race([
                (async () => {
                    let stakedAmount = 0
                    console.log("TierProvider: Refreshing...", { chainType, address, isConnected })

                    // 1. Fetch XRPL Qualifying Balance (Liquid + Locked)
                    const isXrplAddress = address?.startsWith('r');
                    if (chainType === 'xrpl' || isXrplAddress) {
                        try {
                            const xrplTotal = await belgraveService.getQualifyingBalance(address)
                            stakedAmount += xrplTotal
                        } catch (e) {
                            console.warn("XRPL Stake fetch failed:", e)
                        }
                    }

                    // 2. Fetch EVM Staking Balance
                    if (chainType === 'evm') {
                        try {
                            // Dynamic import only when needed
                            const { ethers } = await import('ethers')
                            let provider
                            if (typeof window !== 'undefined' && (window as any).ethereum) {
                                provider = new ethers.BrowserProvider((window as any).ethereum)
                            } else {
                                provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
                            }

                            const chainId = 31337
                            const stakingAddr = getContractAddress(chainId, 'staking')

                            if (stakingAddr) {
                                const abi = ["function stakedBalance(address) view returns (uint256)"]
                                const contract = new ethers.Contract(stakingAddr, abi, provider)
                                const bal = await contract.stakedBalance(address)
                                stakedAmount += Number(ethers.formatEther(bal))
                            }
                        } catch (evmError) {
                            console.warn("EVM Staking fetch error:", evmError)
                        }
                    }

                    setTotalStaked(prev => prev !== stakedAmount ? stakedAmount : prev)
                    const newTier = calculateTier(stakedAmount)
                    setCurrentTier(prev => prev !== newTier ? newTier : prev)
                })(),
                timeoutPromise
            ])
        } catch (e) {
            console.error("Failed to refresh tier:", e)
        } finally {
            setIsLoading(false)
        }
    }, [address, isConnected, chainType, calculateTier])

    // Auto-refresh when wallet changes
    useEffect(() => {
        refresh()
    }, [refresh])

    return (
        <TierContext.Provider value={{
            currentTier,
            totalStaked,
            isLoading,
            refresh
        }}>
            {children}
        </TierContext.Provider>
    )
}

export const useTier = () => {
    const context = useContext(TierContext)
    if (!context) throw new Error("useTier must be used within TierProvider")
    return context
}
