'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, MessageCircle, Users, Clock, Target, Lightbulb } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PipelineStage {
    name: string
    label: string
    description: string
    status: 'pending' | 'active' | 'completed' | 'error'
    progress: number
}

interface AIPersona {
    id: string
    name: string
    role: string
    avatar: string
    isActive: boolean
    lastMessage?: string
    messageTime?: string
}

interface IdeaSeed {
    id: string
    title: string
    description: string
    category: string
    confidence: number
    generatedBy: string
    timestamp: string
}

interface PersonaMessage {
    id: string
    personaId: string
    personaName: string
    message: string
    timestamp: string
    type: 'insight' | 'suggestion' | 'question' | 'critique'
}

export default function IdeaWorkspacePage() {
    const [activeSession, setActiveSession] = useState(true)
    const [sessionStatus, setSessionStatus] = useState<'running' | 'paused' | 'completed'>('running')

    const [pipelineStages] = useState<PipelineStage[]>([
        {
            name: 'data_retrieval',
            label: 'Data Retrieval',
            description: 'Collecting insights from connected data sources',
            status: 'completed',
            progress: 100
        },
        {
            name: 'processing',
            label: 'Processing',
            description: 'Analyzing patterns and extracting key themes',
            status: 'completed',
            progress: 100
        },
        {
            name: 'seed_generation',
            label: 'Seed Generation',
            description: 'AI personas collaborating to generate initial ideas',
            status: 'active',
            progress: 67
        },
        {
            name: 'idea_development',
            label: 'Full Development',
            description: 'Expanding promising seeds into complete ideas',
            status: 'pending',
            progress: 0
        }
    ])

    const [aiPersonas] = useState<AIPersona[]>([
        {
            id: 'visionary',
            name: 'The Visionary',
            role: 'Big picture thinking',
            avatar: '🚀',
            isActive: true,
            lastMessage: "I see potential for disrupting traditional delivery models with drone technology...",
            messageTime: '2 min ago'
        },
        {
            id: 'analyst',
            name: 'The Analyst',
            role: 'Data-driven insights',
            avatar: '📊',
            isActive: true,
            lastMessage: "Based on market data, last-mile delivery costs represent 53% of total shipping expenses...",
            messageTime: '3 min ago'
        },
        {
            id: 'critic',
            name: 'The Critic',
            role: 'Risk assessment',
            avatar: '🔍',
            isActive: true,
            lastMessage: "We need to consider regulatory hurdles and safety concerns with autonomous delivery...",
            messageTime: '1 min ago'
        },
        {
            id: 'advocate',
            name: 'Customer Advocate',
            role: 'User perspective',
            avatar: '👥',
            isActive: true,
            lastMessage: "Customers prioritize reliability and tracking transparency over speed...",
            messageTime: '4 min ago'
        }
    ])

    const [ideaSeeds] = useState<IdeaSeed[]>([
        {
            id: '1',
            title: 'Autonomous Delivery Network',
            description: 'AI-powered fleet of delivery robots and drones that optimize routes in real-time and handle last-mile delivery autonomously.',
            category: 'Technology',
            confidence: 85,
            generatedBy: 'The Visionary',
            timestamp: '10 min ago'
        },
        {
            id: '2',
            title: 'Community Delivery Hubs',
            description: 'Neighborhood-based micro-fulfillment centers that use local community members as delivery partners for hyperlocal distribution.',
            category: 'Community',
            confidence: 78,
            generatedBy: 'Customer Advocate',
            timestamp: '8 min ago'
        },
        {
            id: '3',
            title: 'Predictive Delivery Service',
            description: 'Machine learning system that predicts what customers will order and pre-positions inventory closer to anticipated demand.',
            category: 'AI/ML',
            confidence: 92,
            generatedBy: 'The Analyst',
            timestamp: '6 min ago'
        },
        {
            id: '4',
            title: 'Sustainable Packaging Network',
            description: 'Circular economy approach to packaging with reusable containers tracked via IoT sensors and blockchain verification.',
            category: 'Sustainability',
            confidence: 71,
            generatedBy: 'The Critic',
            timestamp: '4 min ago'
        }
    ])

    const [personaMessages] = useState<PersonaMessage[]>([
        {
            id: '1',
            personaId: 'visionary',
            personaName: 'The Visionary',
            message: "What if we combined drone delivery with AI-powered route optimization to create a truly autonomous last-mile network?",
            timestamp: '5 min ago',
            type: 'suggestion'
        },
        {
            id: '2',
            personaId: 'analyst',
            personaName: 'The Analyst',
            message: "The drone delivery market is projected to reach $11.2B by 2027, with 67% CAGR. Strong validation for this direction.",
            timestamp: '4 min ago',
            type: 'insight'
        },
        {
            id: '3',
            personaId: 'critic',
            personaName: 'The Critic',
            message: "Hold on - what about FAA regulations and urban airspace restrictions? We need regulatory approval pathways.",
            timestamp: '3 min ago',
            type: 'critique'
        },
        {
            id: '4',
            personaId: 'advocate',
            personaName: 'Customer Advocate',
            message: "Customers want reliability over novelty. Can we ensure 99.9% delivery success rates with this approach?",
            timestamp: '2 min ago',
            type: 'question'
        },
        {
            id: '5',
            personaId: 'visionary',
            personaName: 'The Visionary',
            message: "Good points! What about starting with controlled environments like business parks or university campuses?",
            timestamp: '1 min ago',
            type: 'suggestion'
        }
    ])

    const getStageIcon = (stage: PipelineStage) => {
        if (stage.status === 'completed') return '✅'
        if (stage.status === 'active') return '⚡'
        if (stage.status === 'error') return '❌'
        return '⏳'
    }

    const getPersonaStatusColor = (persona: AIPersona) => {
        return persona.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }

    const getMessageTypeIcon = (type: PersonaMessage['type']) => {
        switch (type) {
            case 'insight': return '💡'
            case 'suggestion': return '🎯'
            case 'question': return '❓'
            case 'critique': return '⚠️'
            default: return '💬'
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Idea Workspace</h1>
                        <p className="text-gray-600">Project: E-commerce Enhancement - Session #3</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" disabled={!activeSession}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Session
                        </Button>
                        <Button variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate
                        </Button>
                        <Button>
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                        </Button>
                    </div>
                </div>

                {/* Session Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5" />
                                    <span>Session Progress</span>
                                </CardTitle>
                                <CardDescription>
                                    Challenge: Optimize last-mile delivery for e-commerce platforms
                                </CardDescription>
                            </div>
                            <Badge className={sessionStatus === 'running' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {sessionStatus === 'running' ? 'Active' : 'Paused'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {pipelineStages.map((stage, index) => (
                                <div key={stage.name} className="relative">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-lg">{getStageIcon(stage)}</span>
                                        <div>
                                            <h3 className="font-medium text-sm">{stage.label}</h3>
                                            <p className="text-xs text-gray-500">{stage.description}</p>
                                        </div>
                                    </div>
                                    <Progress value={stage.progress} className="h-2" />
                                    <div className="text-xs text-gray-500 mt-1">{stage.progress}%</div>

                                    {/* Connection line to next stage */}
                                    {index < pipelineStages.length - 1 && (
                                        <div className="hidden md:block absolute top-6 -right-3 w-6 h-0.5 bg-gray-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="collaboration" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="collaboration">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            AI Collaboration
                        </TabsTrigger>
                        <TabsTrigger value="seeds">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Idea Seeds ({ideaSeeds.length})
                        </TabsTrigger>
                        <TabsTrigger value="personas">
                            <Users className="h-4 w-4 mr-2" />
                            AI Personas
                        </TabsTrigger>
                    </TabsList>

                    {/* AI Collaboration Tab */}
                    <TabsContent value="collaboration" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Active Personas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Active Personas</CardTitle>
                                    <CardDescription>Currently contributing to the session</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {aiPersonas.filter(p => p.isActive).map((persona) => (
                                            <div key={persona.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                                                <div className="text-2xl">{persona.avatar}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-sm">{persona.name}</h4>
                                                        <Badge className={getPersonaStatusColor(persona)} variant="secondary">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">{persona.role}</p>
                                                    {persona.lastMessage && (
                                                        <p className="text-xs text-gray-700 line-clamp-2">{persona.lastMessage}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">{persona.messageTime}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conversation Feed */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">Live Collaboration</CardTitle>
                                    <CardDescription>Real-time AI persona interactions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {personaMessages.map((message) => (
                                            <div key={message.id} className="flex items-start space-x-3">
                                                <div className="text-lg">{getMessageTypeIcon(message.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="font-medium text-sm">{message.personaName}</h4>
                                                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{message.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-blue-700">The Visionary is typing...</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Idea Seeds Tab */}
                    <TabsContent value="seeds" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ideaSeeds.map((seed) => (
                                <Card key={seed.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{seed.title}</CardTitle>
                                                <CardDescription>{seed.category}</CardDescription>
                                            </div>
                                            <Badge variant="outline">{seed.confidence}%</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 mb-4">{seed.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Generated by {seed.generatedBy}</span>
                                            <span>{seed.timestamp}</span>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                Develop Further
                                            </Button>
                                            <Button size="sm" className="flex-1">
                                                Approve Seed
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* AI Personas Tab */}
                    <TabsContent value="personas" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {aiPersonas.map((persona) => (
                                <Card key={persona.id}>
                                    <CardHeader className="text-center">
                                        <div className="text-4xl mb-2">{persona.avatar}</div>
                                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                                        <CardDescription>{persona.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-center">
                                                <Badge className={getPersonaStatusColor(persona)} variant="secondary">
                                                    {persona.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {persona.lastMessage && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Latest contribution:</p>
                                                    <p className="text-xs text-gray-700 line-clamp-3">{persona.lastMessage}</p>
                                                </div>
                                            )}
                                            <Button variant="outline" size="sm" className="w-full">
                                                View History
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
} 