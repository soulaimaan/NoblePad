// Supported blockchain networks configuration
interface ContractAddresses {
  tokenFactory: string
  presaleFactory: string
  tokenLock: string
  router?: string
  wrappedNative?: string
  multicall?: string
  staking?: string
  belgrave?: string
}

interface ChainConfig {
  id: number
  name: string
  symbol: string
  rpcUrls: string[]
  blockExplorerUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  iconUrl: string
  color: string
  isMainnet: boolean
  contracts: ContractAddresses
  minimumPresaleAmount: string
  gasMultiplier: number
  explorerApiUrl?: string
  explorerApiKey?: string
  blockTime?: number
  testnet?: boolean
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrl: '/chains/ethereum.svg',
    color: '#627EEA',
    isMainnet: true,
    contracts: {
      tokenFactory: '0x...', // TODO: Deploy TokenFactory
      presaleFactory: '0x...', // To be deployed
      tokenLock: '0x...', // To be deployed
      router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
      wrappedNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'
    },
    minimumPresaleAmount: '1', // ETH
    gasMultiplier: 1.2,
    explorerApiUrl: 'https://api.etherscan.io/api',
    blockTime: 12, // seconds
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    iconUrl: '/chains/bsc.svg',
    color: '#F3BA2F',
    isMainnet: true,
    contracts: {
      tokenFactory: '0x...', // TODO: Deploy TokenFactory
      presaleFactory: '0x...',
      tokenLock: '0x...',
      router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router
      wrappedNative: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      multicall: '0x38ce767d81de3940CFa5020B55aA1edE4dC4C4E9'
    },
    minimumPresaleAmount: '0.1',
    gasMultiplier: 1.1,
    explorerApiUrl: 'https://api.bscscan.com/api',
    blockTime: 3, // seconds
  },

  base: {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    iconUrl: '/chains/base.svg',
    color: '#0052FF',
    isMainnet: true,
    contracts: {
      tokenFactory: '0x...', // TODO: Deploy TokenFactory
      presaleFactory: '0x...',
      tokenLock: '0x...',
    },
    minimumPresaleAmount: '0.01',
    gasMultiplier: 1.1,
  },
  xrpl: {
    id: 144,
    name: 'XRP Ledger',
    symbol: 'XRP',
    rpcUrls: ['https://xrplcluster.com'],
    blockExplorerUrls: ['https://xrpscan.com'],
    nativeCurrency: {
      name: 'XRP',
      symbol: 'XRP',
      decimals: 6,
    },
    iconUrl: '/chains/xrpl.svg',
    color: '#23292F',
    isMainnet: true,
    contracts: {
      tokenFactory: 'native',
      presaleFactory: 'native',
      tokenLock: 'native',
    },
    minimumPresaleAmount: '100', // XRP
    gasMultiplier: 1.0,
  }
} as const

// Export chain IDs as constants for better type safety
export const CHAIN_IDS = {
  ETHEREUM: 1,
  BSC: 56,
  BASE: 8453,
  XRPL: 144
} as const

export type ChainId = keyof typeof CHAIN_IDS

export type Chain = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS]

// Helper to get chain config by ID
export function getChainById(chainId: number): Chain | null {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId) || null
}

// Helper to get contract addresses for a chain
export function getContractAddress(chainId: number, contract: keyof ContractAddresses): string | undefined {
  const chain = getChainById(chainId)
  return chain?.contracts[contract]
}

// Helper to get RPC URL with fallbacks
export function getRpcUrl(chainId: number): string {
  const chain = getChainById(chainId)
  if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`)

  // Return the first working RPC URL
  return chain.rpcUrls[0]
}

export const getChainByKey = (key: ChainId): Chain => {
  return SUPPORTED_CHAINS[key]
}

// Helper function to format chain display name
export const formatChainName = (chainId: number): string => {
  const chain = getChainById(chainId)
  return chain?.name || `Chain ${chainId}`
}

// Helper function to get chain icon
export const getChainIcon = (chainId: number): string => {
  const chain = getChainById(chainId)
  return chain?.iconUrl || '/chains/unknown.svg'
}

// Helper function to validate if chain is supported
export const isSupportedChain = (chainId: number): boolean => {
  return !!getChainById(chainId)
}

// Return only mainnet chain configs (helper used by frontend components)
export function getMainnetChains() {
  return Object.values(SUPPORTED_CHAINS).filter(c => c.isMainnet)
}

// Return only testnet chain configs
export function getTestnetChains() {
  return Object.values(SUPPORTED_CHAINS).filter(c => !c.isMainnet)
}

// Default contract ABIs
export const CONTRACT_ABIS = {
  erc20: [
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
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ],
  // Add other common ABIs here
}

// Presale creation requirements by chain
export const PRESALE_REQUIREMENTS = {
  minimumLockPeriods: {
    liquidity: 6, // months
    team: 12, // months
  },
  minimumLiquidityPercentage: 60, // %
  maximumTeamAllocation: 20, // %
  kycRequired: true,
  auditRequired: true,
  whitelist: {
    maxParticipants: 1000,
    allocationMultiplier: 1.5,
  }
} as const