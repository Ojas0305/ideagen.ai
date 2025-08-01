interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  content?: string
}

interface NewsDataResponse {
  status: string
  totalResults: number
  results: Array<{
    article_id: string
    title: string
    link: string
    keywords?: string[]
    creator?: string[]
    video_url?: string
    description?: string
    content?: string
    pubDate: string
    image_url?: string
    source_id: string
    source_priority: number
    source_name: string
    source_url: string
    source_icon: string
    language: string
    country: string[]
    category: string[]
    ai_tag: string
    sentiment: string
    sentiment_stats: string
    ai_region: string
    ai_org: string
    duplicate: boolean
  }>
}

interface MediastackResponse {
  pagination: {
    limit: number
    offset: number
    count: number
    total: number
  }
  data: Array<{
    author?: string
    title: string
    description?: string
    url: string
    source: string
    image?: string
    category: string
    language: string
    country: string
    published_at: string
  }>
  error?: {
    info: string
  }
}

export interface NewsInsight {
  type: 'news'
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
  relevanceScore: number
  keywords: string[]
  category: 'market_trend' | 'technology' | 'industry_news' | 'funding' | 'product_launch'
}

export class NewsAPIConnector {
  private newsDataKey: string
  private mediastackKey: string
  private newsDataUrl = 'https://newsdata.io/api/1/news'
  private mediastackUrl = 'https://api.mediastack.com/v1/news'

  constructor() {
    this.newsDataKey = process.env.NEWS_DATA_API_KEY || ''
    this.mediastackKey = process.env.MEDIASTACK_API_KEY || ''
    
    if (!this.newsDataKey && !this.mediastackKey) {
      console.warn(' No news API keys configured (NEWS_DATA_API_KEY or MEDIASTACK_API_KEY)')
    }
  }

