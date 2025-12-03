// Enhanced Supabase Client with TypeScript types and error handling
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabaseTypes'

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Create the main client
export const supabase: TypedSupabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // We handle auth via wallet connection
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Service role client for server-side operations (only for server-side usage)
export const supabaseServiceRole: TypedSupabaseClient = typeof window === 'undefined' 
  ? createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  : supabase // Use regular client on client-side

// Error handling utility
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// Helper function to handle Supabase responses
export function handleSupabaseResponse<T>(
  response: { data: T | null; error: any },
  context: string = 'Database operation'
): T {
  if (response.error) {
    console.error(`${context} failed:`, response.error)
    throw new SupabaseError(
      response.error.message || `${context} failed`,
      response.error.code,
      response.error.details
    )
  }
  
  if (response.data === null) {
    throw new SupabaseError(`${context} returned no data`)
  }
  
  return response.data
}

// Helper function for safe database operations
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string = 'Database operation',
  defaultValue?: T
): Promise<T | null> {
  try {
    const response = await operation()
    return handleSupabaseResponse(response, context)
  } catch (error) {
    console.error(`${context} failed:`, error)
    if (defaultValue !== undefined) {
      return defaultValue
    }
    return null
  }
}

// Wallet address validation
export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Set user context for RLS (Row Level Security)
export async function setUserContext(walletAddress: string, role: string = 'user') {
  if (!validateWalletAddress(walletAddress)) {
    throw new SupabaseError('Invalid wallet address format')
  }
  
  // This would be used with a custom auth function that sets JWT claims
  // For now, we'll use direct queries with wallet address filtering
  return {
    wallet_address: walletAddress.toLowerCase(),
    role,
    authenticated: true,
  }
}

// Database table types for better type safety
export type PresaleRow = Database['public']['Tables']['presales']['Row']
export type PresaleInsert = Database['public']['Tables']['presales']['Insert']
export type PresaleUpdate = Database['public']['Tables']['presales']['Update']

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
      () => this.client
        .from('user_sessions')
        .upsert({
          user_address: walletAddress.toLowerCase(),
          last_active: new Date().toISOString(),
          ...sessionData,
        }),
      'User session upsert'
    )
  }

  // Get user statistics
  async getUserStats(walletAddress: string) {
    const [presales, locks, sessions] = await Promise.all([
      this.getUserPresales(walletAddress),
      this.getUserTokenLocks(walletAddress),
      this.getUserSession(walletAddress),
    ])

    return {
      presales: presales?.length || 0,
      locks: locks?.length || 0,
      lastActive: sessions?.last_active,
      totalRaised: presales?.reduce((sum, p) => sum + parseFloat(p.hard_cap || '0'), 0) || 0,
    }
  }

  // Get user presales
  async getUserPresales(walletAddress: string) {
    return await safeSupabaseOperation(
      () => this.client
        .from('presales')
        .select('*')
        .eq('creator_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false }),
      'Get user presales',
      []
    )
  }

  // Get user token locks
  async getUserTokenLocks(walletAddress: string) {
    return await safeSupabaseOperation(
      () => this.client
        .from('token_locks')
        .select('*')
        .or(`owner_address.eq.${walletAddress.toLowerCase()},beneficiary_address.eq.${walletAddress.toLowerCase()}`)
        .order('created_at', { ascending: false }),
      'Get user token locks',
      []
    )
  }

  // Get user session
  async getUserSession(walletAddress: string) {
    return await safeSupabaseOperation(
      () => this.client
        .from('user_sessions')
        .select('*')
        .eq('user_address', walletAddress.toLowerCase())
        .single(),
      'Get user session'
    )
  }

  // Analytics queries
  async getPresaleAnalytics(limit: number = 100) {
    return await safeSupabaseOperation(
      () => this.client
        .from('presales')
        .select(`
          *,
          presale_participants(count),
          presale_timeline(count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit),
      'Get presale analytics',
      []
    )
  }

  async getTokenLockAnalytics() {
    return await safeSupabaseOperation(
      () => this.client
        .from('token_lock_stats')
        .select('*')
        .order('lock_count', { ascending: false }),
      'Get token lock analytics',
      []
    )
  }

  // Real-time subscriptions
  subscribeToUserPresales(walletAddress: string, callback: (payload: any) => void) {
    return this.client
      .channel(`user_presales_${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presales',
          filter: `creator_address=eq.${walletAddress.toLowerCase()}`,
        },
        callback
      )
      .subscribe()
  }

  subscribeToUserTokenLocks(walletAddress: string, callback: (payload: any) => void) {
    return this.client
      .channel(`user_token_locks_${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_locks',
          filter: `owner_address=eq.${walletAddress.toLowerCase()}`,
        },
        callback
      )
      .subscribe()
  }
}

// Create default instance
export const db = new DatabaseOperations()

// Helper for file uploads
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string }
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert || false,
        contentType: options?.contentType || file.type,
      })

    if (error) {
      throw new SupabaseError('File upload failed', error.error, error)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('File upload failed:', error)
    return null
  }
}

// Helper for file downloads
export async function getFileUrl(bucket: string, path: string): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    console.error('Get file URL failed:', error)
    return null
  }
}

// Export commonly used types
export type { Database } from './supabaseTypes'