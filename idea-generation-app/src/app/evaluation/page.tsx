'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewIdeaModal } from '@/components/modals/NewIdeaModal'

interface Idea {
    id: string
    title: string
    description: string
    category: string
    overall_score: number
    created_at: string
}

interface EvaluationData {
    total_ideas: number
    average_score: number
    top_ideas: Idea[]
    categories: Record<string, number>
}

export default function EvaluationPage() {
    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string>('199e6ec6-0e1b-495c-aa87-bccb26eb8ea3') // Test session ID
    const [showNewIdeaModal, setShowNewIdeaModal] = useState(false)
    const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null)
    const [evaluatingIdeas, setEvaluatingIdeas] = useState<Set<string>>(new Set())
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const fetchEvaluationData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/evaluation?session_id=${sessionId}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch evaluation data')
            }
            
            const data = await response.json()
            setEvaluationData(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load evaluation data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (sessionId) {
            fetchEvaluationData()
        }
    }, [sessionId])

    // Polling for ideas being evaluated
    useEffect(() => {
        if (evaluatingIdeas.size > 0) {
            pollingIntervalRef.current = setInterval(async () => {
                try {
                    const response = await fetch(`/api/evaluation?session_id=${sessionId}`)
                    if (response.ok) {
                        const data = await response.json()
                        const updatedEvaluatingIdeas = new Set(evaluatingIdeas)
                        let hasUpdates = false

                        // Check if any evaluating ideas now have scores > 0
                        evaluatingIdeas.forEach(ideaId => {
                            const idea = data.top_ideas.find((i: Idea) => i.id === ideaId)
                            if (idea && idea.overall_score > 0) {
                                updatedEvaluatingIdeas.delete(ideaId)
                                hasUpdates = true
                            }
                        })

                        if (hasUpdates) {
                            setEvaluatingIdeas(updatedEvaluatingIdeas)
                            setEvaluationData(data)
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error)
                }
            }, 5000) // Poll every 5 seconds

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current)
                    pollingIntervalRef.current = null
                }
            }
        }
    }, [evaluatingIdeas, sessionId])

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [])

    const handleIdeaCreated = async (ideaId?: string) => {
        // Add the new idea to evaluating set if we have its ID
        if (ideaId) {
            setEvaluatingIdeas(prev => new Set([...prev, ideaId]))
        }
        
        // Close modal immediately
        setShowNewIdeaModal(false)
        
        // Refresh the evaluation data to show the new idea with score 0
        await fetchEvaluationData()
        
        // If we have an ideaId, give some time for the loading spinner to be visible
        // before the AI evaluation potentially completes
        if (ideaId) {
            console.log(` Idea ${ideaId} added to evaluating set. Loading spinner should be visible.`)
        }
    }

    const handleDeleteIdea = async (ideaId: string, ideaTitle: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${ideaTitle}"? This action cannot be undone.`)
        
        if (!confirmed) return

        try {
            setDeletingIdeaId(ideaId)
            
            const response = await fetch(`/api/full-ideas?id=${ideaId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete idea')
            }

            // Refresh the evaluation data to reflect the deletion
            await fetchEvaluationData()
            
        } catch (err) {
            console.error('Error deleting idea:', err)
            alert('Failed to delete idea. Please try again.')
        } finally {
            setDeletingIdeaId(null)
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
                        <p className="text-gray-600">Assess and score generated ideas across multiple criteria</p>
                    </div>
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading evaluation data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
                        <p className="text-gray-600">Assess and score generated ideas across multiple criteria</p>
                    </div>
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center text-red-600">
                                <p>Error: {error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    if (!evaluationData) {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
                    <p className="text-gray-600">Assess and score generated ideas across multiple criteria</p>
                </div>
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-gray-500">
                                <p>No evaluation data available. Please select a session with ideas to evaluate.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Idea Evaluation</h1>
                        <p className="text-gray-600">AI-powered analysis and scoring of generated ideas</p>
                    </div>
                    <Button onClick={() => setShowNewIdeaModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Idea
                    </Button>
                </div>

                {/* Session Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="sessionId" className="text-sm font-medium">Session ID:</label>
                            <input
                                id="sessionId"
                                type="text"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Enter session ID to evaluate"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Evaluation Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluation Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{evaluationData.total_ideas}</div>
                                <div className="text-gray-600">Total Ideas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{Math.round(evaluationData.average_score)}</div>
                                <div className="text-gray-600">Average Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">1</div>
                                <div className="text-gray-600">Sessions</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Ideas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Ideas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {evaluationData.top_ideas.slice(0, 5).map((idea, index) => {
                                const isEvaluating = evaluatingIdeas.has(idea.id) && idea.overall_score === 0
                                
                                return (
                                    <div key={idea.id} className={`border rounded-lg p-4 ${isEvaluating ? 'bg-blue-50 border-blue-200' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{idea.title}</h3>
                                                <p className="text-gray-600 text-sm">{idea.description}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-right">
                                                    {isEvaluating ? (
                                                        <div className="flex items-center space-x-2">
                                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                                            <div>
                                                                <div className="text-sm font-medium text-blue-600">Evaluating...</div>
                                                                <div className="text-xs text-blue-500">AI analysis in progress</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-2xl font-bold text-blue-600">{idea.overall_score}</div>
                                                            <div className="text-xs text-gray-500">Score</div>
                                                        </>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteIdea(idea.id, idea.title)}
                                                    disabled={deletingIdeaId === idea.id || isEvaluating}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deletingIdeaId === idea.id ? (
                                                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span className="bg-gray-100 px-2 py-1 rounded">{idea.category}</span>
                                            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {isEvaluating && (
                                            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                                                <div className="flex items-center space-x-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>This idea is being evaluated by AI. The score will appear automatically once complete (usually 30-60 seconds).</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ideas by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(evaluationData.categories).map(([category, count]) => (
                                <div key={category} className="border rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{count}</div>
                                    <div className="text-sm text-gray-600">{category}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <NewIdeaModal
                open={showNewIdeaModal}
                onOpenChange={setShowNewIdeaModal}
                onIdeaCreated={handleIdeaCreated}
            />
        </DashboardLayout>
    )
} 