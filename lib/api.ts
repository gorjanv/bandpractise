import { Song, VoteWithDetails } from '@/types';
import { supabase } from '@/lib/supabase';

const API_BASE = '/api';

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// Fetch all songs with vote counts
export async function fetchSongs(): Promise<Song[]> {
  const response = await fetch(API_BASE + '/songs');
  if (!response.ok) {
    throw new Error('Failed to fetch songs');
  }
  return response.json();
}

// Add a new song
export async function addSong(song: Omit<Song, 'id' | 'addedAt' | 'votes' | 'addedBy'>): Promise<Song> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(API_BASE + '/songs', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: song.title,
      artist: song.artist,
      artwork: song.artwork,
      youtubeUrl: song.youtubeUrl,
      youtubeId: song.youtubeId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add song');
  }

  return response.json();
}

// Submit a vote
export async function submitVote(
  songId: string,
  rating: number,
  comment?: string
): Promise<{ averageRating: number; totalVotes: number }> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(API_BASE + '/votes', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      songId,
      rating,
      comment,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit vote');
  }

  return response.json();
}

// Get votes with details for a specific song
export async function getSongVotesWithDetails(songId: string): Promise<VoteWithDetails[]> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(API_BASE + `/songs/${songId}/votes`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch votes');
  }

  const votes = await response.json();
  return votes.map((v: any) => ({
    id: v.id,
    rating: v.rating,
    comment: v.comment,
    timestamp: v.timestamp,
    userName: v.voter_name || v.voter || 'Unknown',
    userEmail: null,
  }));
}

// Get votes for a specific song (stats only)
export async function getSongVotes(songId: string): Promise<{ averageRating: number; totalVotes: number }> {
  const response = await fetch(API_BASE + '/votes?songId=' + encodeURIComponent(songId));
  if (!response.ok) {
    throw new Error('Failed to fetch votes');
  }
  return response.json();
}

// Get user's vote for a specific song
export async function getUserVoteForSong(songId: string): Promise<{ rating: number; comment?: string } | null> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(API_BASE + `/songs/${songId}/votes`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch votes');
    }

    const votes = await response.json();
    
    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Find user's vote
    const userVote = votes.find((v: any) => v.user_id === user.id);
    if (!userVote) {
      return null;
    }

    return {
      rating: userVote.rating,
      comment: userVote.comment || undefined,
    };
  } catch (error) {
    // If no vote exists, return null
    return null;
  }
}

// Delete a song (only if user is the owner)
export async function deleteSong(songId: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(API_BASE + `/songs/${songId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete song');
  }
}
