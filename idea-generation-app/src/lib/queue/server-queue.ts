// Server-side queue implementation for Next.js API routes
// This avoids the Bull module resolution issues in serverless environments

import { PersonaService } from '@/lib/openai/personas'
import { ConversationService } from '@/lib/personas/conversation-service'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { dataSourceOrchestrator } from '@/lib/data-sources'
import { AIPersona, IdeaSeed, FullIdea, DataInsight } from '@/lib/types'

interface IdeaGenerationJobData {
  sessionId: string
  projectId?: string
  challenge: string
  industry?: string
  dataInsights?: DataInsight[]
}

interface IdeaEvaluationJobData {
  ideaId: string
  sessionId: string
}

interface ConversationResult {
  conversation: any
  consensus_reached: boolean
  refined_idea?: FullIdea
  final_scores?: any
}

// Simple in-memory job processing for API routes
export class ServerQueue {
  static async processIdeaGeneration(data: IdeaGenerationJobData): Promise<any> {
    const { sessionId, projectId, challenge, industry, dataInsights } = data
    
    console.log(`Starting idea generation for session ${sessionId}`)
    
    try {
      const supabase = await createServerSupabaseClient()
      
      // Update session status to 'processing'
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'processing',
          statistics: { stage: 'data_retrieval', progress: 10 }
        })
        .eq('id', sessionId)
      
      // Get AI personas for the project
      const { data: personas } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('is_default', true)
        .limit(4)
      
      if (!personas || personas.length === 0) {
        throw new Error('No AI personas available')
      }

      // NEW: Enhanced data retrieval with external sources
      console.log('Fetching external data insights...')
      let enhancedDataInsights: DataInsight[] = dataInsights || []
      
      if (industry) {
        try {
          // Use the new data source orchestrator
          const externalDataResult = await dataSourceOrchestrator.aggregateData({
            enableNews: true,
            enableMarketResearch: true,
            enableSocialMedia: true,
            industry,
            keywords: challenge.split(' ').slice(0, 3), // Use first 3 words as keywords
            timeframe: '7d',
            maxInsights: 15
          })

          // Transform external insights to our internal format
          const externalInsights = dataSourceOrchestrator.transformToDataInsights(externalDataResult.insights)
          enhancedDataInsights = [...enhancedDataInsights, ...externalInsights]
          
          console.log(`Enhanced with ${externalInsights.length} external data insights`)
          console.log(`Data sources used: ${externalDataResult.sources_used.join(', ')}`)
          console.log(`Market sentiment: ${externalDataResult.summary.market_sentiment}`)
          
          // Update session with data insights count
          await supabase
            .from('idea_sessions')
            .update({ 
              status: 'processing',
              statistics: { 
                stage: 'data_processing', 
                progress: 25,
                external_data_sources: externalDataResult.sources_used.length,
                market_sentiment: externalDataResult.summary.market_sentiment,
                data_insights_processed: enhancedDataInsights.length
              }
            })
            .eq('id', sessionId)

        } catch (dataError) {
          console.warn('External data retrieval failed, continuing with available data:', dataError)
          // Continue with existing data if external sources fail
        }
      }
      
