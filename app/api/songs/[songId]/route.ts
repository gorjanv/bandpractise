import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

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

