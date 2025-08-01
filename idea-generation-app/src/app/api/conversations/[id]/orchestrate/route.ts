import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/personas/conversation-service'

// POST - Start conversation orchestration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const body = await request.json()
    const { max_rounds, topics } = body

    console.log(` Starting orchestration for conversation ${conversationId}`)

    const result = await ConversationService.orchestrateConversation({
      conversationId,
      maxRounds: max_rounds || 3,
      topics
    })

    return NextResponse.json({
      success: true,
      result: {
        conversation_id: conversationId,
        messages_generated: result.conversation.messages?.length || 0,
        consensus_reached: result.consensus_reached,
        status: 'completed'
      }
    })

  } catch (error) {
    console.error('Error orchestrating conversation:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to orchestrate conversation' } },
      { status: 500 }
    )
  }
} 