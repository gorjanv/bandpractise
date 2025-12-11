import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';
import { Setlist } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch setlists with songs
    const { data: setlists, error } = await supabase
      .from('setlists')
      .select(`
        *,
        setlist_songs (
          id,
          song_id,
          position,
          songs (
            id,
            title,
            artist,
            artwork,
            youtube_url,
            youtube_id,
            added_by_name,
            user_id
          )
        )
      `)
      .order('rehearsal_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Fetch all votes to calculate stats
    const { data: votes } = await supabase
      .from('votes')
      .select('song_id, rating')
      .not('rating', 'is', null);

    if (error) {
      console.error('Error fetching setlists:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Helper function to calculate vote stats for a song
    const getVoteStats = (songId: string) => {
      const songVotes = votes?.filter(v => v.song_id === songId && v.rating != null) || [];
      const ratings = songVotes.map(v => v.rating as number);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
      
      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalVotes: ratings.length,
      };
    };

    // Transform the data to match our TypeScript interface
    const transformedSetlists = setlists.map((setlist: any) => ({
      id: setlist.id,
      name: setlist.name,
      rehearsalDate: setlist.rehearsal_date,
      userId: setlist.user_id,
      createdAt: setlist.created_at,
      updatedAt: setlist.updated_at,
      songs: setlist.setlist_songs
        ?.sort((a: any, b: any) => a.position - b.position)
        .map((ss: any) => ({
          id: ss.id,
          setlistId: setlist.id,
          songId: ss.song_id,
          position: ss.position,
          song: ss.songs ? {
            id: ss.songs.id,
            title: ss.songs.title,
            artist: ss.songs.artist,
            artwork: ss.songs.artwork,
            youtubeUrl: ss.songs.youtube_url,
            youtubeId: ss.songs.youtube_id,
            addedBy: ss.songs.added_by_name || 'Unknown',
            addedAt: '',
            userId: ss.songs.user_id,
            votes: getVoteStats(ss.songs.id)
          } : undefined
        })) || []
    }));

    return NextResponse.json(transformedSetlists);
  } catch (error: any) {
    console.error('Error in GET /api/setlists:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, rehearsalDate } = body;

    if (!rehearsalDate) {
      return NextResponse.json(
        { error: 'Rehearsal date is required' },
        { status: 400 }
      );
    }

    const { data: setlist, error } = await supabase
      .from('setlists')
      .insert({
        name: name || null,
        rehearsal_date: rehearsalDate,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating setlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedSetlist: Setlist = {
      id: setlist.id,
      name: setlist.name,
      rehearsalDate: setlist.rehearsal_date,
      userId: setlist.user_id,
      createdAt: setlist.created_at,
      updatedAt: setlist.updated_at,
      songs: []
    };

    return NextResponse.json(transformedSetlist, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/setlists:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

