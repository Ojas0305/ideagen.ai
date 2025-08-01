import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/personas/conversation-service'
import { createServerSupabaseClient } from '@/lib/supabase/client'

// GET - List conversations for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const ideaId = searchParams.get('idea_id')

    if (!sessionId && !ideaId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Session ID or Idea ID is required' } },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    // Build query based on filters
    let query = supabase
      .from('persona_conversations')
      .select(`
        *,
        persona_messages(
          *,
          ai_personas!inner(name, role)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    
    if (ideaId) {
      query = query.eq('idea_id', ideaId)
    }
    
    const { data: conversations, error } = await query
    
    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch conversations' } },
        { status: 500 }
      )
    }
    
    // Format conversations for frontend
    const formattedConversations = conversations?.map(conv => ({
      ...conv,
      messages: conv.persona_messages?.map((msg: any) => ({
        ...msg,
        persona_name: msg.ai_personas?.name || 'Unknown'
      })) || []
    })) || []

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch conversations' } },
      { status: 500 }
    )
  }
}

// POST - Start a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, idea_id, topic, conversation_type, participant_ids } = body

    if (!session_id || !idea_id || !topic) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Session ID, Idea ID, and topic are required' } },
        { status: 400 }
      )
    }

    const conversation = await ConversationService.startConversation({
      sessionId: session_id,
      ideaId: idea_id,
      topic,
      conversationType: conversation_type || 'idea_discussion',
      participantIds: participant_ids
    })

    return NextResponse.json({
      success: true,
      conversation
    })

  } catch (error) {
    console.error('Error starting conversation:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to start conversation' } },
      { status: 500 }
    )
  }
} 