  /**
   * Fetch industry-specific news using NewsData.io or Mediastack
   */
  async getIndustryNews(params: {
    industry?: string
    keywords?: string[]
    daysBack?: number
    language?: string
  }): Promise<NewsInsight[]> {
    const { industry, keywords = [], daysBack = 7, language = 'en' } = params
    
    const allInsights: NewsInsight[] = []
    
    // Try NewsData.io first (better for global coverage and categories)
    if (this.newsDataKey) {
      try {
        const newsDataInsights = await this.getNewsDataInsights(industry, keywords, language)
        allInsights.push(...newsDataInsights)
        console.log(` NewsData.io: Retrieved ${newsDataInsights.length} insights`)
      } catch (error) {
        console.warn(' NewsData.io failed:', error)
      }
    }

    // Try Mediastack as backup (good for US/UK sources)
    if (this.mediastackKey && allInsights.length < 5) {
      try {
        const mediastackInsights = await this.getMediastackInsights(industry, keywords, language)
        allInsights.push(...mediastackInsights)
        console.log(` Mediastack: Retrieved ${mediastackInsights.length} insights`)
      } catch (error) {
        console.warn(' Mediastack failed:', error)
      }
    }

    if (allInsights.length === 0) {
      console.warn(' All news APIs failed, using mock data')
      return this.getMockNewsData(industry, keywords)
    }

    // Remove duplicates and sort by relevance
    const uniqueInsights = this.deduplicateInsights(allInsights)
    return uniqueInsights
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)
  }

  /**
   * Get insights from NewsData.io
   */
  private async getNewsDataInsights(
    industry?: string,
    keywords: string[] = [],
    language: string = 'en'
  ): Promise<NewsInsight[]> {
    // Fix undefined issue - provide better logging and defaults
    const effectiveIndustry = industry && industry.trim() !== '' ? industry : 'technology'
    console.log(` Fetching news from NewsData.io for: ${effectiveIndustry}`)
    
    // Build simple, valid query string according to NewsData.io API docs
    let q = ''
    if (effectiveIndustry && effectiveIndustry !== 'undefined') {
      // Use simple industry term to avoid complex query errors
      q = effectiveIndustry.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    }
    if (keywords.length > 0) {
      const keywordQuery = keywords.filter(k => k && k.trim() !== '').join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim()
      q += q ? ` ${keywordQuery}` : keywordQuery
    }
    
    // Default to technology if no valid query
    if (!q || q.trim() === '') {
      q = 'technology startup'
      console.log(' Using default query: technology startup')
    }

    // FIXED: Correct NewsData.io API format based on official documentation
    const params = new URLSearchParams({
      apikey: this.newsDataKey,
      q: q,
      language: language,
      category: 'business,technology',
      size: '10'
    })

    try {
      // Add strict 10-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${this.newsDataUrl}?${params}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('NewsData.io API Error:', response.status, errorText)
        
        // Provide specific error guidance
        if (response.status === 422) {
          console.error('NewsData.io 422 Error - Check API key validity and query format')
          throw new Error(`NewsData.io API key may be invalid or query format incorrect: ${response.status}`)
        }
        throw new Error(`NewsData.io error: ${response.status} ${response.statusText}`)
      }

      const data: NewsDataResponse = await response.json()
      
      if (data.status !== 'success') {
        console.error('NewsData.io API returned non-success status:', data.status)
        throw new Error(`NewsData.io API error: ${data.status}`)
      }

      console.log(` NewsData.io: Found ${data.results?.length || 0} articles`)
      
      if (!data.results || data.results.length === 0) {
        console.log(' NewsData.io: No articles found for query')
        return []
      }
      
      return data.results
        .slice(0, 5)
        .map(article => this.transformNewsDataToInsight(article, industry, keywords))
        .filter(insight => insight.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('NewsData.io request timed out after 10 seconds')
        throw new Error('NewsData.io API timeout')
      }
      console.error('NewsData.io request failed:', error)
      throw error
    }
  }

  /**
   * Get insights from Mediastack with improved error handling and rate limiting
   */
  private async getMediastackInsights(
    industry?: string,
    keywords: string[] = [],
    language: string = 'en'
  ): Promise<NewsInsight[]> {
    // Fix undefined issue - provide better logging and defaults
    const effectiveIndustry = industry && industry.trim() !== '' ? industry : 'technology'
    console.log(` Fetching news from Mediastack for: ${effectiveIndustry}`)
    
    // Build clean query string 
    let keywords_combined = ''
    if (effectiveIndustry && effectiveIndustry !== 'undefined') {
      keywords_combined = effectiveIndustry.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    }
    if (keywords.length > 0) {
      const cleanKeywords = keywords.filter(k => k && k.trim() !== '').join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim()
      keywords_combined += keywords_combined ? ` ${cleanKeywords}` : cleanKeywords
    }
    
    if (!keywords_combined || keywords_combined.trim() === '') {
      keywords_combined = 'technology startup'
      console.log(' Using default query: technology startup')
    }

    // FIXED: Correct Mediastack API format based on official documentation
    const params = new URLSearchParams({
      access_key: this.mediastackKey,
      keywords: keywords_combined,
      languages: language,
      categories: 'business,technology',
      limit: '10'
    })

    try {
      // Add strict 10-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(`${this.mediastackUrl}?${params}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // Handle specific rate limiting
      if (response.status === 429) {
        console.warn(' Mediastack rate limit reached (100 calls/month on free plan)')
        console.warn(' Consider upgrading plan or using NewsData.io as primary source')
        return []
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Mediastack API Error:', response.status, errorText)
        
        // Provide specific error guidance
        if (response.status === 401) {
          console.error('Mediastack 401 Error - Check API key validity')
          throw new Error(`Mediastack API key may be invalid: ${response.status}`)
        }
        if (response.status === 403) {
          console.error('Mediastack 403 Error - API key may not have required permissions')
          throw new Error(`Mediastack API access forbidden: ${response.status}`)
        }
        
        throw new Error(`Mediastack error: ${response.status} ${response.statusText}`)
      }

      const data: MediastackResponse = await response.json()
      
      if (data.error) {
        console.error('Mediastack API Error:', data.error)
        throw new Error(`Mediastack API error: ${data.error.info || 'Unknown error'}`)
      }
      
      if (!data.data || data.data.length === 0) {
        console.log(` Mediastack: No articles found for query: "${keywords_combined}"`)
        return []
      }

      console.log(` Mediastack: Found ${data.data.length} articles`)
      
      return data.data
        .slice(0, 5)
        .map(article => this.transformMediastackToInsight(article, industry, keywords))
        .filter(insight => insight.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Mediastack request timed out after 10 seconds')
        throw new Error('Mediastack API timeout')
      }
      if (error.message.includes('429')) {
        console.warn(' Mediastack rate limit reached - this is expected on free plan')
        return []
      }
      console.error('Mediastack request failed:', error)
      throw error
    }
  }

  /**
   * Get trending topics using both sources
   */
  async getTrendingTopics(): Promise<NewsInsight[]> {
    const trendingQueries = [
      'artificial intelligence startup',
      'blockchain innovation', 
      'fintech funding',
      'healthcare technology',
      'sustainable technology',
      'remote work tools'
    ]

    const allInsights: NewsInsight[] = []

    for (const query of trendingQueries.slice(0, 3)) { // Limit to avoid quota
      try {
        const insights = await this.getIndustryNews({
          keywords: [query],
          daysBack: 3
        })
        allInsights.push(...insights.slice(0, 3)) // Top 3 per query
      } catch (error) {
        console.warn(`Failed to get trending for "${query}":`, error)
      }
    }

    return allInsights
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15)
  }

  /**
   * Transform NewsData.io response to our format
   */
  private transformNewsDataToInsight(
    article: NewsDataResponse['results'][0],
    industry?: string,
    keywords: string[] = []
  ): NewsInsight {
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    const effectiveIndustry = industry && industry.trim() !== '' && industry !== 'undefined' ? industry : null
    
    // Calculate relevance score
    let relevanceScore = 0.5
    
    if (effectiveIndustry && content.includes(effectiveIndustry.toLowerCase())) {
      relevanceScore += 0.3
    }
    
    keywords.filter(k => k && k.trim() !== '').forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        relevanceScore += 0.2
      }
    })
    
    // Business keywords boost
    const businessKeywords = ['startup', 'funding', 'innovation', 'market', 'technology']
    businessKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        relevanceScore += 0.1
      }
    })

    return {
      type: 'news',
      title: article.title,
      summary: article.description || article.title,
      url: article.link,
      publishedAt: article.pubDate,
      source: article.source_name,
      relevanceScore: Math.min(1.0, relevanceScore),
      keywords: article.keywords || this.extractKeywords(content),
      category: this.categorizeContent(content)
    }
  }

  /**
   * Transform Mediastack response to our format
   */
  private transformMediastackToInsight(
    article: MediastackResponse['data'][0],
    industry?: string,
    keywords: string[] = []
  ): NewsInsight {
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    const effectiveIndustry = industry && industry.trim() !== '' && industry !== 'undefined' ? industry : null
    
    // Calculate relevance score
    let relevanceScore = 0.5
    
    if (effectiveIndustry && content.includes(effectiveIndustry.toLowerCase())) {
      relevanceScore += 0.3
    }
    
    keywords.filter(k => k && k.trim() !== '').forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        relevanceScore += 0.2
      }
    })

    return {
      type: 'news',
      title: article.title,
      summary: article.description || article.title,
      url: article.url,
      publishedAt: article.published_at,
      source: article.source,
      relevanceScore: Math.min(1.0, relevanceScore),
      keywords: this.extractKeywords(content),
      category: this.categorizeContent(content)
    }
  }

  private categorizeContent(content: string): NewsInsight['category'] {
    if (content.includes('funding') || content.includes('investment') || content.includes('raised')) {
      return 'funding'
    }
    if (content.includes('launch') || content.includes('release') || content.includes('announce')) {
      return 'product_launch'
    }
    if (content.includes('trend') || content.includes('market') || content.includes('growth')) {
      return 'market_trend'
    }
    if (content.includes('technology') || content.includes('ai') || content.includes('innovation')) {
      return 'technology'
    }
    return 'industry_news'
  }

  private extractKeywords(content: string): string[] {
    const commonKeywords = [
      'artificial intelligence', 'machine learning', 'blockchain', 'fintech',
      'healthcare', 'education', 'sustainability', 'remote work', 'automation',
      'cloud computing', 'cybersecurity', 'iot', 'mobile app', 'saas',
      'marketplace', 'platform', 'digital transformation', 'data analytics'
    ]
    
    return commonKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).slice(0, 5)
  }

  private getMockNewsData(industry?: string, keywords: string[] = []): NewsInsight[] {
    console.log(' Using mock news data (no API keys configured)')
    
    return [
      {
        type: 'news',
        title: `${industry || 'Technology'} Industry Sees 40% Growth in AI Adoption`,
        summary: 'Companies are rapidly integrating AI solutions to improve efficiency and customer experience',
        url: 'https://example.com/news/1',
        publishedAt: new Date().toISOString(),
        source: 'TechNews',
        relevanceScore: 0.9,
        keywords: ['artificial intelligence', 'automation', industry || 'technology'],
        category: 'technology'
      },
      {
        type: 'news',
        title: 'Startup Funding Reaches Record High in Q4 2024',
        summary: 'Venture capital investments focus on sustainable technology and healthcare innovation',
        url: 'https://example.com/news/2',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: 'VentureDaily',
        relevanceScore: 0.8,
        keywords: ['funding', 'venture capital', 'healthcare', 'sustainability'],
        category: 'funding'
      }
    ]
  }

  private deduplicateInsights(insights: NewsInsight[]): NewsInsight[] {
    const seenInsights = new Set<string>();
    const uniqueInsights: NewsInsight[] = [];

    for (const insight of insights) {
      const key = `${insight.title}-${insight.url}-${insight.publishedAt}`;
      if (!seenInsights.has(key)) {
        uniqueInsights.push(insight);
        seenInsights.add(key);
      }
    }
    return uniqueInsights;
  }
} 