export interface CreatePresaleData {
    token_address: string;
    owner_address: string;
    soft_cap: string;
    hard_cap: string;
    presale_rate: string;
    listing_rate: string;
    liquidity_percent: number;
    start_time: Date;
    end_time: Date;
    lock_period: number;
    chain_id: number;
    description?: string;
    website?: string;
    telegram?: string;
    twitter?: string;
    discord?: string;
    logo_url?: string;
}
export declare class PresaleService {
    /**
     * Create a new presale record
     */
    createPresale(data: CreatePresaleData): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get presale by ID
     */
    getPresale(id: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * List presales with filters
     */
    listPresales(filters?: {
        status?: string;
        chain_id?: number;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            presales: any[];
            pagination: {
                page: number;
                limit: number;
                total: number | null;
                totalPages: number;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Update presale status (e.g. after on-chain confirmation)
     */
    updatePresaleStatus(id: string, status: string, txHash?: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
}
//# sourceMappingURL=PresaleService.d.ts.map