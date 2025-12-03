"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const app_1 = require("../app");
const ThirdwebService_1 = require("./ThirdwebService");
const NotificationService_1 = require("./NotificationService");
class ProjectService {
    constructor() {
        this.thirdweb = new ThirdwebService_1.ThirdwebService();
        this.notifications = new NotificationService_1.NotificationService();
    }
    /**
     * Create a new project
     */
    async createProject(creatorId, projectData) {
        try {
            // Validate project data
            this.validateProjectData(projectData);
            // Get chain ID for blockchain
            const chainId = this.getChainId(projectData.blockchain);
            // Insert project into database
            const { data: project, error } = await app_1.supabase
                .from('projects')
                .insert({
                creator_id: creatorId,
                chain_id: chainId,
                ...projectData,
                status: 'draft',
            })
                .select()
                .single();
            if (error)
                throw error;
            // Log project creation event
            await this.logAnalyticsEvent('project_created', {
                project_id: project.id,
                user_id: creatorId,
                blockchain: projectData.blockchain,
            });
            return { success: true, data: project };
        }
        catch (error) {
            console.error('Error creating project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Submit project for review
     */
    async submitForReview(projectId, creatorId) {
        try {
            // Validate project ownership
            const { data: project } = await app_1.supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('creator_id', creatorId)
                .single();
            if (!project) {
                throw new Error('Project not found or not owned by user');
            }
            if (project.status !== 'draft') {
                throw new Error('Project is not in draft status');
            }
            // Update project status
            const { error } = await app_1.supabase
                .from('projects')
                .update({ status: 'pending_review' })
                .eq('id', projectId);
            if (error)
                throw error;
            // Create review record
            await app_1.supabase
                .from('project_reviews')
                .insert({
                project_id: projectId,
                status: 'pending',
            });
            // Send notification to admins
            await this.notifications.notifyAdmins('new_project_submission', {
                project_id: projectId,
                project_name: project.name,
            });
            // Log event
            await this.logAnalyticsEvent('project_submitted', {
                project_id: projectId,
                user_id: creatorId,
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error submitting project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Deploy project contracts
     */
    async deployProject(projectId, creatorId) {
        try {
            const { data: project } = await app_1.supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('creator_id', creatorId)
                .single();
            if (!project) {
                throw new Error('Project not found');
            }
            if (project.status !== 'approved') {
                throw new Error('Project must be approved before deployment');
            }
            // Deploy token contract
            const tokenAddress = await this.thirdweb.deployToken({
                name: project.name,
                symbol: project.symbol,
                totalSupply: project.total_supply,
                decimals: project.decimals || 18,
                chainId: project.chain_id,
            });
            // Deploy presale contract
            const presaleAddress = await this.thirdweb.deployPresale({
                tokenAddress,
                softCap: project.soft_cap,
                hardCap: project.hard_cap,
                presaleRate: project.presale_rate,
                listingRate: project.listing_rate,
                liquidityPercentage: project.liquidity_percentage,
                startTime: project.start_time,
                endTime: project.end_time,
                chainId: project.chain_id,
            });
            // Update project with contract addresses
            const { error } = await app_1.supabase
                .from('projects')
                .update({
                token_address: tokenAddress,
                presale_address: presaleAddress,
                status: 'deployed',
            })
                .eq('id', projectId);
            if (error)
                throw error;
            // Log deployment event
            await this.logAnalyticsEvent('project_deployed', {
                project_id: projectId,
                token_address: tokenAddress,
                presale_address: presaleAddress,
            });
            return {
                success: true,
                data: { tokenAddress, presaleAddress }
            };
        }
        catch (error) {
            console.error('Error deploying project:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Get project by ID
     */
    async getProject(projectId) {
        try {
            const { data: project, error } = await app_1.supabase
                .from('projects')
                .select(`
          *,
          users!creator_id(id, username, kyc_status),
          participations(count),
          project_reviews(status, score, notes)
        `)
                .eq('id', projectId)
                .single();
            if (error)
                throw error;
            return { success: true, data: project };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * List projects with filters
     */
    async listProjects(filters = {}) {
        try {
            let query = app_1.supabase
                .from('projects')
                .select(`
          *,
          users!creator_id(username, kyc_status),
          participations(count)
        `);
            // Apply filters
            if (filters.blockchain) {
                query = query.eq('blockchain', filters.blockchain);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,symbol.ilike.%${filters.search}%`);
            }
            // Pagination
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);
            query = query.order('created_at', { ascending: false });
            const { data: projects, error, count } = await query;
            if (error)
                throw error;
            return {
                success: true,
                data: {
                    projects,
                    pagination: {
                        page,
                        limit,
                        total: count,
                        totalPages: Math.ceil((count || 0) / limit),
                    },
                },
            };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Get user's projects
     */
    async getUserProjects(userId) {
        try {
            const { data: projects, error } = await app_1.supabase
                .from('projects')
                .select('*')
                .eq('creator_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return { success: true, data: projects };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Private helper methods
     */
    validateProjectData(data) {
        if (!data.name || data.name.length < 3) {
            throw new Error('Project name must be at least 3 characters');
        }
        if (!data.symbol || data.symbol.length < 2) {
            throw new Error('Token symbol must be at least 2 characters');
        }
        if (parseFloat(data.hard_cap) <= parseFloat(data.soft_cap)) {
            throw new Error('Hard cap must be greater than soft cap');
        }
        if (data.start_time >= data.end_time) {
            throw new Error('End time must be after start time');
        }
        if (data.start_time <= new Date()) {
            throw new Error('Start time must be in the future');
        }
    }
    getChainId(blockchain) {
        const chainIds = {
            ethereum: 1,
            bsc: 56,
            polygon: 137,
            arbitrum: 42161,
            base: 8453,
            solana: 0, // Special case for Solana
        };
        return chainIds[blockchain] || 1;
    }
    async logAnalyticsEvent(eventType, eventData) {
        await app_1.supabase
            .from('analytics_events')
            .insert({
            event_type: eventType,
            event_data: eventData,
        });
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=ProjectService.js.map