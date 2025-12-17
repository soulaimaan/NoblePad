export interface CreateProjectData {
    name: string;
    symbol: string;
    description: string;
    website?: string;
    whitepaper_url?: string;
    logo_url?: string;
    blockchain: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'base' | 'solana';
    total_supply: string;
    decimals?: number;
    presale_type: 'standard' | 'fair_launch' | 'private' | 'ido';
    soft_cap: string;
    hard_cap: string;
    presale_rate: string;
    listing_rate: string;
    liquidity_percentage: number;
    liquidity_lock_days: number;
    start_time: Date;
    end_time: Date;
    vesting_enabled: boolean;
    vesting_data?: any;
}
export declare class ProjectService {
    private thirdweb;
    private notifications;
    constructor();
    /**
     * Create a new project
     */
    createProject(creatorId: string, projectData: CreateProjectData): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Submit project for review
     */
    submitForReview(projectId: string, creatorId: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    /**
     * Deploy project contracts
     */
    deployProject(projectId: string, creatorId: string): Promise<{
        success: boolean;
        data: {
            tokenAddress: any;
            presaleAddress: any;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get project by ID
     */
    getProject(projectId: string): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * List projects with filters
     */
    listProjects(filters?: {
        blockchain?: string;
        status?: string;
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            projects: any[];
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
     * Get user's projects
     */
    getUserProjects(userId: string): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Private helper methods
     */
    private validateProjectData;
    private getChainId;
    private logAnalyticsEvent;
}
//# sourceMappingURL=ProjectService.d.ts.map