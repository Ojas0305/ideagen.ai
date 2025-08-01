'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Lightbulb } from 'lucide-react'

interface NewIdeaModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onIdeaCreated?: (ideaId?: string) => void
}

interface IdeaFormData {
    title: string
    description: string
    problem: string
    solution: string
    market_opportunity: string
    target_audience: string
    implementation: string
    category: string
}

const CATEGORIES = [
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
    'Sustainability',
    'AI/ML',
    'Community',
    'Other'
]

export function NewIdeaModal({ open, onOpenChange, onIdeaCreated }: NewIdeaModalProps) {
    const [loading, setLoading] = useState(false)
    const [evaluating, setEvaluating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<IdeaFormData>({
        title: '',
        description: '',
        problem: '',
        solution: '',
        market_opportunity: '',
        target_audience: '',
        implementation: '',
        category: 'Technology'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate required fields
            if (!formData.title.trim()) {
                throw new Error('Title is required')
            }
            if (!formData.description.trim()) {
                throw new Error('Description is required')
            }
            if (!formData.problem.trim()) {
                throw new Error('Problem statement is required')
            }
            if (!formData.solution.trim()) {
                throw new Error('Solution is required')
            }

            // Create the idea
            const createResponse = await fetch('/api/create-detailed-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!createResponse.ok) {
                const errorData = await createResponse.json()
                throw new Error(errorData.error?.message || 'Failed to create idea')
            }

            const createdIdea = await createResponse.json()
            console.log('Idea created:', createdIdea)

            // Reset form
            setFormData({
                title: '',
                description: '',
                problem: '',
                solution: '',
                market_opportunity: '',
                target_audience: '',
                implementation: '',
                category: 'Technology'
            })

            // Close modal and notify parent immediately after idea creation
            onOpenChange(false)
            onIdeaCreated?.(createdIdea.idea.id)

            // Trigger AI evaluation asynchronously in the background (fire and forget)
            fetch('/api/test-ai-evaluation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idea_id: createdIdea.idea.id }),
            }).then(response => {
                if (response.ok) {
                    console.log('AI evaluation completed successfully for idea:', createdIdea.idea.id)
                } else {
                    console.warn('AI evaluation failed for idea:', createdIdea.idea.id)
                }
            }).catch(error => {
                console.warn('AI evaluation error for idea:', createdIdea.idea.id, error)
            })

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
            setEvaluating(false)
        }
    }

    const handleInputChange = (field: keyof IdeaFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span>Create New Idea</span>
                    </DialogTitle>
                    <DialogDescription>
                        Describe your innovative idea in detail. It will be automatically evaluated by AI once created.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                            <Label htmlFor="title">Idea Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., AI-Powered Smart City Traffic Management System"
                                required
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <Label htmlFor="description">Brief Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Provide a concise overview of your idea..."
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleInputChange('category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
                        
                        <div>
                            <Label htmlFor="problem">Problem Statement *</Label>
                            <Textarea
                                id="problem"
                                value={formData.problem}
                                onChange={(e) => handleInputChange('problem', e.target.value)}
                                placeholder="What specific problem does your idea solve? Include pain points, market gaps, or inefficiencies..."
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="solution">Proposed Solution *</Label>
                            <Textarea
                                id="solution"
                                value={formData.solution}
                                onChange={(e) => handleInputChange('solution', e.target.value)}
                                placeholder="How does your idea solve the problem? What makes it unique or innovative..."
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="market_opportunity">Market Opportunity</Label>
                            <Textarea
                                id="market_opportunity"
                                value={formData.market_opportunity}
                                onChange={(e) => handleInputChange('market_opportunity', e.target.value)}
                                placeholder="What is the market size, growth potential, and opportunity for this idea..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="target_audience">Target Audience</Label>
                            <Textarea
                                id="target_audience"
                                value={formData.target_audience}
                                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                                placeholder="Who are the primary users or customers for this idea..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="implementation">Implementation Strategy</Label>
                            <Textarea
                                id="implementation"
                                value={formData.implementation}
                                onChange={(e) => handleInputChange('implementation', e.target.value)}
                                placeholder="How would you implement this idea? What resources, partnerships, or technologies are needed..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || evaluating}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Idea...
                                </>
                            ) : evaluating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Evaluating with AI...
                                </>
                            ) : (
                                'Create & Evaluate Idea'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 