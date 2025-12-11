import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';
import { dbSongToSong, DBSong } from '@/lib/supabase';

// PATCH - Update a song (only allowed by the user who added it)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    const { songId } = await params;
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify song exists and user is the owner
    const { data: song, error: fetchError } = await supabase
      .from('songs')
      .select('user_id, added_by')
      .eq('id', songId)
      .single();

    if (fetchError || !song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Check ownership
    const isOwner = song.user_id === user.id || song.added_by === user.id;
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this song' },
        { status: 403 }
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

    // Update the song
    const { data: updatedSongs, error: updateError } = await supabase
      .from('songs')
      .update({
        title,
        artist,
        artwork,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
      })
      .eq('id', songId)
      .select();

    if (updateError) {
      console.error('Error updating song:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedSongs || updatedSongs.length === 0) {
      // Try to get the song again to see if it exists
      const { data: checkSong } = await supabase
        .from('songs')
        .select('id, user_id')
        .eq('id', songId)
        .single();
      
      if (!checkSong) {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        );
      }
      
      // If song exists but update returned nothing, it's likely an RLS issue
      console.error('Update returned 0 rows but song exists. RLS policy may be blocking.');
      return NextResponse.json(
        { error: 'Could not update song. You may not have permission to edit this song.' },
        { status: 403 }
      );
    }

    const updatedSong = updatedSongs[0];

    // Get vote stats for the updated song
    const { data: votes } = await supabase
      .from('votes')
      .select('rating')
      .eq('song_id', songId)
      .not('rating', 'is', null);

    const songVotes = votes || [];
    const ratings = songVotes.map(v => v.rating as number);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    const voteStats = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalVotes: ratings.length,
    };

    const result = dbSongToSong(updatedSong as DBSong, voteStats);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in PATCH /api/songs/[songId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a song (only allowed by the user who added it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
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

    const { songId } = await params;

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      );
    }

    // First, check if the song exists and get its owner
    const { data: song, error: fetchError } = await supabase
      .from('songs')
      .select('user_id, added_by')
      .eq('id', songId)
      .single();

    if (fetchError || !song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Check if the current user is the owner
    // Check both user_id (UUID) and added_by (text/deprecated) for backward compatibility
    const isOwner = song.user_id === user.id || song.added_by === user.id;
    
    if (!isOwner) {
      return NextResponse.json(
        { error: 'You can only delete songs you added' },
        { status: 403 }
      );
    }

    // Delete the song (cascade will delete associated votes)
    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json(
      { message: 'Song deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
}

