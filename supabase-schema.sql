-- Little Bets Database Schema
-- Run this in the Supabase SQL Editor for your new project

-- ============================================
-- Table: bets
-- ============================================
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('yesno', 'multiple_choice')),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  code_name TEXT UNIQUE,
  creator_id UUID REFERENCES auth.users(id),
  creator_name TEXT,
  total_predictions INTEGER DEFAULT 0 NOT NULL
);

-- ============================================
-- Table: bet_participants
-- ============================================
CREATE TABLE bet_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE NOT NULL,
  participant_name TEXT NOT NULL,
  prediction BOOLEAN NOT NULL,
  option_index INTEGER DEFAULT 0 NOT NULL,
  UNIQUE (bet_id, participant_name)
);

-- ============================================
-- Function: Generate code_name from question
-- ============================================
CREATE OR REPLACE FUNCTION generate_code_name()
RETURNS TRIGGER AS $$
DECLARE
  base_name TEXT;
  final_name TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert question to lowercase, replace non-alphanumeric with hyphens, trim
  base_name := lower(NEW.question);
  base_name := regexp_replace(base_name, '[^a-z0-9]+', '-', 'g');
  base_name := trim(both '-' from base_name);
  base_name := left(base_name, 50);
  base_name := trim(both '-' from base_name);

  final_name := base_name;

  -- Handle collisions by appending a counter
  WHILE EXISTS (SELECT 1 FROM bets WHERE code_name = final_name AND id != NEW.id) LOOP
    counter := counter + 1;
    final_name := base_name || '-' || counter;
  END LOOP;

  NEW.code_name := final_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_code_name
  BEFORE INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION generate_code_name();

-- ============================================
-- Function: Update counts after prediction
-- ============================================
CREATE OR REPLACE FUNCTION update_bet_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_predictions
  UPDATE bets
  SET total_predictions = (
    SELECT COUNT(*) FROM bet_participants WHERE bet_id = NEW.bet_id
  )
  WHERE id = NEW.bet_id;

  -- Update option yes/no counts in JSONB
  IF (SELECT bet_type FROM bets WHERE id = NEW.bet_id) = 'yesno' THEN
    UPDATE bets
    SET options = jsonb_set(
      jsonb_set(
        options,
        ARRAY['0', 'yes_count'],
        to_jsonb((SELECT COUNT(*) FROM bet_participants WHERE bet_id = NEW.bet_id AND prediction = true))
      ),
      ARRAY['0', 'no_count'],
      to_jsonb((SELECT COUNT(*) FROM bet_participants WHERE bet_id = NEW.bet_id AND prediction = false))
    )
    WHERE id = NEW.bet_id;
  ELSE
    -- Multiple choice: increment yes_count for the selected option
    UPDATE bets
    SET options = jsonb_set(
      options,
      ARRAY[NEW.option_index::text, 'yes_count'],
      to_jsonb((SELECT COUNT(*) FROM bet_participants WHERE bet_id = NEW.bet_id AND option_index = NEW.option_index))
    )
    WHERE id = NEW.bet_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_prediction_insert
  AFTER INSERT ON bet_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_bet_counts();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_participants ENABLE ROW LEVEL SECURITY;

-- Bets: anyone can read
CREATE POLICY "Anyone can read bets"
  ON bets FOR SELECT
  USING (true);

-- Bets: authenticated users can create
CREATE POLICY "Authenticated users can create bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Bet participants: anyone can read
CREATE POLICY "Anyone can read predictions"
  ON bet_participants FOR SELECT
  USING (true);

-- Bet participants: anyone can predict (anonymous allowed)
CREATE POLICY "Anyone can submit predictions"
  ON bet_participants FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_bets_code_name ON bets(code_name);
CREATE INDEX idx_bets_creator_id ON bets(creator_id);
CREATE INDEX idx_participants_bet_id ON bet_participants(bet_id);
