import { ethers } from 'ethers'
import { getChainById, getContractAddress } from './chains'
// Token information from deployment
export interface TokenInfo {
  tokenAddress: string
  creator: string
  name: string
  symbol: string
  totalSupply: bigint
  createdAt: bigint
  isActive: boolean
}

// Token deployment configuration
export interface TokenDeploymentConfig {
  name: string
  symbol: string
  totalSupply: string
  chainId: number
  owner?: string
}

// Token deployment result
export interface TokenDeploymentResult {
  success: boolean
  tokenAddress?: string
  transactionHash?: string
  error?: string
  tokenInfo?: TokenInfo
}

// Token validation result
export interface TokenValidationResult {
  isValid: boolean
  isVerified: boolean
  tokenInfo?: {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }
  error?: string
}

// Token balance result
export interface TokenBalanceResult {
  balance: string
  formatted: string
  decimals: number
  symbol: string
}

// Token allowance result
export interface TokenAllowanceResult {
  allowance: string
  formatted: string
  decimals: number
}

// Error messages
const ERROR_MESSAGES = {
  INVALID_CHAIN: 'Unsupported or invalid blockchain network',
  INVALID_PARAMS: 'Invalid token parameters',
  DEPLOYMENT_FAILED: 'Token deployment failed',
  VALIDATION_FAILED: 'Token validation failed',
  INSUFFICIENT_FUNDS: 'Insufficient funds for deployment',
  USER_REJECTED: 'Transaction was rejected by user',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_ADDRESS: 'Invalid token address',
}

// Common ERC20 ABI fragments
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]

/**
 * Deploys a new ERC20 token using the TokenFactory contract
 */
export async function deployToken(
  config: TokenDeploymentConfig,
  signer: ethers.Signer
): Promise<TokenDeploymentResult> {
  try {
    const { name, symbol, totalSupply, chainId } = config
    const owner = config.owner || (await signer.getAddress())

    // Validate input parameters
    if (!name || !symbol || !totalSupply) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_PARAMS,
      }
    }

    // Check if chain is supported
    const chain = getChainById(chainId)
    if (!chain) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_CHAIN,
      }
    }

    // Get TokenFactory contract address
    const tokenFactoryAddress = getContractAddress(chainId, 'tokenFactory')
    if (!tokenFactoryAddress) {
      return {
        success: false,
        error: 'TokenFactory contract not deployed on this network',
      }
    }

    // Create contract instance
    const tokenFactory = new ethers.Contract(
      tokenFactoryAddress,
      [
        'function createToken(string name, string symbol, uint256 totalSupply) external payable returns (address)',
        'function creationFee() view returns (uint256)',
      ],
      signer
    )

    // Get creation fee
    const creationFee = await tokenFactory.creationFee()

    // Deploy token
    const tx = await tokenFactory.createToken(
      name,
      symbol,
      ethers.parseEther(totalSupply),
      { value: creationFee }
    )

    // Wait for transaction receipt
    const receipt = await tx.wait()
    if (!receipt.status) {
      throw new Error('Transaction reverted')
    }

    // Extract token address from logs
    const event = receipt.logs.find(
      (log: any) =>
        log.topics[0] === ethers.id('TokenCreated(address,address,string,string,uint256)')
    )

    if (!event) {
      throw new Error('TokenCreated event not found')
    }

    const tokenAddress = '0x' + event.topics[1].slice(-40)

    return {
      success: true,
      tokenAddress,
      transactionHash: receipt.hash,
      tokenInfo: {
        tokenAddress,
        creator: owner,
        name,
        symbol,
        totalSupply: ethers.parseEther(totalSupply),
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        isActive: true,
      },
    }
  } catch (error: any) {
    console.error('Token deployment error:', error)
    return {
      success: false,
      error: parseTokenError(error),
    }
  }
}

/**
 * Validates a token contract
 */
