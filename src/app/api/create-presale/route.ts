import { NextRequest, NextResponse } from 'next/server'
import { 
  supabaseServiceRole as supabase, 
  handleSupabaseResponse,
  safeSupabaseOperation 
} from '@/lib/supabaseClient'
import { PRESALE_REQUIREMENTS } from '@/lib/chains'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { presaleId, contractAddress, transactionHash, formData } = body

    // Server-side Anti-Rug validation: ensure frontend didn't skip rules
    if (!formData) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 })
    }

    const liquidityPct = parseInt(formData.liquidityPercentage || '0')
    const liquidityLockMonths = parseInt(formData.liquidityLockMonths || '0')
    const teamLockMonths = parseInt(formData.teamTokenLockMonths || '0')

    if (liquidityPct < PRESALE_REQUIREMENTS.minimumLiquidityPercentage) {
      return NextResponse.json({ error: `Liquidity percentage must be at least ${PRESALE_REQUIREMENTS.minimumLiquidityPercentage}%` }, { status: 400 })
    }

    if (teamLockMonths < PRESALE_REQUIREMENTS.minimumLockPeriods.team) {
      return NextResponse.json({ error: `Team token lock must be at least ${PRESALE_REQUIREMENTS.minimumLockPeriods.team} months` }, { status: 400 })
    }

    if (liquidityLockMonths < PRESALE_REQUIREMENTS.minimumLockPeriods.liquidity) {
      return NextResponse.json({ error: `Liquidity lock must be at least ${PRESALE_REQUIREMENTS.minimumLockPeriods.liquidity} months` }, { status: 400 })
    }

    // Verify the presale exists and update status
    const { data: presale, error: presaleError } = await supabase
      .from('presales')
      .select('*')
      .eq('id', presaleId)
      .single()

    if (presaleError || !presale) {
      return NextResponse.json(
        { error: 'Presale not found' },
        { status: 404 }
      )
    }

    // Update presale status to indicate contract creation was successful
    const { error: updateError } = await supabase
      .from('presales')
      .update({
        contract_address: contractAddress,
        creation_transaction: transactionHash,
        status: 'pending_review' as const,
        contract_created_at: new Date().toISOString()
      } as any)
      .eq('id', presaleId)

    if (updateError) {
      console.error('Failed to update presale status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update presale status' },
        { status: 500 }
      )
    }

    // Create presale timeline entry
    await supabase.from('presale_timeline').insert({
      presale_id: presaleId,
      event_type: 'contract_created',
      description: 'Presale smart contract deployed successfully',
      transaction_hash: transactionHash,
      created_at: new Date().toISOString()
    })

    // Send notification to admin team (via Supabase Edge Function)
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'new_presale_submission',
          presaleId,
          contractAddress,
          projectName: formData.projectName,
          creatorAddress: presale.creator_address,
          chainId: formData.chainId
        }
      })
    } catch (notificationError) {
      console.warn('Failed to send notification:', notificationError)
      // Don't fail the entire request for notification errors
    }

    // Create initial user session/dashboard entry
    await supabase.from('user_sessions').upsert({
      user_address: presale.creator_address.toLowerCase(),
      last_active: new Date().toISOString(),
      presales_created: 1,
      total_raised: '0'
    }, {
      onConflict: 'user_address'
    })

    // Log the creation event
    await supabase.from('admin_actions').insert({
      action_type: 'presale_submitted',
      performed_by: presale.creator_address,
      target_id: presaleId,
      description: `New presale "${formData.projectName}" submitted for review`,
      metadata: {
        contractAddress,
        transactionHash,
        chainId: formData.chainId,
        hardCap: formData.hardCap,
        startDate: formData.startDate
      },
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Presale created and submitted for review',
      presaleId,
      contractAddress,
      status: 'pending_review'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}