      // Update status to seed generation
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'processing',
          statistics: { stage: 'seed_generation', progress: 30 }
        })
        .eq('id', sessionId)
      
      console.log(`Generating seeds with ${personas.length} AI personas...`)
      
      // Enhanced seed generation with external data context
      const seedPromises = personas.map(async (persona, index) => {
        console.log(`${persona.name} generating seed...`)
        
        // Add delay between API calls to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 2000)) // 2 second delay between each persona
        
        // Build enhanced context including external data
        const dataContext = enhancedDataInsights.length > 0 ? 
          `\n\nRELEVANT MARKET DATA:\n${enhancedDataInsights.slice(0, 8).map(insight => 
            `- ${insight.title}: ${insight.content.substring(0, 150)}...`
          ).join('\n')}` : ''
        
        const enhancedChallenge = challenge + dataContext
        
        try {
          const ideaContent = await PersonaService.generateIdea(persona, {
            challenge: enhancedChallenge,
            industry,
            dataInsights: enhancedDataInsights,
            existingSeeds: [] // Will add existing seeds for diversity in later iterations
          })
          
          // Create initial seed in database
          const { data: seed, error } = await supabase
            .from('full_ideas')
            .insert({
              title: ideaContent.split('\n')[0].replace(/^(#|\*|-|\d+\.)\s*/, '').trim() || `Idea ${index + 1}`,
              description: ideaContent,
              session_id: sessionId,
              persona_id: persona.id,
              category: 'seed',
              status: 'generated'
            })
            .select()
            .single()
          
          if (error) {
            console.error(`Error creating seed for ${persona.name}:`, error)
            return null
          }
          
          console.log(`${persona.name} created seed: ${seed.title}`)
          return seed
          
        } catch (error) {
          console.error(`${persona.name} failed to generate seed:`, error)
          // Create a fallback seed if AI fails
          const fallbackTitle = `${persona.name} Seed - ${industry} Innovation`
          const fallbackDescription = `Fallback idea generated by ${persona.name} for ${industry} in response to: ${challenge.substring(0, 100)}...`
          
          const { data: fallbackSeed, error: fallbackError } = await supabase
            .from('full_ideas')
            .insert({
              title: fallbackTitle,
              description: fallbackDescription,
              session_id: sessionId,
              persona_id: persona.id,
              category: 'seed',
              status: 'generated'
            })
            .select()
            .single()
          
          if (!fallbackError) {
            console.log(`Created fallback seed for ${persona.name}: ${fallbackTitle}`)
            return fallbackSeed
          }
          
          return null
        }
      })
      
      const seeds = (await Promise.all(seedPromises)).filter(Boolean)
      
      // Update status to idea development
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'generating',
          statistics: { stage: 'idea_development', progress: 60 }
        })
        .eq('id', sessionId)
      
      // Expand best seeds to full ideas
      const expansionPromises = seeds.slice(0, 3).map(async (seed, index) => {
        if (!seed) return null
        
        console.log(`Expanding seed: ${seed.title}`)
        
        // Find the persona that created this seed
        const persona = personas[index % personas.length]
        
        const fullIdeaContent = await PersonaService.expandSeedToFullIdea(
          persona,
          seed,
          { challenge, industry, dataInsights: dataInsights || [] }
        )
        
        // Parse the structured response - Handle ACTUAL AI output format
        // The AI generates content like: "DESCRIPTION: Today's businesses are confronted..."
        // We need to extract meaningful sections from this unstructured content
        
        let problem = 'Not specified';
        let solution = 'Not specified';
        let market_opportunity = 'Not specified';
        let target_audience = 'Not specified';
        let implementation = 'Not specified';
        
        // Try to extract problem from description
        const problemPatterns = [
          /(?:problem|challenge|issue)[:\s]+(.*?)(?=\n|solution|market|target|implementation|$)/is,
          /businesses are (?:confronted|facing|dealing) with (.*?)(?=\n|\.)/is,
          /(?:address|solve|tackle)[:\s]+(.*?)(?=\n|\.)/is,
          /\d+\.\s*\*\*Problem Statement\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
          /\*\*Problem Statement\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
        ];
        
        // Try to extract solution from description
        const solutionPatterns = [
          /(?:solution|approach|method)[:\s]+(.*?)(?=\n|market|target|implementation|$)/is,
          /(?:platform|system|service) (?:that|which) (.*?)(?=\n|\.)/is,
          /(?:provides|offers|enables) (.*?)(?=\n|\.)/is,
          /\d+\.\s*\*\*Solution Description\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
          /\*\*Solution Description\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
        ];
        
        // Try to extract market from description
        const marketPatterns = [
          /(?:market|opportunity|potential)[:\s]+(.*?)(?=\n|target|implementation|$)/is,
          /(?:industry|sector|business) (.*?)(?=\n|\.)/is,
          /\d+\.\s*\*\*Market Opportunity\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
          /\*\*Market Opportunity\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
        ];
        
        // Try to extract target audience
        const audiencePatterns = [
          /(?:target|audience|customers|users)[:\s]+(.*?)(?=\n|implementation|$)/is,
          /(?:for|serves|helps) (.*?) (?:businesses|companies|organizations)/is,
          /\d+\.\s*\*\*Target Audience\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
          /\*\*Target Audience\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
        ];
        
        // Try to extract implementation
        const implPatterns = [
          /(?:implementation|plan|strategy)[:\s]+(.*?)(?=\n|$)/is,
          /(?:using|through|via) (.*?)(?=\n|\.)/is,
          /\d+\.\s*\*\*Implementation Plan\*\*[:\s]+(.*?)(?=\n\s*\d+\.|$)/is,
          /\*\*Implementation Plan\*\*[:\s]+(.*?)(?=\n\s*\*\*|$)/is
        ];
        
        // Test all patterns and use the first match found
        for (const pattern of problemPatterns) {
          const match = fullIdeaContent.match(pattern);
          if (match && match[1] && match[1].trim().length > 10) {
            problem = match[1].trim();
            break;
          }
        }
        
        for (const pattern of solutionPatterns) {
          const match = fullIdeaContent.match(pattern);
          if (match && match[1] && match[1].trim().length > 10) {
            solution = match[1].trim();
            break;
          }
        }
        
        for (const pattern of marketPatterns) {
          const match = fullIdeaContent.match(pattern);
          if (match && match[1] && match[1].trim().length > 10) {
            market_opportunity = match[1].trim();
            break;
          }
        }
        
        for (const pattern of audiencePatterns) {
          const match = fullIdeaContent.match(pattern);
          if (match && match[1] && match[1].trim().length > 10) {
            target_audience = match[1].trim();
            break;
          }
        }
        
        for (const pattern of implPatterns) {
          const match = fullIdeaContent.match(pattern);
          if (match && match[1] && match[1].trim().length > 10) {
            implementation = match[1].trim();
            break;
          }
        }
        
        console.log(`Parsing idea content for ${seed.title}:`)
        console.log(`Problem found: ${!!problem}`)
        console.log(`Solution found: ${!!solution}`)
        console.log(`Market found: ${!!market_opportunity}`)
        console.log(`Audience found: ${!!target_audience}`)
        console.log(`Implementation found: ${!!implementation}`)
        
        // Update the seed to a full idea
        const { data: fullIdea, error } = await supabase
          .from('full_ideas')
          .update({
            description: fullIdeaContent,
            problem: problem,
            solution: solution,
            market_opportunity: market_opportunity,
            target_audience: target_audience,
            implementation: implementation,
            category: 'full',
          })
          .eq('id', seed.id)
          .select()
          .single()
        
        if (error) {
          console.error(`Error expanding seed ${seed.title}:`, error)
          return null
        }
        
        console.log(`Expanded to full idea: ${seed.title}`)
        
        // Evaluate the idea immediately
        await this.processIdeaEvaluation({
          ideaId: fullIdea.id,
          sessionId
        })
        
        return fullIdea
      })
      
      const fullIdeas = (await Promise.all(expansionPromises)).filter(Boolean)
      
      // NEW: Start persona conversations for top ideas
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'collaborating',
          statistics: { stage: 'persona_collaboration', progress: 80 }
        })
        .eq('id', sessionId)
      
      console.log(`Starting persona collaboration for ${fullIdeas.length} ideas`)
      
      // Start conversations for each full idea
      const conversationPromises = fullIdeas.map(async (idea, index) => {
        if (!idea) return null
        
        try {
          // Add delay between conversation starts to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 3000)) // 3 second delay between conversations
          
          // Start conversation about this idea
          const conversation = await ConversationService.startConversation({
            sessionId,
            ideaId: idea.id,
            topic: `Collaborative refinement of "${idea.title}"`,
            conversationType: 'idea_refinement'
          })
          
          console.log(`Started conversation for idea: ${idea.title}`)
          
          // Orchestrate the conversation with retry logic
          try {
            const result = await ConversationService.orchestrateConversation({
              conversationId: conversation.id,
              maxRounds: 2 // Shorter for demo
            })
            
            console.log(`Completed conversation for "${idea.title}" - ${result.conversation.messages?.length || 0} messages`)
            return result
            
          } catch (orchestrationError) {
            console.warn(`Conversation orchestration failed for "${idea.title}":`, orchestrationError.message)
            // Continue without failing the entire process
            return { 
              conversation: { id: conversation.id, messages: [] }, 
              error: orchestrationError.message 
            }
          }
          
        } catch (error) {
          console.error(`Error in conversation for idea ${idea.title}:`, error)
          // Don't fail the entire process, just log and continue
          return { error: error.message, ideaTitle: idea.title }
        }
      })
      
      await Promise.all(conversationPromises)
      
      // Update session status to completed
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'completed',
          statistics: { 
            stage: 'completed', 
            progress: 100,
            seeds_generated: seeds.length,
            full_ideas_developed: fullIdeas.length,
            conversations_held: fullIdeas.length,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', sessionId)
      
      console.log(`Completed idea generation for session ${sessionId}`)
      
      return { success: true, seedsGenerated: seeds.length, ideasDeveloped: fullIdeas.length, conversationsHeld: fullIdeas.length }
      
    } catch (error) {
      console.error(`Error in idea generation for session ${sessionId}:`, error)
      
      // Update session status to failed
      const supabase = await createServerSupabaseClient()
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'failed',
          statistics: { stage: 'failed', progress: 0, error: error instanceof Error ? error.message : 'Unknown error' }
        })
        .eq('id', sessionId)
      
      throw error
    }
  }

  static async processIdeaEvaluation(data: IdeaEvaluationJobData): Promise<any> {
    const { ideaId, sessionId } = data
    
    console.log(`Evaluating idea ${ideaId}`)
    
    try {
      const supabase = await createServerSupabaseClient()
      
      // Get the idea
      const { data: idea, error: fetchError } = await supabase
        .from('full_ideas')
        .select('*')
        .eq('id', ideaId)
        .single()
      
      if (fetchError || !idea) {
        throw new Error('Idea not found')
      }
      
      // Evaluate the idea on all criteria
      const [feasibilityEval, marketEval, uniquenessEval, overallEval] = await Promise.all([
        PersonaService.evaluateIdea(idea, 'feasibility'),
        PersonaService.evaluateIdea(idea, 'market_potential'),
        PersonaService.evaluateIdea(idea, 'uniqueness'),
        PersonaService.evaluateIdea(idea, 'overall')
      ])
      
      // Update idea with scores
      const { error: updateError } = await supabase
        .from('full_ideas')
        .update({
          feasibility_score: feasibilityEval.score,
          market_potential_score: marketEval.score,
          uniqueness_score: uniquenessEval.score,
          overall_score: overallEval.score,
          evaluation_reasoning: JSON.stringify({
            feasibility: feasibilityEval.reasoning,
            market_potential: marketEval.reasoning,
            uniqueness: uniquenessEval.reasoning,
            overall: overallEval.reasoning
          })
        })
        .eq('id', ideaId)
      
      if (updateError) {
        throw new Error(`Failed to update scores: ${updateError.message}`)
      }
      
      console.log(`Evaluated idea ${ideaId} - Overall score: ${overallEval.score}`)
      
      return { success: true, scores: {
        feasibility: feasibilityEval.score,
        market_potential: marketEval.score,
        uniqueness: uniquenessEval.score,
        overall: overallEval.score
      }}
      
    } catch (error) {
      console.error(`Error evaluating idea ${ideaId}:`, error)
      throw error
    }
  }
} 