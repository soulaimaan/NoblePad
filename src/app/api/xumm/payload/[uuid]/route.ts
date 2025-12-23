import { NextRequest, NextResponse } from 'next/server'

const XUMM_API_KEY = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''
const XUMM_API_SECRET = process.env.XUMM_API_SECRET || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  if (!XUMM_API_KEY || !XUMM_API_SECRET) {
    return NextResponse.json(
      { error: 'Xumm API credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const { uuid } = params
    
    const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
      headers: {
        'X-API-Key': XUMM_API_KEY,
        'X-API-Secret': XUMM_API_SECRET
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to get payload status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Xumm status check error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
