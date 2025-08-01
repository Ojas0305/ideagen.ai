// Server-side queue implementation for Next.js API routes
// This avoids the Bull module resolution issues in serverless environments

import { createServerSupabaseClient } from '@/lib/supabase/client'
import { PersonaService } from '@/lib/openai/personas'
import { ConversationService } from '@/lib/personas/conversation-service'

export interface IdeaGenerationJobData {
  sessionId: string
  projectId: string
  challenge: string
  industry?: string
  dataInsights?: any[]
}

export interface IdeaEvaluationJobData {
  ideaId: string
  sessionId: string
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
      
      // Update status to seed generation
      await supabase
        .from('idea_sessions')
        .update({ 
          status: 'processing',
          statistics: { stage: 'seed_generation', progress: 30 }
        })
        .eq('id', sessionId)
      
      // Generate seeds from each persona
      const seedPromises = personas.map(async (persona, index) => {
        console.log(` Generating seed from ${persona.name}`)
        
        const seedContent = await PersonaService.generateIdea(persona, {
          challenge,
          industry,
          dataInsights: dataInsights || [],
          existingSeeds: []
        })
        
        // Parse the AI response to extract title and description
        const titleMatch = seedContent.match(/TITLE:\s*(.+)/i)
        const descMatch = seedContent.match(/DESCRIPTION:\s*(.+?)(?=\nINNOVATION:|$)/i)
        const innovationMatch = seedContent.match(/INNOVATION:\s*(.+)/i)
        
        const title = titleMatch ? titleMatch[1].trim() : `Idea from ${persona.name}`
        const description = descMatch ? descMatch[1].trim() : seedContent
        const innovation = innovationMatch ? innovationMatch[1].trim() : ''
        
        // Store seed idea in database
        const { data: seed, error } = await supabase
          .from('full_ideas')
          .insert({
            session_id: sessionId,
            title,
            description: description + (innovation ? `\n\nInnovation: ${innovation}` : ''),
            category: 'seed',
            overall_score: 0, // Will be evaluated later
          })
          .select()
          .single()
        
        if (error) {
          console.error(`Error storing seed from ${persona.name}:`, error)
          return null
        }
        
        console.log(`Stored seed: ${title}`)
        return seed
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
        
        console.log(` Expanding seed: ${seed.title}`)
        
        // Find the persona that created this seed
        const persona = personas[index % personas.length]
        
        const fullIdeaContent = await PersonaService.expandSeedToFullIdea(
          persona,
          seed,
          { challenge, industry, dataInsights: dataInsights || [] }
        )
        
        // Parse the structured response - FIXED: Properly escaped asterisks for markdown bold syntax
        const problemMatch = fullIdeaContent.match(/(?:\*\*Problem Statement\*\*[:\s]*|\d+\.\s*\*\*Problem Statement\*\*[:\s]*|\d+\.\s*Problem Statement[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
        const solutionMatch = fullIdeaContent.match(/(?:\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*\*\*(?:Solution Description|Proposed Solution)\*\*[:\s]*|\d+\.\s*Solution Description[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
        const marketMatch = fullIdeaContent.match(/(?:\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*\*\*Market Opportunity\*\*[:\s]*|\d+\.\s*Market Opportunity[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
        const audienceMatch = fullIdeaContent.match(/(?:\*\*Target Audience\*\*[:\s]*|\d+\.\s*\*\*Target Audience\*\*[:\s]*|\d+\.\s*Target Audience[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
        const implMatch = fullIdeaContent.match(/(?:\*\*(?:Implementation (?:Plan|Strategy))\*\*[:\s]*|\d+\.\s*\*\*Implementation Plan\*\*[:\s]*|\d+\.\s*Implementation Plan[:\s]*)(.+?)(?=\n(?:\*\*|\d+\.)|$)/is)
        
        console.log(` Parsing idea content for ${seed.title}:`)
        console.log(`Problem found: ${!!problemMatch}`)
        console.log(`Solution found: ${!!solutionMatch}`)
        console.log(`Market found: ${!!marketMatch}`)
        console.log(`Audience found: ${!!audienceMatch}`)
        console.log(`Implementation found: ${!!implMatch}`)
        
        // Update the seed to a full idea
        const { data: fullIdea, error } = await supabase
          .from('full_ideas')
          .update({
            description: fullIdeaContent,
            problem: problemMatch ? problemMatch[1].trim() : 'Not specified',
            solution: solutionMatch ? solutionMatch[1].trim() : 'Not specified',
            market_opportunity: marketMatch ? marketMatch[1].trim() : 'Not specified',
            target_audience: audienceMatch ? audienceMatch[1].trim() : 'Not specified',
            implementation: implMatch ? implMatch[1].trim() : 'Not specified',
            category: 'full',
          })
          .eq('id', seed.id)
          .select()
          .single()
        
        if (error) {
          console.error(`Error expanding seed ${seed.title}:`, error)
          return null
        }
        
        console.log(` Expanded to full idea: ${seed.title}`)
        
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
      
      console.log(` Starting persona collaboration for ${fullIdeas.length} ideas`)
      
      // Start conversations for each full idea
      const conversationPromises = fullIdeas.map(async (idea, index) => {
        if (!idea) return null
        
        try {
          // Start conversation about this idea
          const conversation = await ConversationService.startConversation({
            sessionId,
            ideaId: idea.id,
            topic: `Collaborative refinement of "${idea.title}"`,
            conversationType: 'idea_refinement'
          })
          
          console.log(` Started conversation for idea: ${idea.title}`)
          
          // Orchestrate the conversation (3 rounds max to keep it manageable)
          const result = await ConversationService.orchestrateConversation({
            conversationId: conversation.id,
            maxRounds: 2 // Shorter for demo
          })
          
          console.log(` Completed conversation for "${idea.title}" - ${result.conversation.messages?.length || 0} messages`)
          
          return result
        } catch (error) {
          console.error(`Error in conversation for idea ${idea.title}:`, error)
          return null
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
      console.error(` Error in idea generation for session ${sessionId}:`, error)
      
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
    
    console.log(` Evaluating idea ${ideaId}`)
    
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
      
      console.log(` Evaluated idea ${ideaId} - Overall score: ${overallEval.score}`)
      
      return { success: true, scores: {
        feasibility: feasibilityEval.score,
        market_potential: marketEval.score,
        uniqueness: uniquenessEval.score,
        overall: overallEval.score
      }}
      
    } catch (error) {
      console.error(` Error evaluating idea ${ideaId}:`, error)
      throw error
    }
  }
} 