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
    /**
     * Constructs an XRPL EscrowCreate payload for locking tokens
     * @param account The XRPL account address (sender and receiver)
     * @param amount The amount of BELGRAVE to lock
     * @param durationSeconds The duration to lock for in seconds
     */
    constructLockPayload(account: string, amount: number, durationSeconds: number) {
        // Calculate FinishAfter time (Ripple Epoch)
        // Ripple Epoch is seconds since Jan 1 2000 (946684800 seconds after Unix Epoch)
        const now = new Date();
        const finishAfterUnix = Math.floor(now.getTime() / 1000) + durationSeconds;
        const rippleEpochOffset = 946684800;
        const finishAfterRipple = finishAfterUnix - rippleEpochOffset;

        return {
            TransactionType: "EscrowCreate",
            Account: account,
            Destination: account, // Lock to self
            Amount: {
                currency: XRPL_TOKENS.BELGRAVE.currencyHex, // Must use Hex for non-standard currency codes > 3 chars
                issuer: XRPL_TOKENS.BELGRAVE.issuer,
                value: amount.toString()
            },
            FinishAfter: finishAfterRipple,
            CancelAfter: finishAfterRipple + 31536000 // Expire 1 year after unlock time
        };
    }

    /**
     * Locks Belgrave tokens in an XRPL Escrow
     * @deprecated Use constructLockPayload and requestSignature instead
     */
    async lockTokens(amount: number, durationSeconds: number) {
        throw new Error("Use requestSignature flow via StakingPage");
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

    /**
     * Calculates the total qualifying balance for Tiers (Liquid + Locked)
     * Note: Since TokenEscrow is not yet live on Mainnet, we count Liquid holdings as "Staked"
     * @param address 
     */
    async getQualifyingBalance(address: string): Promise<number> {
        try {
            // Static import used above
            
            const locked = await this.getLockedBalance(address);
            const liquidStr = await xamanService.getBelgraveBalance(address);
            const liquid = parseFloat(liquidStr);

            return locked + liquid;
        } catch (e) {
            console.error("Failed to fetch qualifying balance", e);
            return 0;
        }
    }
}

export const belgraveService = new BelgraveService();
