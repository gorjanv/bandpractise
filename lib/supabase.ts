import { createClient } from '@supabase/supabase-js';
import { Song, Vote } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key must be provided via environment variables');
}

// Client-side Supabase client (for use in React components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for use in API routes)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Database types matching our tables
export interface DBSong {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  youtube_url: string;
  youtube_id: string;
  added_by: string;
  added_by_name?: string;
  added_at: string;
  created_at: string;
}

export interface DBVote {
  id?: string;
  song_id: string;
  rating?: number;
  comment?: string;
  vote?: 'yes' | 'no' | null; // Deprecated
  voter?: string | null; // Deprecated
  timestamp: string;
  created_at?: string;
}

// Convert DB song to app song format
export function dbSongToSong(dbSong: DBSong, votes: { averageRating: number; totalVotes: number }): Song {
  return {
    id: dbSong.id,
    title: dbSong.title,
    artist: dbSong.artist,
    artwork: dbSong.artwork,
    youtubeUrl: dbSong.youtube_url,
    youtubeId: dbSong.youtube_id,
    addedBy: dbSong.added_by_name || dbSong.added_by || 'Unknown',
    addedAt: dbSong.added_at,
    votes,
  };
}

