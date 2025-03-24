-- Drop existing tables if they exist
DROP TABLE IF EXISTS bet_participants;
DROP TABLE IF EXISTS bets;
DROP TYPE IF EXISTS bet_type;

-- Create bet type enum
CREATE TYPE bet_type AS ENUM ('yesno', 'number', 'custom');

-- Create bets table
CREATE TABLE bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    code_name TEXT UNIQUE NOT NULL,
    creator_name TEXT NOT NULL,
    bettype bet_type NOT NULL,
    question TEXT NOT NULL,
    description TEXT,
    unit TEXT,
    min_value NUMERIC,
    max_value NUMERIC,
    customoption1 TEXT,
    customoption2 TEXT,
    -- Add constraints
    CONSTRAINT valid_number_bet CHECK (
        (bettype = 'number' AND min_value IS NOT NULL AND max_value IS NOT NULL AND max_value > min_value) OR
        bettype != 'number'
    ),
    CONSTRAINT valid_custom_bet CHECK (
        (bettype = 'custom' AND customoption1 IS NOT NULL AND customoption2 IS NOT NULL) OR
        bettype != 'custom'
    )
);

-- Create bet_participants table
CREATE TABLE bet_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prediction TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_bets_code_name ON bets(code_name);
CREATE INDEX idx_bet_participants_bet_id ON bet_participants(bet_id);

-- Enable Row Level Security (RLS)
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON bets
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON bets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON bet_participants
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON bet_participants
    FOR INSERT WITH CHECK (true);

-- Add function to generate code_name
CREATE OR REPLACE FUNCTION generate_code_name()
RETURNS TRIGGER AS $$
DECLARE
    base_name TEXT;
    final_name TEXT;
    counter INTEGER := 0;
    words TEXT[];
BEGIN
    -- Split question into words
    words := regexp_split_to_array(LOWER(NEW.question), '\s+');
    
    -- Take first 3 words (or fewer if question is shorter)
    base_name := array_to_string(
        words[1:LEAST(3, array_length(words, 1))],
        '-'
    );
    
    -- Clean up the base_name (remove special characters)
    base_name := regexp_replace(base_name, '[^a-z0-9-]', '', 'g');
    
    -- Remove leading/trailing hyphens
    base_name := trim(both '-' from base_name);
    
    -- Initial attempt without counter
    final_name := base_name;
    
    -- Add counter if name exists
    WHILE EXISTS (SELECT 1 FROM bets WHERE code_name = final_name) LOOP
        counter := counter + 1;
        final_name := base_name || '-' || counter;
    END LOOP;
    
    NEW.code_name := final_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for code_name generation
CREATE TRIGGER generate_code_name_trigger
    BEFORE INSERT ON bets
    FOR EACH ROW
    WHEN (NEW.code_name IS NULL)
    EXECUTE FUNCTION generate_code_name(); 