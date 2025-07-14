'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CreateProjectForm } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface NewProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onProjectCreated?: () => void
}

interface DataSource {
    id: string
    name: string
    type: string
}

interface AIPersona {
    id: string
    name: string
    role: string
}

const INDUSTRIES = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Manufacturing',
    'Entertainment',
    'Food & Beverage',
    'Travel & Tourism',
    'Real Estate',
    'Automotive',
    'Energy',
    'Fashion',
    'Sports',
    'Other'
]

export function NewProjectModal({ open, onOpenChange, onProjectCreated }: NewProjectModalProps) {
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dataSources, setDataSources] = useState<DataSource[]>([])
    const [aiPersonas, setAIPersonas] = useState<AIPersona[]>([])
    const [formData, setFormData] = useState<CreateProjectForm>({
        name: '',
        description: '',
        industry: '',
        challenge: '',
        dataSourceIds: [],
        aiPersonaIds: []
    })

    // Fetch data sources and AI personas when modal opens
    useEffect(() => {
        if (open && (dataSources.length === 0 || aiPersonas.length === 0)) {
            fetchData()
        }
    }, [open, dataSources.length, aiPersonas.length])

    const fetchData = async () => {
        setDataLoading(true)
        try {
            const [dataSourcesResponse, aiPersonasResponse] = await Promise.all([
                fetch('/api/data-sources'),
                fetch('/api/ai-personas')
            ])

            if (dataSourcesResponse.ok && aiPersonasResponse.ok) {
                const dataSourcesData = await dataSourcesResponse.json()
                const aiPersonasData = await aiPersonasResponse.json()

                setDataSources(dataSourcesData.data || [])
                setAIPersonas(aiPersonasData.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setDataLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Project name is required')
            }

            if (!formData.description?.trim()) {
                throw new Error('Project description is required')
            }

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to create project')
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                industry: '',
                challenge: '',
                dataSourceIds: [],
                aiPersonaIds: []
            })

            // Close modal and notify parent
            onOpenChange(false)
            onProjectCreated?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDataSourceChange = (dataSourceId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            dataSourceIds: checked
                ? [...prev.dataSourceIds, dataSourceId]
                : prev.dataSourceIds.filter(id => id !== dataSourceId)
        }))
    }

    const handleAIPersonaChange = (personaId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            aiPersonaIds: checked
                ? [...prev.aiPersonaIds, personaId]
                : prev.aiPersonaIds.filter(id => id !== personaId)
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Set up a new idea generation project with your preferred data sources and AI personas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., AI-Powered Fitness App"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your project goals and objectives..."
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                                value={formData.industry}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INDUSTRIES.map((industry) => (
                                        <SelectItem key={industry} value={industry}>
                                            {industry}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="challenge">Challenge or Problem Statement</Label>
                            <Textarea
                                id="challenge"
                                value={formData.challenge}
                                onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                                placeholder="What specific challenge or problem are you trying to solve?"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="space-y-3">
                        <Label>Data Sources</Label>
                        <p className="text-sm text-gray-600">
                            Select data sources to inform your idea generation process.
                        </p>
                        {dataLoading ? (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading data sources...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {dataSources.map((source) => (
                                    <div key={source.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`data-source-${source.id}`}
                                            checked={formData.dataSourceIds.includes(source.id)}
                                            onCheckedChange={(checked) =>
                                                handleDataSourceChange(source.id, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={`data-source-${source.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {source.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Personas */}
                    <div className="space-y-3">
                        <Label>AI Personas</Label>
                        <p className="text-sm text-gray-600">
                            Choose AI personas to collaborate on idea generation.
                        </p>
                        {dataLoading ? (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading AI personas...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {aiPersonas.map((persona) => (
                                    <div key={persona.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`ai-persona-${persona.id}`}
                                            checked={formData.aiPersonaIds.includes(persona.id)}
                                            onCheckedChange={(checked) =>
                                                handleAIPersonaChange(persona.id, checked as boolean)
                                            }
                                        />
                                        <div className="cursor-pointer">
                                            <Label
                                                htmlFor={`ai-persona-${persona.id}`}
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                {persona.name}
                                            </Label>
                                            <p className="text-xs text-gray-500">{persona.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || dataLoading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 