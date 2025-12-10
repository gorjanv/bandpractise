export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  youtubeUrl: string;
  youtubeId: string;
  addedBy: string;
  addedAt: string;
  userId?: string | null; // ID of the user who added the song (for ownership checks)
  votes: {
    averageRating: number;
    totalVotes: number;
  };
}

export interface Vote {
  songId: string;
  rating: number; // 1-10
  comment?: string;
  voter: string;
  timestamp: string;
}

export interface VoteWithDetails {
  id: string;
  rating: number;
  comment?: string | null;
  timestamp: string;
  userName: string;
  userEmail?: string | null;
}
