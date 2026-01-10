// Smart contract interfaces and ABIs for presale and token locking

export const PRESALE_FACTORY_ABI = [
  // Create presale function - matches PresaleFactory.sol createPresale signature
  {
    "inputs": [
      { "name": "_token", "type": "address" },
      { "name": "_router", "type": "address" },
      { "name": "_softCap", "type": "uint256" },
      { "name": "_hardCap", "type": "uint256" },
      { "name": "_presaleRate", "type": "uint256" },
      { "name": "_listingRate", "type": "uint256" },
      { "name": "_liquidityPercent", "type": "uint256" },
      { "name": "_startTime", "type": "uint256" },
      { "name": "_endTime", "type": "uint256" },
      { "name": "_lockPeriod", "type": "uint256" },
      { "name": "_maxSpendPerBuyer", "type": "uint256" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "createPresale",
    "outputs": [{ "name": "presaleAddress", "type": "address" }],
    "stateMutability": "payable",
    "type": "function"
  },

  // Get presale info
  {
    "inputs": [{ "name": "_presale", "type": "address" }],
    "name": "getPresaleInfo",
    "outputs": [
      { "name": "token", "type": "address" },
      { "name": "owner", "type": "address" },
      { "name": "softCap", "type": "uint256" },
      { "name": "hardCap", "type": "uint256" },
      { "name": "presaleRate", "type": "uint256" },
      { "name": "listingRate", "type": "uint256" },
      { "name": "liquidityPercent", "type": "uint256" },
      { "name": "startTime", "type": "uint256" },
      { "name": "endTime", "type": "uint256" },
      { "name": "lockPeriod", "type": "uint256" },
      { "name": "totalRaised", "type": "uint256" },
      { "name": "totalSold", "type": "uint256" },
      { "name": "status", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "presale", "type": "address" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" }
    ],
    "name": "PresaleCreated",
    "type": "event"
  }
] as const

export const PRESALE_ABI = [
  // Contribute to presale
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Claim tokens
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Claim refund
  {
    "inputs": [],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Finalize presale
  {
    "inputs": [],
    "name": "finalize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get user info
  {
    "inputs": [{ "name": "_user", "type": "address" }],
    "name": "getUserInfo",
    "outputs": [
      { "name": "contribution", "type": "uint256" },
      { "name": "tokensClaimed", "type": "bool" },
      { "name": "refundClaimed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "Contributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "TokensClaimed",
    "type": "event"
  }
] as const

export const TOKEN_LOCK_ABI = [
  // Lock tokens
  {
    "inputs": [
      { "name": "_token", "type": "address" },
      { "name": "_amount", "type": "uint256" },
      { "name": "_unlockTime", "type": "uint256" },
      { "name": "_description", "type": "string" }
    ],
    "name": "lockTokens",
    "outputs": [{ "name": "lockId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Unlock tokens
  {
    "inputs": [{ "name": "_lockId", "type": "uint256" }],
    "name": "unlockTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get lock info
  {
    "inputs": [{ "name": "_lockId", "type": "uint256" }],
    "name": "getLockInfo",
    "outputs": [
      { "name": "token", "type": "address" },
      { "name": "owner", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "lockTime", "type": "uint256" },
      { "name": "unlockTime", "type": "uint256" },
      { "name": "claimed", "type": "bool" },
      { "name": "description", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Get locks by owner
  {
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "getLocksByOwner",
    "outputs": [{ "name": "lockIds", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "lockId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "unlockTime", "type": "uint256" }
    ],
    "name": "TokensLocked",
    "type": "event"
  }
] as const

export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const STAKING_ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingToken",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "stakedBalance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  }
] as const

// Contract addresses by chain (to be updated when contracts are deployed)
export const CONTRACT_ADDRESSES = {
  31337: { // Localhost
    presaleFactory: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    tokenLock: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
    staking: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    belgrave: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    tokenFactory: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
  },
  11155111: { // Sepolia
    presaleFactory: '0x5bB9e48B8850b03D5bD89796BDfAd6252F828Fd9',
    tokenLock: '0x55E5d769AF515354d57182f3f70A2738148940cf',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router (Sepolia)
    staking: '0x8592B59b69C30Ae9425f4619e026Aa00E9df1E23', // Keep existing staking for now or update if deployed separately
    belgrave: '0x49fF6eb0FCAd92AF753dae8d17d1156BF6e63b92'
  },
  8453: { // Base
    presaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3',
    tokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
    router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // BaseSwap Router
    staking: '',
    belgrave: ''
  },
  56: { // BSC Mainnet
    presaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3',
    tokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2
    staking: '',
    belgrave: ''
  },
  1: { // Ethereum Mainnet
    presaleFactory: '0x2285321a0c76695c7E900E951Aa45378843b3BC3',
    tokenLock: '0x0DB492BFF4e1A6dB3c2576027075b48895B25D1f',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2
    staking: '', // XRPL Staking
    belgrave: '' // XRPL Token
  }
} as const

export const getContractAddress = (chainId: number, contract: 'presaleFactory' | 'tokenLock' | 'router' | 'staking' | 'belgrave' | 'tokenFactory') => {
  const chainAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] as Record<string, string>;
  return chainAddresses?.[contract] || null
}

// Gas estimation helpers
export const GAS_LIMITS = {
  createPresale: 500000,
  contribute: 100000,
  finalize: 200000,
  claimTokens: 80000,
  claimRefund: 80000,
  lockTokens: 120000,
  unlockTokens: 80000,
  approve: 60000
} as const