'use client'

import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, ExternalLink, Zap } from 'lucide-react'
import { useState } from 'react'

export function ManualMetaMaskConnector() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [result, setResult] = useState<{ status: 'success' | 'error' | null, message: string }>({ status: null, message: '' })

  const connectDirectlyToMetaMask = async () => {
    setIsConnecting(true)
    setResult({ status: null, message: 'Attempting direct MetaMask connection...' })

    try {
      // Method 1: Direct MetaMask access via extension ID
      if ((window as any).chrome && (window as any).chrome.runtime) {
        console.log('🔗 Attempting Chrome extension direct access...')
      }

      // Method 2: Force MetaMask window open
      if (window.ethereum?.isMetaMask) {
        console.log('🎯 Found MetaMask directly, requesting connection...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts && accounts.length > 0) {
          setResult({ 
            status: 'success', 
            message: `✅ Successfully connected to MetaMask: ${accounts[0]}` 
          })
          
          // Dispatch custom event to notify the app
          window.dispatchEvent(new CustomEvent('metamask-connected', { 
            detail: { address: accounts[0] } 
          }))
        }
      }
      
      // Method 3: Search all available providers aggressively
      else if ((window.ethereum as any)?.providers) {
        console.log('🔍 Searching all providers for pure MetaMask...')
        
        const providers = (window.ethereum as any).providers
        for (let i = 0; i < providers.length; i++) {
          const provider = providers[i]
          console.log(`Testing provider ${i}:`, {
            isMetaMask: provider.isMetaMask,
            isOkxWallet: provider.isOkxWallet
          })
          
          if (provider.isMetaMask && !provider.isOkxWallet) {
            console.log('🎯 Found pure MetaMask provider!')
            const accounts = await provider.request({ method: 'eth_requestAccounts' })
            
            if (accounts && accounts.length > 0) {
              setResult({ 
                status: 'success', 
                message: `✅ Connected via provider ${i}: ${accounts[0]}` 
              })
              
              window.dispatchEvent(new CustomEvent('metamask-connected', { 
                detail: { address: accounts[0] } 
              }))
              break
            }
          }
        }
      }
      
      // Method 4: Manual instruction fallback
      else {
        setResult({ 
          status: 'error', 
          message: '❌ Could not find MetaMask. Please try the manual steps below.' 
        })
      }

    } catch (error: any) {
      console.error('Manual connection error:', error)
      
      if (error.code === 4001) {
        setResult({ 
          status: 'error', 
          message: '❌ Connection rejected. You clicked "Cancel" in MetaMask.' 
        })
      } else if (error.code === -32002) {
        setResult({ 
          status: 'error', 
          message: '⏳ Connection request already pending. Check MetaMask extension.' 
        })
      } else {
        setResult({ 
          status: 'error', 
          message: `❌ Error: ${error.message}` 
        })
      }
    }

    setIsConnecting(false)
  }

  const openMetaMaskExtension = () => {
    // Try to open MetaMask extension directly
    window.open('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html', '_blank')
  }

  const openExtensionsPage = () => {
    window.open('chrome://extensions/', '_blank')
  }

  return (
    <div className="noble-card">
      <div className="flex items-center space-x-3 mb-4">
        <Zap className="text-noble-gold" size={24} />
        <h3 className="text-lg font-semibold text-noble-gold">🔧 Manual MetaMask Connector</h3>
      </div>

      <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-center space-x-2 text-orange-400 mb-2">
          <AlertTriangle size={16} />
          <span className="font-medium">OKX Wallet Interference Detected</span>
        </div>
        <div className="text-sm text-noble-gold/70">
          OKX Wallet is preventing normal MetaMask connections. Use these manual methods:
        </div>
      </div>

      {/* Manual Connection Button */}
      <div className="mb-6">
        <Button
          onClick={connectDirectlyToMetaMask}
          disabled={isConnecting}
          className="w-full mb-3"
        >
          {isConnecting ? '🔄 Connecting...' : '🎯 Force MetaMask Connection'}
        </Button>
        
        {result.status && (
          <div className={`p-3 rounded border text-sm ${
            result.status === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center space-x-2">
              {result.status === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{result.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Steps */}
      <div className="space-y-4">
        <h4 className="font-medium text-noble-gold">📋 Manual Connection Steps</h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-noble-gray/20 rounded-lg">
            <div className="w-6 h-6 bg-noble-gold text-noble-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <div className="font-medium text-noble-gold">Open MetaMask Extension Directly</div>
              <div className="text-sm text-noble-gold/70 mb-2">Click the MetaMask icon in your browser toolbar, or use the button below:</div>
              <Button size="sm" variant="outline" onClick={openMetaMaskExtension}>
                <ExternalLink size={16} className="mr-2" />
                Open MetaMask Extension
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-noble-gray/20 rounded-lg">
            <div className="w-6 h-6 bg-noble-gold text-noble-black rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <div className="font-medium text-noble-gold">Temporarily Disable OKX Wallet</div>
              <div className="text-sm text-noble-gold/70 mb-2">This is the most effective solution:</div>
              <Button size="sm" variant="outline" onClick={openExtensionsPage}>
                <ExternalLink size={16} className="mr-2" />
                Manage Extensions
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-noble-gray/20 rounded-lg">
            <div className="w-6 h-6 bg-noble-gold text-noble-black rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <div className="font-medium text-noble-gold">Manual Connection in MetaMask</div>
              <div className="text-sm text-noble-gold/70">
                1. Open MetaMask extension<br/>
                2. Go to Settings → Connected Sites<br/>
                3. Click "Connect a site manually"<br/>
                4. Enter: <code className="bg-noble-gray px-1 rounded">localhost:3005</code>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-noble-gray/20 rounded-lg">
            <div className="w-6 h-6 bg-noble-gold text-noble-black rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <div className="font-medium text-noble-gold">Browser Console Method</div>
              <div className="text-sm text-noble-gold/70 mb-2">Press F12, go to Console tab, and run:</div>
              <code className="block bg-noble-gray p-2 rounded text-xs font-mono">
                ethereum.providers.find(p =&gt; p.isMetaMask &amp;&amp; !p.isOkxWallet).request(&#123;method: "eth_requestAccounts"&#125;)
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Success Instructions */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-2 text-green-400 mb-2">
          <CheckCircle size={16} />
          <span className="font-medium">After Successful Connection</span>
        </div>
        <div className="text-sm text-noble-gold/70">
          Once MetaMask is connected, return to the main app and you should see your wallet address in the header. The connection will persist across page refreshes.
        </div>
      </div>
    </div>
  )
}