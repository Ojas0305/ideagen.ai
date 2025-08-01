import { createServerSupabaseClient } from '@/lib/supabase/client'
import { PersonaService } from '@/lib/openai/personas'
import { AIPersona, FullIdea } from '@/lib/types'

export interface PersonaMessage {
  id: string
  conversation_id: string
  persona_id: string
  persona_name: string
  message_type: 'discussion' | 'suggestion' | 'critique' | 'vote' | 'summary'
  content: string
  metadata?: any
  in_reply_to?: string
  created_at: string
}

export interface PersonaConversation {
  id: string
  session_id: string
  idea_id: string
  topic: string
  status: 'active' | 'completed' | 'paused'
  conversation_type: 'idea_discussion' | 'idea_refinement' | 'consensus_building' | 'evaluation'
  participants: string[]
  metadata?: any
  created_at: string
  messages: PersonaMessage[]
}

export interface ConversationResult {
  conversation: PersonaConversation
  consensus_reached: boolean
  refined_idea?: any
  final_scores?: Record<string, number>
}

export class ConversationService {
  
  /**
   * Start a new conversation between AI personas about an idea
   */
  static async startConversation(params: {
    sessionId: string
    ideaId: string
    topic: string
    conversationType: 'idea_discussion' | 'idea_refinement' | 'consensus_building' | 'evaluation'
    participantIds?: string[]
  }): Promise<PersonaConversation> {
    
    const supabase = await createServerSupabaseClient()
    
    try {
      // Get default personas if none specified
      let participants = params.participantIds
      if (!participants || participants.length === 0) {
        const { data: personas } = await supabase
          .from('ai_personas')
          .select('id')
          .eq('is_default', true)
          .limit(4)
        
        participants = personas?.map(p => p.id) || []
      }
      
      // Create conversation record in database
      const { data: conversation, error } = await supabase
        .from('persona_conversations')
        .insert({
          session_id: params.sessionId,
          idea_id: params.ideaId,
          topic: params.topic,
          conversation_type: params.conversationType,
          participants,
          status: 'active'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating conversation:', error)
        throw new Error(`Failed to create conversation: ${error.message}`)
      }
      
      console.log(` Started real conversation: ${conversation.topic}`)
      
      return {
        ...conversation,
        messages: []
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      throw error
    }
  }
  
  /**
   * Generate and add a message from a specific persona
   */
  static async addPersonaMessage(params: {
    conversationId: string
    personaId: string
    messageType: 'discussion' | 'suggestion' | 'critique' | 'vote' | 'summary'
    context: {
      idea?: FullIdea
      previousMessages?: PersonaMessage[]
      prompt?: string
    }
    inReplyTo?: string
  }): Promise<PersonaMessage> {
    
    const supabase = await createServerSupabaseClient()
    
    // Verify conversation exists before proceeding
    const { data: conversation, error: convError } = await supabase
      .from('persona_conversations')
      .select('id, status')
      .eq('id', params.conversationId)
      .single()
    
    if (convError || !conversation) {
      console.error('Conversation verification failed:', convError)
      throw new Error(`Conversation ${params.conversationId} not found or not accessible`)
    }
    
    // Get persona details
    const { data: persona } = await supabase
      .from('ai_personas')
      .select('*')
      .eq('id', params.personaId)
      .single()
    
    if (!persona) {
      throw new Error('Persona not found')
    }
    
    // Generate AI response based on context
    const messageContent = await this.generatePersonaResponse(
      persona,
      params.messageType,
      params.context
    )
    
    // Store message in database with retry logic
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        const { data: message, error } = await supabase
          .from('persona_messages')
          .insert({
            conversation_id: params.conversationId,
            persona_id: params.personaId,
            message_type: params.messageType,
            content: messageContent,
            in_reply_to: params.inReplyTo
          })
          .select()
          .single()
        
        if (error) {
          console.error('Error saving message:', error)
          throw new Error(`Failed to save message: ${error.message}`)
        }
        
        console.log(`💬 ${persona.name}: ${messageContent.substring(0, 100)}...`)
        
        return {
          ...message,
          persona_name: persona.name
        }
        
      } catch (error) {
        retryCount++
        console.warn(` Message save attempt ${retryCount}/${maxRetries} failed:`, error.message)
        
        if (retryCount >= maxRetries) {
          console.error(`Failed to save message after ${maxRetries} attempts`)
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected end of addPersonaMessage')
  }
  
  /**
   * Orchestrate a full conversation between multiple personas
   */
  static async orchestrateConversation(params: {
    conversationId: string
    maxRounds?: number
    topics?: string[]
  }): Promise<ConversationResult> {
    
    const supabase = await createServerSupabaseClient()
    
    try {
      // Wait a moment and verify conversation exists before proceeding
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get conversation details with related data
      const { data: conversation, error: convError } = await supabase
        .from('persona_conversations')
        .select(`
          *,
          full_ideas!inner(*)
        `)
        .eq('id', params.conversationId)
        .single()
      
      if (convError || !conversation) {
        console.error('Error fetching conversation:', convError)
        throw new Error('Conversation not found or not yet committed to database')
      }
      
      console.log(` Orchestrating real conversation: ${conversation.topic}`)
      
      const maxRounds = params.maxRounds || 2
      const participants = conversation.participants
      let currentRound = 0
      
      // Conduct conversation rounds with real AI personas
      while (currentRound < maxRounds && conversation.status === 'active') {
        console.log(`\n Round ${currentRound + 1}/${maxRounds}`)
        
        // Each persona contributes to the conversation
        for (const personaId of participants) {
          
          // Get latest messages for context
          const { data: recentMessages } = await supabase
            .from('persona_messages')
            .select(`
              *,
              ai_personas!inner(name, role)
            `)
            .eq('conversation_id', params.conversationId)
            .order('created_at', { ascending: false })
            .limit(10)
          
          // Transform messages to include persona_name
          const formattedMessages = recentMessages?.map(msg => ({
            ...msg,
            persona_name: msg.ai_personas?.name || 'Unknown'
          })) || []
          
          // Generate persona response with retry logic for foreign key issues
          let retryCount = 0
          const maxRetries = 3
          
          while (retryCount < maxRetries) {
            try {
              const message = await this.addPersonaMessage({
                conversationId: params.conversationId,
                personaId,
                messageType: currentRound === 0 ? 'discussion' : 'suggestion',
                context: {
                  idea: conversation.full_ideas,
                  previousMessages: formattedMessages
                }
              })
              
              // Success - break out of retry loop
              break
              
            } catch (error) {
              retryCount++
              console.warn(` Attempt ${retryCount}/${maxRetries} failed for persona message:`, error.message)
              
              if (retryCount >= maxRetries) {
                console.error(`Failed to add message after ${maxRetries} attempts`)
                throw error
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }
          
          // Small delay to make conversation feel natural and prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
        currentRound++
      }
      
      // Check for consensus
      const consensusReached = await this.checkConsensus(params.conversationId)
      
      // Mark conversation as completed
      await supabase
        .from('persona_conversations')
        .update({ status: 'completed' })
        .eq('id', params.conversationId)
      
      // Get final conversation state with all messages
      const { data: finalConversation } = await supabase
        .from('persona_conversations')
        .select(`
          *,
          persona_messages(
            *,
            ai_personas!inner(name, role)
          )
        `)
        .eq('id', params.conversationId)
        .single()
      
      // Format messages
      const formattedMessages = finalConversation?.persona_messages?.map((msg: any) => ({
        ...msg,
        persona_name: msg.ai_personas?.name || 'Unknown'
      })) || []
      
      console.log(` Real conversation completed with ${formattedMessages.length} messages`)
      
      return {
        conversation: {
          ...finalConversation,
          messages: formattedMessages
        },
        consensus_reached: consensusReached,
        refined_idea: undefined,
        final_scores: undefined
      }
      
    } catch (error) {
      console.error('Error orchestrating conversation:', error)
      throw error
    }
  }
  
  /**
   * Generate AI response for a persona in conversation context
   */
  private static async generatePersonaResponse(
    persona: AIPersona,
    messageType: string,
    context: {
      idea?: FullIdea
      previousMessages?: PersonaMessage[]
      prompt?: string
    }
  ): Promise<string> {
    
    // Build conversation context
    let conversationHistory = ''
    if (context.previousMessages && context.previousMessages.length > 0) {
      conversationHistory = context.previousMessages
        .reverse() // Show in chronological order
        .map(msg => `${msg.persona_name || 'Persona'}: ${msg.content}`)
        .join('\n\n')
    }
    
    // Build prompt based on message type and context
    let prompt = ''
    
    if (messageType === 'discussion') {
      prompt = `You are ${persona.name}, ${persona.role}.

IDEA TO DISCUSS:
Title: ${context.idea?.title || 'Untitled'}
Description: ${context.idea?.description || 'No description'}

${conversationHistory ? `CONVERSATION SO FAR:\n${conversationHistory}\n\n` : ''}

Your task: Share your perspective on this idea. Consider its strengths, weaknesses, market potential, and implementation challenges. Be authentic to your role as ${persona.role}.

Respond in 2-3 paragraphs with your analysis and suggestions.`
    
    } else if (messageType === 'suggestion') {
      prompt = `You are ${persona.name}, ${persona.role}.

ONGOING CONVERSATION:
${conversationHistory}

Your task: Based on the discussion so far, provide specific suggestions to improve or refine the idea. Focus on actionable recommendations that align with your expertise in ${persona.expertise?.join(', ')}.

Provide 2-3 concrete suggestions.`
    
    } else if (messageType === 'critique') {
      prompt = `You are ${persona.name}, ${persona.role}.

CONVERSATION CONTEXT:
${conversationHistory}

Your task: Provide constructive criticism and identify potential risks or challenges. Be thorough but fair in your assessment.

Focus on potential problems and how they might be addressed.`
    }
    
    // Generate response using OpenAI
    const response = await PersonaService.generateIdea(persona, {
      challenge: prompt,
      industry: 'general',
      dataInsights: [],
      existingSeeds: []
    })
    
    return response
  }
  
  /**
   * Check if personas have reached consensus
   */
  private static async checkConsensus(conversationId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient()
    
    // Get recent messages and analyze sentiment/agreement
    const { data: messages } = await supabase
      .from('persona_messages')
      .select('content, message_type')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(8) // Last 2 rounds
    
    if (!messages || messages.length < 4) {
      return false // Need at least some discussion
    }
    
    // Simple consensus detection - look for agreement keywords
    const agreementKeywords = ['agree', 'good point', 'excellent', 'strong idea', 'promising', 'feasible']
    const disagreementKeywords = ['however', 'but', 'concern', 'risk', 'problem', 'challenge']
    
    let agreementScore = 0
    let disagreementScore = 0
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase()
      agreementKeywords.forEach(keyword => {
        if (content.includes(keyword)) agreementScore++
      })
      disagreementKeywords.forEach(keyword => {
        if (content.includes(keyword)) disagreementScore++
      })
    })
    
    // Consensus if more agreement than disagreement
    return agreementScore > disagreementScore
  }
  
  /**
   * Get conversation with messages
   */
  static async getConversation(conversationId: string): Promise<PersonaConversation | null> {
    const supabase = await createServerSupabaseClient()
    
    const { data: conversation } = await supabase
      .from('persona_conversations')
      .select(`
        *,
        messages:persona_messages(
          *,
          persona:ai_personas(name, role)
        )
      `)
      .eq('id', conversationId)
      .single()
    
    if (!conversation) return null
    
    return {
      ...conversation,
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        persona_name: msg.persona?.name || 'Unknown'
      }))
    }
  }
} 