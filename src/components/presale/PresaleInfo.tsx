'use client'

import { ExternalLink, FileText, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PresaleInfoProps {
  presale: any // Will be properly typed later
}

export function PresaleInfo({ presale }: PresaleInfoProps) {
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="noble-card">
        <h3 className="text-xl font-semibold text-noble-gold mb-4 flex items-center">
          <FileText className="mr-2" size={20} />
          Project Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-noble-gold mb-2">Token Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Name:</span>
                  <span className="text-noble-gold">{presale.tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Symbol:</span>
                  <span className="text-noble-gold">{presale.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Total Supply:</span>
                  <span className="text-noble-gold">{presale.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Presale Supply:</span>
                  <span className="text-noble-gold">{presale.presaleSupply}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-noble-gold mb-2">Sale Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Soft Cap:</span>
                  <span className="text-noble-gold">{presale.softCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Hard Cap:</span>
                  <span className="text-noble-gold">{presale.hardCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Min Contribution:</span>
                  <span className="text-noble-gold">{presale.minContribution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Max Contribution:</span>
                  <span className="text-noble-gold">{presale.maxContribution}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-noble-gold mb-2">Liquidity & Security</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Liquidity %:</span>
                  <span className="text-noble-gold">{presale.liquidityPercentage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Lock Period:</span>
                  <span className="text-noble-gold">{presale.liquidityLock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">Team Tokens:</span>
                  <span className="text-noble-gold">Locked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-noble-gold/70">KYC:</span>
                  <span className="text-green-400">Verified</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-noble-gold mb-2">Contract</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-noble-gold/70 break-all">
                    {presale.contractAddress}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(presale.contractAddress)}
                    className="text-noble-gold hover:text-noble-gold-light"
                  >
                    📋
                  </button>
                </div>
                {presale.auditReport && (
                  <a 
                    href={presale.auditReport} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-noble-gold hover:text-noble-gold-light"
                  >
                    View Audit Report <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vesting Schedule Details */}
      <div className="noble-card">
        <h3 className="text-xl font-semibold text-noble-gold mb-4 flex items-center">
          <Shield className="mr-2" size={20} />
          Vesting Schedule
        </h3>
        
        <div className="space-y-3">
          {presale.vestingSchedule.map((vesting: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-noble-gray/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-noble-gold/20 rounded-full flex items-center justify-center text-xs font-medium text-noble-gold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-noble-gold">{vesting.time}</div>
                  <div className="text-sm text-noble-gold/60">Release {vesting.percentage}% of tokens</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-noble-gold">{vesting.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-noble-gold/10 rounded-lg">
          <p className="text-sm text-noble-gold/70">
            <strong>Note:</strong> Vesting schedule protects investors by ensuring gradual token releases, 
            preventing immediate dumps and promoting long-term project commitment.
          </p>
        </div>
      </div>

      {/* Team & Community */}
      <div className="noble-card">
        <h3 className="text-xl font-semibold text-noble-gold mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Resources & Community
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {presale.website && (
            <a href={presale.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Website
              </Button>
            </a>
          )}
          
          {presale.whitepaper && (
            <a href={presale.whitepaper} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Whitepaper
              </Button>
            </a>
          )}
          
          {presale.telegram && (
            <a href={presale.telegram} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Telegram
              </Button>
            </a>
          )}
          
          {presale.twitter && (
            <a href={presale.twitter} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Twitter
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}