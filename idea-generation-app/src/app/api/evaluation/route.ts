import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' } },
                { status: 400 }
            )
        }

        // Get ideas for the session with evaluation metrics
        const { data: ideas, error } = await supabase
            .from('full_ideas')
            .select('*')
            .eq('session_id', sessionId)
            .order('overall_score', { ascending: false })

        if (error) {
            console.error('Error fetching ideas for evaluation:', error)
            return NextResponse.json(
                { error: { code: 'FETCH_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        // Calculate evaluation metrics
        const evaluationResults = {
            total_ideas: ideas?.length || 0,
            average_score: ideas?.length
                ? Math.round(ideas.reduce((sum, idea) => sum + (idea.overall_score || 0), 0) / ideas.length)
                : 0,
            top_ideas: ideas?.slice(0, 10) || [],
            categories: ideas?.reduce((acc, idea) => {
                const category = idea.category || 'general'
                acc[category] = (acc[category] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {},
            score_distribution: {
                excellent: ideas?.filter(i => (i.overall_score || 0) >= 80).length || 0,
                good: ideas?.filter(i => (i.overall_score || 0) >= 60 && (i.overall_score || 0) < 80).length || 0,
                average: ideas?.filter(i => (i.overall_score || 0) >= 40 && (i.overall_score || 0) < 60).length || 0,
                poor: ideas?.filter(i => (i.overall_score || 0) < 40).length || 0
            }
        }

        return NextResponse.json(evaluationResults)
    } catch (error) {
        console.error('Error in GET /api/evaluation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()

        // Validate required fields
        if (!body.idea_id || typeof body.score !== 'number') {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Idea ID and score are required' } },
                { status: 400 }
            )
        }

        // Update idea score
        const { data: idea, error } = await supabase
            .from('full_ideas')
            .update({
                overall_score: Math.max(0, Math.min(100, body.score)), // Clamp between 0-100
                updated_at: new Date().toISOString()
            })
            .eq('id', body.idea_id)
            .select()
            .single()

        if (error) {
            console.error('Error updating idea score:', error)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(idea)
    } catch (error) {
        console.error('Error in POST /api/evaluation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()

        // Validate required fields
        if (!body.session_id || !Array.isArray(body.evaluations)) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID and evaluations array are required' } },
                { status: 400 }
            )
        }

        // Batch update idea scores
        const updatePromises = body.evaluations.map(async (evaluation: any) => {
            if (!evaluation.idea_id || typeof evaluation.score !== 'number') {
                return { error: 'Invalid evaluation data' }
            }

            const { data, error } = await supabase
                .from('full_ideas')
                .update({
                    overall_score: Math.max(0, Math.min(100, evaluation.score)),
                    updated_at: new Date().toISOString()
                })
                .eq('id', evaluation.idea_id)
                .select()
                .single()

            return { data, error }
        })

        const results = await Promise.all(updatePromises)

        // Check for errors
        const errors = results.filter(r => r.error)
        if (errors.length > 0) {
            return NextResponse.json(
                { error: { code: 'BATCH_UPDATE_ERROR', message: `${errors.length} updates failed` } },
                { status: 400 }
            )
        }

        return NextResponse.json({
            message: 'Batch evaluation update completed',
            updated_count: results.length
        })
    } catch (error) {
        console.error('Error in PUT /api/evaluation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 