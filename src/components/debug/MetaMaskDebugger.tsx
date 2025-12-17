'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useVanillaWeb3 } from '@/components/providers/VanillaWeb3Provider'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react'

export function MetaMaskDebugger() {
  const { wallet, connectMetaMask, disconnect, isLoading, error } = useVanillaWeb3()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any[]>([])
  const [isDebugging, setIsDebugging] = useState(false)

  useEffect(() => {
    runDiagnostics()
    const interval = setInterval(runDiagnostics, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const runDiagnostics = async () => {
    const results: any = {}

    // Check if MetaMask is installed
    results.metamaskInstalled = !!window.ethereum
    results.isMetaMask = window.ethereum?.isMetaMask || false
    results.hasMultipleWallets = window.ethereum?.providers?.length > 1
    
    if (window.ethereum) {
      results.selectedAddress = window.ethereum.selectedAddress
      results.isConnected = window.ethereum.isConnected?.()
      results.chainId = window.ethereum.chainId
      results.networkVersion = window.ethereum.networkVersion
      
      // Check if MetaMask is unlocked
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        results.isUnlocked = accounts && accounts.length > 0
        results.existingAccounts = accounts
      } catch (e) {
        results.isUnlocked = false
        results.accountsError = e
      }

      // Get provider info
      if (window.ethereum.providers) {
        results.availableProviders = window.ethereum.providers.map((p: any) => ({
          isMetaMask: p.isMetaMask,
          isTrust: p.isTrust,
          isCoinbaseWallet: p.isCoinbaseWallet,
          isConnected: p.isConnected?.(),
        }))
      }
    }

    // Check if page is served over HTTPS (required for some wallet features)
    results.isHTTPS = window.location.protocol === 'https:'
    results.isLocalhost = window.location.hostname === 'localhost'

    setDebugInfo(results)
  }

  const runComprehensiveTest = async () => {
    setIsDebugging(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'MetaMask Installation Check',
        test: () => !!window.ethereum,
        description: 'Verify MetaMask extension is installed'
      },
      {
        name: 'MetaMask Provider Check',
        test: () => window.ethereum?.isMetaMask,
        description: 'Confirm this is the official MetaMask provider'
      },
      {
        name: 'Wallet Unlock Check',
        test: async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            return accounts && accounts.length > 0
          } catch (e) {
            return false
          }
        },
        description: 'Check if MetaMask is unlocked and has accounts'
      },
      {
        name: 'Connection Request Test',
        test: async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            return accounts && accounts.length > 0
          } catch (e: any) {
            if (e.code === 4001) {
              throw new Error('User rejected connection request')
            }
            throw e
          }
        },
        description: 'Test actual connection request to MetaMask'
      },
      {
        name: 'Chain ID Check',
        test: async () => {
          try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            return !!chainId
          } catch (e) {
            return false
          }
        },
        description: 'Verify we can get the current chain ID'
      }
    ]

    const results = []

    for (const test of tests) {
      try {
        const startTime = Date.now()
        const result = await test.test()
        const duration = Date.now() - startTime
        
        results.push({
          name: test.name,
          description: test.description,
          passed: result,
          duration: `${duration}ms`,
          error: null
        })
      } catch (error: any) {
        results.push({
          name: test.name,
          description: test.description,
          passed: false,
          duration: 'Failed',
          error: error.message
        })
      }

      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }

    setIsDebugging(false)
  }

  const forceReconnect = async () => {
    try {
      // Disconnect first
      disconnect()
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Clear any cached connection state
      if (window.ethereum) {
        try {
          // Try to disconnect from MetaMask side
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          })
        } catch (e) {
          // This might fail, that's ok
        }
      }
      
      // Force refresh the page to completely reset state
      window.location.reload()
    } catch (error) {
      console.error('Force reconnect failed:', error)
    }
  }

  const openMetaMask = () => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
    }
  }

  return (
    <div className="noble-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-noble-gold">🔧 MetaMask Debugger</h3>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={runDiagnostics}>
            <RefreshCw size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open('https://metamask.io/download/', '_blank')}>
            <ExternalLink size={16} />
            Install MetaMask
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-noble-gray/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-noble-gold">Current Connection Status</h4>
          <div className="flex items-center space-x-2">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-1 text-green-400">
                <Wifi size={16} />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-400">
                <WifiOff size={16} />
                <span className="text-sm">Not Connected</span>
              </div>
            )}
          </div>
        </div>
        
        {wallet.isConnected ? (
          <div className="text-sm space-y-1">
            <div><span className="text-noble-gold/70">Address:</span> <code className="text-noble-gold">{wallet.address}</code></div>
            <div><span className="text-noble-gold/70">Chain:</span> <code className="text-noble-gold">{wallet.chainId}</code></div>
            <div><span className="text-noble-gold/70">Wallet:</span> <code className="text-noble-gold">{wallet.walletType}</code></div>
          </div>
        ) : (
          <div className="text-sm text-noble-gold/70">
            No wallet connection detected
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            <div className="font-medium">Error:</div>
            <div>{error}</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button 
          onClick={connectMetaMask} 
          disabled={isLoading || wallet.isConnected}
          size="sm"
        >
          {isLoading ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
        
        <Button 
          onClick={disconnect} 
          variant="outline" 
          disabled={!wallet.isConnected}
          size="sm"
        >
          Disconnect
        </Button>
        
        <Button 
          onClick={openMetaMask} 
          variant="outline"
          size="sm"
        >
          Open MetaMask
        </Button>
        
        <Button 
          onClick={forceReconnect} 
          variant="outline"
          size="sm"
        >
          Force Reconnect
        </Button>
      </div>

      {/* Diagnostic Info */}
      <div className="mb-6">
        <h4 className="font-medium text-noble-gold mb-3">System Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {debugInfo.metamaskInstalled ? (
                <CheckCircle className="text-green-400" size={16} />
              ) : (
                <AlertTriangle className="text-red-400" size={16} />
              )}
              <span>MetaMask Installed: {debugInfo.metamaskInstalled ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {debugInfo.isMetaMask ? (
                <CheckCircle className="text-green-400" size={16} />
              ) : (
                <AlertTriangle className="text-orange-400" size={16} />
              )}
              <span>Is MetaMask Provider: {debugInfo.isMetaMask ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {debugInfo.isUnlocked ? (
                <CheckCircle className="text-green-400" size={16} />
              ) : (
                <AlertTriangle className="text-red-400" size={16} />
              )}
              <span>MetaMask Unlocked: {debugInfo.isUnlocked ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-noble-gold/70">Selected Address:</span>
              <div className="font-mono text-xs">{debugInfo.selectedAddress || 'None'}</div>
            </div>
            
            <div>
              <span className="text-noble-gold/70">Chain ID:</span>
              <div className="font-mono text-xs">{debugInfo.chainId || 'Unknown'}</div>
            </div>
            
            <div>
              <span className="text-noble-gold/70">Multiple Wallets:</span>
              <div className="text-xs">{debugInfo.hasMultipleWallets ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Test */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-noble-gold">Connection Test Suite</h4>
          <Button 
            onClick={runComprehensiveTest} 
            disabled={isDebugging}
            size="sm"
          >
            {isDebugging ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="animate-spin" size={16} />
                <span>Testing...</span>
              </div>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div 
                key={index} 
                className={`p-3 rounded border text-sm ${
                  test.passed 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {test.passed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <span className="text-xs">{test.duration}</span>
                </div>
                <div className="text-xs mt-1 text-noble-gold/70">{test.description}</div>
                {test.error && (
                  <div className="text-xs mt-1 font-mono">{test.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Troubleshooting Tips */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-2">💡 Troubleshooting Tips</h4>
        <div className="text-sm text-noble-gold/70 space-y-1">
          <div>• Make sure MetaMask extension is installed and enabled</div>
          <div>• Unlock your MetaMask wallet by entering your password</div>
          <div>• Disable other wallet extensions temporarily</div>
          <div>• Try refreshing the page (Ctrl+F5)</div>
          <div>• Check if MetaMask popup is being blocked by browser</div>
          <div>• Make sure you're on the correct network</div>
          <div>• Try connecting in an incognito/private window</div>
        </div>
      </div>
    </div>
  )
}