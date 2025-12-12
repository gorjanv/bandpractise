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

    // Get all song versions
    const { data: songVersions, error: versionsError } = await supabase
      .from('song_versions')
      .select('*')
      .order('position', { ascending: true });

    if (versionsError) {
      console.error('Error fetching song versions:', versionsError);
      // Continue without versions if there's an error
    }

    // Group versions by song_id
    const versionsBySongId = (songVersions || []).reduce((acc: Record<string, any[]>, version: any) => {
      if (!acc[version.song_id]) {
        acc[version.song_id] = [];
      }
      acc[version.song_id].push({
        id: version.id,
        youtubeUrl: version.youtube_url,
        youtubeId: version.youtube_id,
        performedBy: version.performed_by,
        position: version.position,
      });
      return acc;
    }, {});

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
      
      const versions = versionsBySongId[song.id] || [];
      return dbSongToSong(song, voteStats, versions);
    });

    // Sort by average rating descending, then by created_at descending for songs with same/no rating
    const sortedSongs = songsWithVotes.sort((a, b) => {
      // First sort by average rating (descending)
      if (b.votes.averageRating !== a.votes.averageRating) {
        return b.votes.averageRating - a.votes.averageRating;
      }
      // If ratings are the same (or both 0), sort by created_at descending
      const aDate = new Date(a.addedAt).getTime();
      const bDate = new Date(b.addedAt).getTime();
      return bDate - aDate;
    });

    return NextResponse.json(sortedSongs);
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
    const { title, artist, artwork, youtubeUrl, youtubeId, versions } = body;

    if (!title || !artist || !artwork || !youtubeUrl || !youtubeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate versions if provided
    if (versions && Array.isArray(versions)) {
      for (const version of versions) {
        if (!version.youtubeUrl || !version.youtubeId || !version.performedBy) {
          return NextResponse.json(
            { error: 'All versions must have youtubeUrl, youtubeId, and performedBy' },
            { status: 400 }
          );
        }
      }
    }

    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown';

    // Insert the song
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        artwork,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        added_by: user.id, // Deprecated field, kept for backward compatibility
        added_by_name: userName,
        user_id: user.id, // Main field for ownership
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (songError) {
      throw songError;
    }

    // Insert versions if provided
    if (versions && Array.isArray(versions) && versions.length > 0) {
      const versionsToInsert = versions.map((version: any, index: number) => ({
        song_id: songData.id,
        youtube_url: version.youtubeUrl,
        youtube_id: version.youtubeId,
        performed_by: version.performedBy,
        position: version.position ?? index,
      }));

      const { error: versionsError } = await supabase
        .from('song_versions')
        .insert(versionsToInsert);

      if (versionsError) {
        // If versions insert fails, we should probably delete the song
        // But for now, just log the error and continue
        console.error('Error inserting song versions:', versionsError);
      }
    }

    // Fetch the versions we just inserted to include in the response
    const { data: songVersions } = await supabase
      .from('song_versions')
      .select('*')
      .eq('song_id', songData.id)
      .order('position', { ascending: true });

    const versionsArray = (songVersions || []).map((v: any) => ({
      id: v.id,
      youtubeUrl: v.youtube_url,
      youtubeId: v.youtube_id,
      performedBy: v.performed_by,
      position: v.position,
    }));

    const newSong = dbSongToSong(songData as DBSong, { averageRating: 0, totalVotes: 0 }, versionsArray.length > 0 ? versionsArray : undefined);
    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
}

