'use client'

import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { getContractAddress } from '@/lib/contracts'
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
        
        // Safety timeout to ensure we don't hang indefinitely (fixes Opera issues)
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
                       console.log("TierProvider: Fetching XRPL Balance (Chain matches or Address matches)...")
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
       
                   setTotalStaked(stakedAmount)
                   setCurrentTier(calculateTier(stakedAmount))
                })(),
                timeoutPromise
            ])
        } catch (e) {
            console.error("Failed to refresh tier:", e)
            // Keep previous data on error
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
