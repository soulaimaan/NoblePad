'use client'

import { Shield, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PresaleDetailProps {
  presale: any // Will be properly typed later
}

export function PresaleDetail({ presale }: PresaleDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="noble-card">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 bg-noble-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-noble-gold font-bold text-2xl">
              {presale.name.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-noble-gold">{presale.name}</h1>
              {presale.kycVerified && (
                <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs">
                  <CheckCircle size={12} />
                  <span>KYC Verified</span>
                </div>
              )}
            </div>
            <p className="text-noble-gold/70 mb-4">{presale.description}</p>
            
            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {presale.website && (
                <a href={presale.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs">
                    Website <ExternalLink size={12} className="ml-1" />
                  </Button>
                </a>
              )}
              {presale.twitter && (
                <a href={presale.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs">
                    Twitter <ExternalLink size={12} className="ml-1" />
                  </Button>
                </a>
              )}
              {presale.telegram && (
                <a href={presale.telegram} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs">
                    Telegram <ExternalLink size={12} className="ml-1" />
                  </Button>
                </a>
              )}
              {presale.whitepaper && (
                <a href={presale.whitepaper} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs">
                    Whitepaper <ExternalLink size={12} className="ml-1" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="noble-card">
        <h3 className="text-xl font-semibold text-noble-gold mb-4">Presale Progress</h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-noble-gold/70 mb-2">
            <span>Progress</span>
            <span>{presale.progress}%</span>
          </div>
          <div className="w-full bg-noble-gray rounded-full h-3">
            <div 
              className="bg-noble-gold-gradient h-3 rounded-full transition-all duration-500"
              style={{ width: `${presale.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-noble-gold/70 mt-2">
            <span>{presale.raised} raised</span>
            <span>{presale.hardCap} goal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-noble-gold">{presale.softCap}</div>
            <div className="text-sm text-noble-gold/60">Soft Cap</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-noble-gold">{presale.hardCap}</div>
            <div className="text-sm text-noble-gold/60">Hard Cap</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-noble-gold">{presale.tokenPrice}</div>
            <div className="text-sm text-noble-gold/60">Price</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-noble-gold">{presale.chain}</div>
            <div className="text-sm text-noble-gold/60">Chain</div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="noble-card">
        <h3 className="text-xl font-semibold text-noble-gold mb-4 flex items-center">
          <Shield className="mr-2" size={20} />
          Anti-Rug Protection
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={16} />
            <div>
              <div className="font-medium text-noble-gold">Liquidity Lock</div>
              <div className="text-sm text-noble-gold/70">{presale.liquidityLock} ({presale.liquidityPercentage})</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={16} />
            <div>
              <div className="font-medium text-noble-gold">Team Tokens</div>
              <div className="text-sm text-noble-gold/70">{presale.teamTokens}</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={16} />
            <div>
              <div className="font-medium text-noble-gold">KYC Verified</div>
              <div className="text-sm text-noble-gold/70">Team identity verified</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={16} />
            <div>
              <div className="font-medium text-noble-gold">Smart Contract</div>
              <div className="text-sm text-noble-gold/70">Audited and verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}