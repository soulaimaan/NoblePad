'use client'

import { XRPL_NETWORKS } from './constants'
import { xamanService } from './xamanService'

export interface XRPLPresaleContribution {
  projectAddress: string
  amountXRP: string
  tokenIssuer: string
  tokenCurrency: string
}

export class XRPLPresaleService {
  /**
   * Contribute to a presale on XRPL using EscrowCreate.
   * This locks the XRP until it's either claimed by the project or released back.
   */
  async contribute(userAddress: string, projectAddress: string, amountXRP: string) {
    const sdk = (xamanService as any).getSdk()
    if (!sdk) {
      console.log('Simulation: Contributing', amountXRP, 'XRP to', projectAddress)
      return { mock: true, uuid: 'mock-contribution-' + Date.now() }
    }

    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    const amountDrops = (parseFloat(amountXRP) * 1000000).toString()

    const payload = {
      TransactionType: 'EscrowCreate',
      Account: userAddress,
      Destination: projectAddress,
      Amount: amountDrops,
      // We can add FinishAfter or Condition here for milestone governance
      // For mvp, we use a simple escrow to the project address
      // FinishAfter: Math.floor(Date.now() / 1000) + 3600 // Example: 1 hour from now
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  /**
   * Verify if a user has the necessary TrustLine for the project token.
   * If not, it's recommended to create it before contributing.
   */
  async checkTrustLine(userAddress: string, issuer: string, currency: string): Promise<boolean> {
    try {
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "account_lines",
          params: [{ account: userAddress }]
        })
      })
      const data = await response.json()
      if (data.result && data.result.lines) {
          return data.result.lines.some((line: any) => 
            line.currency === currency && 
            line.account === issuer
          )
      }
      return false
    } catch (e) {
      console.error("Failed to check TrustLine", e)
      return false
    }
  }

  /**
   * Create a TrustLine for the project token.
   */
  async ensureTrustLine(userAddress: string, issuer: string, currency: string) {
    const sdk = (xamanService as any).getSdk()
    if (!sdk) {
        console.log('Simulation: Creating Trust Line for', currency)
        return { mock: true, uuid: 'mock-trustline-' + Date.now() }
    }

    const payload = {
      TransactionType: 'TrustSet',
      Account: userAddress,
      LimitAmount: {
        currency: currency,
        issuer: issuer,
        value: '1000000000' 
      }
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  /**
   * Verify a contribution transaction.
   */
  async verifyContribution(txHash: string) {
    try {
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "tx",
          params: [{ transaction: txHash }]
        })
      })
      const data = await response.json()
      return data.result
    } catch (e) {
      console.error("Failed to verify contribution", e)
      return null
    }
  }
}

export const xrplPresaleService = new XRPLPresaleService()
