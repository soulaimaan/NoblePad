'use client'

import { XRPL_NETWORKS } from './constants'
import { xamanService } from './xamanService'

export interface MilestoneEscrowParams {
  projectAddress: string
  amountXRP: string
  milestoneId: string
  // For emergency refund: 180 days after estimated delivery
  cancelAfterDays: number
}

export class XRPL_Escrow_Handler {
  /**
   * Create a native XRPL Escrow with a CancelAfter fail-safe.
   */
  async createMilestoneEscrow(userAddress: string, params: MilestoneEscrowParams) {
    const sdk = (xamanService as any).getSdk()
    if (!sdk) {
      console.log('Simulation: Creating XRPL Escrow for milestone', params.milestoneId)
      return { mock: true, uuid: 'mock-escrow-' + Date.now() }
    }

    const amountDrops = (parseFloat(params.amountXRP) * 1000000).toString()

    // Calculate CancelAfter date (in Ripple Epoch seconds)
    // Ripple Epoch starts at 2000-01-01 00:00:00 UTC
    const RIPPLE_EPOCH_OFFSET = 946684800
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const cancelAfterSeconds = nowInSeconds + (params.cancelAfterDays * 24 * 60 * 60)
    const cancelAfterRipple = cancelAfterSeconds - RIPPLE_EPOCH_OFFSET

    const payload = {
      TransactionType: 'EscrowCreate',
      Account: userAddress,
      Destination: params.projectAddress,
      Amount: amountDrops,
      CancelAfter: cancelAfterRipple,
      // Condition can be added here if using a crypto-condition based release
      // For Belgrave, we rely on the Oracle signature for FinishEscrow
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  /**
   * Execute EscrowFinish to release funds to the project.
   * This is typically called by the project or our Oracle after verification.
   */
  async finishEscrow(sender: string, sequence: number, userAddress: string) {
    const sdk = (xamanService as any).getSdk()
    if (!sdk) {
      console.log('Simulation: Finishing Escrow', sequence)
      return { mock: true, uuid: 'mock-finish-' + Date.now() }
    }

    const payload = {
      TransactionType: 'EscrowFinish',
      Account: userAddress,
      Owner: sender, // The user who created the escrow
      OfferSequence: sequence,
      // Condition and Fulfillment would be added here if needed
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  /**
   * Trigger the inactivity refund via EscrowCancel.
   * Only available AFTER the CancelAfter time has passed.
   */
  async triggerInactivityRefund(ownerAddress: string, sequence: number) {
    const sdk = (xamanService as any).getSdk()
    if (!sdk) {
      console.log('Simulation: Cancelling Escrow', sequence)
      return { mock: true, uuid: 'mock-cancel-' + Date.now() }
    }

    const payload = {
      TransactionType: 'EscrowCancel',
      Account: ownerAddress, // User trying to reclaim their XRP
      Owner: ownerAddress,
      OfferSequence: sequence
    }

    const created = await sdk.payload?.create(payload as any)
    return created
  }

  /**
   * Fetch active escrows for a project or user to show in the dashboard.
   */
  async getActiveEscrows(address: string) {
    try {
      const response = await fetch(XRPL_NETWORKS.MAINNET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: "account_objects",
          params: [{
            account: address,
            type: "escrow"
          }]
        })
      })
      const data = await response.json()
      return data.result.account_objects || []
    } catch (e) {
      console.error("Failed to fetch XRPL Escrows", e)
      return []
    }
  }
}

export const xrplEscrowHandler = new XRPL_Escrow_Handler()
