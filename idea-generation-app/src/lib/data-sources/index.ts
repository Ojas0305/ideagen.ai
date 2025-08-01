import { NewsAPIConnector, NewsInsight } from './news-api'
import { MarketResearchConnector, MarketInsight } from './market-research'
import { SocialMediaConnector, SocialInsight } from './social-media'
import { DataInsight } from '@/lib/types'

export type ExternalInsight = NewsInsight | MarketInsight | SocialInsight

export interface DataSourceConfig {
  enableNews: boolean
  enableMarketResearch: boolean
  enableSocialMedia: boolean
  industry?: string
  keywords?: string[]
  timeframe?: '1h' | '24h' | '7d' | '30d'
  maxInsights?: number
}

export interface DataAggregationResult {
  insights: ExternalInsight[]
  summary: {
    total_insights: number
    source_breakdown: Record<string, number>
    average_relevance: number
    top_trends: string[]
    market_sentiment: 'bullish' | 'bearish' | 'neutral'
  }
  processing_time_ms: number
  sources_used: string[]
  errors: string[]
}

/**
 * Main orchestrator for all external data sources
 * Aggregates data from news, market research, and social media APIs
 */
export class DataSourceOrchestrator {
  private newsConnector: NewsAPIConnector
  private marketConnector: MarketResearchConnector
  private socialConnector: SocialMediaConnector

  constructor() {
    this.newsConnector = new NewsAPIConnector()
    this.marketConnector = new MarketResearchConnector()
    this.socialConnector = new SocialMediaConnector()
  }

