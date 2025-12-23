// Auto-generated TypeScript types for Supabase database schema
// This file should be regenerated when database schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ======================================================================
      // PRESALES TABLE
      // ======================================================================
      presales: {
        Row: {
          id: string,
          contract_address: string | null,
          chain_id: number,
          creator_address: string,
          
          // Project Information
          name: string,
          description: string,
          website: string | null,
          twitter: string | null,
          telegram: string | null,
          discord: string | null,
          whitepaper: string | null,
          
          // Token Information
          token_address: string,
          token_name: string,
          token_symbol: string,
          total_supply: string,
          
          // Presale Parameters
          soft_cap: string,
          hard_cap: string,
          token_price: string,
          min_contribution: string | null,
          max_contribution: string | null,
          start_time: string,
          end_time: string,
          liquidity_percentage: number,
          liquidity_lock_months: number,
          
          // Vesting
          vesting_enabled: boolean,
          vesting_schedule: Json | null,
          
          // Security
          kyc_documents: string[],
          audit_report: string | null,
          team_token_lock_months: number,
          team_wallets: string[],
          
          // Status
          status: string,
          total_raised: string,
          total_participants: number,
          
          // Metadata
          creation_transaction: string | null,
          contract_created_at: string | null,
          milestones: Json | null,
          created_at: string,
          updated_at: string,
        }
        Insert: {
          id?: string
          contract_address?: string | null
          chain_id: number
          creator_address: string
          
          // Project Information
          name: string
          description: string
          website?: string | null
          twitter?: string | null
          telegram?: string | null
          discord?: string | null
          whitepaper?: string | null
          
          // Token Information
          token_address: string
          token_name: string
          token_symbol: string
          total_supply: string
          
          // Presale Parameters
          soft_cap: string
          hard_cap: string
          token_price: string
          min_contribution?: string | null
          max_contribution?: string | null
          start_time: string
          end_time: string
          liquidity_percentage: number
          liquidity_lock_months: number
          
          // Vesting
          vesting_enabled?: boolean
          vesting_schedule?: Json | null
          
          // Security
          kyc_documents?: string[]
          audit_report?: string | null
          team_token_lock_months?: number
          team_wallets?: string[]
          
          // Status
          status?: string
          total_raised?: string
          total_participants?: number
          
          // Metadata
          creation_transaction?: string | null
          contract_created_at?: string | null
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          contract_address?: string | null
          chain_id?: number
          creator_address?: string
          
          // Project Information
          name?: string
          description?: string
          website?: string | null
          twitter?: string | null
          telegram?: string | null
          discord?: string | null
          whitepaper?: string | null
          
          // Token Information
          token_address?: string
          token_name?: string
          token_symbol?: string
          total_supply?: string
          
          // Presale Parameters
          soft_cap?: string
          hard_cap?: string
          token_price?: string
          min_contribution?: string | null
          max_contribution?: string | null
          start_time?: string
          end_time?: string
          liquidity_percentage?: number
          liquidity_lock_months?: number
          
          // Vesting
          vesting_enabled?: boolean
          vesting_schedule?: Json | null
          
          // Security
          kyc_documents?: string[]
          audit_report?: string | null
          team_token_lock_months?: number
          team_wallets?: string[]
          
          // Status
          status?: string
          total_raised?: string
          total_participants?: number
          
          // Metadata
          creation_transaction?: string | null
          contract_created_at?: string | null
          milestones?: Json | null
          updated_at?: string
        }
      },

      // ======================================================================
      // TOKEN LOCKS TABLE
      // ======================================================================
      token_locks: {
        Row: {
          id: string
          lock_id: number
          chain_id: number
          
          // Token Information
          token_address: string
          token_name: string | null
          token_symbol: string | null
          token_decimals: number
          
          // Lock Details
          owner_address: string
          beneficiary_address: string
          amount: string
          
          // Timing
          lock_time: string
          unlock_time: string
          
          // Metadata
          description: string | null
          lock_type: string
          
          // Status
          status: string
          
          // Blockchain Data
          creation_transaction: string
          unlock_transaction: string | null
          
          // Timestamps
          created_at: string
          updated_at: string
          unlocked_at: string | null
        }
        Insert: {
          id?: string
          lock_id: number
          chain_id: number
          
          // Token Information
          token_address: string
          token_name?: string | null
          token_symbol?: string | null
          token_decimals?: number
          
          // Lock Details
          owner_address: string
          beneficiary_address: string
          amount: string
          
          // Timing
          lock_time: string
          unlock_time: string
          
          // Metadata
          description?: string | null
          lock_type?: string
          
          // Status
          status?: string
          
          // Blockchain Data
          creation_transaction: string
          unlock_transaction?: string | null
          
          // Timestamps
          created_at?: string
          updated_at?: string
          unlocked_at?: string | null
        }
        Update: {
          lock_id?: number
          chain_id?: number
          
          // Token Information
          token_address?: string
          token_name?: string | null
          token_symbol?: string | null
          token_decimals?: number
          
          // Lock Details
          owner_address?: string
          beneficiary_address?: string
          amount?: string
          
          // Timing
          lock_time?: string
          unlock_time?: string
          
          // Metadata
          description?: string | null
          lock_type?: string
          
          // Status
          status?: string
          
          // Blockchain Data
          creation_transaction?: string
          unlock_transaction?: string | null
          
          // Timestamps
          updated_at?: string
          unlocked_at?: string | null
        }
      },

      // ======================================================================
      // TOKEN VESTING TABLE
      // ======================================================================
      token_vesting: {
        Row: {
          id: string
          lock_id: string
          
          // Vesting Period Details
          period_index: number
          percentage: string
          amount: string
          unlock_time: string
          description: string | null
          
          // Status
          claimed: boolean
          claim_transaction: string | null
          claimed_at: string | null
          
          // Timestamps
          created_at: string
        }
        Insert: {
          id?: string
          lock_id: string
          
          // Vesting Period Details
          period_index: number
          percentage: string
          amount: string
          unlock_time: string
          description?: string | null
          
          // Status
          claimed?: boolean
          claim_transaction?: string | null
          claimed_at?: string | null
          
          // Timestamps
          created_at?: string
        }
        Update: {
          lock_id?: string
          
          // Vesting Period Details
          period_index?: number
          percentage?: string
          amount?: string
          unlock_time?: string
          description?: string | null
          
          // Status
          claimed?: boolean
          claim_transaction?: string | null
          claimed_at?: string | null
        }
      },

      // ======================================================================
      // USER SESSIONS TABLE
      // ======================================================================
      user_sessions: {
        Row: {
          id: string
          user_address: string
          
          // Session Data
          last_active: string
          presales_created: number
          total_raised: string
          total_locked: string
          
          // Settings
          notification_preferences: Json
          
          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_address: string
          
          // Session Data
          last_active?: string
          presales_created?: number
          total_raised?: string
          total_locked?: string
          
          // Settings
          notification_preferences?: Json
          
          // Timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_address?: string
          
          // Session Data
          last_active?: string
          presales_created?: number
          total_raised?: string
          total_locked?: string
          
          // Settings
          notification_preferences?: Json
          
          // Timestamps
          updated_at?: string
        }
      },

      // ======================================================================
      // PRESALE PARTICIPANTS TABLE
      // ======================================================================
      presale_participants: {
        Row: {
          id: string
          presale_id: string
          user_address: string
          
          // Participation Data
          contribution_amount: string
          token_allocation: string
          tokens_claimed: boolean
          refund_claimed: boolean
          
          // Transaction Data
          contribution_transaction: string
          claim_transaction: string | null
          
          // Timestamps
          participated_at: string
          claimed_at: string | null
        }
        Insert: {
          id?: string
          presale_id: string
          user_address: string
          
          // Participation Data
          contribution_amount: string
          token_allocation: string
          tokens_claimed?: boolean
          refund_claimed?: boolean
          
          // Transaction Data
          contribution_transaction: string
          claim_transaction?: string | null
          
          // Timestamps
          participated_at?: string
          claimed_at?: string | null
        }
        Update: {
          presale_id?: string
          user_address?: string
          
          // Participation Data
          contribution_amount?: string
          token_allocation?: string
          tokens_claimed?: boolean
          refund_claimed?: boolean
          
          // Transaction Data
          contribution_transaction?: string
          claim_transaction?: string | null
          
          // Timestamps
          claimed_at?: string | null
        }
      },

      // ======================================================================
      // PRESALE TIMELINE TABLE
      // ======================================================================
      presale_timeline: {
        Row: {
          id: string
          presale_id: string
          
          // Event Details
          event_type: string
          description: string
          transaction_hash: string | null
          
          // Timestamps
          created_at: string
        }
        Insert: {
          id?: string
          presale_id: string
          
          // Event Details
          event_type: string
          description: string
          transaction_hash?: string | null
          
          // Timestamps
          created_at?: string
        }
        Update: {
          presale_id?: string
          
          // Event Details
          event_type?: string
          description?: string
          transaction_hash?: string | null
        }
      },

      // ======================================================================
      // ADMIN ACTIONS TABLE
      // ======================================================================
      admin_actions: {
        Row: {
          id: string
          action_type: string
          performed_by: string
          target_id: string | null
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action_type: string
          performed_by: string
          target_id?: string | null
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          action_type?: string
          performed_by?: string
          target_id?: string | null
          description?: string
          metadata?: Json | null
        }
      },

      // ======================================================================
      // TOKEN LOCK EVENTS TABLE
      // ======================================================================
      token_lock_events: {
        Row: {
          id: string
          lock_id: string
          
          // Event Details
          event_type: string
          event_data: Json | null
          transaction_hash: string | null
          block_number: number | null
          
          // User and timing
          user_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lock_id: string
          
          // Event Details
          event_type: string
          event_data?: Json | null
          transaction_hash?: string | null
          block_number?: number | null
          
          // User and timing
          user_address?: string | null
          created_at?: string
        }
        Update: {
          lock_id?: string
          
          // Event Details
          event_type?: string
          event_data?: Json | null
          transaction_hash?: string | null
          block_number?: number | null
          
          // User and timing
          user_address?: string | null
        }
      }
    },

    // ======================================================================
    // VIEWS
    // ======================================================================
    Views: {
      active_token_locks: {
        Row: {
          id: string
          lock_id: number
          chain_id: number
          token_address: string
          token_name: string | null
          token_symbol: string | null
          token_decimals: number
          owner_address: string
          beneficiary_address: string
          amount: string
          lock_time: string
          unlock_time: string
          description: string | null
          lock_type: string
          status: string
          creation_transaction: string
          unlock_transaction: string | null
          created_at: string
          updated_at: string
          unlocked_at: string | null
          seconds_until_unlock: number | null
          effective_status: string
        }
      },
      user_lock_stats: {
        Row: {
          owner_address: string
          total_locks: number
          active_locks: number
          unlocked_locks: number
          claimable_locks: number
          total_locked_amount: number
          first_lock_date: string
          latest_lock_date: string
        }
      },
      token_lock_stats: {
        Row: {
          token_address: string
          token_symbol: string | null
          chain_id: number
          lock_count: number
          total_locked_amount: string
          unique_lockers: number
          earliest_unlock: string
          latest_unlock: string
        }
      }
    },

    // ======================================================================
    // FUNCTIONS
    // ======================================================================
    Functions: {
      log_token_lock_event: {
        Args: {
          p_lock_id: string
          p_event_type: string
          p_event_data?: Json
          p_transaction_hash?: string
          p_user_address?: string
        }
        Returns: string
      }
      update_lock_status: {
        Args: {
          p_lock_id: string
          p_status: string
          p_transaction_hash?: string
        }
        Returns: boolean
      }
    },

    // ======================================================================
    // ENUMS
    // ======================================================================
    Enums: {
      presale_status: 'draft' | 'pending_review' | 'approved' | 'active' | 'ended' | 'successful' | 'failed' | 'cancelled',
      lock_status: 'locked' | 'unlocked' | 'cancelled',
      lock_type: 'team' | 'marketing' | 'development' | 'advisors' | 'liquidity' | 'custom',
      event_type: 'lock_created' | 'lock_unlocked' | 'lock_cancelled' | 'vesting_claimed' | 'beneficiary_changed' | 'lock_extended'
    },

    // ======================================================================
    // COMPOSITE TYPES
    // ======================================================================
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type PresaleWithParticipants = Database['public']['Tables']['presales']['Row'] & {
  presale_participants?: Database['public']['Tables']['presale_participants']['Row'][]
  presale_timeline?: Database['public']['Tables']['presale_timeline']['Row'][]
}

export type TokenLockWithVesting = Database['public']['Tables']['token_locks']['Row'] & {
  token_vesting?: Database['public']['Tables']['token_vesting']['Row'][]
  token_lock_events?: Database['public']['Tables']['token_lock_events']['Row'][]
}

export type UserWithStats = Database['public']['Tables']['user_sessions']['Row'] & {
  presales?: Database['public']['Tables']['presales']['Row'][]
  token_locks?: Database['public']['Tables']['token_locks']['Row'][]
  stats?: Database['public']['Views']['user_lock_stats']['Row']
}