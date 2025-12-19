// Smart contract interfaces and ABIs for presale and token locking

export const PRESALE_FACTORY_ABI = [
  // Create presale function
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
      { "name": "_amount", "type": "uint256" },
      { "name": "_teamVesting", "type": "tuple[]", 
        "components": [
          { "name": "recipient", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "unlockTime", "type": "uint256" }
        ]
      }
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
  11155111: { // Sepolia
    presaleFactory: '0x9f2b5f8825A52b3DA237116D917a8abE79002894',
    tokenLock: '0xF6e99eA68239fb8CcC7740b602c78Ed3dD120771',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
    staking: '0x8592B59b69C30Ae9425f4619e026Aa00E9df1E23',
    npad: '0x49fF6eb0FCAd92AF753dae8d17d1156BF6e63b92'
  },
  8453: { // Base
    presaleFactory: '0x...',
    tokenLock: '0x...',
    router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // BaseSwap Router
    staking: '0x...',
    npad: '0x...'
  }
} as const

export const getContractAddress = (chainId: number, contract: 'presaleFactory' | 'tokenLock' | 'router' | 'staking' | 'npad') => {
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