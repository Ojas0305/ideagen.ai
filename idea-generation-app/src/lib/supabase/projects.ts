import { createAdminSupabaseClient } from './client'
import { Project, CreateProjectForm, ApiResponse } from '@/lib/types'

type AdminSupabaseClient = ReturnType<typeof createAdminSupabaseClient>

export class ProjectsService {
    // Remove the static supabase property that was causing the issue

    static async createProject(data: CreateProjectForm): Promise<ApiResponse<Project>> {
        try {
            const supabase = createAdminSupabaseClient()

            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    name: data.name,
                    description: data.description,
                    industry: data.industry,
                    challenge: data.challenge,
                    // Remove owner_id since we're removing authentication
                })
                .select()
                .single()

            if (error) {
                return { error: { code: 'CREATE_ERROR', message: error.message } }
            }

            return { data: project }
        } catch (error) {
            console.error('Error creating project:', error)
            return { error: { code: 'CREATE_ERROR', message: 'Failed to create project' } }
        }
    }

    static async getProjects(
        options: {
            status?: string
            industry?: string
            limit?: number
            offset?: number
        } = {}
    ): Promise<ApiResponse<{ items: Project[]; total: number; limit: number; offset: number }>> {
        try {
            const supabase = createAdminSupabaseClient()

            // Simplified query without complex relationships
            let query = supabase
                .from('projects')
                .select('*')

            if (options.status) {
                query = query.eq('status', options.status)
            }

            if (options.industry) {
                query = query.eq('industry', options.industry)
            }

            if (options.limit) {
                query = query.limit(options.limit)
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
            }

            const { data: projects, error } = await query.order('created_at', { ascending: false })

            if (error) {
                return { error: { code: 'FETCH_ERROR', message: error.message } }
            }

            // Get total count for pagination
            const { count, error: countError } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })

            if (countError) {
                return { error: { code: 'COUNT_ERROR', message: countError.message } }
            }

            const projectsWithCounts = await ProjectsService.attachIdeaCounts(supabase, projects || [])

            return {
                data: {
                    items: projectsWithCounts,
                    total: count || 0,
                    limit: options.limit || 20,
                    offset: options.offset || 0,
                },
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
            return { error: { code: 'FETCH_ERROR', message: 'Failed to fetch projects' } }
        }
    }

    // Counts full_ideas per project via idea_sessions, since projects don't reference ideas directly
    private static async attachIdeaCounts(
        supabase: AdminSupabaseClient,
        projects: Project[]
    ): Promise<Project[]> {
        if (projects.length === 0) {
            return projects
        }

        const projectIds = projects.map(p => p.id)

        const { data: sessions } = await supabase
            .from('idea_sessions')
            .select('id, project_id')
            .in('project_id', projectIds)

        if (!sessions || sessions.length === 0) {
            return projects.map(p => ({ ...p, ideas_count: 0, average_score: 0 }))
        }

        const sessionToProject = new Map(sessions.map(s => [s.id, s.project_id]))
        const sessionIds = sessions.map(s => s.id)

        const { data: ideas } = await supabase
            .from('full_ideas')
            .select('session_id, overall_score')
            .in('session_id', sessionIds)

        const countByProject = new Map<string, number>()
        const scoreSumByProject = new Map<string, number>()

        for (const idea of ideas || []) {
            const projectId = sessionToProject.get(idea.session_id)
            if (!projectId) continue
            countByProject.set(projectId, (countByProject.get(projectId) || 0) + 1)
            scoreSumByProject.set(projectId, (scoreSumByProject.get(projectId) || 0) + (idea.overall_score || 0))
        }

        return projects.map(p => {
            const ideasCount = countByProject.get(p.id) || 0
            const scoreSum = scoreSumByProject.get(p.id) || 0
            return {
                ...p,
                ideas_count: ideasCount,
                average_score: ideasCount > 0 ? Math.round(scoreSum / ideasCount) : 0,
            }
        })
    }

    static async getProjectById(projectId: string): Promise<ApiResponse<Project>> {
        try {
            const supabase = createAdminSupabaseClient()

            const { data: project, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()

            if (error) {
                return { error: { code: 'FETCH_ERROR', message: error.message } }
            }

            return { data: project }
        } catch (error) {
            console.error('Error fetching project:', error)
            return { error: { code: 'FETCH_ERROR', message: 'Failed to fetch project' } }
        }
    }

    static async updateProject(
        projectId: string,
        updates: Partial<Project>
    ): Promise<ApiResponse<Project>> {
        try {
            const supabase = createAdminSupabaseClient()

            const { data: project, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', projectId)
                .select()
                .single()

            if (error) {
                return { error: { code: 'UPDATE_ERROR', message: error.message } }
            }

            return { data: project }
        } catch (error) {
            console.error('Error updating project:', error)
            return { error: { code: 'UPDATE_ERROR', message: 'Failed to update project' } }
        }
    }

    static async deleteProject(projectId: string): Promise<ApiResponse<void>> {
        try {
            const supabase = createAdminSupabaseClient()

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) {
                return { error: { code: 'DELETE_ERROR', message: error.message } }
            }

            return { data: undefined }
        } catch (error) {
            console.error('Error deleting project:', error)
            return { error: { code: 'DELETE_ERROR', message: 'Failed to delete project' } }
        }
    }

    static async getProjectAnalytics(): Promise<ApiResponse<any>> {
        try {
            const supabase = createAdminSupabaseClient()

            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')

            if (error) {
                return { error: { code: 'FETCH_ERROR', message: error.message } }
            }

            return { data: projects }
        } catch (error) {
            console.error('Error fetching project analytics:', error)
            return { error: { code: 'FETCH_ERROR', message: 'Failed to fetch project analytics' } }
        }
    }
} 