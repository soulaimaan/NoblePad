// Edge Function: User Tier
// Application Logic Tier - Secure user tier calculation and management

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateStakeRequest {
  staked_amount: string
  transaction_hash?: string
}

function calculateTier(stakedAmount: number) {
  if (stakedAmount >= 10000) {
    return {
      tier: 'gold',
      max_allocation: 5000,
      color: 'text-yellow-400',
      benefits: [
        'Guaranteed $5,000 allocation',
        'Early access to all presales',
        'Priority KYC processing',
        'Exclusive gold tier events'
      ]
    }
  } else if (stakedAmount >= 5000) {
    return {
      tier: 'silver', 
      max_allocation: 2500,
      color: 'text-gray-300',
      benefits: [
        'Guaranteed $2,500 allocation',
        'Early access to presales',
        'Priority support'
      ]
    }
  } else if (stakedAmount >= 1000) {
    return {
      tier: 'bronze',
      max_allocation: 1000,
      color: 'text-orange-400',
      benefits: [
        'Guaranteed $1,000 allocation',
        'Access to all presales'
      ]
    }
  } else {
    return {
      tier: 'none',
      max_allocation: 0,
      color: 'text-gray-500',
      benefits: [
        'No guaranteed allocation',
        'Public sale access only'
      ]
    }
  }
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

    const method = req.method

    if (method === 'GET') {
      // Get user's current tier information
      const { data: userStake, error: stakeError } = await supabaseClient
        .from('user_stakes')
        .select('*')
        .eq('user_address', userAddress)
        .single()

      if (stakeError && stakeError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Stake error:', stakeError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user stake' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const stakedAmount = userStake?.staked_amount || 0
      const tierInfo = calculateTier(stakedAmount)

      // Get user's commitments across all presales
      const { data: commitments } = await supabaseClient
        .from('user_commitments')
        .select(`
          amount,
          token_allocation,
          presale_id,
          presales!inner(project_name, status)
        `)
        .eq('user_address', userAddress)
        .eq('status', 'confirmed')

      const totalCommitted = commitments?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0
      const totalTokens = commitments?.reduce((sum, c) => sum + parseFloat(c.token_allocation), 0) || 0

      return new Response(
        JSON.stringify({
          user_address: userAddress,
          staked_amount: stakedAmount,
          tier: tierInfo.tier,
          max_allocation: tierInfo.max_allocation,
          color: tierInfo.color,
          benefits: tierInfo.benefits,
          total_committed: totalCommitted,
          total_token_allocation: totalTokens,
          commitments_count: commitments?.length || 0,
          last_updated: userStake?.updated_at || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } else if (method === 'POST') {
      // Update user's staked amount
      const { staked_amount, transaction_hash }: UpdateStakeRequest = await req.json()

      if (!staked_amount) {
        return new Response(
          JSON.stringify({ error: 'Staked amount is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const stakedAmountNum = parseFloat(staked_amount)
      if (isNaN(stakedAmountNum) || stakedAmountNum < 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid staked amount' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const tierInfo = calculateTier(stakedAmountNum)

      // Upsert user stake record
      const { data: updatedStake, error: updateError } = await supabaseClient
        .from('user_stakes')
        .upsert({
          user_address: userAddress,
          staked_amount: stakedAmountNum,
          tier: tierInfo.tier,
          max_allocation: tierInfo.max_allocation,
          last_stake_date: new Date().toISOString(),
          total_stakes: 1 // In production, increment this
        }, {
          onConflict: 'user_address'
        })
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update stake' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Stake updated successfully',
          tier_info: {
            tier: tierInfo.tier,
            max_allocation: tierInfo.max_allocation,
            color: tierInfo.color,
            benefits: tierInfo.benefits
          },
          staked_amount: stakedAmountNum,
          transaction_hash: transaction_hash || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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