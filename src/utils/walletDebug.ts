// Wallet debugging utilities
export const debugWallet = () => {
  const win = window as any
  console.log('=== WALLET DEBUG INFO ===')
  console.log('Window ethereum:', !!win.ethereum)
  
  if (win.ethereum) {
    console.log('Ethereum provider details:', {
      isMetaMask: win.ethereum.isMetaMask,
      isTrust: win.ethereum.isTrust,
      isCoinbaseWallet: win.ethereum.isCoinbaseWallet,
      providersCount: win.ethereum.providers?.length || 0,
      selectedAddress: win.ethereum.selectedAddress,
      isConnected: win.ethereum.isConnected?.(),
      networkVersion: win.ethereum.networkVersion,
      chainId: win.ethereum.chainId
    })
    
    if (win.ethereum.providers) {
      console.log('Multiple providers detected:', win.ethereum.providers.map((p: any) => ({
        isMetaMask: p.isMetaMask,
        isTrust: p.isTrust,
        isCoinbaseWallet: p.isCoinbaseWallet
      })))
    }
  }
  
  console.log('Solana/Phantom:', {
    solana: !!win.solana,
    phantom: !!win.phantom,
    isPhantom: win.solana?.isPhantom || win.phantom?.solana?.isPhantom
  })
  console.log('========================')
}

export const testMetaMaskConnection = async () => {
  const win = window as any
  try {
    console.log('Testing MetaMask connection...')
    debugWallet()
    
    if (!win.ethereum) {
      throw new Error('No ethereum provider found')
    }
    
    // Test basic provider response
    console.log('Testing eth_accounts...')
    const accounts = await win.ethereum.request({ method: 'eth_accounts' })
    console.log('Current accounts:', accounts)
    
    if (accounts.length === 0) {
      console.log('No accounts connected, requesting access...')
      const newAccounts = await win.ethereum.request({ method: 'eth_requestAccounts' })
      console.log('New accounts after request:', newAccounts)
      return newAccounts
    }
    
    return accounts
  } catch (error) {
    console.error('MetaMask test failed:', error)
    throw error
  }
}