-- Migration: Add rating and comment columns to votes table
-- Run this in your Supabase SQL Editor

-- Add rating column (1-10)
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 10);

-- Add comment column (optional text)
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Add voter_name column for displaying who voted
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Make old vote and voter columns nullable if they aren't already
ALTER TABLE votes ALTER COLUMN vote DROP NOT NULL;
ALTER TABLE votes ALTER COLUMN voter DROP NOT NULL;

-- Update the unique constraint to use song_id, user_id (already done in auth migration)
-- If you need to re-run it:
-- ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_song_id_user_id_key;
-- ALTER TABLE votes ADD CONSTRAINT votes_song_id_user_id_key UNIQUE (song_id, user_id);

-- Create index for rating queries
CREATE INDEX IF NOT EXISTS idx_votes_rating ON votes(rating);

-- Note: Existing yes/no votes will need to be migrated manually if you have data
-- You can run this to migrate:
-- UPDATE votes SET rating = CASE WHEN vote = 'yes' THEN 7 ELSE 3 END WHERE rating IS NULL AND vote IS NOT NULL;

