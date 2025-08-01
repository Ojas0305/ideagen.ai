import Queue from 'bull'
import Redis from 'redis'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { PersonaService } from '@/lib/openai/personas'
import { IdeaSession, AIPersona, FullIdea } from '@/lib/types'

// Redis connection for Bull
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}

// Create job queues
export const ideaGenerationQueue = new Queue('idea generation', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export const ideaEvaluationQueue = new Queue('idea evaluation', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Job Types
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

export interface SeedGenerationJobData {
  sessionId: string
  personaId: string
  challenge: string
  industry?: string
  dataInsights?: any[]
  existingSeeds?: any[]
}

export interface SeedExpansionJobData {
  sessionId: string
  seedId: string
  personaId: string
  challenge: string
  industry?: string
  dataInsights?: any[]
}

// Process idea generation jobs
ideaGenerationQueue.process('generateSession', async (job) => {
  const { sessionId, projectId, challenge, industry, dataInsights } = job.data as IdeaGenerationJobData
  
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
    
    job.progress(10)
    
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
    
    job.progress(30)
    
    // Generate seeds from each persona
    const seedPromises = personas.map(async (persona, index) => {
      console.log(`Generating seed from ${persona.name}`)
      
      const seedContent = await PersonaService.generateIdea(persona, {
        challenge,
        industry,
        dataInsights: dataInsights || [],
        existingSeeds: []
      })
      
      // Parse the AI response to extract title and description
      const titleMatch = seedContent.match(/TITLE:\s*(.+)/i)
      const descMatch = seedContent.match(/DESCRIPTION:\s*(.+?)(?=\nINNOVATION:|$)/is)
      const innovationMatch = seedContent.match(/INNOVATION:\s*(.+)/is)
      
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
    
    job.progress(60)
    
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
      
      // Parse the structured response
      const problemMatch = fullIdeaContent.match(/\*\*Problem Statement\*\*:\s*(.+?)(?=\n\*\*|$)/is)
      const solutionMatch = fullIdeaContent.match(/\*\*Solution Description\*\*:\s*(.+?)(?=\n\*\*|$)/is)
      const marketMatch = fullIdeaContent.match(/\*\*Market Opportunity\*\*:\s*(.+?)(?=\n\*\*|$)/is)
      const audienceMatch = fullIdeaContent.match(/\*\*Target Audience\*\*:\s*(.+?)(?=\n\*\*|$)/is)
      const implMatch = fullIdeaContent.match(/\*\*Implementation Plan\*\*:\s*(.+?)(?=\n\*\*|$)/is)
      
      // Update the seed to a full idea
      const { data: fullIdea, error } = await supabase
        .from('full_ideas')
        .update({
          description: fullIdeaContent,
          problem: problemMatch ? problemMatch[1].trim() : '',
          solution: solutionMatch ? solutionMatch[1].trim() : '',
          market_opportunity: marketMatch ? marketMatch[1].trim() : '',
          target_audience: audienceMatch ? audienceMatch[1].trim() : '',
          implementation: implMatch ? implMatch[1].trim() : '',
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
      
      // Queue for evaluation
      await ideaEvaluationQueue.add('evaluateIdea', {
        ideaId: fullIdea.id,
        sessionId
      }, {
        delay: 1000 * index // Stagger evaluations
      })
      
      return fullIdea
    })
    
    await Promise.all(expansionPromises)
    
    job.progress(90)
    
    // Update session status to completed
    await supabase
      .from('idea_sessions')
      .update({ 
        status: 'completed',
        statistics: { 
          stage: 'completed', 
          progress: 100,
          seeds_generated: seeds.length,
          full_ideas_developed: 3,
          completed_at: new Date().toISOString()
        }
      })
      .eq('id', sessionId)
    
    job.progress(100)
    
    console.log(`Completed idea generation for session ${sessionId}`)
    
    return { success: true, seedsGenerated: seeds.length, ideasDeveloped: 3 }
    
  } catch (error) {
    console.error(`Error in idea generation for session ${sessionId}:`, error)
    
    // Update session status to failed
    const supabase = await createServerSupabaseClient()
    await supabase
      .from('idea_sessions')
      .update({ 
        status: 'failed',
        statistics: { stage: 'failed', progress: 0, error: error.message }
      })
      .eq('id', sessionId)
    
    throw error
  }
})

// Process idea evaluation jobs
ideaEvaluationQueue.process('evaluateIdea', async (job) => {
  const { ideaId, sessionId } = job.data as IdeaEvaluationJobData
  
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
})

// Helper functions to add jobs
export async function startIdeaGeneration(data: IdeaGenerationJobData) {
  const job = await ideaGenerationQueue.add('generateSession', data, {
    attempts: 1, // Don't retry session generation
  })
  
  console.log(`Queued idea generation job ${job.id} for session ${data.sessionId}`)
  return job
}

export async function evaluateIdea(data: IdeaEvaluationJobData) {
  const job = await ideaEvaluationQueue.add('evaluateIdea', data)
  
  console.log(`Queued evaluation job ${job.id} for idea ${data.ideaId}`)
  return job
}

// Queue monitoring
export function getQueueStats() {
  return Promise.all([
    ideaGenerationQueue.getWaiting(),
    ideaGenerationQueue.getActive(),
    ideaGenerationQueue.getCompleted(),
    ideaGenerationQueue.getFailed(),
    ideaEvaluationQueue.getWaiting(),
    ideaEvaluationQueue.getActive(),
    ideaEvaluationQueue.getCompleted(),
    ideaEvaluationQueue.getFailed(),
  ]).then(([
    genWaiting, genActive, genCompleted, genFailed,
    evalWaiting, evalActive, evalCompleted, evalFailed
  ]) => ({
    ideaGeneration: {
      waiting: genWaiting.length,
      active: genActive.length,
      completed: genCompleted.length,
      failed: genFailed.length,
    },
    ideaEvaluation: {
      waiting: evalWaiting.length,
      active: evalActive.length,
      completed: evalCompleted.length,
      failed: evalFailed.length,
    }
  }))
} 