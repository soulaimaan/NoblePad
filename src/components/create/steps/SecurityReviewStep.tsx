'use client'

import { useState } from 'react'
import { Shield, Upload, Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SecurityReviewStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function SecurityReviewStep({ formData, updateFormData }: SecurityReviewStepProps) {
  const [dragActive, setDragActive] = useState(false)

  const addTeamWallet = () => {
    const newWallets = [...formData.teamWallets, '']
    updateFormData({ teamWallets: newWallets })
  }

  const removeTeamWallet = (index: number) => {
    const newWallets = formData.teamWallets.filter((_: any, i: number) => i !== index)
    updateFormData({ teamWallets: newWallets })
  }

  const updateTeamWallet = (index: number, value: string) => {
    const newWallets = [...formData.teamWallets]
    newWallets[index] = value
    updateFormData({ teamWallets: newWallets })
  }

  const handleFileDrop = (e: any) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    updateFormData({ kycDocuments: [...formData.kycDocuments, ...files] })
  }

  const handleFileSelect = (e: any) => {
    const files = Array.from(e.target.files)
    updateFormData({ kycDocuments: [...formData.kycDocuments, ...files] })
  }

  const removeDocument = (index: number) => {
    const newDocs = formData.kycDocuments.filter((_: any, i: number) => i !== index)
    updateFormData({ kycDocuments: newDocs })
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
          <Shield className="text-noble-black" size={16} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-noble-gold">Security & Review</h2>
          <p className="text-noble-gold/70 text-sm">Complete security requirements for approval</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* KYC Documents */}
        <div>
          <h3 className="text-lg font-medium text-noble-gold mb-4">KYC Documentation *</h3>
          <p className="text-sm text-noble-gold/70 mb-4">
            Upload identification documents for all team members with token allocations
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-noble-gold bg-noble-gold/5' 
                : 'border-noble-gold/30 hover:border-noble-gold/50'
            }`}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <Upload className="w-12 h-12 text-noble-gold/60 mx-auto mb-4" />
            <p className="text-noble-gold/70 mb-2">
              Drag and drop KYC documents here, or{' '}
              <label className="text-noble-gold cursor-pointer hover:underline">
                browse files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-noble-gold/50">
              Accepted formats: PDF, JPG, PNG (Max 10MB each)
            </p>
          </div>

          {formData.kycDocuments.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-noble-gold mb-2">Uploaded Documents:</h4>
              <div className="space-y-2">
                {formData.kycDocuments.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-noble-gray/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-400" size={16} />
                      <span className="text-noble-gold">{file.name}</span>
                      <span className="text-xs text-noble-gold/50">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Report */}
        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Smart Contract Audit Report *
          </label>
          <input
            type="url"
            value={formData.auditReport}
            onChange={(e) => updateFormData({ auditReport: e.target.value })}
            className="noble-input w-full"
            placeholder="https://certik.com/audit-report or audit document URL"
            required
          />
          <p className="text-xs text-noble-gold/50 mt-1">
            Provide a link to your audit report from a recognized auditing firm
          </p>
        </div>

        {/* Team Token Lock */}
        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Team Token Lock Period *
          </label>
          <select 
            value={formData.teamTokenLockMonths}
            onChange={(e) => updateFormData({ teamTokenLockMonths: e.target.value })}
            className="noble-input w-full"
            required
          >
            <option value="12">12 months (Minimum)</option>
            <option value="18">18 months</option>
            <option value="24">24 months (Recommended)</option>
            <option value="36">36 months</option>
          </select>
          <p className="text-xs text-noble-gold/50 mt-1">
            Team tokens will be locked for the selected period to ensure project commitment
          </p>
        </div>

        {/* Team Wallets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-noble-gold">Team Wallet Addresses</h3>
            <Button variant="outline" size="sm" onClick={addTeamWallet}>
              <Plus size={16} className="mr-2" />
              Add Wallet
            </Button>
          </div>
          <p className="text-sm text-noble-gold/70 mb-4">
            List all wallet addresses that will receive team token allocations
          </p>

          <div className="space-y-3">
            {formData.teamWallets.map((wallet: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => updateTeamWallet(index, e.target.value)}
                  className="noble-input flex-1 font-mono text-sm"
                  placeholder="0x... team member wallet address"
                  required
                />
                {formData.teamWallets.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTeamWallet(index)}
                    className="text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Review Summary */}
        <div className="noble-card bg-noble-gold/5 border-noble-gold/20">
          <h3 className="text-lg font-medium text-noble-gold mb-4">Review Process</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
              <span className="text-noble-gold/70">
                Security team reviews all documentation within 24-48 hours
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
              <span className="text-noble-gold/70">
                Smart contract audit verification
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
              <span className="text-noble-gold/70">
                KYC document validation
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
              <span className="text-noble-gold/70">
                Team token lock implementation
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-noble-gray/30 rounded-lg">
            <p className="text-xs text-noble-gold/60">
              Upon approval, your presale will be listed on NoblePad with verified status. 
              Any issues will be communicated via email for resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}