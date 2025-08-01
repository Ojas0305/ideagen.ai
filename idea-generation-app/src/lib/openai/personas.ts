import OpenAI from 'openai'
import { AIPersona, IdeaSeed, FullIdea, DataInsight } from '@/lib/types'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting and retry configuration
const RETRY_DELAYS = [1000, 2000, 5000, 10000] // Exponential backoff
const MAX_RETRIES = 4
const TOKEN_LIMITS = {
    'gpt-4': 8000,
    'gpt-3.5-turbo': 4000
}

export class PersonaService {
    static async generateIdea(
        persona: AIPersona,
        context: {
            challenge: string
            industry?: string
            dataInsights?: DataInsight[]
            existingSeeds?: IdeaSeed[]
        }
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(persona, context)
        const userPrompt = this.buildUserPrompt(context)
        
        // Try GPT-4 first, then fallback to GPT-3.5-turbo
        const models = ['gpt-4', 'gpt-3.5-turbo']
        
        for (const model of models) {
            try {
                const result = await this.makeAPICallWithRetry({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: persona.configuration?.creativity || 0.7,
                    max_tokens: this.getOptimalTokenLimit(model, systemPrompt, userPrompt),
                })
                
                return result || 'Failed to generate idea'
                
            } catch (error) {
                console.warn(`${model} failed, trying next model:`, error.message)
                if (model === models[models.length - 1]) {
                    // If all models fail, return a fallback response
                    return this.generateFallbackIdea(persona, context)
                }
            }
        }
        
        return this.generateFallbackIdea(persona, context)
    }

