import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, base, bsc } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

// Configure supported chains
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    arbitrum,
    base,
    bsc,
    // Add testnets for development
    ...(process.env.NODE_ENV === 'development' 
      ? [
          {
            id: 11155111,
            name: 'Sepolia',
            network: 'sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
            rpcUrls: {
              public: { http: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'] },
              default: { http: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'] },
            },
            blockExplorers: {
              etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
              default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
            },
            testnet: true,
          }
        ] 
      : []
    ),
  ],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'NoblePad Launchpad',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

// Chain-specific contract addresses
export const CONTRACT_ADDRESSES = {
  [mainnet.id]: {
    tokenFactory: '0x...',
    presaleFactory: '0x...',
    liquidityLock: '0x...',
  },
  [polygon.id]: {
    tokenFactory: '0x...',
    presaleFactory: '0x...',
    liquidityLock: '0x...',
  },
  [arbitrum.id]: {
    tokenFactory: '0x...',
    presaleFactory: '0x...',
    liquidityLock: '0x...',
  },
  [base.id]: {
    tokenFactory: '0x...',
    presaleFactory: '0x...',
    liquidityLock: '0x...',
  },
  [bsc.id]: {
    tokenFactory: '0x...',
    presaleFactory: '0x...',
    liquidityLock: '0x...',
  },
} as const

export const getContractAddress = (chainId: number, contract: keyof typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES]) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.[contract]
}