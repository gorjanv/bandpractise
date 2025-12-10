-- Migration: Update schema to use authentication
-- Run this AFTER setting up Supabase Auth

-- Add user_id column to songs table (keeping added_by for backward compatibility)
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS added_by_name TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update votes table to use user_id instead of voter text
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make voter column nullable (it's deprecated but kept for backward compatibility)
ALTER TABLE votes ALTER COLUMN voter DROP NOT NULL;

-- Drop the old unique constraint if it exists
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_song_id_voter_key;

-- Create new unique constraint on song_id and user_id
ALTER TABLE votes ADD CONSTRAINT votes_song_id_user_id_key UNIQUE (song_id, user_id);

-- Create index for user_id in votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);

-- Update RLS policies to use authenticated users
DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
DROP POLICY IF EXISTS "Anyone can insert songs" ON songs;
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;
DROP POLICY IF EXISTS "Anyone can update their own votes" ON votes;

-- New policies that require authentication
CREATE POLICY "Authenticated users can read songs" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Migrate existing data (if any) - you may need to manually update these
-- UPDATE songs SET user_id = (SELECT id FROM auth.users WHERE email = added_by LIMIT 1) WHERE user_id IS NULL;
-- UPDATE votes SET user_id = (SELECT id FROM auth.users WHERE email = voter LIMIT 1) WHERE user_id IS NULL;

