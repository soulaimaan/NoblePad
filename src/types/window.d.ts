// Window object extensions for wallet providers
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isTrust?: boolean
      isCoinbaseWallet?: boolean
      providers?: Array<{
        isMetaMask?: boolean
        isTrust?: boolean
        isCoinbaseWallet?: boolean
        request: (args: { method: string; params?: any[] }) => Promise<any>
      }>
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (data: any) => void) => void
      removeListener: (event: string, callback: (data: any) => void) => void
    }
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: any }>
      disconnect: () => Promise<void>
      on: (event: string, callback: (data: any) => void) => void
      request: (args: { method: string; params?: any }) => Promise<any>
    }
    phantom?: {
      solana?: {
        isPhantom?: boolean
        connect: () => Promise<{ publicKey: any }>
        disconnect: () => Promise<void>
        on: (event: string, callback: (data: any) => void) => void
      }
    }
  }
}

export {}