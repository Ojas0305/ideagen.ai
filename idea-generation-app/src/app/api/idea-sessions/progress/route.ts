import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')

        if (!sessionId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' } },
                { status: 400 }
            )
        }

        const supabase = await createServerSupabaseClient()

        // Get current session status from database
        const { data: session, error: sessionError } = await supabase
            .from('idea_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Session not found' } },
                { status: 404 }
            )
        }

        // Get ideas generated so far
        const { data: ideas, error: ideasError } = await supabase
            .from('full_ideas')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })

        if (ideasError) {
            console.warn('Error fetching ideas:', ideasError)
        }

        // Count ideas by category
        const seeds = ideas?.filter(idea => idea.category === 'seed') || []
        const fullIdeas = ideas?.filter(idea => idea.category === 'full') || []

        // Calculate average score of evaluated ideas
        const evaluatedIdeas = fullIdeas.filter(idea => idea.overall_score > 0)
        const averageScore = evaluatedIdeas.length > 0 
            ? Math.round(evaluatedIdeas.reduce((sum, idea) => sum + idea.overall_score, 0) / evaluatedIdeas.length)
            : 0

        const response = {
            session_id: sessionId,
            status: session.status,
            statistics: session.statistics || {},
            
            // Current results
            ideas_generated: {
                seeds: seeds.length,
                full_ideas: fullIdeas.length,
                total: ideas?.length || 0
            },
            
            // Quality metrics
            average_score: averageScore,
            evaluated_ideas: evaluatedIdeas.length,
            
            // Recent ideas (all 4 - 3 full ideas + 1 seed)
            recent_ideas: ideas?.slice(0, 4).map(idea => ({
                id: idea.id,
                title: idea.title,
                category: idea.category,
                overall_score: idea.overall_score,
                created_at: idea.created_at
            })) || [],
            
            // Timestamps
            created_at: session.created_at,
            updated_at: session.updated_at
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Error getting session progress:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to get session progress' } },
            { status: 500 }
        )
    }
}

// Get simple queue statistics (mock for now)
export async function POST(request: NextRequest) {
    try {
        // Return mock queue statistics since we're not using Bull
        const queueStats = {
            ideaGeneration: {
                waiting: 0,
                active: 0,
                completed: 1,
                failed: 0,
            },
            ideaEvaluation: {
                waiting: 0,
                active: 0,
                completed: 1,
                failed: 0,
            }
        }
        
        return NextResponse.json({
            queue_statistics: queueStats,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Error getting queue stats:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to get queue statistics' } },
            { status: 500 }
        )
    }
} 