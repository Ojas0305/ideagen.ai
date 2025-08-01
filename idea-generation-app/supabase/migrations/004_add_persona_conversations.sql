-- Add persona conversation and collaboration tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Persona conversation threads table
CREATE TABLE IF NOT EXISTS persona_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES full_ideas(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    conversation_type TEXT DEFAULT 'idea_discussion' CHECK (conversation_type IN ('idea_discussion', 'idea_refinement', 'consensus_building', 'evaluation')),
    participants UUID[] DEFAULT '{}', -- Array of persona IDs
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona messages table
CREATE TABLE IF NOT EXISTS persona_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES persona_conversations(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES ai_personas(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'discussion' CHECK (message_type IN ('discussion', 'suggestion', 'critique', 'vote', 'summary')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing additional context, votes, etc.
    in_reply_to UUID REFERENCES persona_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona votes table for consensus building
CREATE TABLE IF NOT EXISTS persona_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES persona_conversations(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES ai_personas(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- Can reference ideas, messages, or other entities
    target_type TEXT NOT NULL CHECK (target_type IN ('idea', 'message', 'suggestion')),
    vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'reject', 'improve', 'neutral')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea refinements table
CREATE TABLE IF NOT EXISTS idea_refinements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_idea_id UUID REFERENCES full_ideas(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES persona_conversations(id) ON DELETE CASCADE,
    refined_title TEXT,
    refined_description TEXT,
    refinement_type TEXT DEFAULT 'improvement' CHECK (refinement_type IN ('improvement', 'pivot', 'extension', 'simplification')),
    proposed_by UUID REFERENCES ai_personas(id),
    consensus_score INTEGER DEFAULT 0 CHECK (consensus_score >= 0 AND consensus_score <= 100),
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'merged')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persona_conversations_session ON persona_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_persona_conversations_idea ON persona_conversations(idea_id);
CREATE INDEX IF NOT EXISTS idx_persona_conversations_status ON persona_conversations(status);
CREATE INDEX IF NOT EXISTS idx_persona_messages_conversation ON persona_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_persona_messages_persona ON persona_messages(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_messages_created_at ON persona_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_persona_votes_conversation ON persona_votes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_persona_votes_target ON persona_votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_idea_refinements_original ON idea_refinements(original_idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_refinements_conversation ON idea_refinements(conversation_id);

-- Add updated_at triggers
CREATE TRIGGER update_persona_conversations_updated_at BEFORE UPDATE ON persona_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_messages_updated_at BEFORE UPDATE ON persona_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_votes_updated_at BEFORE UPDATE ON persona_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idea_refinements_updated_at BEFORE UPDATE ON idea_refinements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 