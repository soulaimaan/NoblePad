// Edge Function: Commit to Presale
// Application Logic Tier - Secure presale commitment processing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommitmentRequest {
  presale_id: string
  amount: string
  transaction_hash: string
  block_number?: number
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
    let userAddress: string
    
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      userAddress = payload.wallet_address
      
      if (!userAddress) {
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

    const { presale_id, amount, transaction_hash, block_number }: CommitmentRequest = await req.json()

    // Validate input
    if (!presale_id || !amount || !transaction_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const commitmentAmount = parseFloat(amount)
    if (isNaN(commitmentAmount) || commitmentAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid commitment amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get presale details
    const { data: presale, error: presaleError } = await supabaseClient
      .from('presales')
      .select('*')
      .eq('id', presale_id)
      .single()

    if (presaleError || !presale) {
      return new Response(
        JSON.stringify({ error: 'Presale not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate presale status and timing
    const now = new Date()
    const startDate = new Date(presale.start_date)
    const endDate = new Date(presale.end_date)

    if (presale.status !== 'approved' && presale.status !== 'live') {
      return new Response(
        JSON.stringify({ error: 'Presale is not active' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (now < startDate) {
      return new Response(
        JSON.stringify({ error: 'Presale has not started yet' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (now > endDate) {
      return new Response(
        JSON.stringify({ error: 'Presale has ended' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate contribution limits
    if (commitmentAmount < presale.min_contribution) {
      return new Response(
        JSON.stringify({ 
          error: `Minimum contribution is ${presale.min_contribution} ${presale.chain === 'ETH' ? 'ETH' : 'BNB'}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (commitmentAmount > presale.max_contribution) {
      return new Response(
        JSON.stringify({ 
          error: `Maximum contribution is ${presale.max_contribution} ${presale.chain === 'ETH' ? 'ETH' : 'BNB'}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check existing commitments
    const { data: existingCommitments } = await supabaseClient
      .from('user_commitments')
      .select('amount')
      .eq('presale_id', presale_id)
      .eq('user_address', userAddress)
      .eq('status', 'confirmed')

    const totalExistingCommitment = existingCommitments?.reduce(
      (sum, c) => sum + parseFloat(c.amount), 0
    ) || 0

    if (totalExistingCommitment + commitmentAmount > presale.max_contribution) {
      return new Response(
        JSON.stringify({ 
          error: `Total contribution would exceed maximum limit of ${presale.max_contribution}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user's tier and allocation limits
    const { data: userStake } = await supabaseClient
      .from('user_stakes')
      .select('*')
      .eq('user_address', userAddress)
      .single()

    let maxUserAllocation = presale.max_contribution
    if (userStake && userStake.max_allocation > 0) {
      maxUserAllocation = Math.min(maxUserAllocation, userStake.max_allocation)
    }

    if (totalExistingCommitment + commitmentAmount > maxUserAllocation) {
      return new Response(
        JSON.stringify({ 
          error: `Commitment exceeds your tier allocation limit of ${maxUserAllocation}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if hard cap would be exceeded
    const { data: allCommitments } = await supabaseClient
      .from('user_commitments')
      .select('amount')
      .eq('presale_id', presale_id)
      .eq('status', 'confirmed')

    const totalRaised = allCommitments?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0

    if (totalRaised + commitmentAmount > presale.hard_cap) {
      return new Response(
        JSON.stringify({ 
          error: 'Commitment would exceed hard cap' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate token allocation
    const tokenAllocation = commitmentAmount * presale.token_price

    // Check for duplicate transaction
    const { data: existingTx } = await supabaseClient
      .from('user_commitments')
      .select('id')
      .eq('transaction_hash', transaction_hash)
      .single()

    if (existingTx) {
      return new Response(
        JSON.stringify({ error: 'Transaction already processed' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create commitment record
    const { data: commitment, error: commitmentError } = await supabaseClient
      .from('user_commitments')
      .insert({
        presale_id,
        user_address: userAddress,
        amount: commitmentAmount,
        token_allocation: tokenAllocation,
        transaction_hash,
        block_number: block_number || null,
        status: 'confirmed', // In production, start as 'pending' and confirm after blockchain verification
        confirmed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (commitmentError) {
      console.error('Commitment error:', commitmentError)
      return new Response(
        JSON.stringify({ error: 'Failed to record commitment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update presale statistics
    await supabaseClient
      .from('presales')
      .update({
        current_raised: totalRaised + commitmentAmount,
        participant_count: (presale.participant_count || 0) + (existingCommitments?.length === 0 ? 1 : 0)
      })
      .eq('id', presale_id)

    return new Response(
      JSON.stringify({ 
        success: true,
        commitment_id: commitment.id,
        token_allocation: tokenAllocation,
        message: 'Commitment recorded successfully'
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