import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

// GET all votes for the current user
export async function GET(request: NextRequest) {
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

    // Get all votes for the current user
    const { data: votes, error } = await supabase
      .from('votes')
      .select('song_id, rating, comment')
      .eq('user_id', user.id)
      .not('rating', 'is', null);

    if (error) {
      throw error;
    }

    // Convert to a map for easy lookup: { songId: { rating, comment } }
    const votesMap: Record<string, { rating: number; comment?: string }> = {};
    (votes || []).forEach((vote: any) => {
      votesMap[vote.song_id] = {
        rating: vote.rating,
        comment: vote.comment || undefined,
      };
    });

    return NextResponse.json(votesMap);
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user votes' },
      { status: 500 }
    );
  }
}
