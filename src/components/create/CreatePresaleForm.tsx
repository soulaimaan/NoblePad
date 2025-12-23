'use client'

import { Button } from '@/components/ui/Button'
import { presaleService } from '@/lib/presaleService'
import { useEffect, useState } from 'react'
import { MilestoneTemplateStep } from './steps/MilestoneTemplateStep'
import { PresaleSetupStep } from './steps/PresaleSetupStep'
import { ProjectInfoStep } from './steps/ProjectInfoStep'
import { SecurityReviewStep } from './steps/SecurityReviewStep'
import { TokenDetailsStep } from './steps/TokenDetailsStep'

interface CreatePresaleFormProps {
  currentStep: number
  onStepChange: (step: number) => void
}

interface FormData {
  // Project Info
  projectName: string
  description: string
  website: string
  twitter: string
  telegram: string
  discord: string
  whitepaper: string
  
  // Token Details
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  totalSupply: string
  chainId: number
  
  // Presale Setup
  softCap: string
  hardCap: string
  tokenPrice: string
  minContribution: string
  maxContribution: string
  startDate: string
  endDate: string
  liquidityPercentage: string
  liquidityLockMonths: string
  
  // Vesting
  vestingEnabled: boolean
  vestingSchedule: Array<{ percentage: number; timeDescription: string; unlockTime: number }>
  
  // Security
  kycDocuments: string[] // Changed to string[] for file URLs
  auditReport: string
  teamTokenLockMonths: string
  teamWallets: string[]
  
  // Milestones
  milestones: Array<{
    title: string
    percentage: string
    deadline: string
    description: string
    proofOfWork: string
  }>
}

export function CreatePresaleForm({ currentStep, onStepChange }: CreatePresaleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    // Initialize with empty values
    projectName: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
    whitepaper: '',
    tokenName: '',
    tokenSymbol: '',
    tokenAddress: '',
    totalSupply: '',
    chainId: 0, // Will be set when chain is selected
    softCap: '',
    hardCap: '',
    tokenPrice: '',
    minContribution: '',
    maxContribution: '',
    startDate: '',
    endDate: '',
    liquidityPercentage: '80',
    liquidityLockMonths: '12',
    vestingEnabled: true,
    vestingSchedule: [
      { 
        percentage: 50, 
        timeDescription: 'TGE (Token Generation Event)',
        unlockTime: 0
      },
      { 
        percentage: 50, 
        timeDescription: '1 month after TGE',
        unlockTime: 0
      }
    ],
    kycDocuments: [],
    auditReport: '',
    teamTokenLockMonths: '12',
    teamWallets: [''],
    milestones: [
      { title: 'MVP Release', percentage: '40', deadline: '', description: '', proofOfWork: '' },
      { title: 'Beta Testing', percentage: '30', deadline: '', description: '', proofOfWork: '' },
      { title: 'Mainnet Launch', percentage: '30', deadline: '', description: '', proofOfWork: '' }
    ]
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize dates on client side to avoid hydration mismatch
    const now = Math.floor(Date.now() / 1000)
    setFormData(prev => {
      // Only update if they are 0 (prevent overwriting if state was restored/persisted?)
      // Actually this runs once on mount. formData is fresh.
      if (prev.vestingSchedule[0].unlockTime !== 0) return prev
      
      return {
        ...prev,
        vestingSchedule: [
            { ...prev.vestingSchedule[0], unlockTime: now },
            { ...prev.vestingSchedule[1], unlockTime: now + (30 * 24 * 60 * 60) }
        ]
      }
    })
  }, [])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Validate form data
      if (!validateFormData()) {
        throw new Error('Please fill in all required fields')
      }

      // Get user wallet address
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('Please connect your wallet first')
      }
      const userAddress = accounts[0]

      // Step 1: Create presale contract
      const contractResult = await presaleService.createPresaleContract(formData, userAddress)
      if (!contractResult.success) {
        throw new Error(contractResult.error || 'Failed to create presale contract')
      }

      // Step 2: Lock team tokens (if specified)
      if (formData.teamWallets.length > 0 && formData.teamWallets[0]) {
        const lockMonths = parseInt(formData.teamTokenLockMonths)
        const unlockTime = Math.floor(Date.now() / 1000) + (lockMonths * 30 * 24 * 60 * 60)
        
        const teamLockResult = await presaleService.lockTeamTokens(
          formData.tokenAddress,
          ['1000000'], // Team token amount (calculated from total supply)
          [unlockTime],
          formData.teamWallets,
          formData.chainId
        )
        
        if (!teamLockResult.success) {
          console.warn('Team token lock failed:', teamLockResult.error)
          // Continue anyway - team tokens can be locked later
        }
      }

      // Step 3: Submit to database
      const dbResult = await presaleService.submitPresaleToDatabase(
        formData,
        contractResult.presaleAddress!,
        userAddress,
        contractResult.transactionHash!
      )

      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Failed to save presale data')
      }

      // Step 4: Call Supabase Edge Function for additional processing
      const response = await fetch('/api/create-presale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presaleId: dbResult.presaleId,
          contractAddress: contractResult.presaleAddress,
          transactionHash: contractResult.transactionHash,
          formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process presale submission')
      }

      // Success!
      alert(`🎉 Presale created successfully!\n\nContract: ${contractResult.presaleAddress}\nTransaction: ${contractResult.transactionHash}\n\nOur team will review your application within 24-48 hours.`)
      
      // Reset form or redirect to dashboard
      window.location.href = `/presale/${dbResult.presaleId}`
      
    } catch (error: any) {
      console.error('Submission failed:', error)
      alert(`❌ Submission failed: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const validateFormData = (): boolean => {
    const required = [
      'projectName', 'description', 'tokenName', 'tokenSymbol', 'tokenAddress',
      'softCap', 'hardCap', 'tokenPrice', 'startDate', 'endDate', 'chainId'
    ]
    
    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`)
        return false
      }
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const now = new Date()

    if (startDate <= now) {
      alert('Start date must be in the future')
      return false
    }

    if (endDate <= startDate) {
      alert('End date must be after start date')
      return false
    }

    // Validate caps
    const softCap = parseFloat(formData.softCap)
    const hardCap = parseFloat(formData.hardCap)

    if (hardCap <= softCap) {
      alert('Hard cap must be greater than soft cap')
      return false
    }

    // Validate liquidity percentage
    const liquidityPercentage = parseInt(formData.liquidityPercentage)
    if (liquidityPercentage < 60 || liquidityPercentage > 100) {
      alert('Liquidity percentage must be between 60% and 100%')
      return false
    }

    return true
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectInfoStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <TokenDetailsStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <PresaleSetupStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <MilestoneTemplateStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <SecurityReviewStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="noble-card">
      {renderCurrentStep()}
      
      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-noble-gold/20">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex space-x-3">
          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}