-- Database Schema for AI-Powered Idea Generation Platform
-- Compatible with Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    challenge TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'processing', 'generating', 'completed', 'paused')),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('market_research', 'social_media', 'competitor_analysis', 'industry_reports', 'custom_api')),
    api_endpoint TEXT,
    credentials JSONB, -- Encrypted API keys and secrets
    configuration JSONB, -- Source-specific configuration
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
    last_sync TIMESTAMP WITH TIME ZONE,
    data_quality INTEGER DEFAULT 0 CHECK (data_quality >= 0 AND data_quality <= 100),
    records_collected INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Personas table
CREATE TABLE IF NOT EXISTS ai_personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    expertise TEXT[] DEFAULT '{}',
    thinking_style TEXT NOT NULL CHECK (thinking_style IN ('creative', 'analytical', 'critical', 'practical')),
    personality TEXT NOT NULL CHECK (personality IN ('optimistic', 'realistic', 'cautious', 'aggressive')),
    configuration JSONB, -- AI-specific parameters (creativity, risk tolerance, etc.)
    metrics JSONB DEFAULT '{"ideas_generated": 0, "average_score": 0, "utilization_rate": 0}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Data Sources junction table
CREATE TABLE IF NOT EXISTS project_data_sources (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, data_source_id)
);

-- Project AI Personas junction table
CREATE TABLE IF NOT EXISTS project_ai_personas (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ai_persona_id UUID REFERENCES ai_personas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, ai_persona_id)
);

-- Idea Sessions table
CREATE TABLE IF NOT EXISTS idea_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'starting', 'data_retrieval', 'processing', 'seed_generation', 'idea_development', 'completed', 'failed')),
    stage TEXT DEFAULT 'data_retrieval' CHECK (stage IN ('data_retrieval', 'processing', 'seed_generation', 'idea_development', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    configuration JSONB, -- Session-specific settings
    statistics JSONB DEFAULT '{"seeds_generated": 0, "full_ideas_developed": 0, "average_score": 0, "data_insights_processed": 0}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Insights table
CREATE TABLE IF NOT EXISTS data_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    relevance DECIMAL(3,2) DEFAULT 0.0 CHECK (relevance >= 0.0 AND relevance <= 1.0),
    metadata JSONB,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idea Seeds table
CREATE TABLE IF NOT EXISTS idea_seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    ai_persona_id UUID REFERENCES ai_personas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    generated_by TEXT NOT NULL, -- AI persona name
    tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full Ideas table
CREATE TABLE IF NOT EXISTS full_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    seed_id UUID REFERENCES idea_seeds(id) ON DELETE SET NULL,
    ai_persona_id UUID REFERENCES ai_personas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem TEXT,
    solution TEXT,
    market_opportunity TEXT,
    target_audience TEXT,
    implementation TEXT,
    feasibility_score INTEGER DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    market_score INTEGER DEFAULT 0 CHECK (market_score >= 0 AND market_score <= 100),
    uniqueness_score INTEGER DEFAULT 0 CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100),
    overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID REFERENCES full_ideas(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('human_feedback', 'ai_analysis', 'market_validation', 'technical_review')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    criteria TEXT,
    evaluated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    evaluator_name TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export Jobs table
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    idea_ids UUID[] NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'powerpoint', 'word', 'json')),
    template TEXT DEFAULT 'default',
    options JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Events table (for real-time updates)
CREATE TABLE IF NOT EXISTS session_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES idea_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('stage_update', 'seed_generated', 'idea_completed', 'persona_message', 'error')),
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Views
CREATE VIEW IF NOT EXISTS project_analytics AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.industry,
    p.created_at,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT fi.id) as ideas_generated,
    AVG(fi.overall_score) as average_score,
    MAX(s.completed_at) as last_activity
FROM projects p
LEFT JOIN idea_sessions s ON p.id = s.project_id
LEFT JOIN full_ideas fi ON s.id = fi.session_id
GROUP BY p.id, p.name, p.status, p.industry, p.created_at;

CREATE VIEW IF NOT EXISTS idea_analytics AS
SELECT 
    fi.id,
    fi.title,
    fi.category,
    fi.overall_score,
    fi.created_at,
    p.name as project_name,
    p.industry,
    s.name as session_name,
    COUNT(e.id) as evaluation_count,
    AVG(e.score) as average_evaluation_score
FROM full_ideas fi
LEFT JOIN idea_sessions s ON fi.session_id = s.id
LEFT JOIN projects p ON s.project_id = p.id
LEFT JOIN evaluations e ON fi.id = e.idea_id
GROUP BY fi.id, fi.title, fi.category, fi.overall_score, fi.created_at, p.name, p.industry, s.name;

CREATE VIEW IF NOT EXISTS persona_analytics AS
SELECT 
    ap.id,
    ap.name,
    ap.role,
    ap.thinking_style,
    COUNT(DISTINCT is_seeds.id) as seeds_generated,
    COUNT(DISTINCT fi.id) as ideas_developed,
    AVG(fi.overall_score) as average_idea_score,
    COUNT(DISTINCT s.id) as sessions_participated
