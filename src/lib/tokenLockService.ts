// Token Lock Service - handles all token locking operations
import { getChainById } from './chains'
import { ERC20_ABI, GAS_LIMITS, getContractAddress, TOKEN_LOCK_ABI } from './contracts'
import {
    handleSupabaseResponse,
    safeSupabaseOperation,
    supabase,
    type TokenLockInsert,
    type TokenLockRow,
    type TokenVestingInsert,
    type TokenVestingRow
} from './supabaseClient'

export interface TokenLockData {
  tokenAddress: string
  amount: string
  unlockTime: number
  description: string
  lockType: 'team' | 'liquidity' | 'marketing' | 'development' | 'advisors' | 'custom'
  beneficiary: string
  vestingSchedule?: {
    percentage: number
    unlockTime: number
    description: string
  }[]
}

export interface TokenLockInfo {
  id: number
  token: string
  owner: string
  beneficiary: string
  amount: bigint
  lockTime: bigint
  unlockTime: bigint
  claimed: boolean
  description: string
  lockType: string
  chainId: number
  transactionHash: string
  createdAt: string
}

export interface VestingInfo {
  lockId: number
  schedule: {
    percentage: number
    unlockTime: number
    description: string
    claimed: boolean
    amount: bigint
  }[]
}

class TokenLockService {
  private getProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum
    }
    throw new Error('No Ethereum provider found')
  }

  // Create a new token lock
  async createTokenLock(
    lockData: TokenLockData,
    chainId: number,
    userAddress: string
  ): Promise<{
    success: boolean
    lockId?: number
    transactionHash?: string
    error?: string
  }> {
    try {
      const chain = getChainById(chainId)
      if (!chain) {
        throw new Error('Unsupported chain')
      }

      const lockContractAddress = getContractAddress(chainId, 'tokenLock')
      if (!lockContractAddress) {
        throw new Error('Token lock contract not available on this chain')
      }

      // Switch to correct network if needed
      await this.switchNetwork(chainId)

      // Check token allowance and approve if needed
      const approvalResult = await this.ensureTokenApproval(
        lockData.tokenAddress,
        lockContractAddress,
        lockData.amount,
        chainId
      )

      if (!approvalResult.success) {
        throw new Error(approvalResult.error || 'Token approval failed')
      }

      // Create the lock
      const lockContract = await this.createContract(lockContractAddress, TOKEN_LOCK_ABI)
      
      const transaction = await this.executeTransaction(
        lockContract,
        'lockTokens',
        [
          lockData.tokenAddress,
          BigInt(lockData.amount),
          BigInt(lockData.unlockTime),
          lockData.description
        ],
        { gasLimit: BigInt(GAS_LIMITS.lockTokens) }
      )

      const receipt = await this.waitForTransaction(transaction.hash)
      const lockId = this.extractLockId(receipt)

      // Save to database with enhanced error handling
      const lockInsertData: TokenLockInsert = {
        lock_id: lockId,
        chain_id: chainId,
        token_address: lockData.tokenAddress.toLowerCase(),
        token_name: undefined, // Will be filled by token validation
        token_symbol: undefined,
        token_decimals: 18,
        owner_address: userAddress.toLowerCase(),
        beneficiary_address: lockData.beneficiary.toLowerCase(),
        amount: lockData.amount,
        lock_time: new Date().toISOString(),
        unlock_time: new Date(lockData.unlockTime * 1000).toISOString(),
        description: lockData.description,
        lock_type: lockData.lockType,
        status: 'locked',
        creation_transaction: transaction.hash,
      }

      const savedLock = await this.saveLockToDatabase(lockInsertData)

      // Save vesting schedule if provided
      if (lockData.vestingSchedule && lockData.vestingSchedule.length > 0) {
        await this.saveVestingSchedule(lockId.toString(), lockData.vestingSchedule)
      }

      return {
        success: true,
        lockId,
        transactionHash: transaction.hash
      }
    } catch (error: any) {
      console.error('Failed to create token lock:', error)
      return {
        success: false,
        error: error.message || 'Failed to create token lock'
      }
    }
  }

  // Get token lock information
  async getTokenLock(lockId: number, chainId: number): Promise<TokenLockInfo | null> {
    try {
      const lockContractAddress = getContractAddress(chainId, 'tokenLock')
      if (!lockContractAddress) return null

      const lockContract = await this.createContract(lockContractAddress, TOKEN_LOCK_ABI)
      const lockInfo = await this.callContract(lockContract, 'getLockInfo', [lockId])

      // Get additional info from database
      const { data: dbInfo } = await (supabase
        .from('token_locks')
        .select('*')
        .eq('lock_id', lockId)
        .eq('chain_id', chainId)
        .single() as any)

      return {
        id: lockId,
        token: lockInfo.token,
        owner: lockInfo.owner,
        beneficiary: dbInfo?.beneficiary_address || lockInfo.owner,
        amount: BigInt(lockInfo.amount),
        lockTime: BigInt(lockInfo.lockTime),
        unlockTime: BigInt(lockInfo.unlockTime),
        claimed: lockInfo.claimed,
        description: lockInfo.description,
        lockType: dbInfo?.lock_type || 'custom',
        chainId,
        transactionHash: dbInfo?.transaction_hash || '',
        createdAt: dbInfo?.created_at || ''
      }
    } catch (error) {
      console.error('Failed to get token lock info:', error)
      return null
    }
  }

  // Unlock tokens (claim)
  async unlockTokens(
    lockId: number,
    chainId: number,
    userAddress: string
  ): Promise<{
    success: boolean
    transactionHash?: string
    error?: string
  }> {
    try {
      const lockContractAddress = getContractAddress(chainId, 'tokenLock')
      if (!lockContractAddress) {
        throw new Error('Token lock contract not available on this chain')
      }

      // Check if lock is ready to unlock
      const lockInfo = await this.getTokenLock(lockId, chainId)
      if (!lockInfo) {
        throw new Error('Lock not found')
      }

      if (lockInfo.claimed) {
        throw new Error('Tokens already claimed')
      }

      if (lockInfo.unlockTime > BigInt(Math.floor(Date.now() / 1000))) {
        throw new Error('Lock period has not expired yet')
      }

      if (lockInfo.beneficiary.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Only beneficiary can unlock tokens')
      }

      // Switch to correct network
      await this.switchNetwork(chainId)

      // Execute unlock
      const lockContract = await this.createContract(lockContractAddress, TOKEN_LOCK_ABI)
      const transaction = await this.executeTransaction(
        lockContract,
        'unlockTokens',
        [lockId],
        { gasLimit: BigInt(GAS_LIMITS.unlockTokens) }
      )

      await this.waitForTransaction(transaction.hash)

      // Update database
      const supabaseAny: any = supabase
      await supabaseAny
        .from('token_locks')
        .update({
          status: 'unlocked',
          unlocked_at: new Date().toISOString(),
          unlock_transaction: transaction.hash
        })
        .eq('lock_id', lockId)
        .eq('chain_id', chainId)

      return {
        success: true,
        transactionHash: transaction.hash
      }
    } catch (error: any) {
      console.error('Failed to unlock tokens:', error)
      return {
        success: false,
        error: error.message || 'Failed to unlock tokens'
      }
    }
  }

  // Get locks by owner
  async getLocksByOwner(ownerAddress: string, chainId: number): Promise<TokenLockInfo[]> {
    try {
      const { data: locks } = await (supabase
        .from('token_locks')
        .select('*')
        .or(`owner_address.eq.${ownerAddress.toLowerCase()},beneficiary_address.eq.${ownerAddress.toLowerCase()}`)
        .eq('chain_id', chainId)
        .order('created_at', { ascending: false }) as any)

      if (!locks) return []

      return Promise.all(
        locks.map(async (lock: any) => {
          const onChainInfo = await this.getTokenLock(lock.lock_id, chainId)
          return onChainInfo || {
            id: lock.lock_id,
            token: lock.token_address,
            owner: lock.owner_address,
            beneficiary: lock.beneficiary_address,
            amount: BigInt(lock.amount),
            lockTime: BigInt(Math.floor(new Date(lock.created_at).getTime() / 1000)),
            unlockTime: BigInt(Math.floor(new Date(lock.unlock_time).getTime() / 1000)),
            claimed: lock.status === 'unlocked',
            description: lock.description,
            lockType: lock.lock_type,
            chainId: lock.chain_id,
            transactionHash: lock.transaction_hash,
            createdAt: lock.created_at
          }
        })
      )
    } catch (error) {
      console.error('Failed to get locks by owner:', error)
      return []
    }
  }

  // Get vesting schedule for a lock
  async getVestingSchedule(lockId: number): Promise<VestingInfo | null> {
    try {
      const { data: schedule } = await (supabase
        .from('token_vesting')
        .select('*')
        .eq('lock_id', lockId)
        .order('unlock_time', { ascending: true }) as any)

      if (!schedule || schedule.length === 0) return null

      return {
        lockId,
        schedule: schedule.map((v: any) => ({
          percentage: v.percentage,
          unlockTime: Math.floor(new Date(v.unlock_time).getTime() / 1000),
          description: v.description,
          claimed: v.claimed,
          amount: BigInt(v.amount)
        }))
      }
    } catch (error) {
      console.error('Failed to get vesting schedule:', error)
      return null
    }
  }

  // Claim vested tokens
  async claimVestedTokens(
    lockId: number,
    vestingIndex: number,
    chainId: number,
    userAddress: string
  ): Promise<{
    success: boolean
    transactionHash?: string
    error?: string
  }> {
    try {
      // Implementation for claiming specific vesting periods
      // This would require a more complex smart contract with vesting support
      
      return {
        success: false,
        error: 'Vesting claims not yet implemented in smart contract'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to claim vested tokens'
      }
    }
  }

  // Get token information
  async getTokenInfo(tokenAddress: string, chainId: number): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    userBalance: string
  } | null> {
    try {
      const tokenContract = await this.createContract(tokenAddress, ERC20_ABI)
      
      const accounts = await (this.getProvider() as any).request({ method: 'eth_accounts' })
      const userAddress = accounts?.[0]

      const [name, symbol, decimals, totalSupply, userBalance] = await Promise.all([
        this.callContract(tokenContract, 'name'),
        this.callContract(tokenContract, 'symbol'),
        this.callContract(tokenContract, 'decimals'),
        this.callContract(tokenContract, 'totalSupply'),
        userAddress ? this.callContract(tokenContract, 'balanceOf', [userAddress]) : '0'
      ])

      return {
        name,
        symbol,
        decimals: parseInt(decimals),
        totalSupply: totalSupply.toString(),
        userBalance: userBalance.toString()
      }
    } catch (error) {
      console.error('Failed to get token info:', error)
      return null
    }
  }

  // Private helper methods
  private async ensureTokenApproval(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenContract = await this.createContract(tokenAddress, ERC20_ABI)
      
      const accounts = await (this.getProvider() as any).request({ method: 'eth_accounts' })
      const userAddress = accounts?.[0]
      
      if (!userAddress) {
        throw new Error('No wallet connected')
      }

      // Check current allowance
      const allowance = await this.callContract(tokenContract, 'allowance', [userAddress, spenderAddress])
      
      if (BigInt(allowance) >= BigInt(amount)) {
        return { success: true }
      }

      // Need to approve
      const approveTx = await this.executeTransaction(
        tokenContract,
        'approve',
        [spenderAddress, BigInt(amount)],
        { gasLimit: BigInt(GAS_LIMITS.approve) }
      )

      await this.waitForTransaction(approveTx.hash)
      
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token approval failed'
      }
    }
  }

  private async saveLockToDatabase(lockData: TokenLockInsert): Promise<TokenLockRow> {
    const response = await (supabase
      .from('token_locks')
      .insert(lockData as any)
      .select()
      .single() as any)

    const savedLock = handleSupabaseResponse(response as any, 'Save token lock to database')

    // Log the creation event
    await this.logTokenLockEvent(
      (savedLock as any).lock_id || (savedLock as any).id,
      'lock_created',
      {
        token_address: lockData.token_address,
        amount: lockData.amount,
        lock_type: lockData.lock_type,
        unlock_time: lockData.unlock_time,
      },
      lockData.creation_transaction,
      lockData.owner_address
    )

    return savedLock as any
  }

  private async saveVestingSchedule(lockId: string, schedule: any[]): Promise<TokenVestingRow[]> {
    const vestingData: TokenVestingInsert[] = schedule.map((s, index) => ({
      lock_id: lockId,
      period_index: index,
      percentage: s.percentage.toString(),
      unlock_time: new Date(s.unlockTime * 1000).toISOString(),
      description: s.description,
      amount: '0', // Will be calculated based on percentage of total lock
      claimed: false,
    }))

    const response = await (supabase
      .from('token_vesting')
      .insert(vestingData as any)
      .select() as any)

    return handleSupabaseResponse(response as any, 'Save vesting schedule to database')
  }

  private async logTokenLockEvent(
    lockId: string,
    eventType: string,
    eventData: any,
    transactionHash?: string,
    userAddress?: string
  ): Promise<void> {
    await (safeSupabaseOperation(
      () => (supabase
        .from('token_lock_events')
        .insert({
          lock_id: lockId,
          event_type: eventType,
          event_data: eventData,
          transaction_hash: transactionHash,
          user_address: userAddress,
        } as any) as any),
      'Log token lock event'
    ) as any) as Promise<void>
  }

  // Simplified contract interaction methods (same as presaleService)
  private async createContract(address: string, abi: any) {
    return { address, abi, methods: {} }
  }

  private async callContract(contract: any, method: string, params: any[] = []) {
    const provider = this.getProvider()
    return (provider as any).request({
      method: 'eth_call',
      params: [{ to: contract.address, data: '0x' }, 'latest']
    })
  }

  private async executeTransaction(contract: any, method: string, params: any[], options: any = {}) {
    const provider = this.getProvider()
    return (provider as any).request({
      method: 'eth_sendTransaction',
      params: [{ to: contract.address, data: '0x', ...options }]
    })
  }

  private async switchNetwork(chainId: number) {
    const provider = this.getProvider()
    const chain = getChainById(chainId)
    
    if (!chain) throw new Error('Unsupported chain')

    try {
      await (provider as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        await (provider as any).request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: chain.rpcUrls,
            blockExplorerUrls: chain.blockExplorerUrls
          }]
        })
      } else {
        throw error
      }
    }
  }

  private async waitForTransaction(hash: string) {
    return { transactionHash: hash, logs: [] }
  }

  private extractLockId(receipt: any): number {
    return Math.floor(Math.random() * 10000) // Mock implementation
  }
}

export const tokenLockService = new TokenLockService()