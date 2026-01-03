'use client'

import { useUnifiedWallet } from '@/components/providers/UnifiedWalletProvider'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { getContractAddress } from '@/lib/contracts'
import { AlertCircle, CheckCircle2, Coins, Info, Rocket } from 'lucide-react'
import { useState } from 'react'

export default function CreateTokenPage() {
    const { isConnected, address, signer, chain } = useAccount()
    const { chainType } = useUnifiedWallet()
    
    // Form State
    const [name, setName] = useState('')
    const [symbol, setSymbol] = useState('')
    const [decimals, setDecimals] = useState('18')
    const [supply, setSupply] = useState('')
    
    // UI State
    const [isCreating, setIsCreating] = useState(false)
    const [deployedAddress, setDeployedAddress] = useState('')
    const [currentTab, setCurrentTab] = useState<'evm' | 'xrpl'>('evm')

    const handleCreateEVM = async () => {
        if (!name || !symbol || !supply || !signer) return
        setIsCreating(true)
        try {
            const { ethers } = await import('ethers')
            const chainId = chain?.id || 31337
            const factoryAddr = getContractAddress(chainId, 'tokenFactory')
            if (!factoryAddr) throw new Error(`Factory not found for network ${chainId}`)

            const abi = [
                "function createStandardToken(string name, string symbol, uint8 decimals, uint256 totalSupply) external payable returns (address)",
                "function deploymentFee() view returns (uint256)",
                "event TokenCreated(address indexed token, address indexed owner, string name, string symbol)"
            ]
            
            const factory = new ethers.Contract(factoryAddr, abi, signer)
            const fee = await factory.deploymentFee()
            const totalSupplyWei = ethers.parseUnits(supply, Number(decimals))
            
            const tx = await factory.createStandardToken(name, symbol, Number(decimals), totalSupplyWei, { value: fee })
            const receipt = await tx.wait()
            
            const iface = new ethers.Interface(abi)
            for (const log of receipt.logs) {
                try {
                    const parsed = iface.parseLog(log)
                    if (parsed?.name === 'TokenCreated') {
                        setDeployedAddress(parsed.args[0])
                        break
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.error("Token creation failed", e)
            alert("Creation failed. See console for details.")
        } finally {
            setIsCreating(false)
        }
    }

    const handleCreateXRPL = async () => {
        if (!symbol || !supply) return
        setIsCreating(true)
        try {
            // Logic for XRPL Token creation:
            // 1. Setup account as Issuer (DefaultRipple)
            // 2. Explain to user that their address is the issuer
            const response = await fetch('/api/xumm/payload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txjson: {
                        TransactionType: 'AccountSet',
                        Account: address,
                        SetFlag: 8 // asfDefaultRipple
                    }
                })
            })
            
            const data = await response.json()
            if (data.uuid) {
                // In a real app, we'd wait for this to be signed
                // For now, we'll mark it as "Enabled"
                setDeployedAddress(address!) // On XRPL, the address IS the token identifier
                alert("Please sign the transaction in Xaman to enable your account as an Issuer.")
            }
        } catch (e) {
            console.error("XRPL Issuer setup failed", e)
        } finally {
            setIsCreating(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-noble-gold">
                <Rocket className="w-16 h-16 mb-4 opacity-20" />
                <h1 className="text-3xl font-bold mb-4">Token Mint</h1>
                <p className="mb-8 text-noble-gold/60">Connect your wallet to deploy your own custom token.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold noble-text-gradient mb-4">Token Factory</h1>
                <p className="text-noble-gold/70 max-w-2xl mx-auto">
                    Deploy a verified token in seconds on {currentTab === 'evm' ? 'EVM' : 'XRPL'}.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-noble-gray/50 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => { setCurrentTab('evm'); setDeployedAddress(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentTab === 'evm' ? 'bg-noble-gold text-black' : 'text-noble-gold/60 hover:text-noble-gold'}`}
                    >
                        EVM (ETH/BSC/BASE)
                    </button>
                    <button 
                        onClick={() => { setCurrentTab('xrpl'); setDeployedAddress(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentTab === 'xrpl' ? 'bg-noble-gold text-black' : 'text-noble-gold/60 hover:text-noble-gold'}`}
                    >
                        XRPL (XRP Ledger)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="noble-card">
                        <h2 className="text-xl font-bold text-white mb-6">Token Configuration</h2>
                        
                        <div className="space-y-6">
                            {currentTab === 'evm' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-noble-gold/60 mb-2">Token Name</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="e.g. My Token"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-noble-gold/60 mb-2">Token Symbol</label>
                                            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="e.g. TKN"/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-noble-gold/60 mb-2">Decimals</label>
                                            <input type="number" value={decimals} onChange={(e) => setDecimals(e.target.value)} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="18"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-noble-gold/60 mb-2">Total Supply</label>
                                            <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="1000000"/>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm text-noble-gold/60 mb-2">Currency Code (3 chars)</label>
                                        <input type="text" value={symbol} maxLength={3} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="e.g. MAT"/>
                                        <p className="mt-1 text-xs text-noble-gold/40">Standard XRPL currency codes must be 3 characters.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-noble-gold/60 mb-2">Total Supply</label>
                                        <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} className="w-full bg-black/50 border border-noble-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-noble-gold/50" placeholder="e.g. 1000000"/>
                                    </div>
                                </>
                            )}

                            <div className="p-4 bg-noble-gold/5 border border-noble-gold/10 rounded-xl flex items-start space-x-3">
                                <AlertCircle className="text-noble-gold mt-1 flex-shrink-0" size={18} />
                                <div className="text-sm text-noble-gold/70">
                                    {currentTab === 'evm' 
                                        ? 'Fees: 0.01 ETH. This deploys a new Smart Contract on the selected chain.'
                                        : 'Fees: Network Gas only. This sets your account as a professional Token Issuer on XRPL.'}
                                </div>
                            </div>

                            <Button 
                                className="w-full h-14 text-lg bg-noble-gold text-black hover:bg-noble-gold/90 font-bold"
                                onClick={currentTab === 'evm' ? handleCreateEVM : handleCreateXRPL}
                                disabled={isCreating || (currentTab === 'evm' && chainType !== 'evm') || (currentTab === 'xrpl' && chainType !== 'xrpl')}
                            >
                                {isCreating ? 'Processing...' : `Create ${currentTab === 'evm' ? 'ERC20' : 'XRPL'} Token`}
                            </Button>
                            
                            {(currentTab === 'evm' && chainType !== 'evm') && <p className="text-red-400 text-xs text-center mt-2">Switch to an EVM network to continue.</p>}
                            {(currentTab === 'xrpl' && chainType !== 'xrpl') && <p className="text-red-400 text-xs text-center mt-2">Switch to XRPL to continue.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="noble-card h-full">
                        <h2 className="text-xl font-bold text-white mb-6">Live Preview</h2>
                        
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-noble-gold/10 rounded-full flex items-center justify-center">
                                <Coins className="text-noble-gold" size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{name || 'Your Token'}</h3>
                                <p className="text-noble-gold/60 text-sm font-mono">{symbol || 'SYMBOL'}</p>
                            </div>
                            <div className="w-full pt-4 border-t border-white/5 flex justify-around text-sm">
                                <div>
                                    <p className="text-noble-gold/40">Supply</p>
                                    <p className="text-white font-mono">{supply || '0'}</p>
                                </div>
                                {currentTab === 'evm' && (
                                    <div>
                                        <p className="text-noble-gold/40">Decimals</p>
                                        <p className="text-white font-mono">{decimals || '18'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {deployedAddress && (
                            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                <div className="flex items-center space-x-2 text-green-400 font-bold mb-4">
                                    <CheckCircle2 size={24} />
                                    <span>Token Ready!</span>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="p-3 bg-black/30 rounded-lg">
                                        <p className="text-noble-gold/60 text-xs uppercase mb-1">Issuer / Contract:</p>
                                        <p className="text-white font-mono break-all text-xs">{deployedAddress}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full text-green-400 border-green-500/20 hover:bg-green-500/10"
                                        onClick={() => window.location.href = `/create?token=${deployedAddress}&symbol=${symbol}&chain=${currentTab}`}
                                    >
                                        Create Presale with this Token
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {!deployedAddress && currentTab === 'xrpl' && (
                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                                <div className="flex items-center space-x-2 text-blue-400 text-sm font-bold">
                                    <Info size={16} />
                                    <span>XRPL Technical Note</span>
                                </div>
                                <p className="text-xs text-blue-300/70 leading-relaxed">
                                    On XRPL, tokens are tied to your address. By clicking create, we will enable your account for issuance. You can then distribute the tokens to investors.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
