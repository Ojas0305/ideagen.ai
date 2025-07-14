import { NextRequest, NextResponse } from 'next/server'
import { ProjectsService } from '@/lib/supabase/projects'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projectId = params.id

        const result = await ProjectsService.getProjectById(projectId)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error('Error in GET /api/projects/[id]:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projectId = params.id
        const body = await request.json()

        const result = await ProjectsService.updateProject(projectId, body)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error('Error in PUT /api/projects/[id]:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const projectId = params.id

        const result = await ProjectsService.deleteProject(projectId)

        if (result.error) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/projects/[id]:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 