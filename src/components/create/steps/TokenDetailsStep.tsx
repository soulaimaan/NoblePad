'use client'

import { useState, useEffect } from 'react'
import { Coins, AlertTriangle, CheckCircle, Loader, Network } from 'lucide-react'
import { SUPPORTED_CHAINS, getMainnetChains, type Chain } from '@/lib/chains'
import { presaleService } from '@/lib/presaleService'
import { Button } from '@/components/ui/Button'

interface TokenDetailsStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function TokenDetailsStep({ formData, updateFormData }: TokenDetailsStepProps) {
  const [tokenValidation, setTokenValidation] = useState<{
    isValidating: boolean
    isValid: boolean
    error: string | null
    tokenInfo: any | null
  }>({
    isValidating: false,
    isValid: false,
    error: null,
    tokenInfo: null
  })

  const [selectedChain, setSelectedChain] = useState<Chain | null>(
    formData.chainId ? Object.values(SUPPORTED_CHAINS).find(c => c.id === formData.chainId) || null : null
  )

  // Validate token when address and chain are provided
  useEffect(() => {
    if (formData.tokenAddress && formData.chainId && formData.tokenAddress.length === 42) {
      validateToken()
    } else {
      setTokenValidation({
        isValidating: false,
        isValid: false,
        error: null,
        tokenInfo: null
      })
    }
  }, [formData.tokenAddress, formData.chainId])

  const validateToken = async () => {
    setTokenValidation(prev => ({ ...prev, isValidating: true, error: null }))
    
    try {
      const result = await presaleService.validateToken(formData.tokenAddress, formData.chainId)
      
      if (result.isValid && result.tokenInfo) {
        setTokenValidation({
          isValidating: false,
          isValid: true,
          error: null,
          tokenInfo: result.tokenInfo
        })
        
        // Auto-fill token details
        updateFormData({
          tokenName: result.tokenInfo.name,
          tokenSymbol: result.tokenInfo.symbol,
          totalSupply: result.tokenInfo.totalSupply
        })
      } else {
        setTokenValidation({
          isValidating: false,
          isValid: false,
          error: result.error || 'Invalid token contract',
          tokenInfo: null
        })
      }
    } catch (error: any) {
      setTokenValidation({
        isValidating: false,
        isValid: false,
        error: error.message || 'Failed to validate token',
        tokenInfo: null
      })
    }
  }

  const handleChainSelect = (chain: Chain) => {
    setSelectedChain(chain)
    updateFormData({ chainId: chain.id })
  }
  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
          <Coins className="text-noble-black" size={16} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-noble-gold">Token Details</h2>
          <p className="text-noble-gold/70 text-sm">Configure your token specifications</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chain Selection */}
        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-3">
            <Network className="inline mr-2" size={16} />
            Select Blockchain *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getMainnetChains().map((chain) => (
              <button
                key={chain.id}
                type="button"
                onClick={() => handleChainSelect(chain)}
                className={`
                  p-4 border-2 rounded-lg transition-all duration-200 text-left
                  ${selectedChain?.id === chain.id 
                    ? 'border-noble-gold bg-noble-gold/10' 
                    : 'border-noble-gold/20 hover:border-noble-gold/40'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: chain.color }}
                  >
                    {chain.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-medium text-noble-gold">{chain.name}</div>
                    <div className="text-xs text-noble-gold/60">{chain.symbol}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedChain && (
            <div className="mt-2 p-3 bg-noble-gray/20 rounded-lg">
              <div className="text-sm text-noble-gold/70">
                Selected: <span className="text-noble-gold font-medium">{selectedChain.name}</span>
                <br />
                Minimum presale: <span className="text-noble-gold">{selectedChain.minimumPresaleAmount} {selectedChain.symbol}</span>
              </div>
            </div>
          )}
        </div>

        <div className="noble-card bg-orange-500/10 border-orange-500/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={20} />
            <div className="text-sm">
              <p className="text-orange-400 font-medium mb-1">Requirements:</p>
              <ul className="text-noble-gold/70 space-y-1">
                <li>• Token must be deployed and verified on {selectedChain?.name || 'selected blockchain'}</li>
                <li>• Contract must have sufficient tokens for presale + liquidity</li>
                <li>• Token approval for presale contract will be required</li>
                <li>• Ownership verification may be required for security</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={formData.tokenName}
              onChange={(e) => updateFormData({ tokenName: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., NobleSwap Token"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              value={formData.tokenSymbol}
              onChange={(e) => updateFormData({ tokenSymbol: e.target.value.toUpperCase() })}
              className="noble-input w-full"
              placeholder="e.g., NST"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Token Contract Address *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.tokenAddress}
              onChange={(e) => updateFormData({ tokenAddress: e.target.value })}
              className={`
                noble-input w-full font-mono text-sm pr-10
                ${tokenValidation.isValid ? 'border-green-500' : ''}
                ${tokenValidation.error ? 'border-red-500' : ''}
              `}
              placeholder="0x..."
              required
              disabled={!selectedChain}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {tokenValidation.isValidating && (
                <Loader className="animate-spin text-noble-gold/50" size={16} />
              )}
              {tokenValidation.isValid && (
                <CheckCircle className="text-green-500" size={16} />
              )}
              {tokenValidation.error && (
                <AlertTriangle className="text-red-500" size={16} />
              )}
            </div>
          </div>
          
          {!selectedChain && (
            <p className="text-xs text-orange-400 mt-1">
              Please select a blockchain first
            </p>
          )}
          
          {tokenValidation.error && (
            <p className="text-xs text-red-400 mt-1">
              {tokenValidation.error}
            </p>
          )}
          
          {tokenValidation.isValid && tokenValidation.tokenInfo && (
            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                <CheckCircle size={16} />
                <span>Token validated successfully</span>
                {tokenValidation.tokenInfo.verified && (
                  <span className="px-2 py-1 bg-green-500/20 rounded text-xs">Verified</span>
                )}
              </div>
              <div className="text-xs text-noble-gold/70 grid grid-cols-2 gap-2">
                <div>Name: <span className="text-noble-gold">{tokenValidation.tokenInfo.name}</span></div>
                <div>Symbol: <span className="text-noble-gold">{tokenValidation.tokenInfo.symbol}</span></div>
                <div>Decimals: <span className="text-noble-gold">{tokenValidation.tokenInfo.decimals}</span></div>
                <div>Supply: <span className="text-noble-gold">{parseFloat(tokenValidation.tokenInfo.totalSupply).toLocaleString()}</span></div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-noble-gold/50 mt-1">
            Must be a verified contract on {selectedChain?.name || 'the selected blockchain'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Total Supply *
          </label>
          <input
            type="number"
            value={formData.totalSupply}
            onChange={(e) => updateFormData({ totalSupply: e.target.value })}
            className="noble-input w-full"
            placeholder="e.g., 1000000"
            required
          />
          <p className="text-xs text-noble-gold/50 mt-1">
            Enter the total token supply (without decimals)
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-noble-gold mb-4">Token Distribution</h3>
          <div className="space-y-4">
            <div className="p-4 bg-noble-gray/30 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-noble-gold/70">Presale</div>
                  <div className="text-noble-gold font-medium">50%</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Liquidity</div>
                  <div className="text-noble-gold font-medium">30%</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Team</div>
                  <div className="text-noble-gold font-medium">10%</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Marketing</div>
                  <div className="text-noble-gold font-medium">10%</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-noble-gold/60">
              Typical distribution shown above. Team tokens will be locked as per security requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}