export async function validateToken(
  tokenAddress: string,
  chainId: number,
  provider: ethers.Provider
): Promise<TokenValidationResult> {
  try {
    // Basic address validation
    if (!ethers.isAddress(tokenAddress)) {
      return {
        isValid: false,
        isVerified: false,
        error: ERROR_MESSAGES.INVALID_ADDRESS,
      }
    }

    // Create token contract instance
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

    // Fetch token details
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
    ])

    // Check if contract is verified
    const isVerified = await checkContractVerification(tokenAddress, chainId)

    return {
      isValid: true,
      isVerified,
      tokenInfo: {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
      },
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      isValid: false,
      isVerified: false,
      error: ERROR_MESSAGES.VALIDATION_FAILED,
    }
  }
}

/**
 * Gets token balance for a specific address
 */
export async function getTokenBalance(
  tokenAddress: string,
  ownerAddress: string,
  provider: ethers.Provider
): Promise<TokenBalanceResult> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const [balance, decimals, symbol] = await Promise.all([
      token.balanceOf(ownerAddress),
      token.decimals(),
      token.symbol(),
    ])

    return {
      balance: balance.toString(),
      formatted: formatTokenAmount(balance, Number(decimals)),
      decimals: Number(decimals),
      symbol,
    }
  } catch (error) {
    console.error('Error getting token balance:', error)
    throw new Error('Failed to get token balance')
  }
}

/**
 * Gets token allowance for a spender
 */
export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  provider: ethers.Provider
): Promise<TokenAllowanceResult> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const [allowance, decimals] = await Promise.all([
      token.allowance(ownerAddress, spenderAddress),
      token.decimals(),
    ])

    return {
      allowance: allowance.toString(),
      formatted: formatTokenAmount(allowance, Number(decimals)),
      decimals: Number(decimals),
    }
  } catch (error) {
    console.error('Error getting token allowance:', error)
    throw new Error('Failed to get token allowance')
  }
}

/**
 * Approves a spender to spend tokens
 */
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: ethers.Signer
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    const decimals = await token.decimals()
    const parsedAmount = ethers.parseUnits(amount, decimals)

    const tx = await token.approve(spenderAddress, parsedAmount)
    const receipt = await tx.wait()

    if (!receipt.status) {
      throw new Error('Transaction reverted')
    }

    return {
      success: true,
      transactionHash: receipt.hash,
    }
  } catch (error: any) {
    console.error('Token approval error:', error)
    return {
      success: false,
      error: parseTokenError(error),
    }
  }
}

/**
 * Transfers tokens to another address
 */
export async function transferToken(
  tokenAddress: string,
  toAddress: string,
  amount: string,
  signer: ethers.Signer
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    const decimals = await token.decimals()
    const parsedAmount = ethers.parseUnits(amount, decimals)

    const tx = await token.transfer(toAddress, parsedAmount)
    const receipt = await tx.wait()

    if (!receipt.status) {
      throw new Error('Transaction reverted')
    }

    return {
      success: true,
      transactionHash: receipt.hash,
    }
  } catch (error: any) {
    console.error('Token transfer error:', error)
    return {
      success: false,
      error: parseTokenError(error),
    }
  }
}

/**
 * Helper function to check if a contract is verified on block explorer
 */
async function checkContractVerification(
  address: string,
  chainId: number
): Promise<boolean> {
  try {
    const chain = getChainById(chainId)
    if (!chain?.explorerApiUrl) return false

    const response = await fetch(
      `${chain.explorerApiUrl}?module=contract&action=getabi&address=${address}&apikey=${chain.explorerApiKey || ''}`
    )
    const data = await response.json()
    return data.status === '1' && data.result !== 'Contract source code not verified'
  } catch (error) {
    console.error('Error checking contract verification:', error)
    return false
  }
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals)
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals)
}

/**
 * Parse token-related errors into user-friendly messages
 */
function parseTokenError(error: any): string {
  if (error.code === 4001) {
    return ERROR_MESSAGES.USER_REJECTED
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    return ERROR_MESSAGES.INSUFFICIENT_FUNDS
  }

  if (error.code === 'NETWORK_ERROR') {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  // Handle common error patterns
  const message = error.reason || error.message || ''

  if (message.includes('insufficient funds')) {
    return ERROR_MESSAGES.INSUFFICIENT_FUNDS
  }

  if (message.includes('user rejected') || message.includes('User denied')) {
    return ERROR_MESSAGES.USER_REJECTED
  }

  return error.message || ERROR_MESSAGES.DEPLOYMENT_FAILED
}
