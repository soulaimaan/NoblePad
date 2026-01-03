import { aiService } from '@/lib/aiService'
import { db } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    try {
        // 1. Fetch project data from DB
        const project = await db.getPresaleById(id)
        
        if (!project) {
            // If not in DB, check if it's a test ID
            if (id === 'xrpl-test' || id === '2') {
                 // Mock data for simulation
                 const mockResult = await aiService.analyzeProject({
                     liquidityPercentage: 80,
                     liquidityLockMonths: 12,
                     auditReport: 'verified',
                     kycDocuments: ['file1'],
                     description: 'Very long description of the project that sounds professional and well-planned.'
                 })
                 return NextResponse.json(mockResult)
            }
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // 2. Perform AI analysis
        const result = await aiService.analyzeProject(project)

        return NextResponse.json(result)
    } catch (e: any) {
        console.error('AI Score API Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
