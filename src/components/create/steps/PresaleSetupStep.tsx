'use client'

import { Button } from '@/components/ui/Button'
import { getChainById } from '@/lib/chains'
import { Plus, Timer, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PresaleSetupStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function PresaleSetupStep({ formData, updateFormData }: PresaleSetupStepProps) {
  // Derive chain directly from formData to ensure sync
  const currentChain = formData.chainId ? getChainById(Number(formData.chainId)) : null
  const currency = currentChain?.nativeCurrency?.symbol || 'BNB'

  const [calculations, setCalculations] = useState({
    tokensForPresale: '0',
    tokensForLiquidity: '0',
    presaleProgress: 0,
    estimatedLiquidity: '0'
  })

  // Calculate presale metrics when relevant fields change
  useEffect(() => {
    calculatePresaleMetrics()
  }, [
    formData.hardCap,
    formData.tokenPrice,
    formData.liquidityPercentage,
    formData.totalSupply
  ])

  const calculatePresaleMetrics = () => {
    if ((!formData.hardCap && formData.saleType !== 'fair_launch') || !formData.tokenPrice || !formData.totalSupply) {
      return
    }

    const tokenPriceNum = parseFloat(formData.tokenPrice)
    const totalSupplyNum = parseFloat(formData.totalSupply)
    const liquidityPercent = parseFloat(formData.liquidityPercentage) || 80

    if (formData.saleType === 'fair_launch') {
      setCalculations({
        tokensForPresale: 'Unlimited',
        tokensForLiquidity: 'Dynamic (Based on Raised Amount)',
        presaleProgress: 0,
        estimatedLiquidity: 'Dynamic'
      })
      return
    }

    const hardCapNum = parseFloat(formData.hardCap)
    const tokensForPresale = hardCapNum / tokenPriceNum
    const liquidityTokens = (tokensForPresale * liquidityPercent) / 100
    const estimatedLiquidityValue = hardCapNum * (liquidityPercent / 100)

    setCalculations({
      tokensForPresale: tokensForPresale.toLocaleString(),
      tokensForLiquidity: liquidityTokens.toLocaleString(),
      presaleProgress: (tokensForPresale / totalSupplyNum) * 100,
      estimatedLiquidity: estimatedLiquidityValue.toLocaleString()
    })
  }
  const addVestingPeriod = () => {
    const newSchedule = [...formData.vestingSchedule, { percentage: 0, timeDescription: '' }]
    updateFormData({ vestingSchedule: newSchedule })
  }

  const removeVestingPeriod = (index: number) => {
    const newSchedule = formData.vestingSchedule.filter((_: any, i: number) => i !== index)
    updateFormData({ vestingSchedule: newSchedule })
  }

  const updateVestingPeriod = (index: number, field: string, value: any) => {
    const newSchedule = [...formData.vestingSchedule]
    newSchedule[index][field] = value
    updateFormData({ vestingSchedule: newSchedule })
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
          <Timer className="text-noble-black" size={16} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-noble-gold">Presale Setup</h2>
          <p className="text-noble-gold/70 text-sm">Configure your presale parameters</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sale Type Selection */}
        <div className="bg-noble-gray/20 p-4 rounded-lg border border-noble-gold/20">
          <label className="block text-sm font-medium text-noble-gold/70 mb-3">Sale Type</label>
          <div className="flex space-x-4">
            <button
              onClick={() => updateFormData({ saleType: 'standard' })}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                formData.saleType !== 'fair_launch' // Default to standard
                  ? 'bg-noble-gold/20 border-noble-gold text-noble-gold'
                  : 'bg-transparent border-noble-gold/20 text-noble-gold/60 hover:border-noble-gold/50'
              }`}
            >
              Standard Presale
            </button>
            <button
              onClick={() => updateFormData({ saleType: 'fair_launch' })}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                formData.saleType === 'fair_launch'
                  ? 'bg-noble-gold/20 border-noble-gold text-noble-gold'
                  : 'bg-transparent border-noble-gold/20 text-noble-gold/60 hover:border-noble-gold/50'
              }`}
            >
              Fair Launch
            </button>
          </div>
          {formData.saleType === 'fair_launch' && (
             <p className="text-xs text-noble-gold/60 mt-2">
               Fair Launch: No hard cap. The price is determined by the total amount raised divided by tokens sold, or fixed price with unlimited supply until time ends.
             </p>
          )}
        </div>

        {/* Basic Presale Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="softCap" className="block text-sm font-medium text-noble-gold/70 mb-2">
              Soft Cap ({currency}) *
            </label>
            <input
              id="softCap"
              type="text"
              title="Soft Cap"
              placeholder="e.g. 50"
              className="w-full bg-slate-700 border-slate-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.softCap}
              onChange={(e) => updateFormData({ softCap: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="hardCap" className="block text-sm font-medium text-noble-gold/70 mb-2">
              Hard Cap ({currency}) *
            </label>
                <input
                  id="hardCap"
                  type="text"
                  title="Hard Cap"
                  placeholder={formData.saleType === 'fair_launch' ? "Unlimited" : "e.g. 100"}
                  className={`w-full rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formData.saleType === 'fair_launch' 
                      ? 'bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-slate-700 border-slate-600'
                  }`}
                  value={formData.saleType === 'fair_launch' ? '' : formData.hardCap}
                  onChange={(e) => updateFormData({ hardCap: e.target.value })}
                  disabled={formData.saleType === 'fair_launch'}
                  required={formData.saleType !== 'fair_launch'}
                />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Token Price (per {currency}) *
            </label>
            <input
              type="number"
              value={formData.tokenPrice}
              onChange={(e) => updateFormData({ tokenPrice: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., 1000"
              required
            />
            <p className="text-xs text-noble-gold/50 mt-1">
              How many tokens per 1 {currency}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Blockchain
            </label>
            <div className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white flex items-center space-x-2">
               {currentChain ? (
                 <>
                   <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: currentChain.color }}
                    >
                      {currentChain.symbol.slice(0, 1)}
                    </div>
                   <span>{currentChain.name}</span>
                 </>
               ) : (
                 <span className="text-gray-400">No chain selected</span>
               )}
            </div>
            <p className="text-xs text-noble-gold/50 mt-1">
              Selected in previous step
            </p>
          </div>
        </div>

        {/* Contribution Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Min Contribution ({currency}) *
            </label>
            <input
              type="number"
              value={formData.minContribution}
              onChange={(e) => updateFormData({ minContribution: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., 0.1"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Max Contribution ({currency}) *
            </label>
            <input
              id="maxContribution"
              type="number"
              title="Max Contribution"
              value={formData.maxContribution}
              onChange={(e) => updateFormData({ maxContribution: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., 10"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Start Date & Time *
            </label>
            <input
              id="startDate"
              type="datetime-local"
              title="Start Date & Time"
              value={formData.startDate}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
              className="noble-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              End Date & Time *
            </label>
            <input
              id="endDate"
              type="datetime-local"
              title="End Date & Time"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
              className="noble-input w-full"
              required
            />
          </div>
        </div>

        {/* Liquidity Settings */}
        <div>
          <h3 className="text-lg font-medium text-noble-gold mb-4">Liquidity & Lock Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Liquidity Percentage *
              </label>
              <select 
                id="liquidityPercentage"
                title="Liquidity Percentage"
                value={formData.liquidityPercentage}
                onChange={(e) => updateFormData({ liquidityPercentage: e.target.value })}
                className="noble-input w-full"
                required
              >
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80% (Recommended)</option>
                <option value="90">90%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Liquidity Lock Period *
              </label>
              <select 
                id="liquidityLockMonths"
                title="Liquidity Lock Period"
                value={formData.liquidityLockMonths}
                onChange={(e) => updateFormData({ liquidityLockMonths: e.target.value })}
                className="noble-input w-full"
                required
              >
                <option value="6">6 months</option>
                <option value="12">12 months (Recommended)</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vesting Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-noble-gold">Vesting Schedule</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.vestingEnabled}
                onChange={(e) => updateFormData({ vestingEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-noble-gold/70">Enable Vesting</span>
            </label>
          </div>

          {formData.vestingEnabled && (
            <div className="space-y-4">
              {formData.vestingSchedule.map((vesting: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-noble-gray/30 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Percentage"
                      value={vesting.percentage}
                      onChange={(e) => updateVestingPeriod(index, 'percentage', parseFloat(e.target.value))}
                      className="noble-input"
                      min="0"
                      max="100"
                    />
                    <input
                      type="text"
                      placeholder="Time description (e.g., TGE, 1 month after TGE)"
                      value={vesting.timeDescription}
                      onChange={(e) => updateVestingPeriod(index, 'timeDescription', e.target.value)}
                      className="noble-input"
                    />
                  </div>
                  {formData.vestingSchedule.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVestingPeriod(index)}
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addVestingPeriod}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add Vesting Period
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}