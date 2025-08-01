-- Add persona_id column to full_ideas table to track which persona created each idea
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES ai_personas(id) ON DELETE SET NULL;

-- Add status column to track idea lifecycle
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generated' CHECK (status IN ('seed', 'generated', 'refined', 'evaluated', 'selected', 'rejected'));

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_full_ideas_persona_id ON full_ideas(persona_id);
CREATE INDEX IF NOT EXISTS idx_full_ideas_status ON full_ideas(status);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated; 