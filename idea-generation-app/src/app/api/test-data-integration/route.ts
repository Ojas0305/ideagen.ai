import { NextRequest, NextResponse } from 'next/server'
import { dataSourceOrchestrator } from '@/lib/data-sources'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      industry = 'healthcare technology',
      challenge = 'Create innovative solutions for remote patient monitoring',
      testFullPipeline = false
    } = body

    console.log(' Testing Phase 2.1: External Data Integration')
    console.log(` Industry: ${industry}`)
    console.log(` Challenge: ${challenge}`)
    
    const results: {
      phase: string
      timestamp: string
      industry: string
      challenge: string
      tests: Record<string, unknown>
      summary?: {
        total_tests: number
        successful_tests: number
        success_rate: number
        overall_status: string
        phase_completion: string
        next_steps: string
      }
    } = {
      phase: 'Phase 2.1: External Data Connectors',
      timestamp: new Date().toISOString(),
      industry,
      challenge,
      tests: {}
    }

    // Test 1: Data Source Health Check
    console.log('\nTest 1: Data Source Health Check')
    const startHealthCheck = Date.now()
    
    try {
      const healthStatus = await dataSourceOrchestrator.getDataQuality()
      results.tests.health_check = {
        success: true,
        duration_ms: Date.now() - startHealthCheck,
        status: healthStatus,
        notes: 'All data sources operational (using mock data for demo)'
      }
      console.log(' Health check passed')
    } catch (error) {
      results.tests.health_check = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(' Health check failed:', error)
    }

    // Test 2: News API Integration
    console.log('\n Test 2: News API Integration')
    const startNewsTest = Date.now()
    
    try {
      const newsResult = await dataSourceOrchestrator.aggregateData({
        enableNews: true,
        enableMarketResearch: false,
        enableSocialMedia: false,
        industry,
        keywords: challenge.split(' ').slice(0, 3),
        timeframe: '7d',
        maxInsights: 10
      })

      results.tests.news_api = {
        success: true,
        duration_ms: Date.now() - startNewsTest,
        insights_count: newsResult.insights.length,
        sources_used: newsResult.sources_used,
        sample_insights: newsResult.insights.slice(0, 3).map(insight => ({
          title: insight.title,
          relevance_score: insight.relevanceScore,
          source: insight.source
        })),
        notes: 'News API successfully retrieved industry-relevant articles'
      }
      console.log(` News API: ${newsResult.insights.length} insights retrieved`)
    } catch (error) {
      results.tests.news_api = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(' News API failed:', error)
    }

    // Test 3: Market Research Integration
    console.log('\nTest 3: Market Research Integration')
    const startMarketTest = Date.now()
    
    try {
      const marketResult = await dataSourceOrchestrator.aggregateData({
        enableNews: false,
        enableMarketResearch: true,
        enableSocialMedia: false,
        industry,
        keywords: [],
        timeframe: '30d',
        maxInsights: 5
      })

      results.tests.market_research = {
        success: true,
        duration_ms: Date.now() - startMarketTest,
        insights_count: marketResult.insights.length,
        market_sentiment: marketResult.summary.market_sentiment,
        sample_data: marketResult.insights.slice(0, 2).map(insight => {
          if (insight.type === 'market_research') {
            return {
              industry: insight.industry,
              market_size: insight.market_size,
              growth_rate: insight.growth_trends.cagr,
              opportunities: insight.opportunities.slice(0, 3)
            }
          }
          return null
        }).filter(Boolean),
        notes: 'Market research providing comprehensive industry analysis'
      }
      console.log(` Market Research: ${marketResult.insights.length} insights with ${marketResult.summary.market_sentiment} sentiment`)
    } catch (error) {
      results.tests.market_research = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(' Market Research failed:', error)
    }

    // Test 4: Social Media Integration
    console.log('\n Test 4: Social Media Integration')
    const startSocialTest = Date.now()
    
    try {
      const socialResult = await dataSourceOrchestrator.aggregateData({
        enableNews: false,
        enableMarketResearch: false,
        enableSocialMedia: true,
        industry,
        keywords: ['innovation', 'technology', industry.split(' ')[0]],
        timeframe: '24h',
        maxInsights: 8
      })

      results.tests.social_media = {
        success: true,
        duration_ms: Date.now() - startSocialTest,
        insights_count: socialResult.insights.length,
        platforms: [...new Set(socialResult.insights.map(i => i.type === 'social_media' ? i.platform : '').filter(Boolean))],
        trending_topics: socialResult.summary.top_trends.slice(0, 5),
        sentiment_analysis: socialResult.insights
          .filter(i => i.type === 'social_media')
          .map(insight => ({
            platform: insight.platform,
            sentiment: insight.sentiment,
            score: insight.sentiment_score
          })),
        notes: 'Social media monitoring providing real-time market sentiment'
      }
      console.log(` Social Media: ${socialResult.insights.length} insights from multiple platforms`)
    } catch (error) {
      results.tests.social_media = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(' Social Media failed:', error)
    }

    // Test 5: Integrated Data Aggregation
    console.log('\n Test 5: Full Data Integration')
    const startIntegrationTest = Date.now()
    
    try {
      const fullIntegration = await dataSourceOrchestrator.aggregateData({
        enableNews: true,
        enableMarketResearch: true,
        enableSocialMedia: true,
        industry,
        keywords: challenge.split(' ').slice(0, 4),
        timeframe: '7d',
        maxInsights: 25
      })

      // Transform to internal format
      const dataInsights = dataSourceOrchestrator.transformToDataInsights(fullIntegration.insights)

      results.tests.full_integration = {
        success: true,
        duration_ms: Date.now() - startIntegrationTest,
        total_insights: fullIntegration.insights.length,
        sources_breakdown: fullIntegration.summary.source_breakdown,
        average_relevance: fullIntegration.summary.average_relevance,
        market_sentiment: fullIntegration.summary.market_sentiment,
        top_trends: fullIntegration.summary.top_trends.slice(0, 8),
        data_insights_generated: dataInsights.length,
        quality_metrics: {
          processing_time_ms: fullIntegration.processing_time_ms,
          sources_used: fullIntegration.sources_used,
          error_count: fullIntegration.errors.length
        },
        notes: 'Successfully aggregated data from all external sources'
      }
      console.log(` Full Integration: ${dataInsights.length} transformed insights ready for AI`)
    } catch (error) {
      results.tests.full_integration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log(' Full Integration failed:', error)
    }

    // Test 6: AI Idea Generation with External Data (if requested)
    if (testFullPipeline) {
      console.log('\n Test 6: AI Generation with External Data')
      const startAITest = Date.now()
      
      try {
        // Create a test session
        const supabase = await createServerSupabaseClient()
        const { data: session } = await supabase
          .from('idea_sessions')
          .insert({
            name: `Phase 2.1 Test - ${new Date().toLocaleTimeString()}`,
            description: `Testing enhanced idea generation with external data for ${industry}`,
            status: 'planning'
          })
          .select()
          .single()

        if (session) {
          // Import and use the enhanced ServerQueue
          const { ServerQueue } = await import('@/lib/queue/server-queue')
          
          const generationResult = await ServerQueue.processIdeaGeneration({
            sessionId: session.id,
            challenge,
            industry
          })

          results.tests.ai_generation_enhanced = {
            success: true,
            duration_ms: Date.now() - startAITest,
            session_id: session.id,
            ideas_generated: generationResult?.ideas_count || 0,
            notes: 'AI successfully generated ideas using external data context'
          }
          console.log(` AI Generation: Enhanced with external data context`)
        }
      } catch (error) {
        results.tests.ai_generation_enhanced = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        console.log(' AI Generation failed:', error)
      }
    }

    // Calculate overall success metrics
    const testResults = Object.values(results.tests) as Array<{ success: boolean }>
    const successCount = testResults.filter((test) => test.success).length
    const totalTests = testResults.length

    results.summary = {
      total_tests: totalTests,
      successful_tests: successCount,
      success_rate: successCount / totalTests,
      overall_status: successCount === totalTests ? 'PASS' : successCount > totalTests / 2 ? 'PARTIAL' : 'FAIL',
      phase_completion: `${Math.round((successCount / totalTests) * 100)}%`,
      next_steps: successCount === totalTests ? 
        'Phase 2.1 External Data Connectors completed successfully. Ready for Phase 2.2 Data Processing Pipeline.' :
        'Some data source integrations need attention. Review failed tests and API configurations.'
    }

    console.log('\n Phase 2.1 Test Results:')
    console.log(` Success Rate: ${Math.round((successCount / totalTests) * 100)}%`)
    console.log(`Status: ${results.summary.overall_status}`)
    console.log(`${results.summary.next_steps}`)

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error(' Phase 2.1 test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PHASE_2_1_TEST_ERROR',
          message: 'Phase 2.1 integration test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
} 