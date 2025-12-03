// Wallet debugging utilities
export const debugWallet = () => {
  console.log('=== WALLET DEBUG INFO ===')
  console.log('Window ethereum:', !!window.ethereum)
  
  if (window.ethereum) {
    console.log('Ethereum provider details:', {
      isMetaMask: window.ethereum.isMetaMask,
      isTrust: window.ethereum.isTrust,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      providersCount: window.ethereum.providers?.length || 0,
      selectedAddress: window.ethereum.selectedAddress,
      isConnected: window.ethereum.isConnected?.(),
      networkVersion: window.ethereum.networkVersion,
      chainId: window.ethereum.chainId
    })
    
    if (window.ethereum.providers) {
      console.log('Multiple providers detected:', window.ethereum.providers.map((p: any) => ({
        isMetaMask: p.isMetaMask,
        isTrust: p.isTrust,
        isCoinbaseWallet: p.isCoinbaseWallet
      })))
    }
  }
  
  console.log('Solana/Phantom:', {
    solana: !!window.solana,
    phantom: !!window.phantom,
    isPhantom: window.solana?.isPhantom || window.phantom?.solana?.isPhantom
  })
  console.log('========================')
}

export const testMetaMaskConnection = async () => {
  try {
    console.log('Testing MetaMask connection...')
    debugWallet()
    
    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }
    
    // Test basic provider response
    console.log('Testing eth_accounts...')
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    console.log('Current accounts:', accounts)
    
    if (accounts.length === 0) {
      console.log('No accounts connected, requesting access...')
      const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log('New accounts after request:', newAccounts)
      return newAccounts
    }
    
    return accounts
  } catch (error) {
    console.error('MetaMask test failed:', error)
    throw error
  }
}