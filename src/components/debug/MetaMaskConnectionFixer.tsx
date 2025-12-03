'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useVanillaWeb3 } from '@/components/providers/VanillaWeb3Provider'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Zap,
  Settings,
  ExternalLink
} from 'lucide-react'

export function MetaMaskConnectionFixer() {
  const { wallet, connectMetaMask, isLoading, error } = useVanillaWeb3()
  const [debugResults, setDebugResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const addDebugResult = (test: string, status: 'success' | 'error' | 'warning', message: string) => {
    setDebugResults(prev => [...prev, { test, status, message, timestamp: Date.now() }])
  }

  const testDirectConnection = async () => {
    setIsTesting(true)
    setDebugResults([])
    
    addDebugResult('Starting Test', 'warning', 'Beginning MetaMask connection test...')

    // Test 1: Check if MetaMask is installed
    if (!window.ethereum) {
      addDebugResult('Installation Check', 'error', 'MetaMask not detected! Install from metamask.io')
      setIsTesting(false)
      return
    }
    addDebugResult('Installation Check', 'success', 'MetaMask extension detected')

    // Test 2: Check if MetaMask is the active provider
    if (!window.ethereum.isMetaMask) {
      addDebugResult('Provider Check', 'warning', 'Active provider is not MetaMask')
      if (window.ethereum.providers?.length > 1) {
        addDebugResult('Multiple Wallets', 'warning', `Found ${window.ethereum.providers.length} wallet providers`)
      }
    } else {
      addDebugResult('Provider Check', 'success', 'MetaMask is the active provider')
    }

    // Test 3: Check existing accounts
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        addDebugResult('Existing Accounts', 'success', `Found existing connection: ${accounts[0]}`)
      } else {
        addDebugResult('Existing Accounts', 'warning', 'No existing connections found')
      }
    } catch (error: any) {
      addDebugResult('Existing Accounts', 'error', `Error checking accounts: ${error.message}`)
    }

    // Test 4: Check if MetaMask is unlocked
    try {
      const unlocked = await window.ethereum._metamask?.isUnlocked?.()
      if (unlocked === false) {
        addDebugResult('Unlock Status', 'error', 'MetaMask is locked! Please unlock it and try again')
        setIsTesting(false)
        return
      } else {
        addDebugResult('Unlock Status', 'success', 'MetaMask appears to be unlocked')
      }
    } catch (error) {
      addDebugResult('Unlock Status', 'warning', 'Could not check unlock status')
    }

    // Test 5: Direct connection attempt
    addDebugResult('Connection Attempt', 'warning', 'Requesting MetaMask popup...')
    
    try {
      // Force popup with user gesture
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
      })
      
      if (accounts && accounts.length > 0) {
        addDebugResult('Connection Success', 'success', `✅ Connected: ${accounts[0]}`)
        addDebugResult('Next Step', 'success', 'Try the main "Connect Wallet" button now')
      } else {
        addDebugResult('Connection Failed', 'error', 'No accounts returned from MetaMask')
      }
    } catch (error: any) {
      if (error.code === 4001) {
        addDebugResult('User Rejection', 'error', 'You clicked "Cancel" in MetaMask popup')
      } else if (error.code === -32002) {
        addDebugResult('Pending Request', 'error', 'Request already pending - check MetaMask')
      } else if (error.code === -32603) {
        addDebugResult('Internal Error', 'error', 'MetaMask internal error - try refreshing page')
      } else {
        addDebugResult('Unknown Error', 'error', `Error: ${error.message}`)
      }
    }

    setIsTesting(false)
  }

  const openMetaMask = () => {
    if (window.ethereum) {
      // Try to open MetaMask
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => addDebugResult('Manual Open', 'success', 'MetaMask opened successfully'))
        .catch((error: any) => addDebugResult('Manual Open', 'error', `Failed to open: ${error.message}`))
    }
  }

  const forceRefresh = () => {
    addDebugResult('Force Refresh', 'warning', 'Refreshing page in 2 seconds...')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  const checkPopupBlocker = () => {
    const popup = window.open('', '_blank', 'width=1,height=1')
    if (popup) {
      popup.close()
      addDebugResult('Popup Test', 'success', 'Popups are allowed')
    } else {
      addDebugResult('Popup Test', 'error', 'Popups are blocked! Enable popups for localhost')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-400" size={16} />
      case 'error': return <AlertTriangle className="text-red-400" size={16} />
      case 'warning': return <AlertTriangle className="text-orange-400" size={16} />
      default: return null
    }
  }

  return (
    <div className="noble-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-noble-gold">🚨 MetaMask Connection Fixer</h3>
        <div className="flex items-center space-x-2 text-sm">
          {isLoading && (
            <div className="flex items-center space-x-1 text-orange-400">
              <RefreshCw className="animate-spin" size={16} />
              <span>Connecting...</span>
            </div>
          )}
          {wallet.isConnected && (
            <div className="text-green-400">✅ Connected</div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-noble-gray/20 rounded-lg">
        <h4 className="font-medium text-noble-gold mb-2">Current Status</h4>
        <div className="space-y-2 text-sm">
          <div>MetaMask Installed: {window.ethereum ? '✅ Yes' : '❌ No'}</div>
          <div>Provider Active: {window.ethereum?.isMetaMask ? '✅ MetaMask' : '⚠️ Unknown'}</div>
          <div>Connection: {wallet.isConnected ? `✅ ${wallet.address}` : '❌ Not connected'}</div>
          <div>Loading State: {isLoading ? '🔄 Connecting...' : '✅ Ready'}</div>
          {error && <div className="text-red-400">Error: {error}</div>}
        </div>
      </div>

      {/* Quick Fix Actions */}
      <div className="mb-6 space-y-3">
        <h4 className="font-medium text-noble-gold">🔧 Quick Fixes</h4>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={testDirectConnection} 
            disabled={isTesting}
            size="sm"
            variant="outline"
          >
            {isTesting ? (
              <RefreshCw className="animate-spin mr-2" size={16} />
            ) : (
              <Zap className="mr-2" size={16} />
            )}
            Test Connection
          </Button>

          <Button 
            onClick={openMetaMask}
            size="sm"
            variant="outline"
          >
            <ExternalLink className="mr-2" size={16} />
            Open MetaMask
          </Button>

          <Button 
            onClick={checkPopupBlocker}
            size="sm"
            variant="outline"
          >
            <Settings className="mr-2" size={16} />
            Check Popups
          </Button>

          <Button 
            onClick={forceRefresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2" size={16} />
            Force Refresh
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {debugResults.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-noble-gold mb-3">🔍 Test Results</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {debugResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded border text-sm ${
                  result.status === 'success' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : result.status === 'error'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-orange-500/10 border-orange-500/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="text-xs mt-1 text-noble-gold/70">{result.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Connection */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-2">💡 Manual Connection Test</h4>
        <p className="text-sm text-noble-gold/70 mb-3">
          If the automatic connection isn't working, try this manual approach:
        </p>
        <Button 
          onClick={connectMetaMask}
          disabled={isLoading || wallet.isConnected}
          className="w-full"
        >
          {isLoading ? 'Connecting...' : wallet.isConnected ? '✅ Connected' : '🦊 Connect MetaMask Manually'}
        </Button>
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <h4 className="font-medium text-orange-400 mb-2">🚨 Common Issues & Solutions</h4>
        <div className="text-sm text-noble-gold/70 space-y-2">
          <div>1. <strong>Popup Blocked:</strong> Enable popups for localhost in browser settings</div>
          <div>2. <strong>MetaMask Locked:</strong> Open MetaMask extension and unlock with password</div>
          <div>3. <strong>Multiple Wallets:</strong> Disable other wallet extensions temporarily</div>
          <div>4. <strong>Request Pending:</strong> Open MetaMask to see pending connection request</div>
          <div>5. <strong>Browser Cache:</strong> Try hard refresh (Ctrl+Shift+R) or incognito mode</div>
          <div>6. <strong>Extension Issue:</strong> Update or reinstall MetaMask extension</div>
        </div>
      </div>
    </div>
  )
}