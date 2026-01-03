// Presale service - handles blockchain interactions and database operations
import { ethers } from 'ethers'
import { getChainById } from './chains'
import {
  ERC20_ABI,
  GAS_LIMITS,
  PRESALE_ABI,
  PRESALE_FACTORY_ABI,
  TOKEN_LOCK_ABI,
  getContractAddress
} from './contracts'
import {
  safeSupabaseOperation,
  supabase
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
  saleType: string // Added to support Fair Launch logic
  
  // Vesting
  vestingEnabled: boolean
  vestingSchedule: Array<{ percentage: number; timeDescription: string; unlockTime: number }>
  
  // Security
  kycDocuments: string[] // File URLs after upload
  auditReport: string
  teamTokenLockMonths: string
  teamWallets: string[]
  milestones: Array<{
    title: string
    percentage: string
    deadline: string
    description: string
  }>
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
    if (typeof window !== 'undefined') {
      return (window as any).ethereum || (window as any).okxwallet || null
    }
    return null
  }

  // Return an ethers provider for convenience
  private getEthersProvider(externalProvider?: any) {
    const p = externalProvider || this.getProvider()
    if (!p) return null
    return new ethers.BrowserProvider(p as any)
  }

  // Validate token contract / XRPL Issuer
  async validateToken(tokenAddress: string, chainId: number, externalProvider?: any): Promise<{
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
      if (chainId === 144) {
        // XRPL Validation
        if (!tokenAddress.startsWith('r') || tokenAddress.length < 25) {
          throw new Error('Invalid XRPL address format')
        }

        // Check if account exists on ledger
        const response = await fetch('https://xrplcluster.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: "account_info",
            params: [{ account: tokenAddress, ledger_index: "validated" }]
          })
        })
        const data = await response.json()
        
        if (data.result && data.result.error === 'actNotFound') {
          throw new Error('Account not found on XRPL. Please ensure the issuer account is activated.')
        }

        if (data.result && data.result.account_data) {
          const flags = data.result.account_data.Flags
          const isDefaultRipple = (flags & 0x00800000) !== 0 // asfDefaultRipple
          
          return {
            isValid: true,
            tokenInfo: {
              name: 'XRPL Issued Currency',
              symbol: 'CUR', // Placeholder, will be updated by user in form
              decimals: 15, // XRPL standard for issued currencies
              totalSupply: 'Unlimited (Mintable)',
              verified: isDefaultRipple
            }
          }
        }
        
        throw new Error('Could not verify XRPL account')
      }

      const provider = externalProvider || this.getProvider()
      
      // Switch to correct network if needed
      const currentChainId = await (provider as any).request({ method: 'eth_chainId' })
      if (parseInt(currentChainId, 16) !== chainId) {
        await this.switchNetwork(chainId, provider)
      }

      // Create contract instance
      const contract = await this.createContract(tokenAddress, ERC20_ABI, provider)
      if (!contract) throw new Error("Could not initialize contract instance")
      
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
  async createPresaleContract(formData: PresaleFormData, userAddress: string, externalProvider?: any): Promise<{
    success: boolean
    presaleAddress?: string
    transactionHash?: string
    error?: string
  }> {
    try {
      const provider = externalProvider || this.getProvider()
      const ethersProvider = this.getEthersProvider(provider)
      if (!ethersProvider) throw new Error("Wallet provider not found. Please connect your wallet.")
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
        const currentChainId = await (provider as any).request({ method: 'eth_chainId' })
        if (parseInt(currentChainId, 16) !== formData.chainId) {
          await this.switchNetwork(formData.chainId, provider)
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
      const gasEstimate = await factoryContract.createPresale.estimateGas(...params.contractParams, {
        value: params.creationFee
      })

      // Send transaction
      const tx = await factoryContract.createPresale(...params.contractParams, {
        value: params.creationFee,
        gasLimit: (gasEstimate * 120n) / 100n
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
      if (!ethersProvider) throw new Error("Wallet provider not found")
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

  // Contribute to presale on blockchain
  async contributeToPresale(
    presaleAddress: string, 
    amount: string, 
    chainId: number,
    externalProvider?: any
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const provider = externalProvider || this.getProvider()
      const ethersProvider = this.getEthersProvider(provider)
      if (!ethersProvider) throw new Error("Wallet provider not found")
      const signer = await ethersProvider.getSigner()

      // Switch to correct network if needed
      try {
        let hexChainId = await (provider as any).request({ method: 'eth_chainId' })
        let currentChainId = parseInt(hexChainId, 16)
        
        if (currentChainId !== chainId) {
          await this.switchNetwork(chainId, provider)
          
          // Re-verify after switch
          hexChainId = await (provider as any).request({ method: 'eth_chainId' })
          currentChainId = parseInt(hexChainId, 16)
          
          if (currentChainId !== chainId) {
            throw new Error(`Failed to switch network. Expected Chain ID ${chainId}, but got ${currentChainId}.`)
          }
        }
      } catch (err: any) {
        console.error('[PresaleService] Network switch failed:', err)
        if (err.code === 4001) {
            throw new Error('User rejected network switch.')
        }
        throw new Error(`Network switch failed: ${err.message || 'Unknown error'}`)
      }

      const presaleContract = new ethers.Contract(presaleAddress.trim(), PRESALE_ABI as any, signer)
      
      // Send contribution
      const tx = await presaleContract.contribute({
        value: ethers.parseEther(amount),
        gasLimit: BigInt(GAS_LIMITS.contribute)
      })

      const receipt = await tx.wait()

      return {
        success: true,
        transactionHash: tx.hash
      }
    } catch (error: any) {
      console.error('Contribution failed:', error)
      return {
        success: false,
        error: error.message || 'Contribution failed'
      }
    }
  }

  // Record contribution in database
  async recordContributionInDatabase(
    presaleId: string,
    userAddress: string,
    amount: string,
    transactionHash: string,
    tokenAllocation: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const apiResponse = await fetch('/api/record-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presaleId,
          userAddress: userAddress.toLowerCase(),
          amount: parseFloat(amount),
          tokenAllocation: parseFloat(tokenAllocation),
          transactionHash
        })
      })

      const result = await apiResponse.json()
      if (!apiResponse.ok || !result.success) {
        throw new Error(result.error || 'Failed to record contribution via API')
      }

      return { success: true }
    } catch (error: any) {
      console.error('DB Contribution update failed:', error)
      return { success: false, error: error.message }
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

      // Map inputs to the legacy DB schema (001_initial_schema.sql)
      const chainMap: Record<number, string> = {
        1: 'ETH', 56: 'BSC', 137: 'POLYGON', 42161: 'ARB', 8453: 'BASE', 31337: 'ETH'
      }
      const chainName = chainMap[formData.chainId] || 'ETH'
      
      const presaleInsertData: any = {
        // Project Information
        project_name: formData.projectName,
        description: formData.description,
        website: formData.website || null,
        twitter: formData.twitter || null,
        telegram: formData.telegram || null,
        discord: formData.discord || null,
        whitepaper: formData.whitepaper || null,
        
        // Token Details
        token_name: formData.tokenName,
        token_symbol: formData.tokenSymbol,
        token_address: formData.tokenAddress.toLowerCase(),
        total_supply: parseInt(formData.totalSupply) || 0,
        
        // Presale Configuration
        soft_cap: parseFloat(formData.softCap || '0'),
        hard_cap: parseFloat(formData.hardCap || '0'),
        token_price: parseFloat(formData.tokenPrice || '0'),
        min_contribution: parseFloat(formData.minContribution || '0'),
        max_contribution: parseFloat(formData.maxContribution || '0'),
        start_date: formData.startDate,
        end_date: formData.endDate,
        
        // Security Settings
        liquidity_percentage: Math.max(parseInt(formData.liquidityPercentage) || 60, 60),
        liquidity_lock_months: Math.max(parseInt(formData.liquidityLockMonths) || 6, 6),
        team_token_lock_months: Math.max(parseInt(formData.teamTokenLockMonths) || 12, 12),
        
        // Vesting
        vesting_schedule: formData.vestingSchedule,
        
        // Status & Chain
        status: 'pending',
        chain: chainName,
        submitter_address: userAddress.toLowerCase(),
        
        // Extended fields (Supported by API Route auto-filtering)
        contract_address: contractAddress,
        audit_report_url: formData.auditReport || null,
        creation_transaction: transactionHash
      }

      // Call server-side API to bypass RLS policies
      const apiResponse = await fetch('/api/create-presale-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          insertData: presaleInsertData,
          transactionHash,
          userAddress: userAddress.toLowerCase()
        })
      })

      const apiResult = await apiResponse.json()
      
      if (!apiResponse.ok || !apiResult.success) {
        throw new Error(apiResult.error || 'Failed to submit presale via API')
      }

      const savedPresale = { id: apiResult.data.id }

      return {
        success: true,
        presaleId: (savedPresale as any).id
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
      () => (supabase
        .from('presale_timeline')
        .insert({
          presale_id: presaleId,
          event_type: eventType,
          description,
          transaction_hash: transactionHash,
        } as any) as any),
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

  private async createContract(address: string, abi: any, externalProvider?: any) {
    // Create an ethers.js contract instance (read-only by default)
    const provider = this.getEthersProvider(externalProvider)
    if (!provider) return null
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
    if (!ethersProvider) throw new Error("Wallet provider not found")
    const signer = await ethersProvider.getSigner()
    const contractWithSigner = contract.connect ? contract.connect(signer) : contract
    const tx = await contractWithSigner[method](...params, options)
    return tx
  }

  private async switchNetwork(chainId: number, externalProvider?: any) {
    const provider = externalProvider || this.getProvider()
    if (!provider) return
    
    const chain = getChainById(chainId)
    
    if (!chain) {
      throw new Error('Unsupported chain')
    }

    try {
      await (provider as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, add it
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

  private prepareContractParams(formData: PresaleFormData, routerAddress: string) {
    // Helper to safely convert potentially empty/invalid strings to BigInt
    const safeBigInt = (val: string | number | undefined, decimals: number = 18): bigint => {
      if (val === undefined || val === '') return BigInt(0)
      const parsed = typeof val === 'string' ? parseFloat(val) : val
      if (isNaN(parsed)) return BigInt(0)
      return BigInt(Math.floor(parsed * Math.pow(10, decimals)))
    }

    const safeTimestamp = (dateStr: string): bigint => {
      if (!dateStr) return BigInt(0)
      const time = new Date(dateStr).getTime()
      return isNaN(time) ? BigInt(0) : BigInt(Math.floor(time / 1000))
    }

    const softCapWei = safeBigInt(formData.softCap)
    const presaleRate = safeBigInt(formData.tokenPrice)
    const liquidityPercent = parseInt(formData.liquidityPercentage) || 0
    
    let hardCapWei = safeBigInt(formData.hardCap)
    
    // For Fair Launch, calculate the maximum possible Hard Cap based on supply
    if (formData.saleType === 'fair_launch') {
      const totalSupplyWei = safeBigInt(formData.totalSupply)
      
      // Calculate tokens per ETH (presale + liquidity portion)
      // Rate is implicitly scaled by 1e18 in safeBigInt(tokenPrice), so it represents (Tokens * 1e18 / ETH) ?
      // No, safeBigInt(1000) -> 1000 * 1e18.
      // Contract uses: amount = msg.value * rate.
      // If rate = 1000 * 1e18. 1 Wei buys 1000 Tokens (if 18 decimals).
      
      // Tokens needed per 1 ETH raised = Rate + (Rate * Liq / 100)
      const rateVal = presaleRate // This is the scaled rate
      const tokensPerEth = rateVal + (rateVal * BigInt(liquidityPercent) / BigInt(100))
      
      if (tokensPerEth > BigInt(0)) {
         // WEI_RAISABLE = TOTAL_SUPPLY_WEI * 1e18 / TOKENS_PER_ETH_SCALED
         // (Supply * 1e18) / (Rate * 1e18) = Supply / Rate. (Correct for ETH amount)
         // But we are mixing scaled integers.
         // hardCapWei = (totalSupplyWei * BigInt(1e18)) / tokensPerEth
         hardCapWei = (totalSupplyWei * BigInt(1e18)) / tokensPerEth
      }
      
      // Safety margin (99.9%)
       hardCapWei = hardCapWei * BigInt(999) / BigInt(1000)
    }

    // Ensure startTime is at least 120 seconds in the future to prevent block.timestamp collisions
    let startTime = safeTimestamp(formData.startDate)
    const now = BigInt(Math.floor(Date.now() / 1000))
    if (startTime <= now) {
      startTime = now + BigInt(120) // Add 2 minute buffer
    }

    const endTime = safeTimestamp(formData.endDate)
    const lockPeriod = BigInt((parseInt(formData.liquidityLockMonths) || 0) * 30 * 24 * 60 * 60)
    
    // Calculate total tokens required for presale
    const totalTokensRequired = formData.saleType === 'fair_launch' 
      ? safeBigInt(formData.totalSupply)
      : (hardCapWei * presaleRate / BigInt(1e18)) + 
        ((hardCapWei * BigInt(liquidityPercent) / BigInt(100)) * presaleRate / BigInt(1e18))

    // Convert rate to simple integer (tokens per 1 ETH, not scaled)
    // User enters "1000" meaning 1000 tokens per ETH. Contract does: msg.value * rate
    // 1 ETH (1e18 wei) * 1000 = 1000e18 wei worth of tokens = 1000 tokens (with 18 decimals)
    const rateInteger = parseFloat(formData.tokenPrice) || 0
    
    // Ensure liquidity is at least 60% as required by contract
    const finalLiquidityPercent = Math.max(liquidityPercent, 60)
    
    // PresaleFactory.createPresale expects exactly 12 parameters:
    // _token, _router, _softCap, _hardCap, _presaleRate, _listingRate, 
    // _liquidityPercent, _startTime, _endTime, _lockPeriod, _maxSpendPerBuyer, _amount
    const contractParams = [
        formData.tokenAddress,                        // _token
        routerAddress,                                // _router
        softCapWei.toString(),                        // _softCap (in wei)
        hardCapWei.toString(),                        // _hardCap (in wei)
        BigInt(Math.floor(rateInteger)).toString(),   // _presaleRate (tokens per 1 ETH worth of wei)
        BigInt(Math.floor(rateInteger)).toString(),   // _listingRate (same as presale)
        BigInt(finalLiquidityPercent).toString(),     // _liquidityPercent (60-100)
        startTime.toString(),                         // _startTime (unix timestamp)
        endTime.toString(),                           // _endTime (unix timestamp)
        lockPeriod.toString(),                        // _lockPeriod (seconds)
        safeBigInt(formData.maxContribution).toString(), // _maxSpendPerBuyer (in wei)
        totalTokensRequired.toString()                // _amount (total tokens in wei)
    ]
    
    console.log('--- Presale Deployment Params ---')
    console.log('Token:', contractParams[0])
    console.log('Router:', contractParams[1])
    console.log('SoftCap:', contractParams[2])
    console.log('HardCap:', contractParams[3])
    console.log('Rate:', contractParams[4])
    console.log('Liq%:', contractParams[6])
    console.log('StartTime:', contractParams[7])
    console.log('EndTime:', contractParams[8])
    console.log('Amount:', contractParams[11])
    console.log('---------------------------------')
    
    return {
      contractParams,
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
    if (!ethersProvider) throw new Error("Wallet provider not found")
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