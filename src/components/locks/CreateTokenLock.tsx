'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useVanillaWeb3 } from '@/components/providers/VanillaWeb3Provider'
import { tokenLockService, type TokenLockData } from '@/lib/tokenLockService'
import { SUPPORTED_CHAINS, getMainnetChains, type Chain } from '@/lib/chains'
import { 
  Lock, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Loader,
  Plus,
  Trash2,
  Network 
} from 'lucide-react'

interface CreateTokenLockProps {
  onLockCreated?: (lockId: number) => void
  onCancel?: () => void
}

export function CreateTokenLock({ onLockCreated, onCancel }: CreateTokenLockProps) {
  const { wallet } = useVanillaWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [tokenValidation, setTokenValidation] = useState({
    isValidating: false,
    isValid: false,
    error: null as string | null
  })

  const [formData, setFormData] = useState({
    // Token Details
    tokenAddress: '',
    chainId: 0,
    
    // Lock Details
    amount: '',
    unlockDate: '',
    description: '',
    lockType: 'team' as 'team' | 'liquidity' | 'marketing' | 'development' | 'advisors' | 'custom',
    beneficiary: wallet.address || '',
    
    // Vesting (optional)
    enableVesting: false,
    vestingSchedule: [
      {
        percentage: 100,
        unlockTime: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
        description: 'Full unlock'
      }
    ]
  })

  // Update beneficiary when wallet changes
  useEffect(() => {
    if (wallet.address && !formData.beneficiary) {
      setFormData(prev => ({ ...prev, beneficiary: wallet.address || '' }))
    }
  }, [wallet.address])

  // Validate token when address and chain are provided
  useEffect(() => {
    if (formData.tokenAddress && formData.chainId && formData.tokenAddress.length === 42) {
      validateToken()
    }
  }, [formData.tokenAddress, formData.chainId])

  const validateToken = async () => {
    setTokenValidation(prev => ({ ...prev, isValidating: true, error: null }))
    
    try {
      const info = await tokenLockService.getTokenInfo(formData.tokenAddress, formData.chainId)
      
      if (info) {
        setTokenInfo(info)
        setTokenValidation({
          isValidating: false,
          isValid: true,
          error: null
        })
      } else {
        setTokenValidation({
          isValidating: false,
          isValid: false,
          error: 'Invalid token contract or network issue'
        })
      }
    } catch (error: any) {
      setTokenValidation({
        isValidating: false,
        isValid: false,
        error: error.message || 'Failed to validate token'
      })
    }
  }

  const handleChainSelect = (chain: Chain) => {
    setSelectedChain(chain)
    setFormData(prev => ({ ...prev, chainId: chain.id }))
    setTokenInfo(null)
    setTokenValidation({ isValidating: false, isValid: false, error: null })
  }

  const addVestingPeriod = () => {
    const lastUnlock = Math.max(...formData.vestingSchedule.map(v => v.unlockTime))
    setFormData(prev => ({
      ...prev,
      vestingSchedule: [
        ...prev.vestingSchedule,
        {
          percentage: 0,
          unlockTime: lastUnlock + (30 * 24 * 60 * 60), // 1 month after last unlock
          description: 'Vesting period'
        }
      ]
    }))
  }

  const removeVestingPeriod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vestingSchedule: prev.vestingSchedule.filter((_, i) => i !== index)
    }))
  }

  const updateVestingPeriod = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vestingSchedule: prev.vestingSchedule.map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }))
  }

  const handleSubmit = async () => {
    if (!wallet.address) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    
    try {
      // Validate form
      if (!validateForm()) return

      // Prepare lock data
      const lockData: TokenLockData = {
        tokenAddress: formData.tokenAddress,
        amount: formData.amount,
        unlockTime: Math.floor(new Date(formData.unlockDate).getTime() / 1000),
        description: formData.description,
        lockType: formData.lockType,
        beneficiary: formData.beneficiary,
        vestingSchedule: formData.enableVesting ? formData.vestingSchedule : undefined
      }

      // Create the lock
      const result = await tokenLockService.createTokenLock(
        lockData,
        formData.chainId,
        wallet.address
      )

      if (result.success) {
        alert(`🎉 Token lock created successfully!\n\nLock ID: ${result.lockId}\nTransaction: ${result.transactionHash}`)
        onLockCreated?.(result.lockId!)
      } else {
        throw new Error(result.error || 'Failed to create token lock')
      }
    } catch (error: any) {
      console.error('Lock creation failed:', error)
      alert(`❌ Failed to create lock: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    if (!selectedChain) {
      alert('Please select a blockchain')
      setCurrentStep(1)
      return false
    }

    if (!tokenValidation.isValid) {
      alert('Please enter a valid token address')
      setCurrentStep(1)
      return false
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid lock amount')
      setCurrentStep(2)
      return false
    }

    if (!formData.unlockDate || new Date(formData.unlockDate) <= new Date()) {
      alert('Unlock date must be in the future')
      setCurrentStep(2)
      return false
    }

    if (!formData.beneficiary || formData.beneficiary.length !== 42) {
      alert('Please enter a valid beneficiary address')
      setCurrentStep(2)
      return false
    }

    if (formData.enableVesting) {
      const totalPercentage = formData.vestingSchedule.reduce((sum, v) => sum + v.percentage, 0)
      if (totalPercentage !== 100) {
        alert('Vesting schedule percentages must total 100%')
        setCurrentStep(3)
        return false
      }
    }

    return true
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
                <Network className="text-noble-black" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-noble-gold">Token Selection</h3>
                <p className="text-noble-gold/70 text-sm">Choose blockchain and token to lock</p>
              </div>
            </div>

            {/* Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-3">
                Select Blockchain *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getMainnetChains().map((chain) => (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => handleChainSelect(chain)}
                    className={`
                      p-3 border-2 rounded-lg transition-all duration-200 text-left
                      ${selectedChain?.id === chain.id 
                        ? 'border-noble-gold bg-noble-gold/10' 
                        : 'border-noble-gold/20 hover:border-noble-gold/40'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: chain.color }}
                      >
                        {chain.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-noble-gold text-sm">{chain.name}</div>
                        <div className="text-xs text-noble-gold/60">{chain.symbol}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Token Address */}
            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Token Contract Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.tokenAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, tokenAddress: e.target.value }))}
                  className={`
                    noble-input w-full font-mono text-sm pr-10
                    ${tokenValidation.isValid ? 'border-green-500' : ''}
                    ${tokenValidation.error ? 'border-red-500' : ''}
                  `}
                  placeholder="0x..."
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

              {tokenValidation.error && (
                <p className="text-xs text-red-400 mt-1">{tokenValidation.error}</p>
              )}

              {tokenValidation.isValid && tokenInfo && (
                <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                    <CheckCircle size={16} />
                    <span>Token found</span>
                  </div>
                  <div className="text-xs text-noble-gold/70 grid grid-cols-2 gap-2">
                    <div>Name: <span className="text-noble-gold">{tokenInfo.name}</span></div>
                    <div>Symbol: <span className="text-noble-gold">{tokenInfo.symbol}</span></div>
                    <div>Your Balance: <span className="text-noble-gold">
                      {(parseFloat(tokenInfo.userBalance) / Math.pow(10, tokenInfo.decimals)).toLocaleString()}
                    </span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
                <Lock className="text-noble-black" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-noble-gold">Lock Details</h3>
                <p className="text-noble-gold/70 text-sm">Configure your token lock parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                  Lock Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="noble-input w-full"
                  placeholder="Enter amount to lock"
                  step="0.000001"
                />
                {tokenInfo && (
                  <p className="text-xs text-noble-gold/50 mt-1">
                    Available: {(parseFloat(tokenInfo.userBalance) / Math.pow(10, tokenInfo.decimals)).toLocaleString()} {tokenInfo.symbol}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                  Lock Type *
                </label>
                <select
                  value={formData.lockType}
                  onChange={(e) => setFormData(prev => ({ ...prev, lockType: e.target.value as any }))}
                  className="noble-input w-full"
                >
                  <option value="team">Team Tokens</option>
                  <option value="marketing">Marketing</option>
                  <option value="development">Development</option>
                  <option value="advisors">Advisors</option>
                  <option value="liquidity">Liquidity</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Unlock Date *
              </label>
              <input
                type="datetime-local"
                value={formData.unlockDate}
                onChange={(e) => setFormData(prev => ({ ...prev, unlockDate: e.target.value }))}
                className="noble-input w-full"
                min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)} // Tomorrow minimum
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Beneficiary Address *
              </label>
              <input
                type="text"
                value={formData.beneficiary}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficiary: e.target.value }))}
                className="noble-input w-full font-mono text-sm"
                placeholder="0x... (who can claim the tokens)"
              />
              <p className="text-xs text-noble-gold/50 mt-1">
                Address that will be able to claim tokens after unlock
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="noble-input w-full h-24 resize-none"
                placeholder="Optional description for this lock..."
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
                <Calendar className="text-noble-black" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-noble-gold">Vesting Schedule</h3>
                <p className="text-noble-gold/70 text-sm">Configure optional vesting periods</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableVesting"
                checked={formData.enableVesting}
                onChange={(e) => setFormData(prev => ({ ...prev, enableVesting: e.target.checked }))}
                className="w-4 h-4 rounded border-noble-gold/20 bg-noble-gray text-noble-gold focus:ring-noble-gold"
              />
              <label htmlFor="enableVesting" className="text-sm font-medium text-noble-gold">
                Enable vesting schedule (release tokens in multiple periods)
              </label>
            </div>

            {formData.enableVesting && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-noble-gold">Vesting Periods</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVestingPeriod}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Period
                  </Button>
                </div>

                {formData.vestingSchedule.map((period, index) => (
                  <div key={index} className="p-4 bg-noble-gray/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-noble-gold">Period {index + 1}</span>
                      {formData.vestingSchedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVestingPeriod(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-noble-gold/70 mb-1">
                          Percentage %
                        </label>
                        <input
                          type="number"
                          value={period.percentage}
                          onChange={(e) => updateVestingPeriod(index, 'percentage', parseInt(e.target.value) || 0)}
                          className="noble-input w-full text-sm"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-noble-gold/70 mb-1">
                          Unlock Date
                        </label>
                        <input
                          type="datetime-local"
                          value={new Date(period.unlockTime * 1000).toISOString().slice(0, 16)}
                          onChange={(e) => updateVestingPeriod(index, 'unlockTime', Math.floor(new Date(e.target.value).getTime() / 1000))}
                          className="noble-input w-full text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-noble-gold/70 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={period.description}
                          onChange={(e) => updateVestingPeriod(index, 'description', e.target.value)}
                          className="noble-input w-full text-sm"
                          placeholder="e.g., TGE, Month 1..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <AlertTriangle size={16} />
                    <span>
                      Total percentage: {formData.vestingSchedule.reduce((sum, v) => sum + v.percentage, 0)}%
                      {formData.vestingSchedule.reduce((sum, v) => sum + v.percentage, 0) !== 100 && ' (must equal 100%)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Review Summary */}
            <div className="p-4 bg-noble-gray/20 rounded-lg">
              <h4 className="font-medium text-noble-gold mb-3">Lock Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Token:</span>
                  <span className="text-noble-gold">{tokenInfo?.symbol || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Amount:</span>
                  <span className="text-noble-gold">{formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Lock Type:</span>
                  <span className="text-noble-gold capitalize">{formData.lockType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Unlock Date:</span>
                  <span className="text-noble-gold">
                    {formData.unlockDate ? new Date(formData.unlockDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Vesting:</span>
                  <span className="text-noble-gold">
                    {formData.enableVesting ? `${formData.vestingSchedule.length} periods` : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="noble-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-noble-gold">Create Token Lock</h2>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step 
                ? 'bg-noble-gold text-noble-black' 
                : 'bg-noble-gray text-noble-gold/50'
              }
            `}>
              {step}
            </div>
            {step < 3 && (
              <div className={`
                h-0.5 w-16 mx-2
                ${currentStep > step ? 'bg-noble-gold' : 'bg-noble-gold/20'}
              `} />
            )}
          </div>
        ))}
      </div>

      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-noble-gold/20">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex space-x-3">
          {currentStep < 3 ? (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && !tokenValidation.isValid}
            >
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !wallet.isConnected}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="animate-spin" size={16} />
                  <span>Creating Lock...</span>
                </div>
              ) : (
                'Create Token Lock'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}