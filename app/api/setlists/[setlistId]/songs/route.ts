import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ setlistId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { setlistId } = await params;

    const body = await request.json();
    const { songId, position } = body;

    if (!songId || position === undefined) {
      return NextResponse.json(
        { error: 'songId and position are required' },
        { status: 400 }
      );
    }

    // Verify setlist exists
    const { data: setlist, error: fetchError } = await supabase
      .from('setlists')
      .select('id')
      .eq('id', setlistId)
      .single();

    if (fetchError || !setlist) {
      return NextResponse.json(
        { error: 'Setlist not found' },
        { status: 404 }
      );
    }

    // Get current max position to insert at the end if position not specified
    let insertPosition = position;
    if (position === -1) {
      const { data: maxPos } = await supabase
        .from('setlist_songs')
        .select('position')
        .eq('setlist_id', setlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      
      insertPosition = maxPos ? maxPos.position + 1 : 0;
    }

    // Shift existing songs at or after this position
    // We need to update positions one by one or use RPC, but for now let's fetch and update
    const { data: songsToShift } = await supabase
      .from('setlist_songs')
      .select('id, position')
      .eq('setlist_id', setlistId)
      .gte('position', insertPosition);
    
    if (songsToShift && songsToShift.length > 0) {
      await Promise.all(
        songsToShift.map(song =>
          supabase
            .from('setlist_songs')
            .update({ position: song.position + 1 })
            .eq('id', song.id)
        )
      );
    }

    const { data: setlistSong, error } = await supabase
      .from('setlist_songs')
      .insert({
        setlist_id: setlistId,
        song_id: songId,
        position: insertPosition,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding song to setlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update setlist updated_at
    await supabase
      .from('setlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', setlistId);

    return NextResponse.json(setlistSong, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/setlists/[setlistId]/songs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setlistId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    const { setlistId } = await params;
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      );
    }

    // Verify setlist exists
    const { data: setlist, error: fetchError } = await supabase
      .from('setlists')
      .select('id')
      .eq('id', setlistId)
      .single();

    if (fetchError || !setlist) {
      return NextResponse.json(
        { error: 'Setlist not found' },
        { status: 404 }
      );
    }

    // Get the position of the song being removed
    const { data: songToRemove } = await supabase
      .from('setlist_songs')
      .select('position')
      .eq('setlist_id', setlistId)
      .eq('song_id', songId)
      .single();

    // Delete the song
    const { error } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('setlist_id', setlistId)
      .eq('song_id', songId);

    if (error) {
      console.error('Error removing song from setlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Shift remaining songs up
    if (songToRemove) {
      const { data: songsToShift } = await supabase
        .from('setlist_songs')
        .select('id, position')
        .eq('setlist_id', setlistId)
        .gt('position', songToRemove.position);
      
      if (songsToShift && songsToShift.length > 0) {
        await Promise.all(
          songsToShift.map(song =>
            supabase
              .from('setlist_songs')
              .update({ position: song.position - 1 })
              .eq('id', song.id)
          )
        );
      }
    }

    // Update setlist updated_at
    await supabase
      .from('setlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', setlistId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/setlists/[setlistId]/songs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reorder songs in a setlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ setlistId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { setlistId } = await params;

    const body = await request.json();
    const { songIds } = body; // Array of song IDs in the new order

    if (!Array.isArray(songIds)) {
      return NextResponse.json(
        { error: 'songIds must be an array' },
        { status: 400 }
      );
    }

    // Verify setlist exists
    const { data: setlist, error: fetchError } = await supabase
      .from('setlists')
      .select('id')
      .eq('id', setlistId)
      .single();

    if (fetchError || !setlist) {
      return NextResponse.json(
        { error: 'Setlist not found' },
        { status: 404 }
      );
    }

    // First, set all positions to negative values to avoid unique constraint violations
    // Then update to final positions
    const maxPosition = await supabase
      .from('setlist_songs')
      .select('position')
      .eq('setlist_id', setlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();
    
    const offset = maxPosition.data ? maxPosition.data.position + 1000 : 1000;
    
    // Step 1: Set all positions to temporary negative values
    for (let i = 0; i < songIds.length; i++) {
      const { error } = await supabase
        .from('setlist_songs')
        .update({ position: -(offset + i) })
        .eq('setlist_id', setlistId)
        .eq('song_id', songIds[i]);
      
      if (error) {
        console.error('Error setting temporary position:', error);
        return NextResponse.json(
          { error: 'Failed to update song positions' },
          { status: 500 }
        );
      }
    }
    
    // Step 2: Update to final positions
    for (let i = 0; i < songIds.length; i++) {
      const { error } = await supabase
        .from('setlist_songs')
        .update({ position: i })
        .eq('setlist_id', setlistId)
        .eq('song_id', songIds[i]);
      
      if (error) {
        console.error('Error setting final position:', error);
        return NextResponse.json(
          { error: 'Failed to update song positions' },
          { status: 500 }
        );
      }
    }

    // Update setlist updated_at
    await supabase
      .from('setlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', setlistId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/setlists/[setlistId]/songs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

