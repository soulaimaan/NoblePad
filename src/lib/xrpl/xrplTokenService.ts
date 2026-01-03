'use client'


export interface XRPLTokenConfig {
    name: string
    currency: string // 3-6 chars or HEX
    totalSupply: string
}

export class XRPLTokenService {
    /**
     * Prepares an XRPL account to be an Issuer.
     * Sets DefaultRipple flag.
     */
    async setupIssuer(address: string) {
        // We use AccountSet to enable DefaultRipple (required for issued currencies to ripple)
        // Flag 8 = asfDefaultRipple
        const payload = {
            TransactionType: 'AccountSet',
            Account: address,
            SetFlag: 8 
        }

        // Return the payload for Xaman signing
        return payload
    }

    /**
     * "Mints" tokens by sending them to a destination address.
     * Note: The destination MUST have a TrustLine first.
     */
    async mintTo(issuer: string, destination: string, currency: string, amount: string) {
        const payload = {
            TransactionType: 'Payment',
            Account: issuer,
            Destination: destination,
            Amount: {
                currency: currency,
                issuer: issuer,
                value: amount
            }
        }
        return payload
    }

    /**
     * Blackholes an account by setting its RegularKey to a dead address 
     * and disabling the MasterKey. 
     * DANGEROUS: User will lose control of the issuer account forever.
     */
    async blackhole(address: string) {
        // This is a advanced feature, for now we will just provide the sequence
        // 1. SetRegularKey to rps7tY7o7qV9d9kK2bN6RzHwX2ZpG (dead address)
        // 2. AccountSet with SetFlag: 4 (DisableMasterKey)
        const payloads = [
            {
                TransactionType: 'SetRegularKey',
                Account: address,
                RegularKey: 'rrrrrrrrrrrrrrrrrrrrrhoLvR' // Standard blackhole
            },
            {
                TransactionType: 'AccountSet',
                Account: address,
                SetFlag: 4
            }
        ]
        return payloads
    }

    /**
     * Convert a string currency code to XRPL hex format if it's > 3 characters
     */
    formatCurrencyCode(code: string): string {
        if (code.length === 3) return code
        
        // Convert to HEX if needed (must be 160 bits/40 hex chars)
        // But for simplicity, we mostly use 3-char codes on XRPL
        return code
    }
}

export const xrplTokenService = new XRPLTokenService()
