// Edge Function: Get Presale Details
// Application Logic Tier - Secure individual presale data retrieval

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { presale_id } = await req.json()

    if (!presale_id) {
      return new Response(
        JSON.stringify({ error: 'Presale ID is required' }),
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

    // Check if presale is public or user has access
    const authHeader = req.headers.get('Authorization')
    let hasAccess = presale.status in ['approved', 'live', 'ended']

    if (!hasAccess && authHeader) {
      // Decode JWT and check if user is owner or admin
      try {
        const jwt = authHeader.replace('Bearer ', '')
        // In production, properly verify JWT
        const payload = JSON.parse(atob(jwt.split('.')[1]))
        const walletAddress = payload.wallet_address
        
        hasAccess = walletAddress === presale.submitter_address || 
                   payload.role === 'admin'
      } catch (e) {
        console.error('JWT decode error:', e)
      }
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get commitments summary
    const { data: commitments, error: commitmentsError } = await supabaseClient
      .from('user_commitments')
      .select('amount, token_allocation, status')
      .eq('presale_id', presale_id)
      .eq('status', 'confirmed')

    const totalCommitments = commitments?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0
    const participantCount = commitments?.length || 0

    // Calculate current status
    const now = new Date()
    const startDate = new Date(presale.start_date)
    const endDate = new Date(presale.end_date)
    
    let currentStatus = presale.status
    if (presale.status === 'approved') {
      if (now < startDate) {
        currentStatus = 'upcoming'
      } else if (now >= startDate && now <= endDate) {
        currentStatus = 'live'
      } else if (now > endDate) {
        currentStatus = 'ended'
      }
    }

    // Calculate progress
    const progress = presale.hard_cap > 0 
      ? Math.min(100, (totalCommitments / presale.hard_cap) * 100)
      : 0

    // Time calculations
    const timeLeft = endDate.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)))
    const hoursLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
    const minutesLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)))

    const enrichedPresale = {
      ...presale,
      current_status: currentStatus,
      current_raised: totalCommitments,
      participant_count: participantCount,
      progress_percentage: Math.round(progress * 100) / 100,
      time_left: {
        days: daysLeft,
        hours: hoursLeft,
        minutes: minutesLeft,
        expired: timeLeft <= 0,
        total_seconds: Math.max(0, Math.floor(timeLeft / 1000))
      },
      is_soft_cap_reached: totalCommitments >= presale.soft_cap,
      is_hard_cap_reached: totalCommitments >= presale.hard_cap
    }

    return new Response(
      JSON.stringify({ presale: enrichedPresale }),
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