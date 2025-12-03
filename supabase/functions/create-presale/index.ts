// Edge Function: Create Presale
// Application Logic Tier - Secure presale creation with validation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PresaleData {
  // Project Info
  project_name: string
  description: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  whitepaper?: string
  
  // Token Details
  token_name: string
  token_symbol: string
  token_address: string
  total_supply: string
  
  // Presale Setup
  soft_cap: string
  hard_cap: string
  token_price: string
  min_contribution: string
  max_contribution: string
  start_date: string
  end_date: string
  liquidity_percentage: number
  liquidity_lock_months: number
  
  // Security
  team_token_lock_months: number
  team_wallets: string[]
  audit_report_url?: string
  
  // Vesting
  vesting_schedule: Array<{
    percentage: number
    time_description: string
  }>
  
  // Blockchain
  chain: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    let walletAddress: string
    
    try {
      // In production, properly verify JWT with secret
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      walletAddress = payload.wallet_address
      
      if (!walletAddress) {
        throw new Error('No wallet address in JWT')
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const presaleData: PresaleData = await req.json()

    // Validation
    const validationErrors = validatePresaleData(presaleData)
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: validationErrors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for duplicate token address
    const { data: existingPresale } = await supabaseClient
      .from('presales')
      .select('id')
      .eq('token_address', presaleData.token_address)
      .single()

    if (existingPresale) {
      return new Response(
        JSON.stringify({ 
          error: 'A presale for this token address already exists' 
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create presale record
    const { data: newPresale, error: createError } = await supabaseClient
      .from('presales')
      .insert({
        ...presaleData,
        submitter_address: walletAddress,
        status: 'pending',
        current_raised: 0,
        participant_count: 0,
        kyc_verified: false,
        audit_verified: !!presaleData.audit_report_url,
        vesting_schedule: presaleData.vesting_schedule,
        team_wallets: presaleData.team_wallets
      })
      .select()
      .single()

    if (createError) {
      console.error('Database error:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create presale' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log admin action
    await supabaseClient
      .from('admin_actions')
      .insert({
        admin_address: walletAddress,
        action_type: 'create_presale',
        target_id: newPresale.id,
        metadata: { project_name: presaleData.project_name }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        presale_id: newPresale.id,
        message: 'Presale created successfully. Awaiting admin review.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function validatePresaleData(data: PresaleData): string[] {
  const errors: string[] = []

  // Required fields
  if (!data.project_name?.trim()) errors.push('Project name is required')
  if (!data.description?.trim() || data.description.length < 100) {
    errors.push('Description must be at least 100 characters')
  }
  if (!data.token_name?.trim()) errors.push('Token name is required')
  if (!data.token_symbol?.trim()) errors.push('Token symbol is required')
  if (!data.token_address?.trim()) errors.push('Token address is required')
  if (!data.website?.trim()) errors.push('Website URL is required')
  if (!data.whitepaper?.trim()) errors.push('Whitepaper URL is required')

  // Validate token address format (basic check)
  if (data.token_address && !data.token_address.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.push('Invalid token address format')
  }

  // Validate amounts
  const softCap = parseFloat(data.soft_cap)
  const hardCap = parseFloat(data.hard_cap)
  const tokenPrice = parseFloat(data.token_price)
  const minContrib = parseFloat(data.min_contribution)
  const maxContrib = parseFloat(data.max_contribution)

  if (isNaN(softCap) || softCap <= 0) errors.push('Invalid soft cap')
  if (isNaN(hardCap) || hardCap <= 0) errors.push('Invalid hard cap')
  if (hardCap <= softCap) errors.push('Hard cap must be greater than soft cap')
  if (isNaN(tokenPrice) || tokenPrice <= 0) errors.push('Invalid token price')
  if (isNaN(minContrib) || minContrib <= 0) errors.push('Invalid minimum contribution')
  if (isNaN(maxContrib) || maxContrib <= 0) errors.push('Invalid maximum contribution')
  if (maxContrib <= minContrib) errors.push('Maximum contribution must be greater than minimum')

  // Validate dates
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  const now = new Date()

  if (isNaN(startDate.getTime())) errors.push('Invalid start date')
  if (isNaN(endDate.getTime())) errors.push('Invalid end date')
  if (startDate <= now) errors.push('Start date must be in the future')
  if (endDate <= startDate) errors.push('End date must be after start date')

  // Validate security requirements
  if (!data.liquidity_percentage || data.liquidity_percentage < 60) {
    errors.push('Liquidity percentage must be at least 60%')
  }
  if (!data.liquidity_lock_months || data.liquidity_lock_months < 6) {
    errors.push('Liquidity lock must be at least 6 months')
  }
  if (!data.team_token_lock_months || data.team_token_lock_months < 12) {
    errors.push('Team token lock must be at least 12 months')
  }

  // Validate team wallets
  if (!data.team_wallets || data.team_wallets.length === 0) {
    errors.push('At least one team wallet is required')
  } else {
    data.team_wallets.forEach((wallet, index) => {
      if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
        errors.push(`Invalid team wallet address at position ${index + 1}`)
      }
    })
  }

  // Validate vesting schedule
  if (!data.vesting_schedule || data.vesting_schedule.length === 0) {
    errors.push('Vesting schedule is required')
  } else {
    const totalPercentage = data.vesting_schedule.reduce((sum, v) => sum + v.percentage, 0)
    if (totalPercentage !== 100) {
      errors.push('Vesting schedule percentages must total 100%')
    }
  }

  return errors
}