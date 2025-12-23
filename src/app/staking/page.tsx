'use client'

import { useTier } from '@/components/providers/TierProvider'
import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { belgraveService } from '@/lib/xrpl/belgraveService'
import { useState } from 'react'

export default function StakingPage() {
    const { isConnected, chainType, address } = useUnifiedWallet()
    const { currentTier, totalStaked, refresh } = useTier()
    const [amount, setAmount] = useState('')
    const [isLocking, setIsLocking] = useState(false)

    const handleLock = async () => {
        if (!amount || isNaN(Number(amount))) return
        setIsLocking(true)
        try {
            // Lock for 1 year (31536000 seconds) or custom duration
            // For now hardcoded to 3 months (7776000) for demo
            await belgraveService.lockTokens(Number(amount), 7776000)
            
            // Wait a bit for ledger propagation then refresh
            setTimeout(() => refresh(), 5000)
            setAmount('')
        } catch (e) {
            console.error("Lock validation failed", e)
            alert("Failed to lock tokens. See console.")
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
                {/* Staking Card */}
                <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
                    <h2 className="text-xl font-bold text-white mb-6">Lock Belgrave</h2>
                    
                    {chainType !== 'xrpl' ? (
                        <div className="text-center py-8 text-red-400 bg-red-500/10 rounded-lg">
                            ⚠️ Please switch to **XRPL** to stake Belgrave.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-noble-gold/60 mb-2">Amount to Lock (BELGRAVE)</label>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50"
                                    placeholder="0.00"
                                />
                            </div>
                            
                            <div className="bg-blue-500/10 p-4 rounded-lg text-sm text-blue-300">
                                ℹ️ Tokens will be locked in a native **XRPL Escrow** for 3 months.
                            </div>

                            <Button 
                                className="w-full h-12 text-lg bg-noble-gold text-black hover:bg-noble-gold/90 font-bold"
                                onClick={handleLock}
                                disabled={isLocking}
                            >
                                {isLocking ? 'Creating Escrow...' : 'Lock Tokens'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-noble-gray/30 rounded-2xl p-6 border border-noble-gold/10">
                     <h2 className="text-xl font-bold text-white mb-6">Your Vault</h2>
                     
                     <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-noble-gold/60">Total Locked</span>
                            <span className="text-2xl font-bold text-white">{totalStaked.toLocaleString()} <span className="text-sm text-noble-gold">BLGRV</span></span>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white">Tier Requirements</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-yellow-500">Gold</span>
                                <span className="text-gray-400">100,000 BLGRV</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Silver</span>
                                <span className="text-gray-400">50,000 BLGRV</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600">Bronze</span>
                                <span className="text-gray-400">10,000 BLGRV</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    )
}
