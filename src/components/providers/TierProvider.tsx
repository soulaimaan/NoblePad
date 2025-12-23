'use client'

import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { belgraveService } from '@/lib/xrpl/belgraveService'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
// TODO: Import EVM Staking hooks when available

export type TierLevel = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD'

// Tier Thresholds (in BELGRAVE)
export const TIER_THRESHOLDS = {
    GOLD: 100000,
    SILVER: 50000,
    BRONZE: 10000
}

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

    const calculateTier = (amount: number): TierLevel => {
        if (amount >= TIER_THRESHOLDS.GOLD) return 'GOLD'
        if (amount >= TIER_THRESHOLDS.SILVER) return 'SILVER'
        if (amount >= TIER_THRESHOLDS.BRONZE) return 'BRONZE'
        return 'NONE'
    }

    const refresh = async () => {
        if (!isConnected || !address) {
            setTotalStaked(0)
            setCurrentTier('NONE')
            return
        }

        setIsLoading(true)
        try {
            let stakedAmount = 0

            // 1. Fetch XRPL Escrow Balance (if connected or address available)
            // Even if connected via EVM, if we knew the linked XRPL address we could check, 
            // but for now we assume user must be connected with the specific wallet to see that specific stake
            if (chainType === 'xrpl') {
                const xrplLocked = await belgraveService.getLockedBalance(address)
                stakedAmount += xrplLocked
            }
            
            // 2. Fetch EVM Staking Balance (ToDo)
            // if (chainType === 'evm') {
            //    const evmStaked = await stakingContract.balanceOf(address)
            //    stakedAmount += evmStaked
            // }

            setTotalStaked(stakedAmount)
            setCurrentTier(calculateTier(stakedAmount))
        } catch (e) {
            console.error("Failed to refresh tier:", e)
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-refresh when wallet changes
    useEffect(() => {
        refresh()
    }, [address, isConnected, chainType])

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
