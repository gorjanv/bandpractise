import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';
import { dbSongToSong, DBSong } from '@/lib/supabase';

// GET all songs with vote counts
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get all songs
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (songsError) {
      throw songsError;
    }

    // Get all votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('song_id, rating');

    if (votesError) {
      throw votesError;
    }

    // Calculate average ratings for each song
    const songsWithVotes = (songs || []).map((song: DBSong) => {
      const songVotes = votes?.filter(v => v.song_id === song.id && v.rating != null) || [];
      const ratings = songVotes.map(v => v.rating as number);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
      
      const voteStats = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalVotes: ratings.length,
      };
      return dbSongToSong(song, voteStats);
    });

    return NextResponse.json(songsWithVotes);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// POST a new song
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, artist, artwork, youtubeUrl, youtubeId } = body;

    if (!title || !artist || !artwork || !youtubeUrl || !youtubeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown';

    const { data, error } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        artwork,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        added_by: user.id,
        added_by_name: userName,
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const newSong = dbSongToSong(data as DBSong, { averageRating: 0, totalVotes: 0 });
    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}

