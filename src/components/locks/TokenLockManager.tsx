'use client'

import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { SUPPORTED_CHAINS, getChainById } from '@/lib/chains'
import { tokenLockService, type TokenLockInfo } from '@/lib/tokenLockService'
import {
    ExternalLink,
    Eye,
    Lock,
    RefreshCw,
    Unlock
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface TokenLockManagerProps {
  showCreateButton?: boolean
  onCreateClick?: () => void
}

export function TokenLockManager({ showCreateButton = true, onCreateClick }: TokenLockManagerProps) {
  const { address, isConnected } = useAccount()
  const walletAddress = address
  const [locks, setLocks] = useState<TokenLockInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChainId, setSelectedChainId] = useState(1) // Default to Ethereum
  const [filter, setFilter] = useState<'all' | 'active' | 'claimable' | 'claimed'>('all')
  const [selectedLock, setSelectedLock] = useState<TokenLockInfo | null>(null)
  const [isUnlocking, setIsUnlocking] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadLocks()
    }
  }, [isConnected, walletAddress, selectedChainId])

  const loadLocks = async () => {
    if (!walletAddress) return
    
    setIsLoading(true)
    try {
      const userLocks = await tokenLockService.getLocksByOwner(walletAddress, selectedChainId)
      setLocks(userLocks)
    } catch (error) {
      console.error('Failed to load locks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlock = async (lock: TokenLockInfo) => {
    if (!walletAddress) return

    setIsUnlocking(lock.id)
    try {
      const result = await tokenLockService.unlockTokens(lock.id, lock.chainId, walletAddress)
      
      if (result.success) {
        alert(`🎉 Tokens unlocked successfully!\n\nTransaction: ${result.transactionHash}`)
        await loadLocks() // Refresh locks
      } else {
        throw new Error(result.error || 'Failed to unlock tokens')
      }
    } catch (error: any) {
      console.error('Unlock failed:', error)
      alert(`❌ Failed to unlock tokens: ${error.message}`)
    } finally {
      setIsUnlocking(null)
    }
  }

  const getLockStatus = (lock: TokenLockInfo) => {
    const now = Math.floor(Date.now() / 1000)
    
    if (lock.claimed) {
      return { status: 'claimed', label: 'Claimed', color: 'text-green-400' }
    } else if (lock.unlockTime <= BigInt(now)) {
      return { status: 'claimable', label: 'Claimable', color: 'text-noble-gold' }
    } else {
      return { status: 'locked', label: 'Locked', color: 'text-blue-400' }
    }
  }

  const getTimeRemaining = (unlockTime: bigint) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = Number(unlockTime) - now
    
    if (remaining <= 0) return 'Ready to claim'
    
    const days = Math.floor(remaining / (24 * 60 * 60))
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((remaining % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const filteredLocks = locks.filter(lock => {
    const { status } = getLockStatus(lock)
    
    switch (filter) {
      case 'active':
        return status === 'locked'
      case 'claimable':
        return status === 'claimable'
      case 'claimed':
        return status === 'claimed'
      default:
        return true
    }
  })

  const getChainName = (chainId: number) => {
    const chain = getChainById(chainId)
    return chain?.name || `Chain ${chainId}`
  }

  const getBlockExplorerUrl = (chainId: number, address: string) => {
    const chain = getChainById(chainId)
    if (!chain) return null
    return `${chain.blockExplorerUrls[0]}/address/${address}`
  }

  const formatAmount = (amount: bigint, decimals: number = 18) => {
    const formatted = Number(amount) / Math.pow(10, decimals)
    return formatted.toLocaleString()
  }

  if (!isMounted) {
    return <div className="h-48 flex items-center justify-center animate-pulse bg-noble-gray/20 rounded-xl" />
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Lock className="mx-auto mb-4 text-noble-gold/50" size={48} />
        <h3 className="text-lg font-semibold text-noble-gold mb-2">Connect Your Wallet</h3>
        <p className="text-noble-gold/70">
          Connect your wallet to view and manage your token locks
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-noble-gold">Token Lock Manager</h2>
          <p className="text-noble-gold/70">Manage your token locks across all blockchains</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showCreateButton && (
            <Button onClick={onCreateClick}>
              <Lock size={16} className="mr-2" />
              Create New Lock
            </Button>
          )}
          <Button variant="outline" onClick={loadLocks} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Filters and Chain Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Chain Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-noble-gold/70">Chain:</label>
          <select
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(parseInt(e.target.value))}
            className="noble-input text-sm"
          >
            {Object.values(SUPPORTED_CHAINS).map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          {['all', 'active', 'claimable', 'claimed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${filter === filterType
                  ? 'bg-noble-gold text-noble-black'
                  : 'bg-noble-gray/20 text-noble-gold/70 hover:bg-noble-gray/40'
                }
              `}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="noble-card text-center">
          <div className="text-2xl font-bold text-noble-gold">{locks.length}</div>
          <div className="text-xs text-noble-gold/70">Total Locks</div>
        </div>
        <div className="noble-card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {locks.filter(l => getLockStatus(l).status === 'locked').length}
          </div>
          <div className="text-xs text-noble-gold/70">Active</div>
        </div>
        <div className="noble-card text-center">
          <div className="text-2xl font-bold text-noble-gold">
            {locks.filter(l => getLockStatus(l).status === 'claimable').length}
          </div>
          <div className="text-xs text-noble-gold/70">Claimable</div>
        </div>
        <div className="noble-card text-center">
          <div className="text-2xl font-bold text-green-400">
            {locks.filter(l => getLockStatus(l).status === 'claimed').length}
          </div>
          <div className="text-xs text-noble-gold/70">Claimed</div>
        </div>
      </div>

      {/* Locks List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto mb-4 animate-spin text-noble-gold/50" size={48} />
          <p className="text-noble-gold/70">Loading your token locks...</p>
        </div>
      ) : filteredLocks.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="mx-auto mb-4 text-noble-gold/50" size={48} />
          <h3 className="text-lg font-semibold text-noble-gold mb-2">
            {filter === 'all' ? 'No Token Locks Found' : `No ${filter} locks`}
          </h3>
          <p className="text-noble-gold/70 mb-4">
            {filter === 'all' 
              ? 'Create your first token lock to get started'
              : `You don't have any ${filter} token locks`
            }
          </p>
          {showCreateButton && filter === 'all' && (
            <Button onClick={onCreateClick}>
              Create Your First Lock
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLocks.map((lock) => {
            const { status, label, color } = getLockStatus(lock)
            const chain = getChainById(lock.chainId)
            
            return (
              <div key={`${lock.chainId}-${lock.id}`} className="noble-card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {/* Lock Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: chain?.color || '#666' }}
                      >
                        {chain?.symbol.slice(0, 2) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-noble-gold">Lock #{lock.id}</h3>
                        <p className="text-sm text-noble-gold/60">
                          {lock.lockType.charAt(0).toUpperCase() + lock.lockType.slice(1)} • {getChainName(lock.chainId)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${color} bg-current/10`}>
                        {label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-noble-gold/70">Amount</div>
                        <div className="font-medium text-noble-gold">
                          {formatAmount(lock.amount)} tokens
                        </div>
                      </div>
                      <div>
                        <div className="text-noble-gold/70">Unlock Time</div>
                        <div className="font-medium text-noble-gold">
                          {new Date(Number(lock.unlockTime) * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-noble-gold/70">Time Remaining</div>
                        <div className="font-medium text-noble-gold">
                          {getTimeRemaining(lock.unlockTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-noble-gold/70">Beneficiary</div>
                        <div className="font-medium text-noble-gold font-mono text-xs">
                          {lock.beneficiary.slice(0, 6)}...{lock.beneficiary.slice(-4)}
                        </div>
                      </div>
                    </div>

                    {lock.description && (
                      <div className="mt-2">
                        <div className="text-noble-gold/70 text-sm">Description</div>
                        <div className="text-noble-gold text-sm">{lock.description}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLock(lock)}
                    >
                      <Eye size={16} className="mr-1" />
                      Details
                    </Button>

                    {getBlockExplorerUrl(lock.chainId, lock.token) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getBlockExplorerUrl(lock.chainId, lock.token)!, '_blank')}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}

                    {status === 'claimable' && lock.beneficiary.toLowerCase() === walletAddress?.toLowerCase() && (
                      <Button
                        onClick={() => handleUnlock(lock)}
                        disabled={isUnlocking === lock.id}
                        size="sm"
                      >
                        {isUnlocking === lock.id ? (
                          <RefreshCw size={16} className="animate-spin mr-1" />
                        ) : (
                          <Unlock size={16} className="mr-1" />
                        )}
                        {isUnlocking === lock.id ? 'Unlocking...' : 'Claim'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lock Details Modal */}
      {selectedLock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-noble-gray border border-noble-gold/20 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-noble-gold">Lock Details #{selectedLock.id}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedLock(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-noble-gold/70">Lock ID</div>
                  <div className="font-medium text-noble-gold">{selectedLock.id}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Chain</div>
                  <div className="font-medium text-noble-gold">{getChainName(selectedLock.chainId)}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Token Address</div>
                  <div className="font-medium text-noble-gold font-mono text-xs">{selectedLock.token}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Owner</div>
                  <div className="font-medium text-noble-gold font-mono text-xs">{selectedLock.owner}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Beneficiary</div>
                  <div className="font-medium text-noble-gold font-mono text-xs">{selectedLock.beneficiary}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Lock Type</div>
                  <div className="font-medium text-noble-gold capitalize">{selectedLock.lockType}</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Amount Locked</div>
                  <div className="font-medium text-noble-gold">{formatAmount(selectedLock.amount)} tokens</div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Lock Created</div>
                  <div className="font-medium text-noble-gold">
                    {new Date(Number(selectedLock.lockTime) * 1000).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Unlock Time</div>
                  <div className="font-medium text-noble-gold">
                    {new Date(Number(selectedLock.unlockTime) * 1000).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-noble-gold/70">Status</div>
                  <div className={`font-medium ${getLockStatus(selectedLock).color}`}>
                    {getLockStatus(selectedLock).label}
                  </div>
                </div>
              </div>

              {selectedLock.description && (
                <div>
                  <div className="text-noble-gold/70 text-sm mb-1">Description</div>
                  <div className="p-3 bg-noble-gray/20 rounded text-noble-gold text-sm">
                    {selectedLock.description}
                  </div>
                </div>
              )}

              {selectedLock.transactionHash && (
                <div>
                  <div className="text-noble-gold/70 text-sm mb-1">Creation Transaction</div>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-noble-gray/20 px-2 py-1 rounded font-mono text-noble-gold">
                      {selectedLock.transactionHash}
                    </code>
                    {getBlockExplorerUrl(selectedLock.chainId, selectedLock.transactionHash) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(
                          getBlockExplorerUrl(selectedLock.chainId, selectedLock.transactionHash)!.replace('/address/', '/tx/'),
                          '_blank'
                        )}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}