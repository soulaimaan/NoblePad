// Presale service - handles blockchain interactions and database operations
import { SUPPORTED_CHAINS, getChainById } from './chains'
import { 
  PRESALE_FACTORY_ABI, 
  PRESALE_ABI, 
  TOKEN_LOCK_ABI, 
  ERC20_ABI,
  getContractAddress,
  GAS_LIMITS 
} from './contracts'
import { ethers } from 'ethers'
import { 
  supabase, 
  db, 
  handleSupabaseResponse, 
  safeSupabaseOperation,
  type PresaleInsert,
  type PresaleRow,
  uploadFile
} from './supabaseClient'

export interface PresaleFormData {
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
  kycDocuments: string[] // File URLs after upload
  auditReport: string
  teamTokenLockMonths: string
  teamWallets: string[]
}

export interface ContributorInfo {
  address: string
  contribution: bigint
  tokensClaimed: boolean
  refundClaimed: boolean
  isWhitelisted: boolean
  tier: number
  allocationBonus: number
}

export interface PresaleInfo {
  id: string
  contractAddress: string
  token: string
  owner: string
  softCap: bigint
  hardCap: bigint
  presaleRate: bigint
  listingRate: bigint
  liquidityPercent: bigint
  startTime: bigint
  endTime: bigint
  lockPeriod: bigint
  totalRaised: bigint
  totalSold: bigint
  status: number // 0: Pending, 1: Active, 2: Success, 3: Failed, 4: Cancelled
  chainId: number
  participantCount: number
  isWhitelistEnabled: boolean
}

