'use client'

import { XRPL_NETWORKS, XRPL_TOKENS } from './constants'

const xummApiKey = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''
const xummApiSecret = process.env.NEXT_PUBLIC_XUMM_API_SECRET || ''

if (typeof window !== 'undefined' && !xummApiKey) {
    console.warn('⚠️ NEXT_PUBLIC_XUMM_API_KEY is missing. Xaman connection will run in simulation mode.')
}

export interface XamanUser {
  account: string
  name?: string
  token?: string
}

export interface XummPayloadResponse {
  uuid: string
  next: {
    always: string
  }
  refs: {
    qr_png: string
    qr_matrix: string
    websocket_status: string
  }
}

export class XamanService {
  private _connectedAccount: string | null = null

  constructor() {
    // Check for stored session
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xaman_account')
      if (stored) {
        this._connectedAccount = stored
      }
    }
  }

  getInitError() {
    if (!xummApiKey) return 'API Key not configured'
    return null
  }

  async createSignInPayload(): Promise<{ uuid: string; qrUrl: string; wsUrl: string } | null> {
    if (!xummApiKey) {
      console.warn('Xaman: No API key, using simulation mode')
      return {
        uuid: 'simulation',
        qrUrl: 'https://placehold.co/256x256/1a1a2e/d4af37?text=Scan+QR',
        wsUrl: ''
      }
    }

    try {
      // Use Xumm REST API directly
      const response = await fetch('https://xumm.app/api/v1/platform/payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': xummApiKey,
          'X-API-Secret': xummApiSecret
        },
        body: JSON.stringify({
          txjson: {
            TransactionType: 'SignIn'
          },
          options: {
            submit: false,
            return_url: {
              web: window.location.origin
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Xumm API Error:', errorData)
        throw new Error(errorData.error?.message || 'Failed to create payload')
      }

      const data = await response.json()
      console.log('Xumm Payload Created:', data.uuid)

      return {
        uuid: data.uuid,
        qrUrl: data.refs.qr_png,
        wsUrl: data.refs.websocket_status
      }
    } catch (e: any) {
      console.error('Failed to create Xaman sign-in payload:', e)
      throw e
    }
  }

  async subscribeToPayload(uuid: string, onSigned: (account: string) => void, onError: (msg: string) => void) {
    if (uuid === 'simulation') {
      // Simulate successful sign-in after 3 seconds
      setTimeout(() => {
        onSigned('rSimulatedXRPLAddress12345')
      }, 3000)
      return
    }

    try {
      // Poll for payload status instead of WebSocket (more reliable)
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
            headers: {
              'X-API-Key': xummApiKey,
              'X-API-Secret': xummApiSecret
            }
          })

          if (!response.ok) {
            clearInterval(pollInterval)
            onError('Failed to check payload status')
            return
          }

          const data = await response.json()

          if (data.meta.resolved) {
            clearInterval(pollInterval)
            
            if (data.meta.signed) {
              const account = data.response.account
              this._connectedAccount = account
              localStorage.setItem('xaman_account', account)
              onSigned(account)
            } else {
              onError('Sign-in was rejected or expired')
            }
          }
        } catch (e) {
          console.error('Polling error:', e)
        }
      }, 2000) // Poll every 2 seconds

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
      }, 5 * 60 * 1000)

    } catch (e: any) {
      console.error('Subscription error:', e)
      onError(e.message || 'Connection error')
    }
  }

  async disconnect() {
    this._connectedAccount = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xaman_account')
    }
  }

  async getUser(): Promise<XamanUser | null> {
    if (this._connectedAccount) {
      return { account: this._connectedAccount }
    }
    return null
  }

  async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: "account_info",
          params: [
            {
              account: address,
              strict: true,
              ledger_index: "current",
              queue: true
            }
          ]
        })
      })
      const data = await response.json()
      if (data.result && data.result.account_data && data.result.account_data.Balance) {
        const balanceDrops = data.result.account_data.Balance
        return parseFloat(balanceDrops) / 1000000 // Drops to XRP
      }
      return 0
    } catch (e) {
      console.error("Failed to fetch XRPL balance", e)
      return 0
    }
  }

  async getBelgraveBalance(address: string): Promise<string> {
     try {
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "account_lines",
          params: [{ account: address }]
        })
      })
      const data = await response.json()
      if (data.result && data.result.lines) {
          const belgraveLine = data.result.lines.find((line: any) => 
            line.currency === XRPL_TOKENS.BELGRAVE.currency && 
            line.account === XRPL_TOKENS.BELGRAVE.issuer
          )
          return belgraveLine ? belgraveLine.balance : '0'
      }
      return '0'
    } catch (e) {
      console.error("Failed to fetch Belgrave balance", e)
      return '0'
    }
  }
}

export const xamanService = new XamanService()
