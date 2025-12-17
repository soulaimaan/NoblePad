// Enhanced Presale Operations Edge Function
// Handles complex presale operations with blockchain integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PresaleOperationRequest {
  operation: 'create' | 'update_status' | 'sync_data' | 'analytics' | 'validate_token'
  data: any
  user_address?: string
  chain_id?: number
}

interface TokenValidationRequest {
  token_address: string
  chain_id: number
}

interface PresaleUpdateRequest {
  presale_id: string
  contract_address: string
  transaction_hash: string
  new_status: string
  metadata?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { operation, data, user_address, chain_id }: PresaleOperationRequest = await req.json()

    let result: any = {}

    switch (operation) {
      case 'create':
        result = await handlePresaleCreation(supabase, data, user_address!)
        break

      case 'update_status':
        result = await handleStatusUpdate(supabase, data as PresaleUpdateRequest)
        break

      case 'sync_data':
        result = await handleDataSync(supabase, data.presale_id, chain_id!)
        break

      case 'analytics':
        result = await handleAnalytics(supabase, data)
        break

      case 'validate_token':
        result = await handleTokenValidation(data as TokenValidationRequest)
        break

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Enhanced presale operation failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Handle presale creation with comprehensive validation
async function handlePresaleCreation(supabase: any, presaleData: any, userAddress: string) {
  console.log('Creating presale for user:', userAddress)

  // Validate user permissions
  const userValidation = await validateUser(supabase, userAddress)
  if (!userValidation.valid) {
    throw new Error('User validation failed: ' + userValidation.reason)
  }

  // Validate presale parameters
  const paramValidation = await validatePresaleParameters(presaleData)
  if (!paramValidation.valid) {
    throw new Error('Parameter validation failed: ' + paramValidation.reason)
  }

  // Create presale record
  const { data: presale, error: presaleError } = await supabase
    .from('presales')
    .insert({
      ...presaleData,
      creator_address: userAddress.toLowerCase(),
      status: 'pending_review',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (presaleError) {
    throw new Error('Failed to create presale: ' + presaleError.message)
  }

  // Create initial timeline entry
  await supabase
    .from('presale_timeline')
    .insert({
      presale_id: presale.id,
      event_type: 'presale_created',
      description: 'Presale created and submitted for review',
      created_at: new Date().toISOString(),
    })

  // Update user statistics
  await updateUserStats(supabase, userAddress, {
    presales_created: 1,
    last_active: new Date().toISOString(),
  })

  // Trigger notifications
  await triggerNotifications(supabase, 'new_presale', {
    presale_id: presale.id,
    creator: userAddress,
    project_name: presaleData.name,
  })

  return {
    presale_id: presale.id,
    status: presale.status,
    message: 'Presale created successfully'
  }
}

// Handle presale status updates
async function handleStatusUpdate(supabase: any, updateData: PresaleUpdateRequest) {
  console.log('Updating presale status:', updateData.presale_id)

  // Update presale record
  const { data: updatedPresale, error: updateError } = await supabase
    .from('presales')
    .update({
      status: updateData.new_status,
      contract_address: updateData.contract_address,
      creation_transaction: updateData.transaction_hash,
      contract_created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', updateData.presale_id)
    .select()
    .single()

  if (updateError) {
    throw new Error('Failed to update presale: ' + updateError.message)
  }

  // Add timeline entry
  await supabase
    .from('presale_timeline')
    .insert({
      presale_id: updateData.presale_id,
      event_type: 'status_changed',
      description: `Status changed to ${updateData.new_status}`,
      transaction_hash: updateData.transaction_hash,
      created_at: new Date().toISOString(),
    })

  // Trigger status change notifications
  await triggerNotifications(supabase, 'presale_status_changed', {
    presale_id: updateData.presale_id,
    old_status: 'pending',
    new_status: updateData.new_status,
    contract_address: updateData.contract_address,
  })

  return {
    presale_id: updateData.presale_id,
    new_status: updateData.new_status,
    message: 'Status updated successfully'
  }
}

// Handle blockchain data synchronization
async function handleDataSync(supabase: any, presaleId: string, chainId: number) {
  console.log('Syncing data for presale:', presaleId)

  // Get presale data
  const { data: presale, error: presaleError } = await supabase
    .from('presales')
    .select('*')
    .eq('id', presaleId)
    .single()

  if (presaleError || !presale) {
    throw new Error('Presale not found')
  }

  // Sync blockchain data (placeholder - would integrate with actual RPC)
  const blockchainData = await fetchBlockchainData(presale.contract_address, chainId)

  // Update presale with synced data
  const { error: syncError } = await supabase
    .from('presales')
    .update({
      total_raised: blockchainData.totalRaised,
      total_participants: blockchainData.participantCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', presaleId)

  if (syncError) {
    throw new Error('Failed to sync data: ' + syncError.message)
  }

  return {
    presale_id: presaleId,
    synced_data: blockchainData,
    message: 'Data synchronized successfully'
  }
}

// Handle analytics queries
async function handleAnalytics(supabase: any, analyticsParams: any) {
  console.log('Generating analytics:', analyticsParams)

  const { timeframe = '7d', metrics = ['presales', 'volume', 'users'] } = analyticsParams

  const analytics: any = {}

  // Get presale statistics
  if (metrics.includes('presales')) {
    const { data: presaleStats } = await supabase
      .from('presales')
      .select('status, created_at, total_raised, chain_id')
      .gte('created_at', getTimeframeStart(timeframe))

    analytics.presales = {
      total: presaleStats?.length || 0,
      by_status: groupBy(presaleStats || [], 'status'),
      by_chain: groupBy(presaleStats || [], 'chain_id'),
    }
  }

  // Get volume statistics
  if (metrics.includes('volume')) {
    const { data: volumeStats } = await supabase
      .from('presales')
      .select('total_raised, chain_id')
      .gte('created_at', getTimeframeStart(timeframe))

    const totalVolume = volumeStats?.reduce(
      (sum: number, presale: any) => sum + parseFloat(presale.total_raised || '0'),
      0
    ) || 0

    analytics.volume = {
      total: totalVolume,
      by_chain: volumeStats?.reduce((acc: any, presale: any) => {
        const chain = presale.chain_id
        acc[chain] = (acc[chain] || 0) + parseFloat(presale.total_raised || '0')
        return acc
      }, {}) || {}
    }
  }

  // Get user statistics
  if (metrics.includes('users')) {
    const { data: userStats } = await supabase
      .from('user_sessions')
      .select('user_address, last_active, presales_created')
      .gte('last_active', getTimeframeStart(timeframe))

    analytics.users = {
      active: userStats?.length || 0,
      total_presales_created: userStats?.reduce(
        (sum: number, user: any) => sum + (user.presales_created || 0),
        0
      ) || 0,
    }
  }

  return analytics
}

// Handle token validation
async function handleTokenValidation(tokenData: TokenValidationRequest) {
  console.log('Validating token:', tokenData.token_address)

  // Placeholder for token validation logic
  // In a real implementation, this would call the blockchain
  const mockValidation = {
    isValid: true,
    tokenInfo: {
      name: 'Example Token',
      symbol: 'EXAMPLE',
      decimals: 18,
      totalSupply: '1000000000000000000000000', // 1M tokens
      verified: true,
    }
  }

  return mockValidation
}

// Helper functions
async function validateUser(supabase: any, userAddress: string) {
  // Check if user is banned or restricted
  const { data: userSession } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_address', userAddress.toLowerCase())
    .single()

  // For now, all users are valid
  return { valid: true, reason: null }
}

async function validatePresaleParameters(presaleData: any) {
  const requiredFields = [
    'name', 'description', 'token_address', 'soft_cap', 'hard_cap',
    'start_time', 'end_time', 'chain_id'
  ]

  for (const field of requiredFields) {
    if (!presaleData[field]) {
      return { valid: false, reason: `Missing required field: ${field}` }
    }
  }

  // Validate dates
  const startTime = new Date(presaleData.start_time)
  const endTime = new Date(presaleData.end_time)
  const now = new Date()

  if (startTime <= now) {
    return { valid: false, reason: 'Start time must be in the future' }
  }

  if (endTime <= startTime) {
    return { valid: false, reason: 'End time must be after start time' }
  }

  // Validate caps
  const softCap = parseFloat(presaleData.soft_cap)
  const hardCap = parseFloat(presaleData.hard_cap)

  if (hardCap <= softCap) {
    return { valid: false, reason: 'Hard cap must be greater than soft cap' }
  }

  return { valid: true, reason: null }
}

async function updateUserStats(supabase: any, userAddress: string, updates: any) {
  await supabase
    .from('user_sessions')
    .upsert({
      user_address: userAddress.toLowerCase(),
      ...updates,
      updated_at: new Date().toISOString(),
    })
}

async function triggerNotifications(supabase: any, type: string, data: any) {
  // Log notification trigger
  console.log('Triggering notification:', type, data)
  
  // In a real implementation, this would send emails, push notifications, etc.
  // For now, just log to admin actions
  await supabase
    .from('admin_actions')
    .insert({
      action_type: 'notification_triggered',
      performed_by: 'system',
      description: `Notification triggered: ${type}`,
      metadata: data,
      created_at: new Date().toISOString(),
    })
}

async function fetchBlockchainData(contractAddress: string, chainId: number) {
  // Placeholder for blockchain data fetching
  // In a real implementation, this would call the actual blockchain
  return {
    totalRaised: '0',
    participantCount: 0,
    status: 'active',
    lastSyncTime: new Date().toISOString(),
  }
}

function getTimeframeStart(timeframe: string): string {
  const now = new Date()
  const timeframeMap: { [key: string]: number } = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }

  const days = timeframeMap[timeframe] || 7
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return start.toISOString()
}

function groupBy(array: any[], key: string) {
  return array.reduce((acc: any, item: any) => {
    const group = item[key]
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})
}