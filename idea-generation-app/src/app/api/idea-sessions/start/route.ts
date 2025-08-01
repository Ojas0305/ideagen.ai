import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { ServerQueue } from '@/lib/queue/server-queue'
import { dataSourceOrchestrator } from '@/lib/data-sources'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()

        const { session_id } = body

        if (!session_id) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' } },
                { status: 400 }
            )
        }

        // Get session details
        const { data: session, error: sessionError } = await supabase
            .from('idea_sessions')
            .select(`
                *,
                project:projects(*)
            `)
            .eq('id', session_id)
            .single()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Session not found' } },
                { status: 404 }
            )
        }

        if (session.status !== 'planning') {
            return NextResponse.json(
                { error: { code: 'INVALID_STATUS', message: 'Session must be in planning status to start' } },
                { status: 400 }
            )
        }

        // Get connected data sources for the project (placeholder for now)
        const { data: dataSources } = await supabase
            .from('data_sources')
            .select('*')
            .eq('status', 'connected')

        //  FETCH REAL EXTERNAL DATA for idea generation
        console.log(' Fetching real external data insights for idea generation...')
        let dataInsights: any[] = []
        
        try {
            if (session.project?.industry) {
                // Enhanced keyword extraction from user's specific project details
                const projectKeywords = []
                
                // Extract keywords from challenge/problem statement
                if (session.project.challenge) {
                    const challengeWords = session.project.challenge
                        .toLowerCase()
                        .replace(/[^\w\s]/g, ' ')
                        .split(/\s+/)
                        .filter((word: string) => word.length > 3 && !['that', 'this', 'with', 'from', 'into', 'over', 'they', 'have', 'been', 'will', 'more', 'some', 'what', 'when', 'where', 'how'].includes(word))
                        .slice(0, 5)
                    projectKeywords.push(...challengeWords)
                }
                
                // Extract keywords from project description
                if (session.project.description) {
                    const descriptionWords = session.project.description
                        .toLowerCase()
                        .replace(/[^\w\s]/g, ' ')
                        .split(/\s+/)
                        .filter((word: string) => word.length > 4 && !['that', 'this', 'with', 'from', 'into', 'over', 'they', 'have', 'been', 'will', 'more', 'some', 'what', 'when', 'where', 'how'].includes(word))
                        .slice(0, 3)
                    projectKeywords.push(...descriptionWords)
                }
                
                // Industry-specific intelligent keywords
                const industryKeywords: Record<string, string[]> = {
                    'technology': ['software', 'digital', 'innovation', 'platform', 'automation'],
                    'healthcare': ['medical', 'patient', 'treatment', 'telemedicine', 'health'],
                    'finance': ['fintech', 'banking', 'investment', 'payment', 'financial'],
                    'education': ['learning', 'students', 'teaching', 'educational', 'training'],
                    'retail': ['ecommerce', 'shopping', 'consumer', 'merchandise', 'customer'],
                    'manufacturing': ['production', 'supply', 'logistics', 'automation', 'industrial'],
                    'energy': ['renewable', 'power', 'electricity', 'sustainable', 'green'],
                    'agriculture': ['farming', 'food', 'crops', 'sustainability', 'agriculture']
                }
                
                const smartKeywords = [
                    ...projectKeywords,
                    ...(industryKeywords[session.project.industry.toLowerCase()] || ['innovation', 'business', 'technology'])
                ].slice(0, 8)
                
                console.log(`Research keywords for ${session.project.industry}: ${smartKeywords.join(', ')}`)
                console.log(` Project challenge: "${session.project.challenge}"`)
                
                // Use real external data sources for idea generation with user's specific context
                const externalDataResult = await dataSourceOrchestrator.aggregateData({
                    enableNews: true,
                    enableMarketResearch: true,
                    enableSocialMedia: true,
                    industry: session.project.industry,
                    keywords: smartKeywords,
                    timeframe: '7d',
                    maxInsights: 15
                })

                // Transform external insights to our internal format for idea generation
                dataInsights = dataSourceOrchestrator.transformToDataInsights(externalDataResult.insights)
                
                console.log(` Fetched ${dataInsights.length} targeted data insights from ${externalDataResult.sources_used.join(', ')}`)
                console.log(`Market sentiment for ${session.project.industry}: ${externalDataResult.summary.market_sentiment}`)
                console.log(` Data relevance score: ${dataInsights.reduce((sum, insight) => sum + insight.relevance, 0) / dataInsights.length * 100}%`)
                
            } else {
                console.log(' No industry specified, proceeding with general data')
                // Fallback to general technology insights with basic keywords
                const externalDataResult = await dataSourceOrchestrator.aggregateData({
                    enableNews: true,
                    enableMarketResearch: true,
                    enableSocialMedia: true,
                    industry: 'technology',
                    keywords: ['innovation', 'startup', 'business', 'digital', 'technology'],
                    timeframe: '7d',
                    maxInsights: 10
                })

                dataInsights = dataSourceOrchestrator.transformToDataInsights(externalDataResult.insights)
                console.log(` Fetched ${dataInsights.length} general data insights from ${externalDataResult.sources_used.join(', ')}`)
            }
            
        } catch (dataError) {
            console.warn(' External data retrieval failed, proceeding with basic insights:', dataError)
            // Provide minimal fallback data if external sources fail
            dataInsights = [{
                id: 'fallback_1',
                type: 'fallback_data',
                title: 'Market Research Insight',
                content: 'General market research indicates growing demand for innovative solutions',
                source: 'Internal Analysis',
                relevance_score: 0.7,
                confidence_level: 'medium',
                metadata: { timestamp: new Date().toISOString() },
                created_at: new Date().toISOString()
            }]
        }

        console.log(`Starting automated idea generation for session ${session_id}`)

        // Update session status to starting
        await supabase
            .from('idea_sessions')
            .update({ 
                status: 'starting',
                statistics: {
                    stage: 'starting',
                    progress: 0,
                    started_at: new Date().toISOString()
                }
            })
            .eq('id', session_id)

        // Process the idea generation immediately (for now)
        // In production, this would be queued for background processing
        try {
            const result = await ServerQueue.processIdeaGeneration({
                sessionId: session_id,
                projectId: session.project_id,
                challenge: session.project?.challenge || 'Generate innovative business ideas',
                industry: session.project?.industry || undefined,
                dataInsights
            })

            return NextResponse.json({
                success: true,
                message: 'Idea generation completed',
                session_id,
                result,
                estimated_completion: new Date().toISOString() // Already complete
            })

        } catch (processingError) {
            console.error('Error during idea generation:', processingError)
            
            const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error occurred'
            
            // Update session status to failed
            await supabase
                .from('idea_sessions')
                .update({ 
                    status: 'failed',
                    statistics: {
                        stage: 'failed',
                        progress: 0,
                        error: errorMessage
                    }
                })
                .eq('id', session_id)

            return NextResponse.json(
                { error: { code: 'PROCESSING_ERROR', message: errorMessage } },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error starting idea generation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to start idea generation' } },
            { status: 500 }
        )
    }
} 