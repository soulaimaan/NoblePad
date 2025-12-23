'use client'

import { Xumm } from 'xumm'
import { XRPL_NETWORKS, XRPL_TOKENS } from './constants'

const xummApiKey = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''

if (typeof window !== 'undefined' && !xummApiKey) {
    console.warn('⚠️ NEXT_PUBLIC_XUMM_API_KEY is missing. Xaman connection will run in simulation mode.')
}

export interface XamanUser {
  account: string
  name?: string
  token?: string
}

export class XamanService {
  private _sdk: Xumm | null = null
  private _jwt: string | null = null
  private _initError: string | null = null

  private getSdk() {
    if (typeof window === 'undefined') return null
    
    if (!this._sdk && xummApiKey && !this._initError) {
        try {
            console.log('🏗️ Initializing Xumm SDK for Origin:', window.location.origin)
            // Xumm constructor can throw if origin is blocked or API key is malformed
            this._sdk = new Xumm(xummApiKey)
            
            this._sdk.on("ready", () => {
                console.log("Xaman SDK Ready")
            })

            this._sdk.on("error", (err: any) => {
                console.error("Xaman SDK Internal Error:", err)
                if (err?.message?.includes('authorized') || err?.error === 'access_denied') {
                    this._initError = 'Origin not authorized in Xaman Portal'
                }
            })
        } catch (e: any) {
            console.error('❌ Xumm SDK Initialization Error:', e)
            if (e?.message?.includes('authorized') || e?.message?.includes('origin')) {
                this._initError = 'Origin not authorized in Xaman Portal'
            } else {
                this._initError = e.message || 'Unknown initialization error'
            }
        }
    }
    return this._sdk
  }

  constructor() {
    // No-op
  }

  getInitError() {
    return this._initError
  }

  async connect(): Promise<any> {
    const sdk = this.getSdk()
    if (!sdk) {
      console.warn('Xaman SDK not available. Using Simulation Mode.')
      return { 
        created: { 
          next: { always: 'https://xumm.app' },
          refs: { qr_png: 'https://placehold.co/200x200?text=Scan+QR' } 
        },
        payload: { uuid: 'mock-uuid' }
      }
    }

    try {
      // The authorize method initiates the sign-in flow
      // It handles the popup/redirect automatically in most cases
      const auth = await sdk.authorize()
      return auth
    } catch (e: any) {
      console.error("Xaman Auth Failed:", e)
      
       // specific help for the "Invalid client/redirect URL" error
       if (e?.error === 'access_denied' || e?.message?.includes('redirect') || e?.message?.includes('client') || e?.message?.includes('authorized')) {
        const isNonStandardPort = window.location.port !== '3000';
        
        console.error(`
🚨 XAMAN CONFIGURATION ERROR:
The Xaman API rejected the connection. This usually means:
1. The API Key in .env is incorrect.
2. The 'Redirect URI' in Xaman Developer Console is missing this origin.
   -> Go to https://apps.xumm.dev
   -> Select your App
   -> Settings > OAuth / Authorization
   -> Add '${window.location.origin}' to the Redirect URIs list.
   ${isNonStandardPort ? `
⚠️ PORT WARNING: You are running on port ${window.location.port}.
   Your Developer Console probably only has 'http://localhost:3000/' whitelisted.
   Stop your server and check for other running terminal instances to free up port 3000.
   ` : ''}
        `)
      }
      throw e
    }
  }

  async disconnect() {
    const sdk = this.getSdk()
    if (sdk) {
        await sdk.logout()
    }
  }

  async getUser(): Promise<XamanUser | null> {
    const sdk = this.getSdk()
    if (!sdk) return null
    
    try {
        const user = (sdk as any).user
        if (user && user.account) {
            // SDK properties might be getters returning promises or direct values
            const account = await Promise.resolve(user.account)
            const name = await Promise.resolve(user.name)
            const token = await Promise.resolve(user.token)
            
            if (account && typeof account === 'string') {
                return {
                    account,
                    name: typeof name === 'string' ? name : undefined,
                    token: typeof token === 'string' ? token : undefined
                }
            }
        }
    } catch (e) {
        console.warn("Error getting Xaman user details:", e)
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
     // Fetch TrustLines to find Belgrave
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

  async createTrustLine(userAddress: string) {
    const sdk = this.getSdk()
    if (!sdk) {
        console.log('Simulation: Creating Trust Line for BELGRAVE')
        return { mock: true, uuid: 'mock-trustline' }
    }

    const payload = {
      TransactionType: 'TrustSet',
      Account: userAddress,
      LimitAmount: {
        currency: XRPL_TOKENS.BELGRAVE.currency,
        issuer: XRPL_TOKENS.BELGRAVE.issuer,
        value: '1000000000' 
      }
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  async createSignInPayload() {
    const sdk = this.getSdk()
    if (!sdk) {
        return { 
            created: { 
                refs: { qr_png: 'https://placehold.co/200x200?text=Simulation+QR' } 
            },
            payload: { uuid: 'simulation' }
        }
    }

    return await sdk.payload?.create({
        TransactionType: 'SignIn'
    } as any)
  }

  async subscribeToPayload(uuid: string, onEvent: (event: any) => void) {
    const sdk = this.getSdk()
    if (!sdk) return null
    return await sdk.payload?.subscribe(uuid, onEvent)
  }
}

export const xamanService = new XamanService()
