import { createClient, PostgrestError } from '@supabase/supabase-js'
import { Database } from './supabaseTypes'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate environment variables
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '⚠️ Supabase environment variables are missing. ' +
    'Please check your .env.local file. ' +
    'Some features may not work correctly.'
  )
}

// Create clients with fallback handling
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any

// Service role client for API routes/server-side (bypasses RLS)
export const supabaseServiceRole = supabaseUrl && supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
  : null as any

// Global type for our typed client
export type TypedSupabaseClient = typeof supabase

// Shared helper for error handling and logging
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context: string,
  defaultValue: T | null = null
): Promise<{ data: T | null; error: PostgrestError | null }> {
  try {
    const { data, error } = await operation()
    if (error) {
      console.error(`[Supabase Error] ${context}:`, error.message, error.details)
      return { data: defaultValue, error }
    }
    return { data, error: null }
  } catch (err: any) {
    console.error(`[Supabase Exception] ${context}:`, err.message || 'Unknown error')
    return { data: defaultValue, error: { message: err.message || 'Unknown error' } as PostgrestError }
  }
}

// Added for compatibility with legacy code
export function handleSupabaseResponse<T>(
  response: { data: T | null; error: PostgrestError | null },
  context: string,
  defaultValue: T | null = null
): T {
  if (response.error) {
    console.error(`[Supabase Error] ${context}:`, response.error.message)
    if (defaultValue !== null) return defaultValue as T
    throw new Error(response.error.message)
  }
  return response.data as T
}

// Re-export common types
export type PresaleRow = Database['public']['Tables']['presales']['Row']
export type PresaleInsert = Database['public']['Tables']['presales']['Insert']
export type PresaleUpdate = Database['public']['Tables']['presales']['Update']

export type PresaleContributionRow = any
export type PresaleContributionInsert = any

export type TokenLockRow = Database['public']['Tables']['token_locks']['Row']
export type TokenLockInsert = Database['public']['Tables']['token_locks']['Insert']
export type TokenLockUpdate = Database['public']['Tables']['token_locks']['Update']

export type TokenVestingRow = Database['public']['Tables']['token_vesting']['Row']
export type TokenVestingInsert = Database['public']['Tables']['token_vesting']['Insert']

export type UserSessionRow = Database['public']['Tables']['user_sessions']['Row']
export type UserSessionInsert = Database['public']['Tables']['user_sessions']['Insert']
export type UserSessionUpdate = Database['public']['Tables']['user_sessions']['Update']

// Utility functions for common operations
export class DatabaseOperations {
  private client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
    this.client = client
  }

  // User session management
  async upsertUserSession(walletAddress: string, sessionData: Partial<UserSessionInsert>) {
    return await safeSupabaseOperation(
      () => (this.client
        .from('user_sessions')
        .upsert({
          user_address: walletAddress.toLowerCase(),
          last_active: new Date().toISOString(),
          ...sessionData,
        } as any) as any),
      'User session upsert'
    )
  }

  // Get user statistics
  async getUserStats(walletAddress: string) {
    const addr = walletAddress.toLowerCase();
    
    // Explicit individual calls to avoid complex Promise.all typing with broken inferences
    const { data: presales } = await (this.client
      .from('presales')
      .select('*')
      .eq('creator_address', addr) as any)
      
    const { data: locks } = await (this.client
      .from('token_locks')
      .select('*')
      .eq('owner_address', addr) as any)
      
    const { data: sessions } = await (this.client
      .from('user_sessions')
      .select('*')
      .eq('user_address', addr)
      .single() as any)

    const totalRaised = (presales as any[])?.reduce((sum, p) => sum + parseFloat(p.hard_cap || '0'), 0) || 0
    const lastActive = (sessions as any)?.last_active

    return {
      presales: presales?.length || 0,
      locks: locks?.length || 0,
      lastActive,
      totalRaised,
    }
  }

  // Get user presales
  async getUserPresales(walletAddress: string) {
    return await safeSupabaseOperation(
      () => (this.client
        .from('presales')
        .select('*')
        .eq('creator_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false }) as any),
      'Get user presales',
      []
    ) as any
  }

  // Get presale by ID
  async getPresaleById(id: string) {
    return await safeSupabaseOperation(
      () => (this.client
        .from('presales')
        .select('*')
        .eq('id', id)
        .single() as any),
      'Get presale by ID'
    ) as any
  }

  // Get user token locks
  async getUserTokenLocks(walletAddress: string) {
    return await safeSupabaseOperation(
      () => (this.client
        .from('token_locks')
        .select('*')
        .or(`owner_address.eq.${walletAddress.toLowerCase()},beneficiary_address.eq.${walletAddress.toLowerCase()}`)
        .order('created_at', { ascending: false }) as any),
      'Get user token locks',
      []
    ) as any
  }

  // Get user session
  async getUserSession(walletAddress: string) {
    return await safeSupabaseOperation(
      () => (this.client
        .from('user_sessions')
        .select('*')
        .eq('user_address', walletAddress.toLowerCase())
        .single() as any),
      'Get user session'
    ) as any
  }

  // Analytics queries
  async getGlobalStats() {
    const { data: presales } = await (this.client
      .from('presales')
      .select('status, hard_cap') as any)

    if (!presales) return { totalRaised: '0', activePresales: 0 }

    const totalRaised = presales.reduce((sum: number, p: any) => sum + parseFloat(p.hard_cap || '0'), 0)
    const activePresales = presales.filter((p: any) => p.status === 'active').length

    return {
      totalRaised: totalRaised.toString(),
      activePresales
    }
  }

  async getTokenLockAnalytics() {
    return await safeSupabaseOperation(
      () => (this.client
        .from('token_lock_stats')
        .select('*')
        .single() as any),
      'Token lock analytics'
    ) as any
  }

  // Storage operations
  async uploadTokenIcon(file: File, fileName: string) {
    const { data, error } = await this.client.storage
      .from('token-icons')
      .upload(fileName, file)

    if (error) {
      console.error('[Supabase Storage Error] Icon upload:', error.message)
      return { data: null, error: error as any }
    }

    const { data: { publicUrl } } = this.client.storage
      .from('token-icons')
      .getPublicUrl(fileName)

    return { data: publicUrl, error: null }
  }
}

export const db = new DatabaseOperations()
