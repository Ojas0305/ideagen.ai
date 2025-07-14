import { createServerSupabaseClient } from './client'
import { Project, CreateProjectForm, ApiResponse, PaginatedResponse } from '@/lib/types'

export class ProjectsService {
    // Remove the static supabase property that was causing the issue

    static async createProject(data: CreateProjectForm): Promise<ApiResponse<Project>> {
        try {
            const supabase = await createServerSupabaseClient()

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
    ): Promise<ApiResponse<PaginatedResponse<Project>>> {
        try {
            const supabase = await createServerSupabaseClient()

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

            return {
                data: {
                    items: projects || [],
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

    static async getProjectById(projectId: string): Promise<ApiResponse<Project>> {
        try {
            const supabase = await createServerSupabaseClient()

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
            const supabase = await createServerSupabaseClient()

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
            const supabase = await createServerSupabaseClient()

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
            const supabase = await createServerSupabaseClient()

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