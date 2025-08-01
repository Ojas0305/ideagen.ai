interface SocialPost {
  id: string
  platform: 'twitter' | 'linkedin' | 'reddit' | 'hackernews'
  content: string
  author: string
  url: string
  timestamp: string
  engagement: {
    likes: number
    shares: number
    comments: number
  }
  hashtags: string[]
  mentions: string[]
}

export interface SocialInsight {
  type: 'social_media'
  platform: string
  topic: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_score: number // -1 to 1
  trend_volume: number
  engagement_rate: number
  key_posts: SocialPost[]
  trending_hashtags: string[]
  influencer_mentions: {
    username: string
    follower_count: number
    post_content: string
  }[]
  relevanceScore: number
  timeframe: string
  source: string
}

interface ApifyTwitterPost {
  id: string
  text: string
  author: {
    username: string
    name: string
    followers: number
    verified: boolean
  }
  url: string
  createdAt: string
  retweetCount: number
  likeCount: number
  replyCount: number
  hashtags: string[]
  mentions: string[]
}

export class SocialMediaConnector {
  private apiLayerKey: string
  
  // Static flags to prevent repeated warnings
  private static hasWarnedAPILayer = false

  constructor() {
    this.apiLayerKey = process.env.APILAYER_API_KEY || ''
    
    // Only warn once per application lifecycle
    if (!this.apiLayerKey && !SocialMediaConnector.hasWarnedAPILayer) {
      console.warn(' APILAYER_API_KEY not configured - social media monitoring will use Reddit only')
      SocialMediaConnector.hasWarnedAPILayer = true
    }
  }

  /**
   * Get trending topics from Reddit (Twitter removed - Reddit works perfectly)
   */
  async getTrendingTopics(topics: string[]): Promise<SocialInsight[]> {
    const allInsights: SocialInsight[] = []

    for (const topic of topics) {
      try {
        const redditInsight = await this.getRedditInsights(topic, '24h')
        if (redditInsight) {
          allInsights.push(redditInsight)
        }
      } catch (error) {
        console.warn(`Failed to get Reddit insights for ${topic}:`, error)
        // Continue with other topics instead of failing entirely
      }
    }

    return allInsights
  }

  /**
   * Get insights from Reddit (Twitter removed - Reddit works perfectly)
   */
  private async getPlatformInsights(
    platform: string, 
    topic: string, 
    timeframe: string
  ): Promise<SocialInsight | null> {
    if (!this.apiLayerKey) {
      return null
    }

    if (platform === 'reddit') {
      return this.getRedditInsights(topic, timeframe)
    }
    
    return null
  }

  /**
   * Get Reddit insights using public Reddit API
   */
  private async getRedditInsights(topic: string, timeframe: string): Promise<SocialInsight | null> {
    try {
      console.log(` Fetching Reddit data for: ${topic}`)
      
      // Using Reddit's public API (no auth required for public posts)
      const subreddits = ['startups', 'entrepreneur', 'technology', 'business']
      const query = topic.replace(/\s+/g, '+')
      
      // Add strict 10-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(
        `https://www.reddit.com/r/${subreddits[0]}/search.json?q=${query}&sort=hot&limit=25&t=week`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = await response.json()
      
      return this.transformRedditData(data, topic, timeframe)

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(' Reddit API request timed out after 10 seconds')
      } else {
        console.warn('Reddit API failed:', error)
      }
      return null
    }
  }

  /**
   * Transform Reddit data to our format  
   */
  private async transformRedditData(data: any, topic: string, timeframe: string): Promise<SocialInsight> {
    const posts = data.data?.children || []
    
    const keyPosts: SocialPost[] = posts.slice(0, 8).map((post: any) => ({
      id: post.data.id,
      platform: 'reddit' as const,
      content: post.data.title + (post.data.selftext ? ` - ${post.data.selftext.substring(0, 200)}...` : ''),
      author: post.data.author,
      url: `https://reddit.com${post.data.permalink}`,
      timestamp: new Date(post.data.created_utc * 1000).toISOString(),
      engagement: {
        likes: post.data.ups || 0,
        shares: 0,
        comments: post.data.num_comments || 0
      },
      hashtags: [],
      mentions: []
    }))

    // Analyze sentiment
    const sentimentData = await this.analyzeSentiment(keyPosts.map(p => p.content))

    return {
      type: 'social_media',
      platform: 'Reddit',
      topic,
      sentiment: sentimentData.overall_sentiment,
      sentiment_score: sentimentData.average_score,
      trend_volume: posts.length,
      engagement_rate: keyPosts.reduce((sum, post) => sum + post.engagement.likes, 0) / posts.length,
      key_posts: keyPosts,
      trending_hashtags: [],
      influencer_mentions: [],
      relevanceScore: 0.65,
      timeframe,
      source: 'Reddit Public API'
    }
  }

  /**
   * Analyze sentiment using basic analysis only (MEANINGCLOUD removed)
   */
  private async analyzeSentiment(texts: string[] | string): Promise<{
    overall_sentiment: 'positive' | 'negative' | 'neutral'
    average_score: number
    individual_scores: number[]
  }> {
    // FIXED: Ensure texts is always an array
    const textArray = Array.isArray(texts) ? texts : [texts]
    
    // FIXED: Use only basic sentiment analysis since MEANINGCLOUD_KEY doesn't exist
    return this.getBasicSentiment(textArray)
  }

  /**
   * Get sentiment score using basic analysis (fallback method) for arrays - FIXED
   */
  private getBasicSentiment(texts: string[]): {
    overall_sentiment: 'positive' | 'negative' | 'neutral'
    average_score: number
    individual_scores: number[]
  } {
    // FIXED: Ensure texts is always an array and handle empty case
    if (!Array.isArray(texts) || texts.length === 0) {
      return {
        overall_sentiment: 'neutral',
        average_score: 0,
        individual_scores: []
      }
    }

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'like', 'best', 'fantastic', 'wonderful']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'disappointing', 'failed', 'broken']
    
    const scores = texts.map(text => {
      const lowerText = text.toLowerCase()
      let score = 0
      
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 0.3
      })
      
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 0.3
      })
      
      // Clamp score between -1 and 1
      return Math.max(-1, Math.min(1, score))
    })
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const overallSentiment = averageScore > 0.1 ? 'positive' : 
                             averageScore < -0.1 ? 'negative' : 'neutral'

    return {
      overall_sentiment: overallSentiment,
      average_score: averageScore,
      individual_scores: scores
    }
  }

  /**
   * Get basic sentiment score for a single string (used in fallback data)
   */
  private getBasicSentimentScore(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'like', 'best', 'fantastic', 'wonderful', 'innovation', 'transforming', 'momentum', 'acceleration']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'disappointing', 'failed', 'broken']
    
    const lowerText = text.toLowerCase()
    let score = 0
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.3
    })
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.3
    })
    
    return score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
  }
} 