import { Song, Vote } from '@/types';

const SONGS_KEY = 'bandpractise_songs';
const VOTES_KEY = 'bandpractise_votes';

export function getSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SONGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSong(song: Song): void {
  if (typeof window === 'undefined') return;
  const songs = getSongs();
  songs.push(song);
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function getVotes(): Vote[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(VOTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveVote(vote: Vote): void {
  if (typeof window === 'undefined') return;
  const votes = getVotes();
  // Check if this voter already voted on this song
  const existingIndex = votes.findIndex(
    v => v.songId === vote.songId && v.voter === vote.voter
  );
  if (existingIndex >= 0) {
    votes[existingIndex] = vote;
  } else {
    votes.push(vote);
  }
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function updateSongVotes(songId: string): { yes: number; no: number } {
  const votes = getVotes();
  const songVotes = votes.filter(v => v.songId === songId);
  return {
    yes: songVotes.filter(v => v.vote === 'yes').length,
    no: songVotes.filter(v => v.vote === 'no').length,
  };
}

