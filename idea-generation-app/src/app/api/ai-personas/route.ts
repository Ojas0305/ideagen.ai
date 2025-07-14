import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: personas, error } = await supabase
            .from('ai_personas')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching AI personas:', error)
            return NextResponse.json(
                { error: { code: 'FETCH_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ personas: personas || [] })
    } catch (error) {
        console.error('Error in GET /api/ai-personas:', error)
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
        if (!body.name || !body.role || !body.system_prompt) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Name, role, and system_prompt are required' } },
                { status: 400 }
            )
        }

        const { data: persona, error } = await supabase
            .from('ai_personas')
            .insert({
                name: body.name,
                role: body.role,
                system_prompt: body.system_prompt,
                expertise: body.expertise || [],
                thinking_style: body.thinking_style || 'balanced',
                personality: body.personality || 'neutral',
                configuration: body.configuration || {},
                is_default: body.is_default || false
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating AI persona:', error)
            return NextResponse.json(
                { error: { code: 'CREATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(persona, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/ai-personas:', error)
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
        const personaId = searchParams.get('id')

        if (!personaId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Persona ID is required' } },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { data: persona, error } = await supabase
            .from('ai_personas')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', personaId)
            .select()
            .single()

        if (error) {
            console.error('Error updating AI persona:', error)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(persona)
    } catch (error) {
        console.error('Error in PUT /api/ai-personas:', error)
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
        const personaId = searchParams.get('id')

        if (!personaId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Persona ID is required' } },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('ai_personas')
            .delete()
            .eq('id', personaId)

        if (error) {
            console.error('Error deleting AI persona:', error)
            return NextResponse.json(
                { error: { code: 'DELETE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'AI persona deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/ai-personas:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 