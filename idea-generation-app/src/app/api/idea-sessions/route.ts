import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('project_id')
        const status = searchParams.get('status')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

        let query = supabase
            .from('idea_sessions')
            .select('*')

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data: sessions, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching idea sessions:', error)
            return NextResponse.json(
                { error: { code: 'FETCH_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('idea_sessions')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            console.error('Error counting idea sessions:', countError)
        }

        return NextResponse.json({
            sessions: sessions || [],
            total: count || 0,
            limit,
            offset
        })
    } catch (error) {
        console.error('Error in GET /api/idea-sessions:', error)
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
        if (!body.name) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
                { status: 400 }
            )
        }

        const { data: session, error } = await supabase
            .from('idea_sessions')
            .insert({
                name: body.name,
                description: body.description,
                project_id: body.project_id,
                status: body.status || 'planning',
                configuration: body.configuration || {},
                statistics: body.statistics || {}
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating idea session:', error)
            return NextResponse.json(
                { error: { code: 'CREATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(session, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/idea-sessions:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' } },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { data: session, error } = await supabase
            .from('idea_sessions')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select()
            .single()

        if (error) {
            console.error('Error updating idea session:', error)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error('Error in PUT /api/idea-sessions:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' } },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('idea_sessions')
            .delete()
            .eq('id', sessionId)

        if (error) {
            console.error('Error deleting idea session:', error)
            return NextResponse.json(
                { error: { code: 'DELETE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'Idea session deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/idea-sessions:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 