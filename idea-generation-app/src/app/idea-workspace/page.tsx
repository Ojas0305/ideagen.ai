'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RefreshCw, MessageCircle, Users, Clock, Target, Lightbulb, Loader2, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConversationThread } from '@/components/personas/ConversationThread'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PipelineStage {
    name: string
    label: string
    description: string
    status: 'pending' | 'active' | 'completed' | 'error'
    progress: number
}

interface SessionProgress {
    session_id: string
    status: string
    statistics: any
    job_id?: string
    job_progress?: number
    job_state?: string
    ideas_generated: {
        seeds: number
        full_ideas: number
        total: number
    }
    average_score: number
    evaluated_ideas: number
    recent_ideas: Array<{
        id: string
        title: string
        category: string
        overall_score: number
        created_at: string
    }>
}

interface ProjectSession {
    id: string
    name: string
    project_id: string
    status: string
    created_at: string
    project: {
        name: string
        challenge: string
        industry: string
    }
}

interface Conversation {
    id: string
    topic: string
    status: string
    conversation_type: string
    participants: string[]
    messages: Array<{
        id: string
        persona_name: string
        message_type: string
        content: string
        created_at: string
    }>
    created_at: string
}

export default function IdeaWorkspacePage() {
    const [sessions, setSessions] = useState<ProjectSession[]>([])
    const [selectedSession, setSelectedSession] = useState<ProjectSession | null>(null)
    const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isStarting, setIsStarting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [sessionToDelete, setSessionToDelete] = useState<ProjectSession | null>(null)

    // Pipeline stages mapped from session progress
    const getPipelineStages = (progress: SessionProgress | null): PipelineStage[] => {
        if (!progress) {
            return [
                { name: 'data_retrieval', label: 'Data Retrieval', description: 'Collecting insights from connected data sources', status: 'pending', progress: 0 },
                { name: 'seed_generation', label: 'Seed Generation', description: 'AI personas collaborating to generate initial ideas', status: 'pending', progress: 0 },
                { name: 'idea_development', label: 'Full Development', description: 'Expanding promising seeds into complete ideas', status: 'pending', progress: 0 },
                { name: 'persona_collaboration', label: 'AI Collaboration', description: 'Personas discussing and refining ideas together', status: 'pending', progress: 0 }
            ]
        }

        const currentStage = progress.statistics?.stage || 'starting'
        const overallProgress = progress.statistics?.progress || 0

        return [
        {
            name: 'data_retrieval',
            label: 'Data Retrieval',
            description: 'Collecting insights from connected data sources',
                status: overallProgress >= 30 ? 'completed' : currentStage === 'data_retrieval' ? 'active' : 'pending',
                progress: overallProgress >= 30 ? 100 : currentStage === 'data_retrieval' ? overallProgress : 0
        },
        {
            name: 'seed_generation',
            label: 'Seed Generation',
            description: 'AI personas collaborating to generate initial ideas',
                status: overallProgress >= 60 ? 'completed' : currentStage === 'seed_generation' ? 'active' : overallProgress >= 30 ? 'pending' : 'pending',
                progress: overallProgress >= 60 ? 100 : currentStage === 'seed_generation' ? Math.max(30, overallProgress) : 0
        },
        {
            name: 'idea_development',
            label: 'Full Development',
            description: 'Expanding promising seeds into complete ideas',
                status: overallProgress >= 80 ? 'completed' : currentStage === 'idea_development' ? 'active' : overallProgress >= 60 ? 'pending' : 'pending',
                progress: overallProgress >= 80 ? 100 : currentStage === 'idea_development' ? Math.max(60, overallProgress) : 0
        },
        {
            name: 'persona_collaboration',
            label: 'AI Collaboration',
            description: 'Personas discussing and refining ideas together',
                status: overallProgress >= 100 ? 'completed' : currentStage === 'persona_collaboration' ? 'active' : overallProgress >= 80 ? 'pending' : 'pending',
                progress: overallProgress >= 100 ? 100 : currentStage === 'persona_collaboration' ? Math.max(80, overallProgress) : 0
            }
        ]
    }

    // Fetch available sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/idea-sessions')
                if (response.ok) {
                    const data = await response.json()
                    setSessions(data.sessions || [])
                    
                    // Auto-select the first session
                    if (data.sessions && data.sessions.length > 0) {
                        setSelectedSession(data.sessions[0])
                    }
                }
            } catch (error) {
                console.error('Error fetching sessions:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSessions()
    }, [])

    // Fetch session progress when session is selected
    useEffect(() => {
        if (!selectedSession) {
            setSessionProgress(null)
            setConversations([])
            return
        }

        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/idea-sessions/progress?session_id=${selectedSession.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setSessionProgress(data)
                    
                    // CRITICAL FIX: Update the session status in real-time
                    // The progress endpoint returns the current session status from database
                    if (data.status && selectedSession.status !== data.status) {
                        console.log(` Session status updated: ${selectedSession.status} → ${data.status}`)
                        setSelectedSession(prev => prev ? { ...prev, status: data.status } : null)
                        
                        // Also update the session in the sessions array for UI consistency
                        setSessions(prev => prev.map(session => 
                            session.id === selectedSession.id 
                                ? { ...session, status: data.status }
                                : session
                        ))
                    }
                }
            } catch (error) {
                console.error('Error fetching session progress:', error)
            }
        }

        const fetchConversations = async () => {
            try {
                const response = await fetch(`/api/conversations?session_id=${selectedSession.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setConversations(data.conversations || [])
                }
            } catch (error) {
                console.error('Error fetching conversations:', error)
            }
        }

        // Initial fetch
        fetchProgress()
        fetchConversations()

        // Only set up polling if session is actively processing
        const isActiveSession = selectedSession.status === 'starting' || 
                               selectedSession.status === 'processing' || 
                               selectedSession.status === 'generating' ||
                               selectedSession.status === 'collaborating'

        if (isActiveSession) {
            const intervalId = setInterval(() => {
                fetchProgress()
                fetchConversations()
            }, 5000) // Poll every 5 seconds (reduced frequency)

            return () => {
                clearInterval(intervalId)
            }
        }

    }, [selectedSession?.id, selectedSession?.status]) // Only depend on id and status, not the whole object

    const startIdeaGeneration = async () => {
        if (!selectedSession) return

        setIsStarting(true)
        try {
            // Create an AbortController for timeout handling
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
            
            const response = await fetch('/api/idea-sessions/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: selectedSession.id }),
                signal: controller.signal
            })
            
            clearTimeout(timeoutId) // Clear timeout if request completes

            if (response.ok) {
                const data = await response.json()
                console.log(' Started idea generation:', data)
                
                // Update selected session status locally instead of reloading
                setSelectedSession(prev => prev ? { ...prev, status: 'starting' } : null)
                
                // No need to reload the page - the useEffect will handle polling
            } else {
                // Only show error if it's a client error (4xx) not server timeout
                if (response.status >= 400 && response.status < 500) {
                    try {
                        const error = await response.json()
                        console.error('Error starting idea generation:', error)
                        alert(`Error: ${error.error?.message || 'Failed to start idea generation'}`)
                    } catch (parseError) {
                        // If we can't parse the error, it might be a timeout but generation could still be working
                        console.warn('Could not parse error response, but generation may still be working')
                        setSelectedSession(prev => prev ? { ...prev, status: 'starting' } : null)
                    }
                } else {
                    // For 5xx errors or timeouts, assume generation might still be working
                    console.warn('Server error or timeout, but generation may still be processing')
                    setSelectedSession(prev => prev ? { ...prev, status: 'starting' } : null)
                }
            }
        } catch (error) {
            // Check if it's an abort error (timeout)
            if (error instanceof Error && error.name === 'AbortError') {
                console.warn('Request timed out after 30 seconds, but generation may still be processing')
                setSelectedSession(prev => prev ? { ...prev, status: 'starting' } : null)
            } else {
                // Other network errors - generation might still be working if it's just a frontend timeout
                console.error('Network error starting idea generation:', error)
                
                // Don't show alert for network errors, just log and assume it might be working
                console.warn('Network error occurred, but generation may still be processing in background')
                setSelectedSession(prev => prev ? { ...prev, status: 'starting' } : null)
            }
        } finally {
            setIsStarting(false)
        }
    }

    const createNewSession = async () => {
        try {
            // For demo, create a session with default project
            const response = await fetch('/api/idea-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `Idea Session ${new Date().toLocaleTimeString()}`,
                    description: 'Automated AI-powered idea generation session',
                    project_id: null, // Will use default project
                    status: 'planning'
                })
            })

            if (response.ok) {
                const newSession = await response.json()
                setSessions(prev => [newSession, ...prev])
                setSelectedSession(newSession)
            }
        } catch (error) {
            console.error('Error creating session:', error)
        }
    }

    const deleteSession = async (sessionId: string) => {
        try {
            setDeletingSessionId(sessionId)
            
            const response = await fetch(`/api/idea-sessions?id=${sessionId}`, {
                method: 'DELETE'
            })
            
            if (response.ok) {
                // Remove from sessions list
                setSessions(prev => prev.filter(s => s.id !== sessionId))
                
                // If deleted session was selected, clear selection
                if (selectedSession?.id === sessionId) {
                    setSelectedSession(null)
                    setSessionProgress(null)
                    setConversations([])
                }
                
                console.log('Session deleted successfully')
            } else {
                const error = await response.json()
                console.error('Error deleting session:', error)
                // You might want to show a toast notification here
            }
        } catch (error) {
            console.error('Error deleting session:', error)
            // You might want to show a toast notification here
        } finally {
            setDeletingSessionId(null)
            setShowDeleteDialog(false)
            setSessionToDelete(null)
        }
    }

    const handleDeleteClick = (session: ProjectSession, event: React.MouseEvent) => {
        event.stopPropagation() // Prevent session selection
        setSessionToDelete(session)
        setShowDeleteDialog(true)
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        )
    }

    const pipelineStages = getPipelineStages(sessionProgress)
    const currentStage = sessionProgress?.statistics?.stage || 'planning'
    const isSessionActive = selectedSession?.status === 'starting' || selectedSession?.status === 'processing' || selectedSession?.status === 'generating'

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Idea Workspace</h1>
                        <p className="text-gray-600 mt-1">Watch AI personas collaborate to generate and develop ideas</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={createNewSession}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Session
                        </Button>
                        {selectedSession?.status === 'planning' && (
                            <Button 
                                onClick={startIdeaGeneration} 
                                disabled={isStarting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isStarting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                )}
                                Start Generation
                            </Button>
                        )}
                    </div>
                </div>

                {/* Session Selector */}
                {sessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>Select a session to monitor progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`group p-4 border rounded-lg cursor-pointer transition-colors relative ${
                                            selectedSession?.id === session.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedSession(session)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium">{session.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    session.status === 'completed' ? 'default' :
                                                    session.status === 'processing' || session.status === 'generating' ? 'secondary' :
                                                    session.status === 'planning' ? 'outline' : 'destructive'
                                                }>
                                                    {session.status}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={(e) => handleDeleteClick(session, e)}
                                                            disabled={deletingSessionId === session.id}
                                                        >
                                                            {deletingSessionId === session.id ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                            )}
                                                            Delete Session
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{session.project?.name || 'Default Project'}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Created: {new Date(session.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedSession && (
                    <>
                        {/* Pipeline Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Generation Pipeline
                                </CardTitle>
                                <CardDescription>
                                    Current Stage: <span className="font-medium capitalize">{currentStage}</span>
                                    {sessionProgress && (
                                        <span className="ml-2">
                                            ({sessionProgress.statistics?.progress || 0}% complete)
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {pipelineStages.map((stage, index) => (
                                        <div key={stage.name} className="relative">
                                            <div className={`p-4 rounded-lg border-2 ${
                                                stage.status === 'completed' ? 'border-green-500 bg-green-50' :
                                                stage.status === 'active' ? 'border-blue-500 bg-blue-50' :
                                                stage.status === 'error' ? 'border-red-500 bg-red-50' :
                                                'border-gray-200 bg-gray-50'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-sm">{stage.label}</h3>
                                                    {stage.status === 'active' && (
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                    )}
                                                    {stage.status === 'completed' && (
                                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mb-3">{stage.description}</p>
                                                <Progress value={stage.progress} className="h-2" />
                                            </div>
                                            
                                            {index < pipelineStages.length - 1 && (
                                                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300 transform -translate-y-1/2" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Dashboard */}
                        {sessionProgress && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ideas Generated</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {sessionProgress.ideas_generated.total}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {sessionProgress.ideas_generated.seeds} seeds, {sessionProgress.ideas_generated.full_ideas} full ideas
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Average Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600">
                                            {sessionProgress.average_score}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            From {sessionProgress.evaluated_ideas} evaluated ideas
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Session Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600 capitalize">
                                            {selectedSession.status}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {isSessionActive ? 'In Progress...' : 'Completed'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Recent Ideas */}
                        {sessionProgress?.recent_ideas && sessionProgress.recent_ideas.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Ideas</CardTitle>
                                    <CardDescription>Latest ideas generated in this session</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {sessionProgress.recent_ideas.map((idea) => (
                                            <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h3 className="font-medium">{idea.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline">{idea.category}</Badge>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(idea.created_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">
                                                        {idea.overall_score > 0 
                                                            ? idea.overall_score 
                                                            : idea.category === 'seed' 
                                                                ? 'N/A' 
                                                                : 'Pending'
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">Score</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* AI Persona Conversations */}
                        {conversations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5" />
                                        AI Persona Conversations
                                    </CardTitle>
                                    <CardDescription>
                                        Watch AI personas collaborate and discuss ideas in real-time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {conversations.map((conversation) => (
                                            <ConversationThread
                                                key={conversation.id}
                                                conversation={conversation}
                                                onRefresh={() => {
                                                    // Refresh conversations
                                                    if (selectedSession) {
                                                        fetch(`/api/conversations?session_id=${selectedSession.id}`)
                                                            .then(res => res.json())
                                                            .then(data => setConversations(data.conversations || []))
                                                            .catch(console.error)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* No Progress Yet */}
                        {!sessionProgress && selectedSession.status === 'planning' && (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Ideas</h3>
                                    <p className="text-gray-600 mb-6">
                                        Click "Start Generation" to begin the automated AI-powered idea generation process.
                                    </p>
                                    <Button 
                                        onClick={startIdeaGeneration} 
                                        disabled={isStarting}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isStarting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4 mr-2" />
                                        )}
                                        Start Generation
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* No Sessions */}
                {sessions.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
                            <p className="text-gray-600 mb-6">
                                Create your first idea generation session to get started.
                            </p>
                            <Button onClick={createNewSession}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Session
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Session</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{sessionToDelete?.name}"? This action cannot be undone and will permanently remove all associated ideas and conversations.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => sessionToDelete && deleteSession(sessionToDelete.id)}
                            disabled={deletingSessionId !== null}
                        >
                            {deletingSessionId ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    )
} 