import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        
        console.log('Checking full_ideas table schema...')

        // Try to get a sample record to see what columns exist
        const { data: sampleRecord, error: sampleError } = await supabase
            .from('full_ideas')
            .select('*')
            .limit(1)
            .single()

        if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error getting sample record:', sampleError)
            return NextResponse.json(
                { error: { code: 'SAMPLE_ERROR', message: 'Failed to get sample record' } },
                { status: 500 }
            )
        }

        // Get the column names from the sample record
        const columns = sampleRecord ? Object.keys(sampleRecord) : []

        console.log('📋 Current full_ideas table columns:', columns)

        // Also try to check if specific columns exist by doing targeted selects
        const columnChecks = {
            feasibility_score: false,
            market_potential_score: false,
            uniqueness_score: false,
            evaluation_reasoning: false,
            problem: false,
            solution: false,
            market_opportunity: false,
            target_audience: false,
            implementation: false
        }

        for (const column of Object.keys(columnChecks)) {
            try {
                const { error } = await supabase
                    .from('full_ideas')
                    .select(column)
                    .limit(1)
                
                columnChecks[column] = !error
            } catch (e) {
                columnChecks[column] = false
            }
        }

        console.log('🔎 Column existence check:', columnChecks)

        return NextResponse.json({
            success: true,
            columns,
            columnChecks,
            sampleRecord,
            message: 'Schema check completed'
        })

    } catch (error) {
        console.error('Error in schema check:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 