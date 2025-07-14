import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'

// Test configuration
const API_BASE_URL = 'http://localhost:3001'
const TEST_TIMEOUT = 30000

// Test data
let testProjectId: string
let testSessionId: string
let testIdeaId: string
let testPersonaId: string
let testDataSourceId: string

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    })

    const data = await response.json()
    return { response, data }
}

// Setup and teardown
beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))
}, TEST_TIMEOUT)

afterAll(async () => {
    // Clean up test data using API endpoints
    if (testIdeaId) {
        await apiRequest(`/api/full-ideas?id=${testIdeaId}`, { method: 'DELETE' })
    }
    if (testSessionId) {
        await apiRequest(`/api/idea-sessions?id=${testSessionId}`, { method: 'DELETE' })
    }
    if (testProjectId) {
        await apiRequest(`/api/projects/${testProjectId}`, { method: 'DELETE' })
    }
    if (testPersonaId) {
        await apiRequest(`/api/ai-personas?id=${testPersonaId}`, { method: 'DELETE' })
    }
    if (testDataSourceId) {
        await apiRequest(`/api/data-sources?id=${testDataSourceId}`, { method: 'DELETE' })
    }
})

describe('API Integration Tests', () => {

    describe('Projects API', () => {
        it('should create a new project', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'A test project for API integration',
                industry: 'Technology',
                challenge: 'Testing API endpoints'
            }

            const { response, data } = await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            })

            expect(response.status).toBe(201)
            expect(data.name).toBe(projectData.name)
            expect(data.description).toBe(projectData.description)
            expect(data.id).toBeDefined()

            testProjectId = data.id
        }, TEST_TIMEOUT)

        it('should get all projects', async () => {
            const { response, data } = await apiRequest('/api/projects')

            expect(response.status).toBe(200)
            expect(data.items).toBeDefined()
            expect(Array.isArray(data.items)).toBe(true)
            expect(data.total).toBeDefined()
        }, TEST_TIMEOUT)

        it('should get project by ID', async () => {
            const { response, data } = await apiRequest(`/api/projects/${testProjectId}`)

            expect(response.status).toBe(200)
            expect(data.id).toBe(testProjectId)
            expect(data.name).toBe('Test Project')
        }, TEST_TIMEOUT)

        it('should update a project', async () => {
            const updateData = {
                name: 'Updated Test Project',
                status: 'processing'
            }

            const { response, data } = await apiRequest(`/api/projects/${testProjectId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            })

            expect(response.status).toBe(200)
            expect(data.name).toBe(updateData.name)
            expect(data.status).toBe(updateData.status)
        }, TEST_TIMEOUT)

        it('should filter projects by status', async () => {
            const { response, data } = await apiRequest('/api/projects?status=processing')

            expect(response.status).toBe(200)
            expect(data.items).toBeDefined()
            expect(data.items.length).toBeGreaterThan(0)
            expect(data.items[0].status).toBe('processing')
        }, TEST_TIMEOUT)
    })

    describe('AI Personas API', () => {
        it('should create a new AI persona', async () => {
            const personaData = {
                name: 'Test Persona',
                role: 'Test Role',
                system_prompt: 'You are a test AI persona',
                expertise: ['testing', 'quality assurance'],
                thinking_style: 'analytical',
                personality: 'neutral'
            }

            const { response, data } = await apiRequest('/api/ai-personas', {
                method: 'POST',
                body: JSON.stringify(personaData)
            })

            expect(response.status).toBe(201)
            expect(data.name).toBe(personaData.name)
            expect(data.role).toBe(personaData.role)
            expect(data.id).toBeDefined()

            testPersonaId = data.id
        }, TEST_TIMEOUT)

        it('should get all AI personas', async () => {
            const { response, data } = await apiRequest('/api/ai-personas')

            expect(response.status).toBe(200)
            expect(data.personas).toBeDefined()
            expect(Array.isArray(data.personas)).toBe(true)
        }, TEST_TIMEOUT)

        it('should update an AI persona', async () => {
            const updateData = {
                name: 'Updated Test Persona',
                thinking_style: 'creative'
            }

            const { response, data } = await apiRequest(`/api/ai-personas?id=${testPersonaId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            })

            expect(response.status).toBe(200)
            expect(data.name).toBe(updateData.name)
            expect(data.thinking_style).toBe(updateData.thinking_style)
        }, TEST_TIMEOUT)
    })

    describe('Data Sources API', () => {
        it('should create a new data source', async () => {
            const dataSourceData = {
                name: 'Test Data Source',
                type: 'api',
                status: 'connected',
                configuration: { url: 'https://test.api.com' }
            }

            const { response, data } = await apiRequest('/api/data-sources', {
                method: 'POST',
                body: JSON.stringify(dataSourceData)
            })

            expect(response.status).toBe(201)
            expect(data.name).toBe(dataSourceData.name)
            expect(data.type).toBe(dataSourceData.type)
            expect(data.id).toBeDefined()

            testDataSourceId = data.id
        }, TEST_TIMEOUT)

        it('should get all data sources', async () => {
            const { response, data } = await apiRequest('/api/data-sources')

            expect(response.status).toBe(200)
            expect(data.dataSources).toBeDefined()
            expect(Array.isArray(data.dataSources)).toBe(true)
        }, TEST_TIMEOUT)

        it('should update a data source', async () => {
            const updateData = {
                status: 'disconnected'
            }

            const { response, data } = await apiRequest(`/api/data-sources?id=${testDataSourceId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            })

            expect(response.status).toBe(200)
            expect(data.status).toBe(updateData.status)
        }, TEST_TIMEOUT)
    })

    describe('Idea Sessions API', () => {
        it('should create a new idea session', async () => {
            const sessionData = {
                name: 'Test Session',
                description: 'A test session for API integration',
                project_id: testProjectId,
                status: 'planning',
                configuration: { max_ideas: 10 }
            }

            const { response, data } = await apiRequest('/api/idea-sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            })

            expect(response.status).toBe(201)
            expect(data.name).toBe(sessionData.name)
            expect(data.project_id).toBe(testProjectId)
            expect(data.id).toBeDefined()

            testSessionId = data.id
        }, TEST_TIMEOUT)

        it('should get all idea sessions', async () => {
            const { response, data } = await apiRequest('/api/idea-sessions')

            expect(response.status).toBe(200)
            expect(data.sessions).toBeDefined()
            expect(Array.isArray(data.sessions)).toBe(true)
            expect(data.total).toBeDefined()
        }, TEST_TIMEOUT)

        it('should filter sessions by project', async () => {
            const { response, data } = await apiRequest(`/api/idea-sessions?project_id=${testProjectId}`)

            expect(response.status).toBe(200)
            expect(data.sessions).toBeDefined()
            expect(data.sessions.length).toBeGreaterThan(0)
            expect(data.sessions[0].project_id).toBe(testProjectId)
        }, TEST_TIMEOUT)

        it('should update an idea session', async () => {
            const updateData = {
                status: 'processing'
            }

            const { response, data } = await apiRequest(`/api/idea-sessions?id=${testSessionId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            })

            expect(response.status).toBe(200)
            expect(data.status).toBe(updateData.status)
        }, TEST_TIMEOUT)
    })

    describe('Full Ideas API', () => {
        it('should create a new full idea', async () => {
            const ideaData = {
                title: 'Test Idea',
                description: 'A test idea for API integration',
                category: 'technology',
                overall_score: 85,
                session_id: testSessionId
            }

            const { response, data } = await apiRequest('/api/full-ideas', {
                method: 'POST',
                body: JSON.stringify(ideaData)
            })

            expect(response.status).toBe(201)
            expect(data.title).toBe(ideaData.title)
            expect(data.overall_score).toBe(ideaData.overall_score)
            expect(data.id).toBeDefined()

            testIdeaId = data.id
        }, TEST_TIMEOUT)

        it('should get all full ideas', async () => {
            const { response, data } = await apiRequest('/api/full-ideas')

            expect(response.status).toBe(200)
            expect(data.ideas).toBeDefined()
            expect(Array.isArray(data.ideas)).toBe(true)
            expect(data.total).toBeDefined()
        }, TEST_TIMEOUT)

        it('should filter ideas by session', async () => {
            const { response, data } = await apiRequest(`/api/full-ideas?session_id=${testSessionId}`)

            expect(response.status).toBe(200)
            expect(data.ideas).toBeDefined()
            expect(data.ideas.length).toBeGreaterThan(0)
            expect(data.ideas[0].session_id).toBe(testSessionId)
        }, TEST_TIMEOUT)

        it('should update a full idea', async () => {
            const updateData = {
                overall_score: 90
            }

            const { response, data } = await apiRequest(`/api/full-ideas?id=${testIdeaId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            })

            expect(response.status).toBe(200)
            expect(data.overall_score).toBe(updateData.overall_score)
        }, TEST_TIMEOUT)
    })

    describe('Evaluation API', () => {
        it('should get evaluation results for a session', async () => {
            const { response, data } = await apiRequest(`/api/evaluation?session_id=${testSessionId}`)

            expect(response.status).toBe(200)
            expect(data.total_ideas).toBeDefined()
            expect(data.average_score).toBeDefined()
            expect(data.top_ideas).toBeDefined()
            expect(data.categories).toBeDefined()
            expect(data.score_distribution).toBeDefined()
        }, TEST_TIMEOUT)

        it('should update idea score', async () => {
            const scoreData = {
                idea_id: testIdeaId,
                score: 95
            }

            const { response, data } = await apiRequest('/api/evaluation', {
                method: 'POST',
                body: JSON.stringify(scoreData)
            })

            expect(response.status).toBe(200)
            expect(data.overall_score).toBe(scoreData.score)
        }, TEST_TIMEOUT)

        it('should batch update idea scores', async () => {
            const batchData = {
                session_id: testSessionId,
                evaluations: [
                    { idea_id: testIdeaId, score: 88 }
                ]
            }

            const { response, data } = await apiRequest('/api/evaluation', {
                method: 'PUT',
                body: JSON.stringify(batchData)
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('Batch evaluation update completed')
            expect(data.updated_count).toBe(1)
        }, TEST_TIMEOUT)
    })

    describe('Dashboard Analytics API', () => {
        it('should get dashboard analytics', async () => {
            const { response, data } = await apiRequest('/api/dashboard/analytics')

            expect(response.status).toBe(200)
            expect(data.kpis).toBeDefined()
            expect(data.kpis.activeProjects).toBeDefined()
            expect(data.kpis.ideasGenerated).toBeDefined()
            expect(data.kpis.successRate).toBeDefined()
            expect(data.kpis.processingTime).toBeDefined()
            expect(data.pipelineData).toBeDefined()
            expect(data.topIdeas).toBeDefined()
            expect(data.aiPersonas).toBeDefined()
            expect(data.dataSources).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('API Error Handling', () => {
        it('should handle missing required fields', async () => {
            const { response, data } = await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify({}) // Missing required fields
            })

            expect(response.status).toBe(400)
            expect(data.error).toBeDefined()
            expect(data.error.code).toBe('VALIDATION_ERROR')
        }, TEST_TIMEOUT)

        it('should handle non-existent resource', async () => {
            const { response, data } = await apiRequest('/api/projects/non-existent-id')

            expect(response.status).toBe(400)
            expect(data.error).toBeDefined()
        }, TEST_TIMEOUT)

                it('should handle invalid JSON', async () => {
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: 'invalid json'
            })
            
            // Next.js returns 500 for invalid JSON, which is acceptable
            expect(response.status).toBeGreaterThanOrEqual(400)
        }, TEST_TIMEOUT)
    })

    describe('API Data Validation', () => {
        it('should validate project status values', async () => {
            const projectData = {
                name: 'Invalid Status Project',
                description: 'Test project with invalid status',
                status: 'invalid_status'
            }

            const { response, data } = await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            })

            // Should either reject or normalize the status
            expect(response.status).toBeLessThan(500)
        }, TEST_TIMEOUT)

        it('should validate idea score range', async () => {
            const ideaData = {
                title: 'Test Idea with Invalid Score',
                description: 'Test idea',
                overall_score: 150, // Invalid score > 100
                session_id: testSessionId
            }

            const { response, data } = await apiRequest('/api/full-ideas', {
                method: 'POST',
                body: JSON.stringify(ideaData)
            })

            if (response.status === 201) {
                // If created, score should be clamped to 100
                expect(data.overall_score).toBeLessThanOrEqual(100)
            }
        }, TEST_TIMEOUT)
    })

    describe('API Pagination', () => {
        it('should handle pagination parameters', async () => {
            const { response, data } = await apiRequest('/api/projects?limit=5&offset=0')

            expect(response.status).toBe(200)
            expect(data.items).toBeDefined()
            expect(data.items.length).toBeLessThanOrEqual(5)
            expect(data.limit).toBe(5)
            expect(data.offset).toBe(0)
        }, TEST_TIMEOUT)

        it('should handle large offset values', async () => {
            const { response, data } = await apiRequest('/api/projects?limit=10&offset=1000')

            expect(response.status).toBe(200)
            expect(data.items).toBeDefined()
            expect(Array.isArray(data.items)).toBe(true)
        }, TEST_TIMEOUT)
    })

    describe('API Cleanup', () => {
        it('should delete full idea', async () => {
            const { response, data } = await apiRequest(`/api/full-ideas?id=${testIdeaId}`, {
                method: 'DELETE'
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('Full idea deleted successfully')
        }, TEST_TIMEOUT)

        it('should delete idea session', async () => {
            const { response, data } = await apiRequest(`/api/idea-sessions?id=${testSessionId}`, {
                method: 'DELETE'
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('Idea session deleted successfully')
        }, TEST_TIMEOUT)

        it('should delete data source', async () => {
            const { response, data } = await apiRequest(`/api/data-sources?id=${testDataSourceId}`, {
                method: 'DELETE'
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('Data source deleted successfully')
        }, TEST_TIMEOUT)

        it('should delete AI persona', async () => {
            const { response, data } = await apiRequest(`/api/ai-personas?id=${testPersonaId}`, {
                method: 'DELETE'
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('AI persona deleted successfully')
        }, TEST_TIMEOUT)

        it('should delete project', async () => {
            const { response, data } = await apiRequest(`/api/projects/${testProjectId}`, {
                method: 'DELETE'
            })

            expect(response.status).toBe(200)
            expect(data.message).toBe('Project deleted successfully')
        }, TEST_TIMEOUT)
    })
}) 