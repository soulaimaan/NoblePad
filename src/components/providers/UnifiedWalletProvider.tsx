'use client'

import { XamanLoginModal } from '@/components/wallet/XamanLoginModal'
import { xamanService } from '@/lib/xrpl/xamanService'
import { useAppKit } from '@reown/appkit/react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'

export type WalletType = 'evm' | 'xrpl' | 'solana' | null

interface UnifiedWalletContextType {
  isConnected: boolean
  address: string | null
  walletType: WalletType
  chainType: 'evm' | 'xrpl' | 'solana' | null
  connect: (type: WalletType, connector?: any) => Promise<void>
  disconnect: () => Promise<void>
  isConnecting: boolean
  balance: {
    formatted: string
    symbol: string
  }
  connectors: any[]
  requestSignature: (txjson: any) => Promise<any>
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | null>(null)

export function UnifiedWalletProvider({ children }: { children: ReactNode }) {
  // EVM Hooks
  const { address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting } = useAccount()
  const { disconnect: disconnectEvm } = useDisconnect()
  const { open: openAppKit } = useAppKit()
  const { connect: wagmiConnect, connectors } = useConnect()

  // Solana Hooks
  const { publicKey: solanaPublicKey, connected: isSolanaConnected, disconnect: disconnectSolana } = useWallet()
  const { connection: solanaConnection } = useConnection()
  const { setVisible: setSolanaModalVisible } = useWalletModal()

  // Local State for XRPL
  const [xrplAddress, setXrplAddress] = useState<string | null>(null)
  const [isXrplConnecting, setIsXrplConnecting] = useState(false)
  const [xrplBalance, setXrplBalance] = useState<string>('0')
  const [solanaBalance, setSolanaBalance] = useState<string>('0')

  // Xaman QR Modal State
  const [showXamanModal, setShowXamanModal] = useState(false)
  const [xamanQr, setXamanQr] = useState<string | null>(null)
  const [xamanDeepLink, setXamanDeepLink] = useState<string | null>(null)
  const [xamanStatus, setXamanStatus] = useState('Initializing...')

  // Unified State
  const [activeWallet, setActiveWallet] = useState<WalletType>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. Initial Mount: Check for stored session
  useEffect(() => {
    if (!isMounted) return
    const checkSessions = async () => {
      try {
        const xamanUser = await xamanService.getUser()
        if (xamanUser) {
          setXrplAddress(xamanUser.account)
          setActiveWallet('xrpl')
        }
      } catch (e) {
        console.warn("Session check failed, skipping automatic XRPL restore", e)
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

  // 2.5 Watch Solana State
  useEffect(() => {
    if (isSolanaConnected && solanaPublicKey) {
      if (activeWallet !== 'solana') {
        setActiveWallet('solana')
      }
    } else if (!isSolanaConnected && activeWallet === 'solana') {
      setActiveWallet(null)
    }
  }, [isSolanaConnected, solanaPublicKey, activeWallet])

  // 3. XRPL Balance Polling
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeWallet === 'xrpl' && xrplAddress) {
      const fetchBal = async () => {
        try {
          const bal = await xamanService.getBalance(xrplAddress)
          setXrplBalance(prev => prev !== String(bal || '0') ? String(bal || '0') : prev)
        } catch (balError) {
          console.error("Balance fetch error:", balError)
        }
      }
      fetchBal()
      interval = setInterval(fetchBal, 30000) // 30s polling
    }
    return () => clearInterval(interval)
  }, [activeWallet, xrplAddress])

  // 3.5 Solana Balance
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeWallet === 'solana' && solanaPublicKey) {
      const fetchSolBal = async () => {
        try {
          const bal = await solanaConnection.getBalance(solanaPublicKey)
          const newBal = (bal / LAMPORTS_PER_SOL).toFixed(4)
          setSolanaBalance(prev => prev !== newBal ? newBal : prev)
        } catch (e) {
          console.error("Solana balance error", e)
        }
      }
      fetchSolBal()
      interval = setInterval(fetchSolBal, 30000) // 30s polling
    }
    return () => clearInterval(interval)
  }, [activeWallet, solanaPublicKey, solanaConnection])


  // ACTIONS
  const requestSignature = async (txjson: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      setXamanStatus('Preparing transaction...')
      setShowXamanModal(true)
      setXamanQr(null)

      try {
        const payload = await xamanService.createPayload(txjson)

        if (payload?.qrUrl) {
          setXamanQr(payload.qrUrl)
          setXamanDeepLink(payload.deepLink)
          setXamanStatus('Scan the QR code to sign')

          xamanService.subscribeToPayload(
            payload.uuid,
            (data: any) => {
              setShowXamanModal(false)
              resolve(data)
            },
            (errorMsg: string) => {
              setXamanStatus(`Error: ${errorMsg}`)
              setTimeout(() => {
                setShowXamanModal(false)
                reject(errorMsg)
              }, 3000)
            }
          )
        } else {
          setXamanStatus('Failed to create QR code')
          setTimeout(() => setShowXamanModal(false), 2000)
          reject("Failed to create payload")
        }
      } catch (e: any) {
        console.error("XRPL Sign Error", e)
        setXamanStatus(`Failed: ${e.message}`)
        setTimeout(() => setShowXamanModal(false), 3000)
        reject(e)
      }
    })
  }

  const connect = async (type: WalletType, connector?: any) => {
    if (type === 'evm') {
      if (connector) {
        wagmiConnect({ connector })
      } else {
        openAppKit()
      }
    } else if (type === 'solana') {
      if (isSolanaConnected) return
      setSolanaModalVisible(true)
    } else if (type === 'xrpl') {
      const initError = xamanService.getInitError()
      if (initError) {
        setXamanStatus(`Xaman Error: ${initError}`)
        setShowXamanModal(true)
        setIsXrplConnecting(false)
        return
      }

      if (isXrplConnecting) return

      setIsXrplConnecting(true)
      setXamanStatus('Creating sign-in request...')
      setShowXamanModal(true)
      setXamanQr(null)

      try {
        const payload = await xamanService.createSignInPayload()

        if (payload?.qrUrl) {
          setXamanQr(payload.qrUrl)
          setXamanDeepLink(payload.deepLink)
          setXamanStatus('Scan the QR code or tap "Open in Xaman"')

          // Subscribe to payload events
          xamanService.subscribeToPayload(
            payload.uuid,
            async (data: any) => {
              const account = data.account
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
    } else if (activeWallet === 'solana') {
      await disconnectSolana()
    }
    setActiveWallet(null)
  }

  const { data: evmBalanceData } = useBalance({
    address: evmAddress as `0x${string}`,
    query: {
      enabled: !!evmAddress && activeWallet === 'evm'
    }
  })

  // DERIVED STATE
  // Ensure we only render wallet-specific data after mounting to prevent hydration errors
  const address = !isMounted ? null : (
    activeWallet === 'evm' ? (evmAddress ?? null) :
      activeWallet === 'xrpl' ? (xrplAddress ?? null) :
        activeWallet === 'solana' ? (solanaPublicKey?.toBase58() ?? null) : null
  )

  const balance = !isMounted ? { formatted: '0.00', symbol: '' } : (
    activeWallet === 'evm' ? {
      formatted: evmBalanceData ? formatUnits(evmBalanceData.value, evmBalanceData.decimals) : '0.00',
      symbol: evmBalanceData?.symbol || 'ETH'
    } : (
      activeWallet === 'xrpl' ? {
        formatted: xrplBalance || '0.00',
        symbol: 'XRP'
      } : {
        formatted: solanaBalance || '0.00',
        symbol: 'SOL'
      }
    )
  )

  const isConnected = !isMounted ? false : (
    activeWallet === 'evm' ? isEvmConnected :
      activeWallet === 'xrpl' ? (!!xrplAddress) :
        activeWallet === 'solana' ? isSolanaConnected : false
  )

  return (
    <UnifiedWalletContext.Provider value={{
      isConnected: !!isConnected,
      address,
      walletType: activeWallet,
      chainType: activeWallet,
      connect,
      disconnect,
      isConnecting: isEvmConnecting || isXrplConnecting, // Solana handles its own connecting state via modal mostly
      balance,
      connectors: connectors as any[],
      requestSignature
    }}>
      {children}
      <XamanLoginModal
        isOpen={showXamanModal}
        onClose={() => setShowXamanModal(false)}
        qrUrl={xamanQr}
        deepLink={xamanDeepLink}
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
