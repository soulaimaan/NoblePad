"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresaleService = void 0;
const app_1 = require("../app");
class PresaleService {
    /**
     * Create a new presale record
     */
    async createPresale(data) {
        try {
            const { data: presale, error } = await app_1.supabase
                .from('presales')
                .insert({
                ...data,
                status: 'pending', // pending on-chain confirmation
            })
                .select()
                .single();
            if (error)
                throw error;
            return { success: true, data: presale };
        }
        catch (error) {
            console.error('Error creating presale:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Get presale by ID
     */
    async getPresale(id) {
        try {
            const { data: presale, error } = await app_1.supabase
                .from('presales')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            return { success: true, data: presale };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * List presales with filters
     */
    async listPresales(filters = {}) {
        try {
            let query = app_1.supabase
                .from('presales')
                .select('*', { count: 'exact' });
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.chain_id) {
                query = query.eq('chain_id', filters.chain_id);
            }
            if (filters.search) {
                // Assuming there's a name or token_symbol column
                query = query.or(`token_symbol.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 20, 50);
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);
            query = query.order('created_at', { ascending: false });
            const { data: presales, error, count } = await query;
            if (error)
                throw error;
            return {
                success: true,
                data: {
                    presales,
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
     * Update presale status (e.g. after on-chain confirmation)
     */
    async updatePresaleStatus(id, status, txHash) {
        try {
            const updateData = { status };
            if (txHash) {
                updateData.creation_tx_hash = txHash;
            }
            const { error } = await app_1.supabase
                .from('presales')
                .update(updateData)
                .eq('id', id);
            if (error)
                throw error;
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.PresaleService = PresaleService;
//# sourceMappingURL=PresaleService.js.map