import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: dataSources, error } = await supabase
            .from('data_sources')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching data sources:', error)
            return NextResponse.json(
                { error: { code: 'FETCH_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ dataSources: dataSources || [] })
    } catch (error) {
        console.error('Error in GET /api/data-sources:', error)
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
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Name and type are required' } },
                { status: 400 }
            )
        }

        const { data: dataSource, error } = await supabase
            .from('data_sources')
            .insert({
                name: body.name,
                type: body.type,
                status: body.status || 'disconnected',
                configuration: body.configuration || {}
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating data source:', error)
            return NextResponse.json(
                { error: { code: 'CREATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(dataSource, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/data-sources:', error)
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
        const dataSourceId = searchParams.get('id')

        if (!dataSourceId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Data source ID is required' } },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { data: dataSource, error } = await supabase
            .from('data_sources')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', dataSourceId)
            .select()
            .single()

        if (error) {
            console.error('Error updating data source:', error)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json(dataSource)
    } catch (error) {
        console.error('Error in PUT /api/data-sources:', error)
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
        const dataSourceId = searchParams.get('id')

        if (!dataSourceId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Data source ID is required' } },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('data_sources')
            .delete()
            .eq('id', dataSourceId)

        if (error) {
            console.error('Error deleting data source:', error)
            return NextResponse.json(
                { error: { code: 'DELETE_ERROR', message: error.message } },
                { status: 400 }
            )
        }

        return NextResponse.json({ message: 'Data source deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/data-sources:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 