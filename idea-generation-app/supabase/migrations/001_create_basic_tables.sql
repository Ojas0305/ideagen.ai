-- Create basic tables without authentication
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table (without owner_id)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    challenge TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'processing', 'generating', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI personas table
CREATE TABLE IF NOT EXISTS ai_personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    expertise TEXT[] DEFAULT '{}',
    thinking_style TEXT DEFAULT 'balanced' CHECK (thinking_style IN ('creative', 'analytical', 'critical', 'practical', 'balanced')),
    personality TEXT DEFAULT 'neutral' CHECK (personality IN ('optimistic', 'realistic', 'cautious', 'neutral')),
    configuration JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea sessions table
CREATE TABLE IF NOT EXISTS idea_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'processing', 'generating', 'completed', 'paused')),
    configuration JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full ideas table
CREATE TABLE IF NOT EXISTS full_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_project ON idea_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_status ON idea_sessions(status);
CREATE INDEX IF NOT EXISTS idx_full_ideas_session ON full_ideas(session_id);
CREATE INDEX IF NOT EXISTS idx_full_ideas_score ON full_ideas(overall_score);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON ai_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idea_sessions_updated_at BEFORE UPDATE ON idea_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_full_ideas_updated_at BEFORE UPDATE ON full_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default AI personas
INSERT INTO ai_personas (name, role, system_prompt, expertise, thinking_style, personality, configuration, is_default) VALUES
('The Visionary', 'Big picture thinking and disruptive innovation', 'You are a visionary thinker who sees beyond current limitations and imagines revolutionary solutions. Focus on breakthrough innovations and paradigm shifts.', ARRAY['innovation', 'technology', 'market_disruption'], 'creative', 'optimistic', '{"creativity": 0.9, "risk_tolerance": 0.8, "focus_areas": ["emerging_tech", "user_experience"]}', true),
('The Analyst', 'Data-driven practical solutions', 'You are a methodical analyst who relies on data and evidence to generate practical, implementable ideas. Focus on feasibility and market validation.', ARRAY['market_analysis', 'data_science', 'business_strategy'], 'analytical', 'realistic', '{"creativity": 0.6, "risk_tolerance": 0.4, "focus_areas": ["market_data", "financial_metrics"]}', true),
('The Critic', 'Risk assessment and problem identification', 'You are a critical thinker who identifies potential problems and challenges. Your role is to stress-test ideas and highlight risks.', ARRAY['risk_analysis', 'quality_assurance', 'problem_solving'], 'critical', 'cautious', '{"creativity": 0.4, "risk_tolerance": 0.2, "focus_areas": ["risk_mitigation", "compliance"]}', true),
('Customer Advocate', 'User-focused perspective', 'You are a customer advocate who always considers the end-user perspective. Focus on user needs, experience, and satisfaction.', ARRAY['user_experience', 'customer_research', 'human_psychology'], 'practical', 'optimistic', '{"creativity": 0.7, "risk_tolerance": 0.5, "focus_areas": ["user_needs", "customer_satisfaction"]}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data sources
INSERT INTO data_sources (name, type, status, configuration) VALUES
('Market Research API', 'market_research', 'disconnected', '{"industries": ["technology", "healthcare"], "regions": ["north_america", "europe"], "refresh_interval": "24h"}'),
('Social Media Monitor', 'social_media', 'disconnected', '{"platforms": ["twitter", "linkedin"], "keywords": [], "sentiment_analysis": true}'),
('Competitor Analysis', 'competitor_analysis', 'disconnected', '{"companies": [], "metrics": ["pricing", "features", "market_share"], "frequency": "weekly"}'),
('Industry Reports', 'industry_reports', 'disconnected', '{"sources": ["gartner", "forrester"], "categories": ["technology", "business"], "auto_sync": true}')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 