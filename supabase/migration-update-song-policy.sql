-- Migration: Add RLS policy for updating songs
-- Users can update their own songs

CREATE POLICY "Users can update their own songs" ON songs
  FOR UPDATE 
  USING (auth.uid() = user_id);

