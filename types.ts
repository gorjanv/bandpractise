export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  youtubeUrl: string;
  youtubeId: string;
  addedBy: string;
  addedAt: string;
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
