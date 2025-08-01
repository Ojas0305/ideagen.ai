-- Add evaluation score columns to full_ideas table
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS feasibility_score INTEGER DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 100);
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS market_potential_score INTEGER DEFAULT 0 CHECK (market_potential_score >= 0 AND market_potential_score <= 100);
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS uniqueness_score INTEGER DEFAULT 0 CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100);
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS evaluation_reasoning TEXT;

-- Add additional idea fields for better AI evaluation
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS problem TEXT;
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS market_opportunity TEXT;
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE full_ideas ADD COLUMN IF NOT EXISTS implementation TEXT;

-- Create indexes for the new score columns
CREATE INDEX IF NOT EXISTS idx_full_ideas_feasibility_score ON full_ideas(feasibility_score);
CREATE INDEX IF NOT EXISTS idx_full_ideas_market_potential_score ON full_ideas(market_potential_score);
CREATE INDEX IF NOT EXISTS idx_full_ideas_uniqueness_score ON full_ideas(uniqueness_score); 