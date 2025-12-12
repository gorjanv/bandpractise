export interface SongVersion {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  performedBy: string;
  position: number;
}

export interface SongVersionInput {
  youtubeUrl: string;
  youtubeId: string;
  performedBy: string;
  position: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  youtubeUrl: string; // Primary/default version (for backward compatibility)
  youtubeId: string; // Primary/default version (for backward compatibility)
  addedBy: string;
  addedAt: string;
  userId?: string | null; // ID of the user who added the song (for ownership checks)
  versions?: SongVersion[]; // Multiple versions of the song
  votes: {
    averageRating: number;
    totalVotes: number;
  };
}

// Type for creating a new song (versions don't need IDs yet)
export interface SongInput {
  title: string;
  artist: string;
  artwork: string;
  youtubeUrl: string;
  youtubeId: string;
  userId?: string | null;
  versions?: Array<Omit<SongVersion, 'id'>>;
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

export interface Setlist {
  id: string;
  name?: string | null;
  rehearsalDate: string; // ISO date string
  userId: string;
  createdAt: string;
  updatedAt: string;
  songs?: SetlistSong[];
}

export interface SetlistSong {
  id: string;
  setlistId: string;
  songId: string;
  position: number;
  song?: Song; // Populated when fetching setlist with songs
}