  /**
   * Check health status of all data sources
   */
  async healthCheck(): Promise<{
    status: string
    sources: Record<string, { status: string; message: string }>
    timestamp: string
  }> {
    const sources: Record<string, { status: string; message: string }> = {}
    
    // Check NewsData.io
    try {
      const newsDataKey = process.env.NEWS_DATA_API_KEY
      sources.newsdata = {
        status: newsDataKey ? 'configured' : 'missing_key',
        message: newsDataKey ? 'API key configured' : 'NEWS_DATA_API_KEY environment variable missing'
      }
    } catch (error) {
      sources.newsdata = { status: 'error', message: 'Failed to check NewsData.io' }
    }

    // Check Mediastack
    try {
      const mediastackKey = process.env.MEDIASTACK_API_KEY
      sources.mediastack = {
        status: mediastackKey ? 'configured' : 'missing_key',
        message: mediastackKey ? 'API key configured' : 'MEDIASTACK_API_KEY environment variable missing'
      }
    } catch (error) {
      sources.mediastack = { status: 'error', message: 'Failed to check Mediastack' }
    }

    // Check Apify
    try {
      const apifyToken = process.env.APIFY_TOKEN
      sources.apify = {
        status: apifyToken ? 'configured' : 'missing_key',
        message: apifyToken ? 'API token configured' : 'APIFY_TOKEN environment variable missing'
      }
    } catch (error) {
      sources.apify = { status: 'error', message: 'Failed to check Apify' }
    }

    // Check market research APIs
    try {
      const fmpKey = process.env.FMP_API_KEY
      const twelveDataKey = process.env.TWELVE_DATA_API_KEY
      
      sources.market_research = {
        status: (fmpKey || twelveDataKey) ? 'configured' : 'missing_keys',
        message: fmpKey && twelveDataKey ? 'Both FMP and Twelve Data configured' :
                 fmpKey ? 'Only FMP configured' :
                 twelveDataKey ? 'Only Twelve Data configured' :
                 'FMP_API_KEY and TWELVE_DATA_API_KEY environment variables missing'
      }
    } catch (error) {
      sources.market_research = { status: 'error', message: 'Failed to check market research APIs' }
    }

    const allConfigured = Object.values(sources).every(s => s.status === 'configured')
    const overallStatus = allConfigured ? 'healthy' : 'partial'

    return {
      status: overallStatus,
      sources,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Aggregate data from all configured sources
   */
  async aggregateData(config: DataSourceConfig): Promise<DataAggregationResult> {
    const startTime = Date.now()
    console.log(' Starting data aggregation from external sources...')
    
    const {
      enableNews = true,
      enableMarketResearch = true,
      enableSocialMedia = true,
      industry,
      keywords = [],
      timeframe = '24h',
      maxInsights = 50
    } = config

    const allInsights: ExternalInsight[] = []
    const sourcesUsed: string[] = []
    const errors: string[] = []

    // Fetch data from all enabled sources in parallel
    const dataPromises: Promise<void>[] = []

    // News API
    if (enableNews) {
      dataPromises.push(
        this.fetchNewsData(industry, keywords, timeframe)
          .then(insights => {
            allInsights.push(...insights)
            sourcesUsed.push('News API')
            console.log(` News: ${insights.length} insights`)
          })
          .catch(error => {
            console.error('News API error:', error)
            errors.push(`News API: ${error.message}`)
          })
      )
    }

    // Market Research
    if (enableMarketResearch && industry) {
      dataPromises.push(
        this.fetchMarketData(industry)
          .then(insights => {
            allInsights.push(...insights)
            sourcesUsed.push('Market Research')
            console.log(` Market Research: ${insights.length} insights`)
          })
          .catch(error => {
            console.error('Market Research error:', error)
            errors.push(`Market Research: ${error.message}`)
          })
      )
    }

    // Social Media
    if (enableSocialMedia) {
      dataPromises.push(
        this.fetchSocialData(keywords.length > 0 ? keywords : [industry || 'technology'])
          .then(insights => {
            allInsights.push(...insights)
            sourcesUsed.push('Social Media')
            console.log(` Social Media: ${insights.length} insights`)
          })
          .catch(error => {
            console.error('Social Media error:', error)
            errors.push(`Social Media: ${error.message}`)
          })
      )
    }

    // Wait for all data fetching to complete
    await Promise.allSettled(dataPromises)

    // Sort by relevance and limit results
    const sortedInsights = allInsights
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxInsights)

    // Generate summary
    const summary = this.generateSummary(sortedInsights)
    const processingTime = Date.now() - startTime

    console.log(` Data aggregation complete: ${sortedInsights.length} insights in ${processingTime}ms`)

    return {
      insights: sortedInsights,
      summary,
      processing_time_ms: processingTime,
      sources_used: sourcesUsed,
      errors
    }
  }

  /**
   * Fetch news insights
   */
  private async fetchNewsData(
    industry?: string, 
    keywords: string[] = [], 
    timeframe: string = '24h'
  ): Promise<NewsInsight[]> {
    const newsData = await this.newsConnector.getIndustryNews({
      industry,
      keywords,
      daysBack: this.timeframeToDays(timeframe)
    })

    const trendingNews = await this.newsConnector.getTrendingTopics()
    
    return [...newsData, ...trendingNews]
  }

  /**
   * Fetch market research insights
   */
  private async fetchMarketData(industry: string): Promise<MarketInsight[]> {
    const marketData = await this.marketConnector.getMarketResearch(industry)
    return marketData
  }

  /**
   * Fetch social media data
   */
  private async fetchSocialData(keywords: string[]): Promise<Insight[]> {
    console.log(` Monitoring social trends for: ${keywords.join(', ')}`)
    
    try {
      const socialConnector = new SocialMediaConnector()
      const socialInsights = await socialConnector.getTrendingTopics(keywords)
      
      const transformedInsights = socialInsights.map((insight: any) => ({
        id: insight.id || `social-${Date.now()}-${Math.random()}`,
        title: `Social Media: ${insight.content?.substring(0, 100) || 'Social Media Insight'}...`,
        description: insight.content || `Social media activity about ${insight.tags?.[0] || 'technology'}`,
        source: `${insight.platform || 'Social Media'} - @${insight.author || 'unknown'}`,
        url: insight.url || '#',
        relevanceScore: insight.relevanceScore || 0.7,
        timestamp: insight.timestamp || new Date().toISOString(),
        type: 'social_media' as const,
        category: 'social_trend' as const,
        tags: insight.tags || keywords,
        metadata: {
          platform: insight.platform,
          author: insight.author,
          engagement: insight.engagement,
          sentiment: insight.sentiment
        }
      }))

      console.log(` Social Media: ${transformedInsights.length} insights`)
      return transformedInsights

    } catch (error) {
      console.error('Social media data fetch failed:', error)
      // Return empty array instead of mock data to avoid false positives
      console.log(' No social media data available')
      return []
    }
  }

  /**
   * Convert timeframe to days
   */
  private timeframeToDays(timeframe: string): number {
    switch (timeframe) {
      case '1h':
        return 1
      case '24h':
        return 1
      case '7d':
        return 7
      case '30d':
        return 30
      default:
        return 1
    }
  }

  /**
   * Generate comprehensive summary of all insights
   */
  private generateSummary(insights: ExternalInsight[]): DataAggregationResult['summary'] {
    const sourceBreakdown: Record<string, number> = {}
    let totalRelevance = 0
    const allTrends: string[] = []

    insights.forEach(insight => {
      // Count by source type
      sourceBreakdown[insight.type] = (sourceBreakdown[insight.type] || 0) + 1
      
      // Calculate average relevance
      totalRelevance += insight.relevanceScore

      // Collect trends based on insight type
      if (insight.type === 'news' && insight.keywords) {
        allTrends.push(...insight.keywords)
      } else if (insight.type === 'social_media' && insight.trending_hashtags) {
        allTrends.push(...insight.trending_hashtags)
      } else if (insight.type === 'market_research' && insight.opportunities) {
        allTrends.push(...insight.opportunities.slice(0, 3))
      }
    })

    // Calculate top trends
    const trendCounts: Record<string, number> = {}
    allTrends.forEach(trend => {
      trendCounts[trend] = (trendCounts[trend] || 0) + 1
    })
    
    const topTrends = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([trend]) => trend)

    // Calculate market sentiment
    const socialInsights = insights.filter(i => i.type === 'social_media') as SocialInsight[]
    let avgSentiment = 0
    if (socialInsights.length > 0) {
      avgSentiment = socialInsights.reduce((sum, insight) => sum + insight.sentiment_score, 0) / socialInsights.length
    }
    
    const marketSentiment: 'bullish' | 'bearish' | 'neutral' = 
      avgSentiment > 0.3 ? 'bullish' : 
      avgSentiment < -0.3 ? 'bearish' : 'neutral'

    return {
      total_insights: insights.length,
      source_breakdown: sourceBreakdown,
      average_relevance: insights.length > 0 ? totalRelevance / insights.length : 0,
      top_trends: topTrends,
      market_sentiment: marketSentiment
    }
  }

