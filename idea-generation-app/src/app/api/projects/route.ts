import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { ProjectsService } from '@/lib/supabase/projects'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || undefined
        const industry = searchParams.get('industry') || undefined
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

        const result = await ProjectsService.getProjects({
            status,
            industry,
            limit,
            offset,
        })

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error('Error in GET /api/projects:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.description) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Name and description are required' } },
                { status: 400 }
            )
        }

        const result = await ProjectsService.createProject(body)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result.data, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/projects:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('id')

        if (!projectId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Project ID is required' } },
                { status: 400 }
            )
        }

        const body = await request.json()
        const result = await ProjectsService.updateProject(projectId, body)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error('Error in PUT /api/projects:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('id')

        if (!projectId) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Project ID is required' } },
                { status: 400 }
            )
        }

        const result = await ProjectsService.deleteProject(projectId)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/projects:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 