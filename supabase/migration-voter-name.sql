-- Migration: Add voter_name column to votes table
-- Run this in your Supabase SQL Editor

-- Add voter_name column for displaying who voted
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Backfill existing votes (optional - update with user names if needed)
-- UPDATE votes SET voter_name = voter WHERE voter_name IS NULL AND voter IS NOT NULL;


