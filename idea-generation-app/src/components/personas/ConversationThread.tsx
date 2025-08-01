'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PersonaMessage, PersonaConversation } from '@/lib/personas/conversation-service'

interface ConversationThreadProps {
  conversation: PersonaConversation
  onRefresh?: () => void
  onOrchestrate?: () => void
}

export function ConversationThread({ 
  conversation, 
  onRefresh, 
  onOrchestrate 
}: ConversationThreadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getPersonaAvatar = (personaName: string) => {
    const colors = {
      'The Visionary': 'bg-purple-500',
      'The Analyst': 'bg-blue-500', 
      'The Critic': 'bg-red-500',
      'Customer Advocate': 'bg-green-500'
    }
    return colors[personaName as keyof typeof colors] || 'bg-gray-500'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleOrchestrate = async () => {
    if (!onOrchestrate) return
    
    setIsLoading(true)
    try {
      await onOrchestrate()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {conversation.topic}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <Badge variant={
                conversation.status === 'completed' ? 'default' :
                conversation.status === 'active' ? 'secondary' : 'outline'
              }>
                {conversation.status}
              </Badge>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {conversation.participants.length} personas
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {conversation.messages.length} messages
              </span>
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {conversation.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrchestrate}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Discussion'}
              </Button>
            )}
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the discussion to see AI personas collaborate!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.messages.map((message, index) => (
                <PersonaMessageCard 
                  key={message.id} 
                  message={message}
                  avatarColor={getPersonaAvatar(message.persona_name)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface PersonaMessageCardProps {
  message: PersonaMessage
  avatarColor: string
}

function PersonaMessageCard({ message, avatarColor }: PersonaMessageCardProps) {
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'discussion':
        return <MessageCircle className="w-4 h-4" />
      case 'suggestion':
        return <CheckCircle className="w-4 h-4" />
      case 'critique':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getMessageTypeBadge = (type: string) => {
    const variants = {
      discussion: 'secondary',
      suggestion: 'default', 
      critique: 'destructive',
      vote: 'outline',
      summary: 'outline'
    }
    return variants[type as keyof typeof variants] || 'secondary'
  }

  return (
    <div className="flex gap-3 p-4 border rounded-lg bg-gray-50">
      {/* Persona Avatar */}
      <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-sm`}>
        {message.persona_name.substring(0, 2).toUpperCase()}
      </div>
      
      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{message.persona_name}</span>
            <Badge variant={getMessageTypeBadge(message.message_type)}>
              {getMessageTypeIcon(message.message_type)}
              {message.message_type}
            </Badge>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
} 