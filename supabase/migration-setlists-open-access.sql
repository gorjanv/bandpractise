-- Migration: Update setlist RLS policies to allow all authenticated users to modify setlists
-- Run this in your Supabase SQL Editor if you've already run migration-setlists.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own setlists" ON setlists;
DROP POLICY IF EXISTS "Users can update their own setlists" ON setlists;
DROP POLICY IF EXISTS "Users can delete their own setlists" ON setlists;
DROP POLICY IF EXISTS "Users can manage songs in their own setlists" ON setlist_songs;

-- Create new policies that allow all authenticated users to modify setlists
CREATE POLICY "Authenticated users can create setlists" ON setlists
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all setlists" ON setlists
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all setlists" ON setlists
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage songs in all setlists" ON setlist_songs
  FOR ALL USING (auth.uid() IS NOT NULL);


