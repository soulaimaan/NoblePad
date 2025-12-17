'use client'

import { Button } from '@/components/ui/Button'

interface PresaleFiltersProps {
  selectedChain: string
  selectedStatus: string
  onChainChange: (chain: string) => void
  onStatusChange: (status: string) => void
}

export function PresaleFilters({
  selectedChain,
  selectedStatus,
  onChainChange,
  onStatusChange
}: PresaleFiltersProps) {
  const chains = [
    { value: 'all', label: 'All Chains' },
    { value: 'BSC', label: 'BSC' },
    { value: 'ETH', label: 'Ethereum' },
    { value: 'POLYGON', label: 'Polygon' },
    { value: 'ARB', label: 'Arbitrum' },
    { value: 'BASE', label: 'Base' },
    { value: 'SOL', label: 'Solana' }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'live', label: 'Live' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' }
  ]

  return (
    <div className="flex flex-wrap gap-4">
      {/* Chain Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-noble-gold/70 flex items-center mr-2">Chain:</span>
        {chains.map((chain) => (
          <Button
            key={chain.value}
            variant={selectedChain === chain.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChainChange(chain.value)}
            className="text-xs"
          >
            {chain.label}
          </Button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-noble-gold/70 flex items-center mr-2">Status:</span>
        {statuses.map((status) => (
          <Button
            key={status.value}
            variant={selectedStatus === status.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status.value)}
            className="text-xs"
          >
            {status.label}
          </Button>
        ))}
      </div>
    </div>
  )
}