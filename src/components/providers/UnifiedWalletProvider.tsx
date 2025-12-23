'use client'

import { XamanLoginModal } from '@/components/wallet/XamanLoginModal'
import { xamanService } from '@/lib/xrpl/xamanService'
import { useAppKit } from '@reown/appkit/react'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

export type WalletType = 'evm' | 'xrpl' | null

interface UnifiedWalletContextType {
  isConnected: boolean
  address: string | null
  walletType: WalletType
  chainType: 'evm' | 'xrpl' | null
  connect: (type: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  isConnecting: boolean
  balance: {
    formatted: string
    symbol: string
  }
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | null>(null)

export function UnifiedWalletProvider({ children }: { children: ReactNode }) {
  // EVM Hooks
  const { address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting } = useAccount()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { open: openAppKit } = useAppKit()

  // Local State for XRPL
  const [xrplAddress, setXrplAddress] = useState<string | null>(null)
  const [isXrplConnecting, setIsXrplConnecting] = useState(false)
  const [xrplBalance, setXrplBalance] = useState<string>('0')
  
  // Xaman QR Modal State
  const [showXamanModal, setShowXamanModal] = useState(false)
  const [xamanQr, setXamanQr] = useState<string | null>(null)
  const [xamanStatus, setXamanStatus] = useState('Initializing...')

  // Unified State
  const [activeWallet, setActiveWallet] = useState<WalletType>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Initial Mount: Check for persisted sessions
  useEffect(() => {
    if (!isMounted) return
    const checkSessions = async () => {
      const xamanUser = await xamanService.getUser()
      if (xamanUser) {
        setXrplAddress(xamanUser.account)
        setActiveWallet('xrpl')
      }
    }
    checkSessions()
  }, [isMounted])

  // 2. Watch Wagmi State
  useEffect(() => {
    if (isEvmConnected && evmAddress) {
      if (activeWallet !== 'xrpl') {
        setActiveWallet('evm')
      }
    } else if (!isEvmConnected && activeWallet === 'evm') {
      setActiveWallet(null)
    }
  }, [isEvmConnected, evmAddress, activeWallet])

  // 3. XRPL Balance Polling
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeWallet === 'xrpl' && xrplAddress) {
      const fetchBal = async () => {
        try {
          const bal = await xamanService.getBalance(xrplAddress)
          setXrplBalance(String(bal || '0'))
        } catch (balError) {
          console.error("Balance fetch error:", balError)
        }
      }
      fetchBal()
      interval = setInterval(fetchBal, 15000)
    }
    return () => clearInterval(interval)
  }, [activeWallet, xrplAddress])


  // ACTIONS
  const connect = async (type: WalletType) => {
    if (type === 'evm') {
        // AppKit Modal
        openAppKit() 
    } else if (type === 'xrpl') {
        const initError = xamanService.getInitError()
        if (initError) {
            setXamanStatus(`Xaman Error: ${initError}`)
            setShowXamanModal(true)
            setIsXrplConnecting(false)
            return
        }

        // Prevent double-firing
        if (isXrplConnecting) return

        setIsXrplConnecting(true)
        setXamanStatus('Creating sign-in request...')
        setShowXamanModal(true)
        setXamanQr(null)
        
        try {
            const payload = await xamanService.createSignInPayload()
            
            if (payload?.qrUrl) {
                setXamanQr(payload.qrUrl)
                setXamanStatus('Please scan the QR code with Xaman')
                
                // Subscribe to payload events
                xamanService.subscribeToPayload(
                    payload.uuid,
                    async (account: string) => {
                        setXamanStatus('Verified! Connected.')
                        setXrplAddress(account)
                        setActiveWallet('xrpl')
                        setShowXamanModal(false)
                        // Don't reset isXrplConnecting immediately to prevent race conditions
                        setTimeout(() => setIsXrplConnecting(false), 500)
                        if (isEvmConnected) disconnectEvm()
                    },
                    (errorMsg: string) => {
                        setXamanStatus(`Error: ${errorMsg}`)
                        // Allow retrying after delay
                        setTimeout(() => {
                           setShowXamanModal(false)
                           setIsXrplConnecting(false)
                        }, 3000)
                    }
                )
            } else {
                setXamanStatus('Failed to create QR code')
                setIsXrplConnecting(false)
            }
        } catch (e: any) {
            console.error("XRPL Connect Error", e)
            setXamanStatus(`Connection failed: ${e.message || 'Unknown error'}`)
            setIsXrplConnecting(false)
        }
    }
  }

  const disconnect = async () => {
    if (activeWallet === 'evm') {
        disconnectEvm()
    } else if (activeWallet === 'xrpl') {
        await xamanService.disconnect()
        setXrplAddress(null)
    }
    setActiveWallet(null)
  }

  // DERIVED STATE
  // Ensure we only render wallet-specific data after mounting to prevent hydration errors
  const address = !isMounted ? null : (activeWallet === 'evm' ? (evmAddress ?? null) : (xrplAddress ?? null))
  
  const balance = !isMounted ? { formatted: '0.00', symbol: '' } : (
    activeWallet === 'evm' ? {
      formatted: '0.00', // Note: Add EVM balance hook if needed
      symbol: 'ETH'
    } : {
      formatted: xrplBalance,
      symbol: 'XRP'
    }
  )

  const isConnected = !isMounted ? false : (activeWallet === 'evm' ? isEvmConnected : (activeWallet === 'xrpl' && !!xrplAddress))

  return (
    <UnifiedWalletContext.Provider value={{
        isConnected: !!isConnected,
        address,
        walletType: activeWallet,
        chainType: activeWallet,
        connect,
        disconnect,
        isConnecting: isEvmConnecting || isXrplConnecting,
        balance
    }}>
      {children}
      <XamanLoginModal 
        isOpen={showXamanModal} 
        onClose={() => setShowXamanModal(false)}
        qrUrl={xamanQr}
        status={xamanStatus}
      />
    </UnifiedWalletContext.Provider>
  )
}

export const useUnifiedWallet = () => {
    const context = useContext(UnifiedWalletContext)
    if (!context) throw new Error("useUnifiedWallet must be used within UnifiedWalletProvider")
    return context
}
