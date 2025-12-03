'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, DollarSign, Calendar, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SUPPORTED_CHAINS, getChainById, PRESALE_REQUIREMENTS } from '@/lib/chains'

interface PresaleSetupStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function PresaleSetupStep({ formData, updateFormData }: PresaleSetupStepProps) {
  const [currentChain, setCurrentChain] = useState(
    formData.chainId ? getChainById(formData.chainId) : null
  )

  const [calculations, setCalculations] = useState({
    tokensForPresale: '0',
    tokensForLiquidity: '0',
    presaleProgress: 0,
    estimatedLiquidity: '0'
  })

  // Update chain when formData changes
  useEffect(() => {
    if (formData.chainId) {
      const chain = getChainById(formData.chainId)
      setCurrentChain(chain)
    }
  }, [formData.chainId])

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
    if (!formData.hardCap || !formData.tokenPrice || !formData.totalSupply) {
      return
    }

    const hardCapNum = parseFloat(formData.hardCap)
    const tokenPriceNum = parseFloat(formData.tokenPrice)
    const totalSupplyNum = parseFloat(formData.totalSupply)
    const liquidityPercent = parseFloat(formData.liquidityPercentage) || 80

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
          <Clock className="text-noble-black" size={16} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-noble-gold">Presale Setup</h2>
          <p className="text-noble-gold/70 text-sm">Configure your presale parameters</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Presale Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Soft Cap (BNB) *
            </label>
            <input
              type="number"
              value={formData.softCap}
              onChange={(e) => updateFormData({ softCap: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., 250"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Hard Cap (BNB) *
            </label>
            <input
              type="number"
              value={formData.hardCap}
              onChange={(e) => updateFormData({ hardCap: e.target.value })}
              className="noble-input w-full"
              placeholder="e.g., 500"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Token Price (per BNB) *
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
              How many tokens per 1 BNB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Blockchain *
            </label>
            <select className="noble-input w-full">
              <option value="BSC">Binance Smart Chain (BSC)</option>
              <option value="ETH">Ethereum</option>
              <option value="POLYGON">Polygon</option>
              <option value="ARB">Arbitrum</option>
              <option value="BASE">Base</option>
              <option value="SOL">Solana</option>
            </select>
          </div>
        </div>

        {/* Contribution Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Min Contribution (BNB) *
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
              Max Contribution (BNB) *
            </label>
            <input
              type="number"
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
              type="datetime-local"
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
              type="datetime-local"
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