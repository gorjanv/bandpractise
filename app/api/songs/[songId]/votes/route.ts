import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

// GET all votes with comments for a specific song
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    const { songId } = await params;

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      );
    }

    // Get votes - we'll use voter_name if available, otherwise voter or user_id
    const { data: votes, error } = await supabase
      .from('votes')
      .select(`
        id,
        rating,
        comment,
        timestamp,
        user_id,
        voter_name,
        voter
      `)
      .eq('song_id', songId)
      .not('rating', 'is', null)
      .order('timestamp', { ascending: false });

    // If voter_name column doesn't exist, filter it out and use voter instead
    if (error && error.code === '42703' && error.message?.includes('voter_name')) {
      const { data: votesWithoutName, error: retryError } = await supabase
        .from('votes')
        .select(`
          id,
          rating,
          comment,
          timestamp,
          user_id,
          voter
        `)
        .eq('song_id', songId)
        .not('rating', 'is', null)
        .order('timestamp', { ascending: false });
      
      if (retryError) {
        throw retryError;
      }
      
      return NextResponse.json(
        (votesWithoutName || []).map((v: any) => ({
          ...v,
          voter_name: v.voter || null,
        }))
      );
    }

    if (error) {
      throw error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json(votes || []);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