  /**
   * Transform external insights to our internal DataInsight format
   */
  transformToDataInsights(externalInsights: ExternalInsight[]): DataInsight[] {
    return externalInsights.map(insight => {
      let content = ''
      let source = insight.source || 'External API'
      
      if (insight.type === 'news') {
        content = `${insight.title}: ${insight.summary}`
        source = `News - ${insight.source}`
      } else if (insight.type === 'market_research') {
        content = `Market size: $${(insight.market_size.value / 1e9).toFixed(1)}B, CAGR: ${insight.growth_trends.cagr}%. Key opportunities: ${insight.opportunities.slice(0, 3).join(', ')}`
        source = `Market Research - ${insight.source}`
      } else if (insight.type === 'social_media') {
        const trendingHashtags = insight.trending_hashtags || []
        content = `${insight.platform || 'Social Media'} sentiment: ${insight.sentiment || 'neutral'} (${insight.trend_volume || 0} posts). Trending: ${trendingHashtags.slice(0, 3).join(', ') || 'No trends available'}`
        source = `Social Media - ${insight.platform || 'Unknown Platform'}`
      }

      return {
        id: `external_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'external_data',
        title: this.generateInsightTitle(insight),
        content,
        source,
        relevance_score: insight.relevanceScore,
        confidence_level: insight.relevanceScore > 0.8 ? 'high' : insight.relevanceScore > 0.5 ? 'medium' : 'low',
        metadata: {
          original_type: insight.type,
          timestamp: new Date().toISOString(),
          ...this.extractMetadata(insight)
        },
        created_at: new Date().toISOString()
      }
    })
  }

  private generateInsightTitle(insight: ExternalInsight): string {
    if (insight.type === 'news') {
      return insight.title
    } else if (insight.type === 'market_research') {
      return `${insight.industry} Market Analysis`
    } else if (insight.type === 'social_media') {
      return `${insight.platform} Trends: ${insight.topic}`
    }
    return 'External Data Insight'
  }

  private extractMetadata(insight: ExternalInsight): Record<string, any> {
    const baseMetadata = {
      relevanceScore: insight.relevanceScore,
    }

    if (insight.type === 'news') {
      return {
        ...baseMetadata,
        category: insight.category,
        keywords: insight.keywords,
        publishedAt: insight.publishedAt,
        url: insight.url
      }
    } else if (insight.type === 'market_research') {
      return {
        ...baseMetadata,
        industry: insight.industry,
        marketSize: insight.market_size,
        cagr: insight.growth_trends.cagr,
        competitorCount: insight.competitors.length
      }
    } else if (insight.type === 'social_media') {
      return {
        ...baseMetadata,
        platform: insight.platform,
        sentiment: insight.sentiment,
        sentimentScore: insight.sentiment_score,
        trendVolume: insight.trend_volume,
        hashtags: insight.trending_hashtags
      }
    }

    return baseMetadata
  }

  /**
   * Get real-time data quality metrics
   */
  async getDataQuality(): Promise<{
    news_api: 'online' | 'degraded' | 'offline'
    market_research: 'online' | 'degraded' | 'offline'
    social_media: 'online' | 'degraded' | 'offline'
    overall_health: 'healthy' | 'degraded' | 'critical'
    last_updated: string
  }> {
    // Test connectivity to each service
    const checks = await Promise.allSettled([
      this.testNewsAPI(),
      this.testMarketResearchAPI(),
      this.testSocialMediaAPI()
    ])

    const newsStatus = checks[0].status === 'fulfilled' ? 'online' : 'offline'
    const marketStatus = checks[1].status === 'fulfilled' ? 'online' : 'offline'
    const socialStatus = checks[2].status === 'fulfilled' ? 'online' : 'offline'

    const onlineCount = [newsStatus, marketStatus, socialStatus].filter(s => s === 'online').length
    const overallHealth = onlineCount >= 2 ? 'healthy' : onlineCount === 1 ? 'degraded' : 'critical'

    return {
      news_api: newsStatus,
      market_research: marketStatus,
      social_media: socialStatus,
      overall_health: overallHealth,
      last_updated: new Date().toISOString()
    }
  }

  private async testNewsAPI(): Promise<void> {
    // Simple connectivity test
    await this.newsConnector.getIndustryNews({ 
      industry: 'technology', 
      keywords: ['test'], 
      daysBack: 1 
    })
  }

  private async testMarketResearchAPI(): Promise<void> {
    await this.marketConnector.getMarketResearch('technology')
  }

  private async testSocialMediaAPI(): Promise<void> {
    await this.socialConnector.getTrendingTopics({ 
      topics: ['test'], 
      timeframe: '24h' 
    })
  }
}

// Export singleton instance
export const dataSourceOrchestrator = new DataSourceOrchestrator()

// Re-export types for convenience
export type { NewsInsight, MarketInsight, SocialInsight }
export { NewsAPIConnector, MarketResearchConnector, SocialMediaConnector } 