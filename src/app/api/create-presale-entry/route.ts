import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { insertData, transactionHash, userAddress } = await request.json()

    // Initialize raw client to avoid schema cache issues with typed client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch available columns to handle legacy schemas gracefully
    const { data: sample } = await supabase
      .from('presales')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    const validColumns = sample ? Object.keys(sample) : []
    const filteredInsertData: any = {}
    
    // Auto-map/filter columns
    if (validColumns.length > 0) {
      for (const key of Object.keys(insertData)) {
        if (validColumns.includes(key)) {
          filteredInsertData[key] = insertData[key]
        }
      }
    } else {
      // Fallback if table is empty - just try the insert as is
      Object.assign(filteredInsertData, insertData)
    }

    // 1b. Insert Presale (Bypass RLS via Service Role)
    const { data: presale, error: insertError } = await supabase
      .from('presales')
      .insert(filteredInsertData)
      .select('id')
      .single()

    if (insertError) {
      console.error('Presale Insert Error:', insertError)
      return NextResponse.json({ 
        error: insertError.message,
        details: 'Attempted to insert into columns: ' + Object.keys(filteredInsertData).join(', ')
      }, { status: 400 })
    }

    const presaleId = presale.id

    // 2. Insert Timeline Entry
    try {
      await supabase.from('presale_timeline').insert({
        presale_id: presaleId,
        event_type: 'presale_submitted',
        description: 'Presale submitted for review',
        transaction_hash: transactionHash,
        created_at: new Date().toISOString()
      } as any)
    } catch (e) {
      console.warn('Timeline insert failed:', e)
    }

    // 3. Upsert User Session
    try {
      await supabase.from('user_sessions').upsert({
        user_address: userAddress,
        presales_created: 1,
        last_active: new Date().toISOString()
      } as any)
    } catch (e) {
      console.warn('Session upsert failed:', e)
    }

    // 4. Log Admin Action
    try {
      await supabase.from('admin_actions').insert({
        action_type: 'presale_submitted',
        performed_by: userAddress,
        target_id: presaleId,
        description: `New presale "${insertData.project_name}" submitted for review`,
        metadata: {
          transactionHash,
          chainId: insertData.chain,
          hardCap: insertData.hard_cap
        },
        created_at: new Date().toISOString()
      } as any)
    } catch (e) {
      console.warn('Admin action log failed:', e)
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: presaleId } 
    })

  } catch (error: any) {
    console.error('API Handler Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
