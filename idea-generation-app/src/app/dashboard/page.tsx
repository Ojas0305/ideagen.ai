'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Link as LinkIcon, Star, TrendingUp, Clock, Folder, FolderOpen } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NewProjectModal } from '@/components/modals/NewProjectModal'

interface KPICardProps {
    title: string
    value: string | number
    trend: string
    trendType: 'positive' | 'negative' | 'neutral'
    icon: React.ReactNode
    description: string
}

function KPICard({ title, value, trend, trendType, icon, description }: KPICardProps) {
    const trendColor = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-600'
    }[trendType]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span className={trendColor}>{trend}</span>
                    <span>{description}</span>
                </p>
            </CardContent>
        </Card>
    )
}

interface ProjectStageProps {
    name: string
    title: string
    count: number
    projects: Array<{ id: string; name: string }>
}

function ProjectStage({ name, title, count, projects }: ProjectStageProps) {
    return (
        <div className="bg-white rounded-lg border p-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{title}</h3>
                <Badge variant="secondary">{count}</Badge>
            </div>
            <div className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                        {project.name}
                    </div>
                ))}
                {projects.length > 3 && (
                    <div className="text-xs text-gray-500">
                        +{projects.length - 3} more projects
                    </div>
                )}
            </div>
        </div>
    )
}

interface IdeaCardProps {
    title: string
    category: string
    score: number
    metrics: {
        feasibility: number
        market_potential: number
        uniqueness: number
    }
    generated_date: string
}

function IdeaCard({ title, category, score, metrics, generated_date }: IdeaCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">{title}</CardTitle>
                    <Badge variant="outline" className="ml-2">{score}</Badge>
                </div>
                <CardDescription>{category}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                        <span>Feasibility</span>
                        <span>{metrics.feasibility}%</span>
                    </div>
                    <Progress value={metrics.feasibility} className="h-1" />

                    <div className="flex justify-between text-xs">
                        <span>Market Potential</span>
                        <span>{metrics.market_potential}%</span>
                    </div>
                    <Progress value={metrics.market_potential} className="h-1" />

                    <div className="flex justify-between text-xs">
                        <span>Uniqueness</span>
                        <span>{metrics.uniqueness}%</span>
                    </div>
                    <Progress value={metrics.uniqueness} className="h-1" />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{generated_date}</span>
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                            View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                            Export
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
    const [kpis, setKpis] = useState({
        activeProjects: { value: 0, trend: '0%', type: 'positive' as const },
        ideasGenerated: { value: 0, trend: '0%', type: 'positive' as const },
        successRate: { value: '0%', trend: '0%', type: 'positive' as const },
        processingTime: { value: '0h', trend: '0h', type: 'positive' as const },
    })

    const [pipelineData, setPipelineData] = useState({
        planning: { count: 0, projects: [] },
        processing: { count: 0, projects: [] },
        generating: { count: 0, projects: [] },
        completed: { count: 0, projects: [] }
    })

    const [topIdeas, setTopIdeas] = useState<any[]>([])
    const [aiPersonas, setAiPersonas] = useState<any[]>([])
    const [dataSources, setDataSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showNewProjectModal, setShowNewProjectModal] = useState(false)

    // Fetch dashboard analytics
    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch('/api/dashboard/analytics')
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to view dashboard')
                }
                throw new Error('Failed to fetch dashboard data')
            }
            
            const data = await response.json()
            
            setKpis(data.kpis)
            setPipelineData(data.pipelineData)
            setTopIdeas(data.topIdeas)
            setAiPersonas(data.aiPersonas)
            setDataSources(data.dataSources)
        } catch (err) {
            console.error('Error fetching analytics:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        } finally {
            setLoading(false)
        }
    }

    // Fetch analytics on component mount
    useEffect(() => {
        fetchAnalytics()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Loading State */}
                {loading && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading dashboard...</p>
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
                                    <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
                                    <p>{error}</p>
                                </div>
                                <Button onClick={fetchAnalytics} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Dashboard Content */}
                {!loading && !error && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Innovation Dashboard</h1>
                        <p className="text-gray-600">Manage your AI-powered idea generation projects</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button onClick={() => setShowNewProjectModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                        <Button variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Start Session
                        </Button>
                        <Button variant="outline">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Connect Data
                        </Button>
                        <Button variant="ghost">
                            <Star className="h-4 w-4 mr-2" />
                            Review Ideas
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Active Projects"
                        value={kpis.activeProjects.value}
                        trend={kpis.activeProjects.trend}
                        trendType={kpis.activeProjects.type}
                        icon={<FolderOpen className="h-4 w-4" />}
                        description="Projects in progress"
                    />
                    <KPICard
                        title="Ideas Generated"
                        value={kpis.ideasGenerated.value}
                        trend={kpis.ideasGenerated.trend}
                        trendType={kpis.ideasGenerated.type}
                        icon={<Star className="h-4 w-4" />}
                        description="Total ideas this month"
                    />
                    <KPICard
                        title="Success Rate"
                        value={kpis.successRate.value}
                        trend={kpis.successRate.trend}
                        trendType={kpis.successRate.type}
                        icon={<TrendingUp className="h-4 w-4" />}
                        description="Ideas advancing to implementation"
                    />
                    <KPICard
                        title="Processing Time"
                        value={kpis.processingTime.value}
                        trend={kpis.processingTime.trend}
                        trendType={kpis.processingTime.type}
                        icon={<Clock className="h-4 w-4" />}
                        description="Average time to full ideas"
                    />
                </div>

                {/* Project Pipeline */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Project Pipeline</CardTitle>
                                <CardDescription>Overview of all active projects</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-6 overflow-x-auto pb-4">
                            <ProjectStage
                                name="planning"
                                title="Planning"
                                count={pipelineData.planning.count}
                                projects={pipelineData.planning.projects}
                            />
                            <ProjectStage
                                name="processing"
                                title="Processing"
                                count={pipelineData.processing.count}
                                projects={pipelineData.processing.projects}
                            />
                            <ProjectStage
                                name="generating"
                                title="Generating"
                                count={pipelineData.generating.count}
                                projects={pipelineData.generating.projects}
                            />
                            <ProjectStage
                                name="completed"
                                title="Completed"
                                count={pipelineData.completed.count}
                                projects={pipelineData.completed.projects}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performing Ideas */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Top Performing Ideas</CardTitle>
                                <CardDescription>Recently generated high-potential ideas</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                View All Ideas
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topIdeas.map((idea, index) => (
                                <IdeaCard key={index} {...idea} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Personas</CardTitle>
                            <CardDescription>Current activity and performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {aiPersonas.map((persona) => (
                                    <div key={persona.name} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{persona.name}</div>
                                            <div className="text-sm text-gray-500">Response: {persona.responseTime}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{persona.utilization}%</div>
                                            <Progress value={persona.utilization} className="w-20 h-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Sources</CardTitle>
                            <CardDescription>Connection status and data quality</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dataSources.map((source) => (
                                    <div key={source.name} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{source.name}</div>
                                            <div className="text-sm text-gray-500">Last sync: {source.lastSync}</div>
                                        </div>
                                        <Badge
                                            variant={source.status === 'Connected' ? 'default' : 'secondary'}
                                            className={source.status === 'Connected' ? 'bg-green-100 text-green-800' : ''}
                                        >
                                            {source.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                        </div>
                    </>
                )}
            </div>

            <NewProjectModal
                open={showNewProjectModal}
                onOpenChange={setShowNewProjectModal}
                onProjectCreated={fetchAnalytics}
            />
        </DashboardLayout>
    )
} 