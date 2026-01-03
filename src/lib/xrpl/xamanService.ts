'use client'

import { XRPL_NETWORKS, XRPL_TOKENS } from './constants'

export interface XamanUser {
  account: string
  name?: string
  token?: string
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

  getInitError(): string | null {
    // No client-side API key check needed anymore since we use server-side proxy
    return null
  }

  async createSignInPayload(): Promise<{ uuid: string; qrUrl: string; deepLink: string } | null> {
    try {
      // Call our server-side proxy instead of Xumm directly
      const response = await fetch('/api/xumm/payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txjson: {
            TransactionType: 'SignIn'
          },
          options: {
            submit: false,
            return_url: {
              web: typeof window !== 'undefined' ? window.location.origin : ''
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Xumm Proxy Error:', errorData)
        throw new Error(errorData.error || 'Failed to create payload')
      }

      const data = await response.json()
      console.log('Xumm Payload Created:', data.uuid)

      return {
        uuid: data.uuid,
        qrUrl: data.refs.qr_png,
        deepLink: data.next?.always || `https://xumm.app/sign/${data.uuid}`
      }
    } catch (e: any) {
      console.error('Failed to create Xaman sign-in payload:', e)
      throw e
    }
  }

  async createPayload(txjson: any): Promise<{ uuid: string; qrUrl: string; deepLink: string } | null> {
    try {
      const response = await fetch('/api/xumm/payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          txjson: txjson,
          options: {
            submit: true, // Auto-submit for transactions
            return_url: {
              web: typeof window !== 'undefined' ? window.location.href : ''
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payload')
      }

      const data = await response.json()
      return {
        uuid: data.uuid,
        qrUrl: data.refs.qr_png,
        deepLink: data.next?.always || `https://xumm.app/sign/${data.uuid}`
      }
    } catch (e: any) {
      console.error('Failed to create Xaman payload:', e)
      throw e
    }
  }

  async subscribeToPayload(uuid: string, onSigned: (data: any) => void, onError: (msg: string) => void) {
    if (uuid === 'simulation') {
      setTimeout(() => {
        onSigned({ account: 'rSimulatedXRPLAddress12345', txid: 'SIMULATED_HASH' })
      }, 3000)
      return
    }

    console.log('Starting Xumm Subscription for UUID:', uuid)

    try {
      // Poll for payload status via our server-side proxy
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/xumm/payload/${uuid}`)

          if (!response.ok) {
            clearInterval(pollInterval)
            onError('Failed to check payload status')
            return
          }

          const data = await response.json()
          // console.log('Xumm Status Check:', { resolved: data.meta?.resolved, signed: data.meta?.signed })

          if (data.meta?.resolved || data.meta?.signed) {
            clearInterval(pollInterval)

            if (data.meta.signed) {
              const result = data.response
              console.log('Xumm Signed!', result)
              if (result && result.account) {
                this._connectedAccount = result.account
                localStorage.setItem('xaman_account', result.account)
                onSigned(result)
              } else {
                onError('No account in response')
              }
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
      console.log(`Checking Belgrave balance for ${address}...`)
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "account_lines",
          params: [{ account: address }]
        })
      })
      const data = await response.json()

      console.log("XRPL account_lines response:", data)

      if (data.result && data.result.lines) {
        // Log all lines for debugging
        console.log("Found lines:", data.result.lines)

        const belgraveLine = data.result.lines.find((line: any) =>
          // Check Issuer matches
          line.account === XRPL_TOKENS.BELGRAVE.issuer &&
          // Check Currency matches EITHER the string OR the Hex
          (line.currency === XRPL_TOKENS.BELGRAVE.currency ||
            line.currency === XRPL_TOKENS.BELGRAVE.currencyHex)
        )

        if (belgraveLine) {
          console.log("Found Belgrave Line:", belgraveLine)
          return belgraveLine.balance
        } else {
          console.warn("No Belgrave trustline found.")
        }
        return '0'
      }
      return '0'
    } catch (e) {
      console.error("Failed to fetch Belgrave balance", e)
      return '0'
    }
  }
}

export const xamanService = new XamanService()
