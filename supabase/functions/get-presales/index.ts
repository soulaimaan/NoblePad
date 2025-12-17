// Edge Function: Get Presales
// Application Logic Tier - Secure presale data retrieval

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const chain = searchParams.get('chain') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabaseClient
      .from('public_presales')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (chain !== 'all') {
      query = query.eq('chain', chain)
    }

    if (search) {
      query = query.or(`project_name.ilike.%${search}%,token_symbol.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: presales, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch presales' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate additional fields for each presale
    const enrichedPresales = presales?.map(presale => {
      const now = new Date()
      const startDate = new Date(presale.start_date)
      const endDate = new Date(presale.end_date)
      
      let calculatedStatus = presale.status
      if (presale.status === 'approved') {
        if (now < startDate) {
          calculatedStatus = 'upcoming'
        } else if (now >= startDate && now <= endDate) {
          calculatedStatus = 'live'
        } else if (now > endDate) {
          calculatedStatus = 'ended'
        }
      }

      // Calculate progress percentage
      const progress = presale.hard_cap > 0 
        ? Math.min(100, (presale.current_raised / presale.hard_cap) * 100)
        : 0

      // Calculate time remaining
      const timeLeft = endDate.getTime() - now.getTime()
      const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)))
      const hoursLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))

      return {
        ...presale,
        calculated_status: calculatedStatus,
        progress_percentage: Math.round(progress * 100) / 100,
        time_left: {
          days: daysLeft,
          hours: hoursLeft,
          expired: timeLeft <= 0
        }
      }
    })

    // Get total count for pagination
    let countQuery = supabaseClient
      .from('public_presales')
      .select('*', { count: 'exact', head: true })

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }
    if (chain !== 'all') {
      countQuery = countQuery.eq('chain', chain)
    }
    if (search) {
      countQuery = countQuery.or(`project_name.ilike.%${search}%,token_symbol.ilike.%${search}%`)
    }

    const { count } = await countQuery

    return new Response(
      JSON.stringify({
        presales: enrichedPresales,
        total_count: count,
        has_more: (offset + limit) < (count || 0),
        pagination: {
          limit,
          offset,
          total: count || 0
        }
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