    private static async makeAPICallWithRetry(params: {
        model: string
        messages: Array<{ role: string; content: string }>
        temperature: number
        max_tokens: number
    }): Promise<string> {
        let lastError: Error | null = null
        
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(` Attempting ${params.model} API call (attempt ${attempt + 1}/${MAX_RETRIES + 1})`)
                
                const completion = await openai.chat.completions.create({
                    model: params.model,
                    messages: params.messages,
                    temperature: params.temperature,
                    max_tokens: params.max_tokens,
                })

                const content = completion.choices[0]?.message?.content
                if (content) {
                    console.log(` ${params.model} API call successful`)
                    return content
                } else {
                    throw new Error('No content in API response')
                }
                
            } catch (error: any) {
                lastError = error
                console.warn(` ${params.model} API call failed (attempt ${attempt + 1}):`, error.message)
                
                // Handle specific error types
                if (error.status === 429) {
                    // Rate limiting - use exponential backoff
                    const retryAfter = error.headers?.['retry-after'] ? 
                        parseInt(error.headers['retry-after']) * 1000 : 
                        RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
                    
                    if (attempt < MAX_RETRIES) {
                        console.log(`⏱️ Rate limited, waiting ${retryAfter}ms before retry...`)
                        await new Promise(resolve => setTimeout(resolve, retryAfter))
                        continue
                    }
                } else if (error.status === 502 || error.status === 503 || error.status === 504) {
                    // Server errors - retry with exponential backoff
                    if (attempt < MAX_RETRIES) {
                        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
                        console.log(` Server error, retrying in ${delay}ms...`)
                        await new Promise(resolve => setTimeout(resolve, delay))
                        continue
                    }
                } else {
                    // Other errors - don't retry
                    break
                }
            }
        }
        
        throw lastError || new Error('API call failed after all retries')
    }

    private static getOptimalTokenLimit(model: string, systemPrompt: string, userPrompt: string): number {
        const baseLimit = TOKEN_LIMITS[model] || 4000
        const promptTokensEstimate = Math.ceil((systemPrompt.length + userPrompt.length) / 4) // Rough estimate
        const responseTokens = Math.min(800, baseLimit - promptTokensEstimate - 100) // Leave buffer
        
        return Math.max(200, responseTokens) // Minimum 200 tokens for response
    }

    private static generateFallbackIdea(
        persona: AIPersona,
        context: {
            challenge: string
            industry?: string
            dataInsights?: DataInsight[]
            existingSeeds?: IdeaSeed[]
        }
    ): string {
        const industry = context.industry || 'technology'
        const challenge = context.challenge || 'innovation'
        
        // Generate a basic but coherent idea based on persona type
        const fallbackIdeas = {
            'The Visionary': `TITLE: Revolutionary ${industry} Innovation Platform\n\nDESCRIPTION: Envision a transformative platform that addresses ${challenge} through cutting-edge technology and user-centric design. This solution leverages emerging trends to create unprecedented value for users while disrupting traditional approaches in the ${industry} space.\n\nINNOVATION: Combines multiple emerging technologies to solve complex problems in innovative ways.`,
            
            'The Analyst': `TITLE: Data-Driven ${industry} Solution\n\nDESCRIPTION: A systematic approach to ${challenge} using comprehensive data analysis and market research. This solution is built on solid business fundamentals with clear metrics, validated assumptions, and a scalable implementation strategy.\n\nINNOVATION: Uses advanced analytics and data science to optimize performance and deliver measurable results.`,
            
            'The Critic': `TITLE: Robust ${industry} Framework\n\nDESCRIPTION: A carefully designed solution that addresses ${challenge} while mitigating common risks and pitfalls. This approach emphasizes reliability, security, and sustainable growth over rapid scaling.\n\nINNOVATION: Incorporates comprehensive risk management and quality assurance from the ground up.`,
            
            'Customer Advocate': `TITLE: User-Centered ${industry} Experience\n\nDESCRIPTION: A human-first approach to ${challenge} that prioritizes user needs, accessibility, and satisfaction. This solution is designed with extensive user research and feedback integration.\n\nINNOVATION: Places user experience and customer success at the core of every design decision.`
        }
        
        const personaName = persona.name || 'AI Persona'
        const fallbackIdea = fallbackIdeas[personaName] || fallbackIdeas['The Analyst']
        
        console.log(` Generated fallback idea for ${personaName}`)
        return fallbackIdea
    }

    static async expandSeedToFullIdea(
        persona: AIPersona,
        seed: IdeaSeed,
        context: {
            challenge: string
            industry?: string
            dataInsights?: DataInsight[]
        }
    ): Promise<string> {
        try {
            const systemPrompt = `${persona.system_prompt}

You are now expanding a promising idea seed into a comprehensive business idea. Focus on:
1. Problem definition and validation
2. Detailed solution description
3. Market opportunity analysis
4. Target audience identification
5. Implementation roadmap
6. Risk assessment and mitigation

Be thorough but practical, considering feasibility and market potential.`

            const userPrompt = `Expand this idea seed into a full business concept:

SEED IDEA:
Title: ${seed.title}
Description: ${seed.description}
Category: ${seed.category || 'General'}

CONTEXT:
Challenge: ${context.challenge}
Industry: ${context.industry || 'General'}

DATA INSIGHTS:
${context.dataInsights?.slice(0, 5).map(insight =>
                `- ${insight.source}: ${insight.content}`
            ).join('\n') || 'No specific data insights available'}

Provide a structured response covering:
1. **Problem Statement**: What specific problem does this solve?
2. **Solution Description**: How does this idea work in detail?
3. **Market Opportunity**: What's the potential market size and demand?
4. **Target Audience**: Who would use/buy this?
5. **Implementation Plan**: Key phases and milestones
6. **Competitive Advantage**: What makes this unique?
7. **Risk Factors**: Potential challenges and how to address them`

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: persona.configuration?.creativity || 0.6,
                max_tokens: 1500,
            })

            return completion.choices[0]?.message?.content || 'Failed to expand idea'
        } catch (error) {
            console.error('Error expanding seed to full idea:', error)
            throw new Error('Failed to expand idea with AI')
        }
    }

    static async evaluateIdea(
        idea: FullIdea,
        criteria: 'feasibility' | 'market_potential' | 'uniqueness' | 'overall'
    ): Promise<{ score: number; reasoning: string }> {
        try {
            const systemPrompt = `You are an expert business evaluator. Analyze the given idea based on the specified criteria and provide:
1. A score from 0-100
2. Clear reasoning for the score

Be objective and consider real-world constraints, market dynamics, and implementation challenges.`

            const userPrompt = `Evaluate this business idea for ${criteria.replace('_', ' ')}:

IDEA:
Title: ${idea.title}
Problem: ${idea.problem || 'Not specified'}
Solution: ${idea.solution || 'Not specified'}
Market Opportunity: ${idea.market_opportunity || 'Not specified'}
Target Audience: ${idea.target_audience || 'Not specified'}
Implementation: ${idea.implementation || 'Not specified'}

Provide evaluation in this exact format:
SCORE: [number from 0-100]
REASONING: [detailed explanation of the score]`

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3, // Low temperature for consistent evaluation
                max_tokens: 500,
            })

            const response = completion.choices[0]?.message?.content || ''

            // Parse the response to extract score and reasoning
            const scoreMatch = response.match(/SCORE:\s*(\d+)/)
            const reasoningMatch = response.match(/REASONING:\s*(.+)$/s)

            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0
            const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Unable to generate reasoning'

            return { score: Math.min(100, Math.max(0, score)), reasoning }
        } catch (error) {
            console.error('Error evaluating idea:', error)
            return { score: 0, reasoning: 'Failed to evaluate idea' }
        }
    }

    static async generatePersonaMessage(
        persona: AIPersona,
        context: {
            topic: string
            otherPersonaMessages?: string[]
            currentStage: string
        }
    ): Promise<string> {
        try {
            const systemPrompt = `${persona.system_prompt}

You are participating in a collaborative brainstorming session. Stay true to your personality and thinking style.
Current stage: ${context.currentStage}
Your role is to contribute insights, build on others' ideas, or provide constructive criticism based on your expertise.
Keep responses concise but valuable - aim for 1-2 sentences maximum.`

            const userPrompt = `Topic: ${context.topic}

${context.otherPersonaMessages?.length ?
                    `Other participants said:\n${context.otherPersonaMessages.join('\n')}\n\n` :
                    ''
                }Share your perspective on this topic based on your role as ${persona.role}.`

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: persona.configuration?.creativity || 0.7,
                max_tokens: 150,
            })

            return completion.choices[0]?.message?.content || 'No response generated'
        } catch (error) {
            console.error('Error generating persona message:', error)
            return 'Unable to contribute at this time'
        }
    }

    private static buildSystemPrompt(persona: AIPersona, context: any): string {
        return `${persona.system_prompt}

EXPERTISE AREAS: ${persona.expertise.join(', ')}
THINKING STYLE: ${persona.thinking_style}
PERSONALITY: ${persona.personality}

You are participating in an idea generation session for the ${context.industry || 'business'} industry.
Focus on generating practical, innovative ideas that address real market needs.
Consider the available data insights and build upon existing ideas where appropriate.
Generate ideas that align with your thinking style and expertise.`
    }

    private static buildUserPrompt(context: {
        challenge: string
        industry?: string
        dataInsights?: DataInsight[]
        existingSeeds?: IdeaSeed[]
    }): string {
        return `Generate a creative business idea to address this challenge:

CHALLENGE: ${context.challenge}
INDUSTRY: ${context.industry || 'General'}

AVAILABLE DATA INSIGHTS:
${context.dataInsights?.slice(0, 10).map(insight =>
            `- ${insight.source}: ${insight.content} (Relevance: ${Math.round(insight.relevance * 100)}%)`
        ).join('\n') || 'No specific data insights available'}

${context.existingSeeds?.length ?
                `EXISTING IDEAS TO BUILD UPON:
${context.existingSeeds.slice(0, 5).map(seed =>
                    `- ${seed.title}: ${seed.description}`
                ).join('\n')}

Consider these existing ideas but generate something new or a creative variation.
` : ''
            }

Generate ONE concrete, actionable business idea with:
1. A clear, compelling title
2. A detailed description (2-3 paragraphs)
3. Why it addresses the challenge
4. What makes it innovative or different

Format your response as:
TITLE: [idea title]
DESCRIPTION: [detailed description]
INNOVATION: [what makes it unique]`
    }

    static async processDataInsights(
        insights: DataInsight[],
        challenge: string
    ): Promise<string[]> {
        try {
            const systemPrompt = `You are a data analyst expert at extracting actionable insights from market data.
Analyze the provided data insights and identify key themes, opportunities, and patterns that could inform idea generation.`

            const userPrompt = `Analyze these data insights in the context of this challenge: "${challenge}"

DATA INSIGHTS:
${insights.map(insight =>
                `Source: ${insight.source}
Content: ${insight.content}
Category: ${insight.category || 'General'}
Sentiment: ${insight.sentiment || 'neutral'}
---`
            ).join('\n')}

Identify 5-7 key patterns, opportunities, or themes that could guide idea generation.
List them as concise bullet points.`

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 600,
            })

            const response = completion.choices[0]?.message?.content || ''

            // Extract bullet points
            const patterns = response
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.trim().replace(/^[-•]\s*/, ''))
                .filter(line => line.length > 0)

            return patterns
        } catch (error) {
            console.error('Error processing data insights:', error)
            return ['Unable to process data insights at this time']
        }
    }
} 