// Edge Function: Admin Actions
// Application Logic Tier - Secure admin operations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminActionRequest {
  action: 'approve' | 'reject' | 'verify_kyc' | 'verify_audit'
  presale_id: string
  reason?: string
  notes?: string
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

    // Verify admin authorization
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
    let adminAddress: string
    
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      adminAddress = payload.wallet_address
      
      // Check if user is admin
      const adminAddresses = (Deno.env.get('ADMIN_ADDRESSES') || '').split(',')
      if (!adminAddresses.includes(adminAddress.toLowerCase())) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
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

    const { action, presale_id, reason, notes }: AdminActionRequest = await req.json()

    // Validate request
    if (!action || !presale_id) {
      return new Response(
        JSON.stringify({ error: 'Action and presale_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get presale
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

    let updateData: any = {}
    let actionType: string = action

    switch (action) {
      case 'approve':
        if (presale.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Only pending presales can be approved' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        updateData = {
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminAddress,
          rejection_reason: null
        }
        actionType = 'approve_presale'
        break

      case 'reject':
        if (presale.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Only pending presales can be rejected' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        if (!reason?.trim()) {
          return new Response(
            JSON.stringify({ error: 'Rejection reason is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        updateData = {
          status: 'rejected',
          rejection_reason: reason,
          approved_by: adminAddress
        }
        actionType = 'reject_presale'
        break

      case 'verify_kyc':
        updateData = {
          kyc_verified: true
        }
        actionType = 'verify_kyc'
        break

      case 'verify_audit':
        updateData = {
          audit_verified: true
        }
        actionType = 'verify_audit'
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    // Update presale
    const { data: updatedPresale, error: updateError } = await supabaseClient
      .from('presales')
      .update(updateData)
      .eq('id', presale_id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update presale' }),
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
        admin_address: adminAddress,
        action_type: actionType,
        target_id: presale_id,
        reason: reason || null,
        notes: notes || null,
        metadata: {
          project_name: presale.project_name,
          previous_status: presale.status
        }
      })

    // Send notification email to project creator (in production)
    // await sendNotificationEmail(presale.submitter_address, action, reason)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Presale ${action}d successfully`,
        presale: updatedPresale
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