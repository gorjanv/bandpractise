-- Migration: Add policy to allow users to delete their own songs
-- Run this in your Supabase SQL Editor

-- Policy to allow users to delete songs they added
CREATE POLICY "Users can delete their own songs" ON songs
  FOR DELETE USING (auth.uid() = user_id OR auth.uid()::text = added_by);


