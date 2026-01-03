import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { presaleId, userAddress, amount, tokenAllocation, transactionHash } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Record the commitment
    const { error: commitmentError } = await supabase
      .from('user_commitments')
      .upsert({
        presale_id: presaleId,
        user_address: userAddress.toLowerCase(),
        amount: amount,
        token_allocation: tokenAllocation,
        transaction_hash: transactionHash,
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      }, { onConflict: 'presale_id,user_address' })

    if (commitmentError) {
      console.error('Commitment Insert Error:', commitmentError)
      return NextResponse.json({ error: commitmentError.message }, { status: 400 })
    }

    // 2. Update presale totals
    // In a real production app, this should be done via a DB trigger or a secure RPC call
    // to ensure atomicity and prevent race conditions.
    // For this implementation, we fetch and then update as a best-effort.
    
    const { data: presale } = await supabase
      .from('presales')
      .select('current_raised, participant_count')
      .eq('id', presaleId)
      .single()

    if (presale) {
      const newRaised = parseFloat(presale.current_raised || '0') + amount
      const newParticipants = (presale.participant_count || 0) + 1 // Simplified: should check if user is new

      await supabase
        .from('presales')
        .update({
          current_raised: newRaised,
          participant_count: newParticipants,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', presaleId)
    }

    // 3. Log to timeline
    await supabase.from('presale_timeline').insert({
      presale_id: presaleId,
      event_type: 'contribution',
      description: `New contribution of ${amount} from ${userAddress.substring(0, 6)}...`,
      transaction_hash: transactionHash,
      created_at: new Date().toISOString()
    } as any)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Contribution API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
