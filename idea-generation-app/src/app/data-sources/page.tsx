'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataSource } from '@/lib/types'
import { Plus, Search, Settings, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface DataSourceFormData {
    name: string
    type: DataSource['type']
    api_endpoint?: string
    credentials?: Record<string, any>
    configuration?: Record<string, any>
}

export default function DataSourcesPage() {
    const [dataSources, setDataSources] = useState<DataSource[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showTestModal, setShowTestModal] = useState(false)
    const [showCustomTestModal, setShowCustomTestModal] = useState(false)
    const [customTestParams, setCustomTestParams] = useState({
        industry: 'technology',
        keywords: 'AI,startup'
    })
    const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [testing, setTesting] = useState<string | null>(null)
    const [testResults, setTestResults] = useState<any>(null)
    const [liveTestResults, setLiveTestResults] = useState<any>(null)
    const [runningLiveTest, setRunningLiveTest] = useState(false)
    const [formData, setFormData] = useState<DataSourceFormData>({
        name: '',
        type: 'market_research',
        api_endpoint: '',
        credentials: {},
        configuration: {}
    })

    // Fetch data sources
    const fetchDataSources = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch('/api/data-sources')
            
            if (!response.ok) {
                throw new Error('Failed to fetch data sources')
            }
            
            const data = await response.json()
            setDataSources(data.dataSources || [])
        } catch (err) {
            console.error('Error fetching data sources:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch data sources')
        } finally {
            setLoading(false)
        }
    }

    // Create new data source
    const createDataSource = async () => {
        try {
            setSubmitting(true)
            
            const response = await fetch('/api/data-sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to create data source')
            }
            
            await fetchDataSources()
            setShowAddModal(false)
            resetForm()
        } catch (err) {
            console.error('Error creating data source:', err)
            setError(err instanceof Error ? err.message : 'Failed to create data source')
        } finally {
            setSubmitting(false)
        }
    }

    // Update data source
    const updateDataSource = async () => {
        if (!selectedDataSource) return
        
        try {
            setSubmitting(true)
            
            const response = await fetch(`/api/data-sources?id=${selectedDataSource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to update data source')
            }
            
            await fetchDataSources()
            setShowEditModal(false)
            setSelectedDataSource(null)
            resetForm()
        } catch (err) {
            console.error('Error updating data source:', err)
            setError(err instanceof Error ? err.message : 'Failed to update data source')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete data source
    const deleteDataSource = async () => {
        if (!selectedDataSource) return
        
        try {
            setSubmitting(true)
            
            const response = await fetch(`/api/data-sources?id=${selectedDataSource.id}`, {
                method: 'DELETE'
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Failed to delete data source')
            }
            
            await fetchDataSources()
            setShowDeleteModal(false)
            setSelectedDataSource(null)
        } catch (err) {
            console.error('Error deleting data source:', err)
            setError(err instanceof Error ? err.message : 'Failed to delete data source')
        } finally {
            setSubmitting(false)
        }
    }

    // Test connection
    const testConnection = async (dataSourceId: string) => {
        try {
            setTesting(dataSourceId)
            
            // Simulate API call to test connection
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Update status in UI (simulate successful connection)
            setDataSources(prev => prev.map(ds => 
                ds.id === dataSourceId 
                    ? { ...ds, status: 'connected', last_sync: new Date().toISOString() }
                    : ds
            ))
        } catch (err) {
            console.error('Error testing connection:', err)
            setError('Failed to test connection')
        } finally {
            setTesting(null)
        }
    }

    // Test live data from our working API endpoints
    const testLiveData = async () => {
        try {
            setRunningLiveTest(true)
            setError(null)
            
            // Test with our working API
            const response = await fetch('/api/data-sources?action=test&industry=technology&keywords=AI,startup')
            
            if (!response.ok) {
                throw new Error('Failed to fetch live data')
            }
            
            const data = await response.json()
            setLiveTestResults(data)
            setShowTestModal(true)
        } catch (err) {
            console.error('Error testing live data:', err)
            setError(err instanceof Error ? err.message : 'Failed to test live data')
        } finally {
            setRunningLiveTest(false)
        }
    }

    // Test live data with custom parameters
    const testCustomData = async () => {
        try {
            setRunningLiveTest(true)
            setError(null)
            
            // Test with custom parameters
            const params = new URLSearchParams({
                action: 'test',
                industry: customTestParams.industry,
                keywords: customTestParams.keywords
            })
            
            const response = await fetch(`/api/data-sources?${params}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch live data')
            }
            
            const data = await response.json()
            setLiveTestResults(data)
            setShowCustomTestModal(false)
            setShowTestModal(true)
        } catch (err) {
            console.error('Error testing custom data:', err)
            setError(err instanceof Error ? err.message : 'Failed to test custom data')
        } finally {
            setRunningLiveTest(false)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            type: 'market_research',
            api_endpoint: '',
            credentials: {},
            configuration: {}
        })
    }

    // Open edit modal
    const openEditModal = (dataSource: DataSource) => {
        setSelectedDataSource(dataSource)
        setFormData({
            name: dataSource.name,
            type: dataSource.type,
            api_endpoint: dataSource.api_endpoint || '',
            credentials: dataSource.credentials || {},
            configuration: dataSource.configuration || {}
        })
        setShowEditModal(true)
    }

    // Open delete modal
    const openDeleteModal = (dataSource: DataSource) => {
        setSelectedDataSource(dataSource)
        setShowDeleteModal(true)
    }

    // Filter data sources by search term
    const filteredDataSources = searchTerm
        ? dataSources.filter(ds =>
            ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.type.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : dataSources

    // Get status icon and color
    const getStatusBadge = (status: DataSource['status']) => {
        const configs = {
            connected: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Connected' },
            disconnected: { icon: XCircle, color: 'bg-gray-100 text-gray-800', text: 'Disconnected' },
            error: { icon: AlertCircle, color: 'bg-red-100 text-red-800', text: 'Error' },
            syncing: { icon: Clock, color: 'bg-blue-100 text-blue-800', text: 'Syncing' }
        }
        
        const config = configs[status] || configs.disconnected
        const IconComponent = config.icon
        
        return (
            <Badge className={config.color}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.text}
            </Badge>
        )
    }

    // Get type display name
    const getTypeDisplayName = (type: DataSource['type']) => {
        const names = {
            market_research: 'Market Research',
            social_media: 'Social Media',
            competitor_analysis: 'Competitor Analysis',
            industry_reports: 'Industry Reports',
            custom_api: 'Custom API'
        }
        return names[type] || type
    }

    // Format last sync time
    const formatLastSync = (lastSync?: string) => {
        if (!lastSync) return 'Never'
        
        const date = new Date(lastSync)
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        
        if (diffMinutes < 60) return `${diffMinutes} min ago`
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
        return date.toLocaleDateString()
    }

    // Fetch data sources on component mount
    useEffect(() => {
        fetchDataSources()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
                    <p className="text-gray-600">Manage external data connections and integrations</p>
                    </div>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Data Source
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Data Source</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Google Trends API"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value: DataSource['type']) => 
                                        setFormData(prev => ({ ...prev, type: value }))
                                    }>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="market_research">Market Research</SelectItem>
                                            <SelectItem value="social_media">Social Media</SelectItem>
                                            <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                                            <SelectItem value="industry_reports">Industry Reports</SelectItem>
                                            <SelectItem value="custom_api">Custom API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="api_endpoint">API Endpoint</Label>
                                    <Input
                                        id="api_endpoint"
                                        value={formData.api_endpoint}
                                        onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
                                        placeholder="https://api.example.com/v1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="credentials">API Key / Credentials</Label>
                                    <Textarea
                                        id="credentials"
                                        value={JSON.stringify(formData.credentials, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value)
                                                setFormData(prev => ({ ...prev, credentials: parsed }))
                                            } catch {
                                                // Invalid JSON, keep current value
                                            }
                                        }}
                                        placeholder='{"api_key": "your-api-key"}'
                                        rows={3}
                                    />
                                </div>

                                {error && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAddModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={createDataSource} disabled={submitting}>
                                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Create
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search data sources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button 
                        onClick={testLiveData} 
                        disabled={runningLiveTest}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {runningLiveTest ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Test Live Data
                    </Button>
                    <Dialog open={showCustomTestModal} onOpenChange={setShowCustomTestModal}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline"
                                disabled={runningLiveTest}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Custom Test
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Test Custom Research Topic</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="test-industry">Industry</Label>
                                    <Select 
                                        value={customTestParams.industry} 
                                        onValueChange={(value) => 
                                            setCustomTestParams(prev => ({ ...prev, industry: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="energy">Energy</SelectItem>
                                            <SelectItem value="agriculture">Agriculture</SelectItem>
                                            <SelectItem value="entertainment">Entertainment</SelectItem>
                                            <SelectItem value="transportation">Transportation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="test-keywords">Keywords (comma-separated)</Label>
                                    <Input
                                        id="test-keywords"
                                        value={customTestParams.keywords}
                                        onChange={(e) => 
                                            setCustomTestParams(prev => ({ ...prev, keywords: e.target.value }))
                                        }
                                        placeholder="e.g., sustainable, innovation, mobile"
                                    />
                                </div>
                                
                                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                                    <strong>This will research:</strong> {customTestParams.industry} industry 
                                    with focus on {customTestParams.keywords.split(',').map(k => k.trim()).join(', ')}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowCustomTestModal(false)}
                                        disabled={runningLiveTest}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={testCustomData} disabled={runningLiveTest}>
                                        {runningLiveTest && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Test Research
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={fetchDataSources} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Data Sources Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading data sources...</span>
                    </div>
                ) : error ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : filteredDataSources.length === 0 ? (
                <Card>
                        <CardContent className="py-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Settings className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Sources</h3>
                            <p className="text-gray-600 mb-4">
                                Get started by adding your first data source connection.
                            </p>
                            <Button onClick={() => setShowAddModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Data Source
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDataSources.map((dataSource) => (
                            <Card key={dataSource.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{getTypeDisplayName(dataSource.type)}</p>
                                        </div>
                                        {getStatusBadge(dataSource.status)}
                                    </div>
                    </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Sync:</span>
                                            <span>{formatLastSync(dataSource.last_sync)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Records:</span>
                                            <span>{dataSource.records_collected?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Quality:</span>
                                            <span>{dataSource.data_quality || 0}%</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => testConnection(dataSource.id)}
                                            disabled={testing === dataSource.id}
                                            className="flex-1"
                                        >
                                            {testing === dataSource.id ? (
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-3 w-3 mr-1" />
                                            )}
                                            Test
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(dataSource)}
                                        >
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDeleteModal(dataSource)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                    </CardContent>
                </Card>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Data Source</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value: DataSource['type']) => 
                                    setFormData(prev => ({ ...prev, type: value }))
                                }>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="market_research">Market Research</SelectItem>
                                        <SelectItem value="social_media">Social Media</SelectItem>
                                        <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                                        <SelectItem value="industry_reports">Industry Reports</SelectItem>
                                        <SelectItem value="custom_api">Custom API</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-api_endpoint">API Endpoint</Label>
                                <Input
                                    id="edit-api_endpoint"
                                    value={formData.api_endpoint}
                                    onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-credentials">API Key / Credentials</Label>
                                <Textarea
                                    id="edit-credentials"
                                    value={JSON.stringify(formData.credentials, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value)
                                            setFormData(prev => ({ ...prev, credentials: parsed }))
                                        } catch {
                                            // Invalid JSON, keep current value
                                        }
                                    }}
                                    rows={3}
                                />
                            </div>

                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowEditModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={updateDataSource} disabled={submitting}>
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Update
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Data Source</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Are you sure you want to delete "{selectedDataSource?.name}"? This action cannot be undone.
                            </p>

                            {error && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={deleteDataSource} 
                                    disabled={submitting}
                                >
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Live Data Test Results Modal */}
                <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Live Data Test Results</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            {liveTestResults && (
                                <>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {liveTestResults.data?.summary?.total_insights || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Insights</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {liveTestResults.data?.summary?.source_breakdown?.news || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">News Articles</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {liveTestResults.data?.summary?.source_breakdown?.market_research || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Market Data</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {liveTestResults.data?.summary?.source_breakdown?.social_media || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Social Media</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Processing Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Processing Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Processing Time:</span>
                                                <span className="ml-2 font-medium">
                                                    {liveTestResults.data?.processing_time_ms || 0}ms
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Average Relevance:</span>
                                                <span className="ml-2 font-medium">
                                                    {(liveTestResults.data?.summary?.average_relevance * 100 || 0).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Sources Used:</span>
                                                <span className="ml-2 font-medium">
                                                    {liveTestResults.data?.sources_used?.length || 0}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Timestamp:</span>
                                                <span className="ml-2 font-medium">
                                                    {new Date(liveTestResults.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sample Insights */}
                                    {liveTestResults.data?.insights && liveTestResults.data.insights.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3">Sample Insights (First 3)</h3>
                                            <div className="space-y-3">
                                                {liveTestResults.data.insights.slice(0, 3).map((insight: any, index: number) => (
                                                    <Card key={index}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <Badge 
                                                                    variant="outline"
                                                                    className={
                                                                        insight.type === 'news' ? 'border-blue-200 bg-blue-50' :
                                                                        insight.type === 'market_research' ? 'border-purple-200 bg-purple-50' :
                                                                        insight.type === 'social_media' ? 'border-orange-200 bg-orange-50' :
                                                                        'border-gray-200 bg-gray-50'
                                                                    }
                                                                >
                                                                    {insight.type?.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                                <span className="text-sm text-gray-500">
                                                                    Score: {(insight.relevanceScore * 100 || 0).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                            <h4 className="font-medium mb-1">
                                                                {insight.title || insight.content?.substring(0, 100) + '...' || 'Insight'}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {insight.summary || insight.description || insight.content?.substring(0, 200) + '...' || 'No description available'}
                                                            </p>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <span>Source: {insight.source || 'Unknown'}</span>
                                                                {insight.url && insight.url !== '#' && (
                                                                    <>
                                                                        <span className="mx-2">•</span>
                                                                        <a 
                                                                            href={insight.url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            View Source
                                                                        </a>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sources Status */}
                                    {liveTestResults.data?.sources_used && (
                                        <div>
                                            <h3 className="font-medium mb-3">Data Sources Status</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {liveTestResults.data.sources_used.map((source: string, index: number) => (
                                                    <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                                        <span className="text-sm font-medium">{source}</span>
                                                        <Badge className="ml-auto bg-green-100 text-green-800">Active</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end">
                                <Button onClick={() => setShowTestModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
} 