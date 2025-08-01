import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()
        
        const { idea_id } = body

        if (!idea_id) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Idea ID is required' } },
                { status: 400 }
            )
        }

        // Get the idea from database
        const { data: idea, error: fetchError } = await supabase
            .from('full_ideas')
            .select('*')
            .eq('id', idea_id)
            .single()

        if (fetchError || !idea) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Idea not found' } },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            idea,
            message: 'Idea retrieved successfully'
        })

    } catch (error) {
        console.error('Error getting idea:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 