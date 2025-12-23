import { NextRequest, NextResponse } from 'next/server'

const XUMM_API_KEY = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''
const XUMM_API_SECRET = process.env.XUMM_API_SECRET || ''

export async function POST(request: NextRequest) {
  if (!XUMM_API_KEY || !XUMM_API_SECRET) {
    return NextResponse.json(
      { error: 'Xumm API credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    
    const response = await fetch('https://xumm.app/api/v1/platform/payload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': XUMM_API_KEY,
        'X-API-Secret': XUMM_API_SECRET
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Xumm API Error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to create payload' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Xumm proxy error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
