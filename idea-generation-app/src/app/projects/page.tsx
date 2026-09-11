'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NewProjectModal } from '@/components/modals/NewProjectModal'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
    id: string
    name: string
    description?: string
    industry?: string
    status: 'planning' | 'processing' | 'generating' | 'completed' | 'paused'
    created_at: string
    ideasGenerated: number
    averageScore: number
}

function ProjectCard({
    id,
    name,
    description,
    industry,
    status,
    created_at,
    ideasGenerated,
    averageScore
}: ProjectCardProps) {
    const router = useRouter()
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    
    const statusColors = {
        planning: 'bg-blue-100 text-blue-800',
        processing: 'bg-yellow-100 text-yellow-800',
        generating: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        paused: 'bg-red-100 text-red-800'
    }

    const statusLabels = {
        planning: 'Planning',
        processing: 'Processing',
        generating: 'Generating',
        completed: 'Completed',
        paused: 'Paused'
    }

    const handleNewSession = async () => {
        try {
            setIsCreatingSession(true)
            console.log(`Creating new idea generation session for project: ${name}`)
            console.log(`Project ID: ${id}`)
            
            // Validate project ID
            if (!id || id.trim() === '') {
                throw new Error('Invalid project ID')
            }
            
            // Step 1: Create new idea session with timeout
            const sessionResponse = await Promise.race([
                fetch('/api/idea-sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        project_id: id,
                        name: `${name} - ${new Date().toLocaleString()}`
                    })
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Session creation timeout')), 10000)
                )
            ]) as Response

            if (!sessionResponse.ok) {
                const errorText = await sessionResponse.text()
                let errorMessage = 'Failed to create session'
                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error?.message || errorMessage
                } catch {
                    errorMessage = `HTTP ${sessionResponse.status}: ${errorText}`
                }
                throw new Error(errorMessage)
            }

            const sessionData = await sessionResponse.json()
            const sessionId = sessionData.id

            console.log(` Session created: ${sessionId}`)

            // Step 2: Start the idea generation pipeline asynchronously (fire and forget)
            console.log(` Starting idea generation in background...`)
            
            // Start idea generation in background - don't wait for it
            fetch('/api/idea-sessions/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: sessionId
                })
            }).then(response => {
                if (response.ok) {
                    console.log(` Background idea generation started successfully!`)
                } else {
                    console.warn(` Background idea generation may have issues, but session was created`)
                }
            }).catch(error => {
                console.warn(` Background idea generation error:`, error)
                console.log(` Session ${sessionId} was created successfully, you can check its progress in the workspace`)
            })

            console.log(` Navigating to workspace to monitor progress...`)
            
            // Step 3: Navigate immediately to idea workspace  
            router.push('/idea-workspace')
            
        } catch (error) {
            console.error(' Error creating session:', error)
            
            // Better error messaging for user
            let userMessage = 'Failed to create session'
            if (error instanceof Error) {
                if (error.message.includes('timeout')) {
                    userMessage = 'Session creation timed out. Please try again or check your internet connection.'
                } else if (error.message.includes('uuid')) {
                    userMessage = 'Invalid project configuration. Please try refreshing the page.'
                } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    userMessage = 'Network connection issue. Please check your internet connection and try again.'
                } else {
                    userMessage = error.message
                }
            }
            
            alert(userMessage)
        } finally {
            setIsCreatingSession(false)
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                        {description || 'No description provided'}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleNewSession} disabled={isCreatingSession}>
                            {isCreatingSession ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Session...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Session
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <Badge className={statusColors[status]}>
                        {statusLabels[status]}
                    </Badge>
                    {industry && (
                        <Badge variant="outline">{industry}</Badge>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-semibold text-lg">{ideasGenerated}</div>
                        <div className="text-gray-500">Ideas</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-lg">{averageScore}</div>
                        <div className="text-gray-500">Avg Score</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-lg">
                            {new Date(created_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">Created</div>
                    </div>
                </div>

                <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Analytics
                    </Button>
                    <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={handleNewSession}
                        disabled={isCreatingSession}
                    >
                        {isCreatingSession ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                New Session
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
    const [projects, setProjects] = useState<ProjectCardProps[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showNewProjectModal, setShowNewProjectModal] = useState(false)

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const params = new URLSearchParams()
            if (selectedStatus !== 'all') params.append('status', selectedStatus)
            if (selectedIndustry !== 'all') params.append('industry', selectedIndustry)
            params.append('limit', '50') // Get more projects for better filtering
            
            const response = await fetch(`/api/projects?${params}`)
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to view projects')
                }
                throw new Error('Failed to fetch projects')
            }
            
            const data = await response.json()
            
            // Transform the data to match our ProjectCardProps interface
            const transformedProjects: ProjectCardProps[] = data.items?.map((project: any) => ({
                id: project.id,
                name: project.name,
                description: project.description,
                industry: project.industry,
                status: project.status,
                created_at: project.created_at,
                ideasGenerated: project.ideas_count || 0,
                averageScore: project.average_score || 0
            })) || []
            
            setProjects(transformedProjects)
        } catch (err) {
            console.error('Error fetching projects:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch projects')
        } finally {
            setLoading(false)
        }
    }

    // Fetch projects on component mount and when filters change
    useEffect(() => {
        fetchProjects()
    }, [selectedStatus, selectedIndustry])

    // Client-side search filtering (since the API doesn't support search yet)
    const searchFilteredProjects = searchTerm 
        ? projects.filter(project => {
            const searchLower = searchTerm.toLowerCase()
            return project.name.toLowerCase().includes(searchLower) ||
                   project.description?.toLowerCase().includes(searchLower) ||
                   project.industry?.toLowerCase().includes(searchLower)
          })
        : projects

    const filteredProjects = searchFilteredProjects

    const industries = Array.from(new Set(projects.map(p => p.industry).filter(Boolean)))
    const statuses = ['planning', 'processing', 'generating', 'completed', 'paused']

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600">Manage your idea generation projects</p>
                    </div>
                    <Button onClick={() => setShowNewProjectModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <option value="all">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <option value="all">All Industries</option>
                                {industries.map(industry => (
                                    <option key={industry} value={industry}>
                                        {industry}
                                    </option>
                                ))}
                            </select>

                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {filteredProjects.length} visible
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {projects.filter(p => ['processing', 'generating'].includes(p.status)).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ideas Generated</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {projects.reduce((sum, p) => sum + p.ideasGenerated, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all projects
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {projects.filter(p => p.averageScore > 0).length > 0 
                                    ? Math.round(projects.filter(p => p.averageScore > 0).reduce((sum, p) => sum + p.averageScore, 0) / projects.filter(p => p.averageScore > 0).length)
                                    : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Quality metric
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Loading State */}
                {loading && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading projects...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error State */}
                {error && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="text-red-600 mb-4">
                                    <h3 className="text-lg font-medium mb-2">Error Loading Projects</h3>
                                    <p>{error}</p>
                                </div>
                                <Button onClick={fetchProjects} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Projects Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredProjects.length === 0 && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || selectedStatus !== 'all' || selectedIndustry !== 'all'
                                        ? 'Try adjusting your filters to see more projects.'
                                        : 'Get started by creating your first project.'}
                                </p>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <NewProjectModal
                open={showNewProjectModal}
                onOpenChange={setShowNewProjectModal}
                onProjectCreated={fetchProjects}
            />
        </DashboardLayout>
    )
} 