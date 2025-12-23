import { XRPL_NETWORKS, XRPL_TOKENS } from './constants';
import { xamanService } from './xamanService';

export interface LockedTokens {
    amount: number;
    unlockDate: Date;
    txHash: string;
}

export class BelgraveService {
    
    /**
     * Locks Belgrave tokens in an XRPL Escrow
     * @param amount The amount of BELGRAVE to lock
     * @param durationSeconds The duration to lock for
     */
    async lockTokens(amount: number, durationSeconds: number) {
        const sdk = xamanService['_sdk']; // Access private SDK if needed or expose getter
        if (!sdk) throw new Error("Xaman SDK not initialized");
        
        const user = await xamanService.getUser();
        if (!user?.account) throw new Error("User not connected");

        // Unlock date in Ripple Epoch time (seconds since 2000-01-01 00:00:00 UTC)
        const RIPPLE_EPOCH_DIFF = 946684800;
        const now = Math.floor(Date.now() / 1000);
        const finishAfter = (now - RIPPLE_EPOCH_DIFF) + durationSeconds;

        const payload = {
            TransactionType: "EscrowCreate",
            Account: user.account,
            Destination: user.account, // Lock for self
            Amount: {
                currency: XRPL_TOKENS.BELGRAVE.currency,
                issuer: XRPL_TOKENS.BELGRAVE.issuer,
                value: amount.toString()
            },
            FinishAfter: finishAfter
            // Condition: OPTIONAL - We use time-based only for simpler staking
        };

        return await sdk.payload?.create(payload as any);
    }

    /**
     * Fetches all ACTIVE Escrows for the user that involve BELGRAVE
     * @param address User's XRPL Address
     */
    async getLockedBalance(address: string): Promise<number> {
        try {
            // We need to query the account_objects to find Escrows
            // Note: This is a robust query. 
            // 'account_objects' returns escrows where the account is the OWNER (Sender).
            // Since we lock for SELF, we are both Sender and Receiver.
            
            const response = await fetch(XRPL_NETWORKS.MAINNET, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: "account_objects",
                    params: [{
                        account: address,
                        type: "escrow",
                        ledger_index: "validated"
                    }]
                })
            });

            const data = await response.json();
            
            if (!data.result || !data.result.account_objects) {
                return 0;
            }

            let totalLocked = 0;
            const escrows = data.result.account_objects;

            for (const escrow of escrows) {
                // Check if this escrow holds BELGRAVE
                // Note: account_objects for Escrow usually shows 'Amount' as string (XRP) or Object (IOU)
                if (typeof escrow.Amount === 'object' && 
                    escrow.Amount.currency === XRPL_TOKENS.BELGRAVE.currency && 
                    escrow.Amount.issuer === XRPL_TOKENS.BELGRAVE.issuer) {
                    
                    totalLocked += parseFloat(escrow.Amount.value);
                }
            }

            return totalLocked;
        } catch (e) {
            console.error("Failed to fetch locked Belgrave balance:", e);
            return 0;
        }
    }
}

export const belgraveService = new BelgraveService();
