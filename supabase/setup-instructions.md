# Quick Database Setup Instructions

## The Error You're Seeing

If you see: `"Could not find the table 'public.songs' in the schema cache"`

This means the database tables haven't been created yet. Follow these steps:

## Step-by-Step Setup

### 1. Open Supabase Dashboard
- Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project

### 2. Open SQL Editor
- Click on **SQL Editor** in the left sidebar
- Click **New Query**

### 3. Run the Schema
- Copy the entire contents of `supabase/schema.sql`
- Paste it into the SQL Editor
- Click **Run** (or press Cmd/Ctrl + Enter)

### 4. Verify Tables Were Created
- Go to **Table Editor** in the left sidebar
- You should see two tables: `songs` and `votes`

### 5. If Real-time Commands Fail
If you see errors about `supabase_realtime` publication, that's okay - it might already be enabled. You can skip those lines or run this alternative schema:

```sql
-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artwork TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  voter TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(song_id, voter)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_votes_song_id ON votes(song_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their own votes" ON votes FOR UPDATE USING (true);
```

### 6. Enable Real-time (Optional but Recommended)
After creating the tables, go to:
- **Database** → **Replication** (or **Settings** → **API** → **Realtime**)
- Enable replication for `songs` and `votes` tables

Or run in SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

### 7. Test Your App
- Refresh your app in the browser
- Try adding a song
- It should work now!

## Troubleshooting

**Still seeing the error?**
- Make sure your `.env.local` has the correct Supabase URL and key
- Restart your Next.js dev server: `npm run dev`
- Double-check that both tables exist in Table Editor

**Real-time not working?**
- Make sure replication is enabled for both tables
- Check that your Supabase project isn't paused