class PresaleService {
  private getProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum
    }
    throw new Error('No Ethereum provider found')
  }

  // Return an ethers provider for convenience
  private getEthersProvider() {
    const p = this.getProvider()
    return new ethers.BrowserProvider(p as any)
  }

  // Validate token contract
  async validateToken(tokenAddress: string, chainId: number): Promise<{
    isValid: boolean
    tokenInfo?: {
      name: string
      symbol: string
      decimals: number
      totalSupply: string
      verified: boolean
    }
    error?: string
  }> {
    try {
      const provider = this.getProvider()
      
      // Switch to correct network if needed
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      if (parseInt(currentChainId, 16) !== chainId) {
        await this.switchNetwork(chainId)
      }

      // Create contract instance
      const contract = await this.createContract(tokenAddress, ERC20_ABI)
      
      // Get token info
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.callContract(contract, 'name'),
        this.callContract(contract, 'symbol'),
        this.callContract(contract, 'decimals'),
        this.callContract(contract, 'totalSupply')
      ])

      // Check if contract is verified (simplified check)
      const isVerified = await this.checkContractVerification(tokenAddress, chainId)

      return {
        isValid: true,
        tokenInfo: {
          name,
          symbol,
          decimals: parseInt(decimals),
          totalSupply: totalSupply.toString(),
          verified: isVerified
        }
      }
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Failed to validate token contract'
      }
    }
  }

  // Create presale on blockchain
  async createPresaleContract(formData: PresaleFormData, userAddress: string): Promise<{
    success: boolean
    presaleAddress?: string
    transactionHash?: string
    error?: string
  }> {
    try {
      const provider = this.getProvider()
      const ethersProvider = this.getEthersProvider()
      const signer = await ethersProvider.getSigner()
      const chain = getChainById(formData.chainId)
      
      if (!chain) {
        throw new Error('Unsupported chain')
      }

      // Get contract addresses
      const factoryAddress = getContractAddress(formData.chainId, 'presaleFactory')
      const routerAddress = getContractAddress(formData.chainId, 'router')
      
      if (!factoryAddress || !routerAddress) {
        throw new Error('Contract addresses not configured for this chain')
      }

      // Switch to correct network in the wallet if needed
      try {
        const currentChainId = await provider.request({ method: 'eth_chainId' })
        if (parseInt(currentChainId, 16) !== formData.chainId) {
          await this.switchNetwork(formData.chainId)
        }
      } catch (err) {
        // ignore - wallet may not respond
      }

      // Prepare contract parameters
      const params = this.prepareContractParams(formData, routerAddress)
      
      // Estimate gas
      // Create ethers contract instance connected to signer
      const factoryContract = new ethers.Contract(factoryAddress!, PRESALE_FACTORY_ABI as any, signer)

      // Estimate gas for the createPresale call
      const gasEstimate = await factoryContract.estimateGas.createPresale(...params.contractParams, {
        value: params.creationFee
      })

      // Send transaction
      const tx = await factoryContract.createPresale(...params.contractParams, {
        value: params.creationFee,
        gasLimit: gasEstimate.mul(120).div(100)
      })

      const receipt = await tx.wait()

      // Try to extract presale address from events
      let presaleAddress: string | undefined = undefined
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = factoryContract.interface.parseLog(log)
            if (parsed && parsed.name === 'PresaleCreated') {
              presaleAddress = parsed.args?.presale || parsed.args?.[0]
              break
            }
          } catch (e) {
            // ignore parsing errors
          }
        }
      }

      // Fallback: if factory returned a value via receipt.events
      if (!presaleAddress && receipt.events) {
        for (const ev of receipt.events) {
          if ((ev as any).event === 'PresaleCreated') {
            presaleAddress = (ev as any).args?.presale || (ev as any).args?.[0]
            break
          }
        }
      }

      return {
        success: true,
        presaleAddress,
        transactionHash: tx.hash
      }
    } catch (error: any) {
      console.error('Failed to create presale contract:', error)
      return {
        success: false,
        error: error.message || 'Failed to create presale contract'
      }
    }
  }

  // Lock team tokens
  async lockTeamTokens(
    tokenAddress: string,
    amounts: string[],
    unlockTimes: number[],
    recipients: string[],
    chainId: number
  ): Promise<{
    success: boolean
    lockIds?: number[]
    transactionHashes?: string[]
    error?: string
  }> {
    try {
      const lockAddress = getContractAddress(chainId, 'tokenLock')
      if (!lockAddress) {
        throw new Error('Token lock contract not available on this chain')
      }

      const ethersProvider = this.getEthersProvider()
      const signer = await ethersProvider.getSigner()
      const lockContract = new ethers.Contract(lockAddress, TOKEN_LOCK_ABI as any, signer)
      const lockIds: number[] = []
      const transactionHashes: string[] = []

      // Lock tokens for each recipient
      for (let i = 0; i < recipients.length; i++) {
        const amount = BigInt(amounts[i])
        const unlockTime = BigInt(unlockTimes[i])
        const description = `Team tokens - ${recipients[i]}`

        const tx = await lockContract.lockTokens(tokenAddress, amount.toString(), unlockTime.toString(), description, {
          gasLimit: BigInt(GAS_LIMITS.lockTokens)
        })

        const receipt = await tx.wait()
        const lockId = this.extractLockId(receipt)

        lockIds.push(lockId)
        transactionHashes.push(tx.hash)
      }

      return {
        success: true,
        lockIds,
        transactionHashes
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to lock team tokens'
      }
    }
  }

  // Submit presale to database
  async submitPresaleToDatabase(
    formData: PresaleFormData,
    contractAddress: string,
    userAddress: string,
    transactionHash: string
  ): Promise<{ success: boolean; presaleId?: string; error?: string }> {
    try {
      // Handle file uploads for KYC documents
      const uploadedKycDocuments = await this.uploadKycDocuments(
        formData.kycDocuments,
        userAddress
      )

      const presaleInsertData: PresaleInsert = {
        contract_address: contractAddress,
        chain_id: formData.chainId,
        creator_address: userAddress.toLowerCase(),
        
        // Project info
        name: formData.projectName,
        description: formData.description,
        website: formData.website || null,
        twitter: formData.twitter || null,
        telegram: formData.telegram || null,
        discord: formData.discord || null,
        whitepaper: formData.whitepaper || null,
        
        // Token info
        token_address: formData.tokenAddress.toLowerCase(),
        token_name: formData.tokenName,
        token_symbol: formData.tokenSymbol,
        total_supply: formData.totalSupply,
        
        // Presale params
        soft_cap: formData.softCap,
        hard_cap: formData.hardCap,
        token_price: formData.tokenPrice,
        min_contribution: formData.minContribution || null,
        max_contribution: formData.maxContribution || null,
        start_time: formData.startDate,
        end_time: formData.endDate,
        liquidity_percentage: parseInt(formData.liquidityPercentage),
        liquidity_lock_months: parseInt(formData.liquidityLockMonths),
        
        // Vesting
        vesting_enabled: formData.vestingEnabled,
        vesting_schedule: formData.vestingSchedule as any,
        
        // Security
        kyc_documents: uploadedKycDocuments,
        audit_report: formData.auditReport || null,
        team_token_lock_months: parseInt(formData.teamTokenLockMonths),
        team_wallets: formData.teamWallets,
        
        // Metadata
        creation_transaction: transactionHash,
        status: 'pending_review',
        total_raised: '0',
        total_participants: 0,
      }

      const response = await supabase
        .from('presales')
        .insert(presaleInsertData)
        .select('id')
        .single()

      const savedPresale = handleSupabaseResponse(response, 'Submit presale to database')

      // Create initial timeline entry
      await this.createTimelineEntry(
        savedPresale.id,
        'presale_submitted',
        'Presale submitted for review',
        transactionHash
      )

      // Update user session
      await db.upsertUserSession(userAddress, {
        presales_created: 1, // This would be incremented in a real implementation
        total_raised: '0',
      })

      return {
        success: true,
        presaleId: savedPresale.id
      }
    } catch (error: any) {
      console.error('Failed to submit presale to database:', error)
      return {
        success: false,
        error: error.message || 'Failed to save presale to database'
      }
    }
  }

  // Upload KYC documents to Supabase storage
  private async uploadKycDocuments(
    documents: string[],
    userAddress: string
  ): Promise<string[]> {
    // If documents are already URLs, return them as is
    if (documents.every(doc => doc.startsWith('http'))) {
      return documents
    }

    // In a real implementation, this would handle file uploads
    // For now, return the documents as provided
    return documents
  }

  // Create timeline entry
  private async createTimelineEntry(
    presaleId: string,
    eventType: string,
    description: string,
    transactionHash?: string
  ): Promise<void> {
    await safeSupabaseOperation(
      () => supabase
        .from('presale_timeline')
        .insert({
          presale_id: presaleId,
          event_type: eventType,
          description,
          transaction_hash: transactionHash,
        }),
      'Create timeline entry'
    )
  }

  // Get presale information from blockchain
  async getPresaleInfo(contractAddress: string, chainId: number): Promise<PresaleInfo | null> {
    try {
      const factoryAddress = getContractAddress(chainId, 'presaleFactory')
      if (!factoryAddress) return null

      const factoryContract = await this.createContract(factoryAddress, PRESALE_FACTORY_ABI)
      const presaleContract = await this.createContract(contractAddress, PRESALE_ABI)

      // Get presale info from factory
      const presaleInfo = await this.callContract(factoryContract, 'getPresaleInfo', [contractAddress])
      
      // Get additional info from presale contract
      const [participantCount] = await Promise.all([
        this.callContract(presaleContract, 'getParticipantCount', [])
      ])

      return {
        id: contractAddress,
        contractAddress,
        token: presaleInfo.token,
        owner: presaleInfo.owner,
        softCap: BigInt(presaleInfo.softCap),
        hardCap: BigInt(presaleInfo.hardCap),
        presaleRate: BigInt(presaleInfo.presaleRate),
        listingRate: BigInt(presaleInfo.listingRate),
        liquidityPercent: BigInt(presaleInfo.liquidityPercent),
        startTime: BigInt(presaleInfo.startTime),
        endTime: BigInt(presaleInfo.endTime),
        lockPeriod: BigInt(presaleInfo.lockPeriod),
        totalRaised: BigInt(presaleInfo.totalRaised),
        totalSold: BigInt(presaleInfo.totalSold),
        status: presaleInfo.status,
        chainId,
        participantCount: parseInt(participantCount),
        isWhitelistEnabled: false // To be implemented
      }
    } catch (error) {
      console.error('Failed to get presale info:', error)
      return null
    }
  }

  // Helper methods (simplified implementations)
  private async createContract(address: string, abi: any) {
    // Create an ethers.js contract instance (read-only by default)
    const provider = this.getEthersProvider()
    return new ethers.Contract(address, abi as any, provider)
  }

  private async callContract(contract: any, method: string, params: any[] = []) {
    // Use ethers contract read method
    if (!contract) throw new Error('Contract instance required')
    return await contract[method](...params)
  }

  private async executeTransaction(contract: any, method: string, params: any[], options: any = {}) {
    if (!contract) throw new Error('Contract instance required')
    const ethersProvider = this.getEthersProvider()
    const signer = await ethersProvider.getSigner()
    const contractWithSigner = contract.connect ? contract.connect(signer) : contract
    const tx = await contractWithSigner[method](...params, options)
    return tx
  }

  private async switchNetwork(chainId: number) {
    const provider = this.getProvider()
    const chain = getChainById(chainId)
    
    if (!chain) {
      throw new Error('Unsupported chain')
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, add it
        await provider.request({
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

  private prepareContractParams(formData: PresaleFormData, routerAddress: string) {
    // Convert form data to contract parameters
    const softCapWei = BigInt(parseFloat(formData.softCap) * 1e18)
    const hardCapWei = BigInt(parseFloat(formData.hardCap) * 1e18)
    const presaleRate = BigInt(parseFloat(formData.tokenPrice) * 1e18)
    const startTime = BigInt(Math.floor(new Date(formData.startDate).getTime() / 1000))
    const endTime = BigInt(Math.floor(new Date(formData.endDate).getTime() / 1000))
    const lockPeriod = BigInt(parseInt(formData.liquidityLockMonths) * 30 * 24 * 60 * 60) // Convert months to seconds
    
    return {
      contractParams: [
        formData.tokenAddress,
        routerAddress,
        softCapWei.toString(),
        hardCapWei.toString(),
        presaleRate.toString(),
        presaleRate.toString(), // listing rate same as presale for now
        BigInt(parseInt(formData.liquidityPercentage)).toString(),
        startTime.toString(),
        endTime.toString(),
        lockPeriod.toString(),
        BigInt(parseFloat(formData.maxContribution) * 1e18).toString(),
        BigInt(parseFloat(formData.hardCap) * parseFloat(formData.tokenPrice) * 1e18).toString(), // Total tokens for presale
        formData.vestingSchedule.map(v => ({
          recipient: formData.teamWallets[0] || '0x0000000000000000000000000000000000000000',
          amount: BigInt(parseFloat(formData.totalSupply) * v.percentage / 100 * 1e18).toString(),
          unlockTime: BigInt(v.unlockTime).toString()
        }))
      ],
      creationFee: BigInt(0.01 * 1e18) // 0.01 ETH creation fee
    }
  }

  private async estimateGas(contract: any, method: string, params: any[], options: any = {}) {
    if (!contract) throw new Error('Contract instance required')
    try {
      const estimate = await contract.estimateGas[method](...params, options)
      return estimate
    } catch (e) {
      return BigInt(GAS_LIMITS.createPresale)
    }
  }

  private async waitForTransaction(hash: string) {
    const ethersProvider = this.getEthersProvider()
    const receipt = await ethersProvider.getTransactionReceipt(hash)
    return receipt
  }

  private extractPresaleAddress(receipt: any): string {
    if (!receipt) return ''
    // Try to find PresaleCreated event
    if (receipt.logs) {
      for (const log of receipt.logs) {
        try {
          // We cannot decode without the contract interface here - caller should parse
        } catch (e) {
          // ignore
        }
      }
    }
    return ''
  }

  private extractLockId(receipt: any): number {
    if (!receipt) return 0
    if (receipt.events) {
      for (const ev of receipt.events) {
        if ((ev as any).event === 'TokensLocked') {
          return parseInt(((ev as any).args?.lockId || 0).toString())
        }
      }
    }
    // Try logs fallback
    return 0
  }

  private async checkContractVerification(address: string, chainId: number): Promise<boolean> {
    // Implementation would check if contract is verified on block explorer
    return true // Placeholder
  }
}

export const presaleService = new PresaleService()