import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('session_id')
        const category = searchParams.get('category')
        const minScore = searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!) : 0
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

        let query = supabase
            .from('full_ideas')
            .select('*')

        if (sessionId) {
            query = query.eq('session_id', sessionId)
        }

        if (category) {
            query = query.eq('category', category)
        }

        if (minScore > 0) {
            query = query.gte('overall_score', minScore)
        }

        const { data: ideas, error } = await query
            .order('overall_score', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching full ideas:', error)
            return NextResponse.json(
                { error: { code: 'FETCH_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('full_ideas')
            .select('*', { count: 'exact', head: true })

        if (countError) {
            console.error('Error counting full ideas:', countError)
        }

        return NextResponse.json({
            ideas: ideas || [],
            total: count || 0,
            limit,
            offset
        })
    } catch (error) {
        console.error('Error in GET /api/full-ideas:', error)
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
        if (!body.title) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Title is required' } },
                { status: 400 }
            )
        }

        const { data: idea, error } = await supabase
            .from('full_ideas')
            .insert({
                title: body.title,
                description: body.description,
                category: body.category || 'general',
                overall_score: body.overall_score || 0,
                session_id: body.session_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating full idea:', error)
            return NextResponse.json(
                { error: { code: 'CREATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(idea, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/full-ideas:', error)
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
        const ideaId = searchParams.get('id')

        if (!ideaId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Idea ID is required' } },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { data: idea, error } = await supabase
            .from('full_ideas')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', ideaId)
            .select()
            .single()

        if (error) {
            console.error('Error updating full idea:', error)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(idea)
    } catch (error) {
        console.error('Error in PUT /api/full-ideas:', error)
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
        const ideaId = searchParams.get('id')

        if (!ideaId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Idea ID is required' } },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('full_ideas')
            .delete()
            .eq('id', ideaId)

        if (error) {
            console.error('Error deleting full idea:', error)
            return NextResponse.json(
                { error: { code: 'DELETE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'Full idea deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/full-ideas:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 