FROM ai_personas ap
LEFT JOIN idea_seeds is_seeds ON ap.id = is_seeds.ai_persona_id
LEFT JOIN full_ideas fi ON ap.id = fi.ai_persona_id
LEFT JOIN idea_sessions s ON (is_seeds.session_id = s.id OR fi.session_id = s.id)
GROUP BY ap.id, ap.name, ap.role, ap.thinking_style;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_project ON idea_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_status ON idea_sessions(status);
CREATE INDEX IF NOT EXISTS idx_idea_seeds_session ON idea_seeds(session_id);
CREATE INDEX IF NOT EXISTS idx_full_ideas_session ON full_ideas(session_id);
CREATE INDEX IF NOT EXISTS idx_full_ideas_seed ON full_ideas(seed_id);
CREATE INDEX IF NOT EXISTS idx_full_ideas_score ON full_ideas(overall_score);
CREATE INDEX IF NOT EXISTS idx_evaluations_idea ON evaluations(idea_id);
CREATE INDEX IF NOT EXISTS idx_data_insights_session ON data_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_timestamp ON session_events(timestamp);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_full_ideas_title_search ON full_ideas USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_full_ideas_description_search ON full_ideas USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_data_insights_content_search ON data_insights USING gin(to_tsvector('english', content));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_personas_updated_at BEFORE UPDATE ON ai_personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idea_sessions_updated_at BEFORE UPDATE ON idea_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_full_ideas_updated_at BEFORE UPDATE ON full_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_jobs_updated_at BEFORE UPDATE ON export_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Projects are owned by users
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- Data sources are accessible by project owners
CREATE POLICY "Users can view data sources" ON data_sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_data_sources pds
            JOIN projects p ON pds.project_id = p.id
            WHERE pds.data_source_id = data_sources.id
            AND p.owner_id = auth.uid()
        )
    );

-- AI personas can be viewed by all authenticated users
CREATE POLICY "Authenticated users can view AI personas" ON ai_personas
    FOR SELECT TO authenticated USING (true);

-- Idea sessions are accessible by project owners
CREATE POLICY "Users can view own idea sessions" ON idea_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = idea_sessions.project_id
            AND p.owner_id = auth.uid()
        )
    );

-- Similar policies for other tables...

-- Insert default AI personas
INSERT INTO ai_personas (name, role, system_prompt, expertise, thinking_style, personality, configuration, is_default) VALUES
('The Visionary', 'Big picture thinking and disruptive innovation', 'You are a visionary thinker who sees beyond current limitations and imagines revolutionary solutions. Focus on breakthrough innovations and paradigm shifts.', ARRAY['innovation', 'technology', 'market_disruption'], 'creative', 'optimistic', '{"creativity": 0.9, "risk_tolerance": 0.8, "focus_areas": ["emerging_tech", "user_experience"]}', true),
('The Analyst', 'Data-driven practical solutions', 'You are a methodical analyst who relies on data and evidence to generate practical, implementable ideas. Focus on feasibility and market validation.', ARRAY['market_analysis', 'data_science', 'business_strategy'], 'analytical', 'realistic', '{"creativity": 0.6, "risk_tolerance": 0.4, "focus_areas": ["market_data", "financial_metrics"]}', true),
('The Critic', 'Risk assessment and problem identification', 'You are a critical thinker who identifies potential problems and challenges. Your role is to stress-test ideas and highlight risks.', ARRAY['risk_analysis', 'quality_assurance', 'problem_solving'], 'critical', 'cautious', '{"creativity": 0.4, "risk_tolerance": 0.2, "focus_areas": ["risk_mitigation", "compliance"]}', true),
('The Customer Advocate', 'User-focused perspective', 'You are a customer advocate who always considers the end-user perspective. Focus on user needs, experience, and satisfaction.', ARRAY['user_experience', 'customer_research', 'human_psychology'], 'practical', 'optimistic', '{"creativity": 0.7, "risk_tolerance": 0.5, "focus_areas": ["user_needs", "customer_satisfaction"]}', true);

-- Insert sample data sources
INSERT INTO data_sources (name, type, status, configuration) VALUES
('Market Research API', 'market_research', 'disconnected', '{"industries": ["technology", "healthcare"], "regions": ["north_america", "europe"], "refresh_interval": "24h"}'),
('Social Media Monitor', 'social_media', 'disconnected', '{"platforms": ["twitter", "linkedin"], "keywords": [], "sentiment_analysis": true}'),
('Competitor Analysis', 'competitor_analysis', 'disconnected', '{"companies": [], "metrics": ["pricing", "features", "market_share"], "frequency": "weekly"}'),
('Industry Reports', 'industry_reports', 'disconnected', '{"sources": ["gartner", "forrester"], "categories": ["technology", "business"], "auto_sync": true}');

-- Sample user (for testing)
INSERT INTO users (id, email, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@ideagen.com', 'Demo User', 'user')
ON CONFLICT (id) DO NOTHING; 