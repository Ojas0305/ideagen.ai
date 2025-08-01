import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        
        console.log(' Adding missing evaluation columns to full_ideas table...')

        // Add evaluation score columns
        const { error: alterError1 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS feasibility_score INTEGER DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 100);'
        })

        const { error: alterError2 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS market_potential_score INTEGER DEFAULT 0 CHECK (market_potential_score >= 0 AND market_potential_score <= 100);'
        })

        const { error: alterError3 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS uniqueness_score INTEGER DEFAULT 0 CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100);'
        })

        const { error: alterError4 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS evaluation_reasoning TEXT;'
        })

        // Add additional idea fields
        const { error: alterError5 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS problem TEXT;'
        })

        const { error: alterError6 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS solution TEXT;'
        })

        const { error: alterError7 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS market_opportunity TEXT;'
        })

        const { error: alterError8 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS target_audience TEXT;'
        })

        const { error: alterError9 } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS implementation TEXT;'
        })

        if (alterError1 || alterError2 || alterError3 || alterError4 || alterError5 || alterError6 || alterError7 || alterError8 || alterError9) {
            console.error('Schema migration errors:', { alterError1, alterError2, alterError3, alterError4, alterError5, alterError6, alterError7, alterError8, alterError9 })
            return NextResponse.json({
                success: false,
                errors: { alterError1, alterError2, alterError3, alterError4, alterError5, alterError6, alterError7, alterError8, alterError9 },
                message: 'Some schema changes failed'
            }, { status: 500 })
        }

        console.log(' Schema migration completed successfully')

        return NextResponse.json({
            success: true,
            message: 'Schema migration completed - evaluation columns added to full_ideas table'
        })

    } catch (error) {
        console.error('Error in schema migration:', error)
        return NextResponse.json(
            { error: { code: 'MIGRATION_ERROR', message: 'Schema migration failed' } },
            { status: 500 }
        )
    }
} 