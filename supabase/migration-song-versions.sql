-- Create song_versions table to support multiple YouTube versions per song
CREATE TABLE IF NOT EXISTS song_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_song_versions_song_id ON song_versions(song_id);
CREATE INDEX IF NOT EXISTS idx_song_versions_position ON song_versions(song_id, position);

-- Enable Row Level Security (RLS)
ALTER TABLE song_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read song versions" ON song_versions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert song versions" ON song_versions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update song versions" ON song_versions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete song versions" ON song_versions
  FOR DELETE USING (true);

-- Enable real-time for song_versions table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE song_versions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
