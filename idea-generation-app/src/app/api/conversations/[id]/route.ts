import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/personas/conversation-service'

// GET - Get conversation details with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    const conversation = await ConversationService.getConversation(conversationId)

    if (!conversation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      conversation
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch conversation' } },
      { status: 500 }
    )
  }
} 