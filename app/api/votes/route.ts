import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

// POST a new vote or update existing vote
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
    const { songId, rating, comment } = body;

    if (!songId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown';

    // Prepare vote data
    const voteData: any = {
      song_id: songId,
      rating: Math.round(rating),
      comment: comment || null,
      user_id: user.id,
      voter: null, // Deprecated field, kept for backward compatibility
      vote: null, // Deprecated field, kept for backward compatibility
      timestamp: new Date().toISOString(),
    };

    // Try to include voter_name, but handle if column doesn't exist
    try {
      voteData.voter_name = userName;
    } catch {
      // Column might not exist yet, will be handled by fallback
    }

    // Upsert vote (insert or update if exists)
    const { data, error } = await supabase
      .from('votes')
      .upsert(voteData, {
        onConflict: 'song_id,user_id',
      })
      .select()
      .single();

    // If voter_name column doesn't exist, try again without it
    if (error && error.code === '42703' && error.message?.includes('voter_name')) {
      const { data: retryData, error: retryError } = await supabase
        .from('votes')
        .upsert(
          {
            song_id: songId,
            rating: Math.round(rating),
            comment: comment || null,
            user_id: user.id,
            voter: userName, // Use old voter field as fallback
            vote: null,
            timestamp: new Date().toISOString(),
          },
          {
            onConflict: 'song_id,user_id',
          }
        )
        .select()
        .single();

      if (retryError) {
        throw retryError;
      }

      // Continue with vote statistics calculation
    } else if (error) {
      throw error;
    }

    // Get updated vote statistics
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('rating')
      .eq('song_id', songId);

    if (votesError) {
      throw votesError;
    }

    const validRatings = votes?.filter(v => v.rating != null).map(v => v.rating as number) || [];
    const averageRating = validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalVotes: validRatings.length,
    });
  } catch (error) {
    console.error('Error saving vote:', error);
    return NextResponse.json(
      { error: 'Failed to save vote' },
      { status: 500 }
    );
  }
}

// GET votes for a specific song
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForRoute(request);
    
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { error: 'songId parameter is required' },
        { status: 400 }
      );
    }

    const { data: votes, error } = await supabase
      .from('votes')
      .select('rating')
      .eq('song_id', songId);

    if (error) {
      throw error;
    }

    const validRatings = votes?.filter(v => v.rating != null).map(v => v.rating as number) || [];
    const averageRating = validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalVotes: validRatings.length,
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

