import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()
        
        const { 
            title, 
            description, 
            problem, 
            solution, 
            market_opportunity, 
            target_audience, 
            implementation, 
            category,
            session_id 
        } = body

        if (!title || !description) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Title and description are required' } },
                { status: 400 }
            )
        }

        // Create detailed description that includes all the structured information
        const structuredDescription = `${description}

**Problem Statement:**
${problem || 'Not specified'}

**Proposed Solution:**
${solution || 'Not specified'}

**Market Opportunity:**
${market_opportunity || 'Not specified'}

**Target Audience:**
${target_audience || 'Not specified'}

**Implementation Strategy:**
${implementation || 'Not specified'}`

        // Insert the idea into the database
        const { data: idea, error: insertError } = await supabase
            .from('full_ideas')
            .insert({
                title,
                description: structuredDescription,
                category: category || 'Technology',
                session_id: session_id || '199e6ec6-0e1b-495c-aa87-bccb26eb8ea3', // Use existing session
                overall_score: 0, // Will be updated by AI evaluation
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating idea:', insertError)
            return NextResponse.json(
                { error: { code: 'INSERT_ERROR', message: 'Failed to create idea', details: insertError } },
                { status: 500 }
            )
        }

        console.log(' Created detailed idea:', idea.title)

        return NextResponse.json({
            success: true,
            idea,
            message: 'Detailed idea created successfully'
        })

    } catch (error) {
        console.error('Error in idea creation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 