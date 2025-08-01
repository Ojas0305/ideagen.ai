'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Brain, Settings, Users, MoreHorizontal, Star, Zap } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

interface AIPersona {
    id: string
    name: string
    role: string
    system_prompt: string
    expertise: string[]
    thinking_style: 'creative' | 'analytical' | 'critical' | 'practical' | 'balanced'
    personality: 'optimistic' | 'realistic' | 'cautious' | 'neutral'
    configuration: any
    is_default: boolean
    created_at: string
    updated_at: string
}

interface PersonaFormData {
    name: string
    role: string
    system_prompt: string
    expertise: string[]
    thinking_style: string
    personality: string
    is_default: boolean
}

export default function AIPersonasPage() {
    const [personas, setPersonas] = useState<AIPersona[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)
    const [formData, setFormData] = useState<PersonaFormData>({
        name: '',
        role: '',
        system_prompt: '',
        expertise: [],
        thinking_style: 'balanced',
        personality: 'neutral',
        is_default: false
    })
    const [submitting, setSubmitting] = useState(false)

    // Fetch personas from API
    const fetchPersonas = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch('/api/ai-personas')
            
            if (!response.ok) {
                throw new Error('Failed to fetch AI personas')
            }
            
            const data = await response.json()
            setPersonas(data.personas || [])
        } catch (err) {
            console.error('Error fetching personas:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch personas')
        } finally {
            setLoading(false)
        }
    }

    // Create new persona
    const createPersona = async () => {
        try {
            setSubmitting(true)
            
            const response = await fetch('/api/ai-personas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to create persona')
            }
            
            await fetchPersonas()
            setShowCreateModal(false)
            resetForm()
        } catch (err) {
            console.error('Error creating persona:', err)
            setError(err instanceof Error ? err.message : 'Failed to create persona')
        } finally {
            setSubmitting(false)
        }
    }

    // Update existing persona
    const updatePersona = async () => {
        if (!selectedPersona) return
        
        try {
            setSubmitting(true)
            
            const response = await fetch(`/api/ai-personas?id=${selectedPersona.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to update persona')
            }
            
            await fetchPersonas()
            setShowEditModal(false)
            setSelectedPersona(null)
            resetForm()
        } catch (err) {
            console.error('Error updating persona:', err)
            setError(err instanceof Error ? err.message : 'Failed to update persona')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete persona
    const deletePersona = async () => {
        if (!selectedPersona) return
        
        try {
            setSubmitting(true)
            
            const response = await fetch(`/api/ai-personas?id=${selectedPersona.id}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to delete persona')
            }
            
            await fetchPersonas()
            setShowDeleteModal(false)
            setSelectedPersona(null)
        } catch (err) {
            console.error('Error deleting persona:', err)
            setError(err instanceof Error ? err.message : 'Failed to delete persona')
        } finally {
            setSubmitting(false)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            system_prompt: '',
            expertise: [],
            thinking_style: 'balanced',
            personality: 'neutral',
            is_default: false
        })
    }

    // Open edit modal
    const openEditModal = (persona: AIPersona) => {
        setSelectedPersona(persona)
        setFormData({
            name: persona.name,
            role: persona.role,
            system_prompt: persona.system_prompt,
            expertise: persona.expertise,
            thinking_style: persona.thinking_style,
            personality: persona.personality,
            is_default: persona.is_default
        })
        setShowEditModal(true)
    }

    // Open delete modal
    const openDeleteModal = (persona: AIPersona) => {
        setSelectedPersona(persona)
        setShowDeleteModal(true)
    }

    // Filter personas by search term
    const filteredPersonas = searchTerm
        ? personas.filter(persona =>
            persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            persona.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            persona.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : personas

    // Get thinking style color
    const getThinkingStyleColor = (style: string) => {
        const colors = {
            creative: 'bg-purple-100 text-purple-800',
            analytical: 'bg-blue-100 text-blue-800',
            critical: 'bg-red-100 text-red-800',
            practical: 'bg-green-100 text-green-800',
            balanced: 'bg-gray-100 text-gray-800'
        }
        return colors[style as keyof typeof colors] || colors.balanced
    }

    // Get personality color
    const getPersonalityColor = (personality: string) => {
        const colors = {
            optimistic: 'bg-yellow-100 text-yellow-800',
            realistic: 'bg-blue-100 text-blue-800',
            cautious: 'bg-orange-100 text-orange-800',
            neutral: 'bg-gray-100 text-gray-800'
        }
        return colors[personality as keyof typeof colors] || colors.neutral
    }

    // Fetch personas on component mount
    useEffect(() => {
        fetchPersonas()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Personas</h1>
                    <p className="text-gray-600">Configure and manage AI thinking styles for idea generation</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Persona
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search personas by name, role, or expertise..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading AI personas...</p>
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
                                    <h3 className="text-lg font-medium mb-2">Error Loading Personas</h3>
                                    <p>{error}</p>
                                </div>
                                <Button onClick={fetchPersonas} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Personas Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPersonas.map((persona) => (
                            <Card key={persona.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Brain className="h-4 w-4 text-blue-600" />
                                            <CardTitle className="text-lg">{persona.name}</CardTitle>
                                            {persona.is_default && (
                                                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                            )}
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {persona.role}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(persona)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Persona
                                            </DropdownMenuItem>
                                            {!persona.is_default && (
                                                <DropdownMenuItem 
                                                    onClick={() => openDeleteModal(persona)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge className={getThinkingStyleColor(persona.thinking_style)}>
                                                {persona.thinking_style}
                                            </Badge>
                                            <Badge className={getPersonalityColor(persona.personality)}>
                                                {persona.personality}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">Expertise:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {persona.expertise.slice(0, 3).map((exp, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {exp.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                                {persona.expertise.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{persona.expertise.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs text-gray-500">
                                            Created: {new Date(persona.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredPersonas.length === 0 && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center">
                                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'No personas found' : 'No AI personas yet'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm 
                                        ? 'Try adjusting your search terms.'
                                        : 'Create your first AI persona to get started with intelligent idea generation.'}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={() => setShowCreateModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Persona
                                    </Button>
                                )}
                            </div>
                    </CardContent>
                </Card>
                )}
            </div>

            {/* Create Persona Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New AI Persona</DialogTitle>
                        <DialogDescription>
                            Define a new AI personality with specific thinking styles and expertise
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., The Innovator"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    placeholder="e.g., Strategic technology advisor"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="system_prompt">System Prompt</Label>
                            <Textarea
                                id="system_prompt"
                                placeholder="Describe how this AI persona should think and behave..."
                                value={formData.system_prompt}
                                onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                                className="min-h-[100px]"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="thinking_style">Thinking Style</Label>
                                <Select 
                                    value={formData.thinking_style} 
                                    onValueChange={(value) => setFormData({...formData, thinking_style: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="creative">Creative</SelectItem>
                                        <SelectItem value="analytical">Analytical</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="practical">Practical</SelectItem>
                                        <SelectItem value="balanced">Balanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personality">Personality</Label>
                                <Select 
                                    value={formData.personality} 
                                    onValueChange={(value) => setFormData({...formData, personality: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="optimistic">Optimistic</SelectItem>
                                        <SelectItem value="realistic">Realistic</SelectItem>
                                        <SelectItem value="cautious">Cautious</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="expertise">Expertise Areas (comma-separated)</Label>
                            <Input
                                id="expertise"
                                placeholder="e.g., machine_learning, user_experience, market_analysis"
                                value={formData.expertise.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData, 
                                    expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_default"
                                checked={formData.is_default}
                                onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                            />
                            <Label htmlFor="is_default">Default persona (always included in sessions)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={createPersona} disabled={submitting || !formData.name || !formData.role || !formData.system_prompt}>
                            {submitting ? 'Creating...' : 'Create Persona'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Persona Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit AI Persona</DialogTitle>
                        <DialogDescription>
                            Modify the AI personality settings and configuration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_name">Name</Label>
                                <Input
                                    id="edit_name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_role">Role</Label>
                                <Input
                                    id="edit_role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit_system_prompt">System Prompt</Label>
                            <Textarea
                                id="edit_system_prompt"
                                value={formData.system_prompt}
                                onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                                className="min-h-[100px]"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_thinking_style">Thinking Style</Label>
                                <Select 
                                    value={formData.thinking_style} 
                                    onValueChange={(value) => setFormData({...formData, thinking_style: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="creative">Creative</SelectItem>
                                        <SelectItem value="analytical">Analytical</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="practical">Practical</SelectItem>
                                        <SelectItem value="balanced">Balanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_personality">Personality</Label>
                                <Select 
                                    value={formData.personality} 
                                    onValueChange={(value) => setFormData({...formData, personality: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="optimistic">Optimistic</SelectItem>
                                        <SelectItem value="realistic">Realistic</SelectItem>
                                        <SelectItem value="cautious">Cautious</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit_expertise">Expertise Areas (comma-separated)</Label>
                            <Input
                                id="edit_expertise"
                                value={formData.expertise.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData, 
                                    expertise: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit_is_default"
                                checked={formData.is_default}
                                onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                            />
                            <Label htmlFor="edit_is_default">Default persona (always included in sessions)</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={updatePersona} disabled={submitting || !formData.name || !formData.role || !formData.system_prompt}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete AI Persona</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedPersona?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={deletePersona} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Persona'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
} 