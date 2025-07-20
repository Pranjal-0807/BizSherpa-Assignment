-- Creating transcripts table
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  attendees VARCHAR(500) NOT NULL,
  date DATE NOT NULL,
  transcript TEXT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creating LinkedIn icebreakers table
CREATE TABLE linkedin_icebreakers (
  id SERIAL PRIMARY KEY,
  prospect_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(100) NOT NULL,
  linkedin_bio TEXT NOT NULL,
  pitch_deck TEXT NOT NULL,
  role_level VARCHAR(50) DEFAULT 'Mid-level',
  icebreaker_analysis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creating indexes for better query performance
CREATE INDEX idx_transcripts_created_at ON transcripts(created_at DESC);
CREATE INDEX idx_transcripts_company ON transcripts(company_name);
CREATE INDEX idx_transcripts_date ON transcripts(date);

CREATE INDEX idx_linkedin_icebreakers_created_at ON linkedin_icebreakers(created_at DESC);
CREATE INDEX idx_linkedin_icebreakers_company ON linkedin_icebreakers(company_name);
CREATE INDEX idx_linkedin_icebreakers_prospect ON linkedin_icebreakers(prospect_name);

-- Enabling Row Level Security (optional but recommended)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_icebreakers ENABLE ROW LEVEL SECURITY;

-- Creating policies for authenticated users (adjust based on your needs)
CREATE POLICY "Users can view all transcripts" ON transcripts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert transcripts" ON transcripts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their transcripts" ON transcripts
  FOR DELETE USING (true);

CREATE POLICY "Users can view all linkedin icebreakers" ON linkedin_icebreakers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert linkedin icebreakers" ON linkedin_icebreakers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their linkedin icebreakers" ON linkedin_icebreakers
  FOR DELETE USING (true);