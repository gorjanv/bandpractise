-- Migration: Create setlists and setlist_songs tables
-- Run this in your Supabase SQL Editor

-- Create setlists table
CREATE TABLE IF NOT EXISTS setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- Optional name for the setlist
  rehearsal_date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setlist_songs table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order of the song in the setlist
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(setlist_id, song_id), -- Prevent duplicate songs in a setlist
  UNIQUE(setlist_id, position) -- Ensure unique positions within a setlist
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_setlists_user_id ON setlists(user_id);
CREATE INDEX IF NOT EXISTS idx_setlists_rehearsal_date ON setlists(rehearsal_date DESC);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_setlist_id ON setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_song_id ON setlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_position ON setlist_songs(setlist_id, position);

-- Enable Row Level Security (RLS)
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for setlists
CREATE POLICY "Authenticated users can read all setlists" ON setlists
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create setlists" ON setlists
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all setlists" ON setlists
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all setlists" ON setlists
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create policies for setlist_songs
CREATE POLICY "Authenticated users can read setlist songs" ON setlist_songs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage songs in all setlists" ON setlist_songs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Enable real-time for setlists (optional, for live updates)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE setlists;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE setlist_songs;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

