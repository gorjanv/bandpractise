'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import { fetchSongs, addSong, submitVote, getUserVoteForSong, deleteSong } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SongCard from '@/components/SongCard';
import AddSongModal from '@/components/AddSongModal';
import AuthModal from '@/components/AuthModal';

interface UserVote {
  rating: number;
  comment?: string;
}

export default function VotePage() {
  const { user, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load songs from API
  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSongs = await fetchSongs();
      setSongs(loadedSongs);
      
      // Load user votes for all songs
      if (user) {
        const votes: Record<string, UserVote> = {};
        for (const song of loadedSongs) {
          try {
            const vote = await getUserVoteForSong(song.id);
            if (vote) {
              votes[song.id] = vote;
            }
          } catch (err) {
            // Vote doesn't exist, that's fine
          }
        }
        setUserVotes(votes);
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only load songs if user is authenticated
    if (!authLoading && user) {
      loadSongs();
      setShowAuthModal(false);
    } else if (!authLoading && !user) {
      setShowAuthModal(true);
      setIsLoading(false);
    }
  }, [authLoading, user, loadSongs]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscriptions for songs
    const songsSubscription = supabase
      .channel('songs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'songs' },
        () => {
          loadSongs();
        }
      )
      .subscribe();

    // Set up real-time subscriptions for votes
    const votesSubscription = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          loadSongs();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(songsSubscription);
      supabase.removeChannel(votesSubscription);
    };
  }, [user, loadSongs]);

  const handleVote = async (rating: number, comment?: string) => {
    if (!user || !selectedSongId) return;

    const currentSong = songs.find(s => s.id === selectedSongId);
    if (!currentSong) return;

    try {
      // Submit vote via API
      const updatedVotes = await submitVote(
        currentSong.id,
        rating,
        comment
      );

      // Update user votes
      setUserVotes(prev => ({
        ...prev,
        [currentSong.id]: { rating, comment },
      }));

      // Update local state with new vote statistics
      setSongs(prevSongs =>
        prevSongs.map(song =>
          song.id === currentSong.id ? { ...song, votes: updatedVotes } : song
        )
      );

      // Optionally move to next unvoted song
      // You can uncomment this if you want auto-advance
      // const nextUnvoted = songs.find(s => !userVotes[s.id] && s.id !== currentSong.id);
      // if (nextUnvoted) {
      //   setSelectedSongId(nextUnvoted.id);
      // }
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
    }
  };

  const handleAddSong = async (songData: Omit<Song, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => {
    try {
      setError(null);
      const newSong = await addSong(songData);
      setSongs(prev => [newSong, ...prev]);
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song. Please try again.');
      throw err;
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song? This will also delete all votes.')) {
      return;
    }

    try {
      setError(null);
      await deleteSong(songId);
      // Remove from local state
      setSongs(prev => prev.filter(s => s.id !== songId));
      // Clear user votes for this song
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[songId];
        return newVotes;
      });
      // If deleted song was selected, clear selection
      if (selectedSongId === songId) {
        setSelectedSongId(null);
      }
    } catch (err: any) {
      console.error('Error deleting song:', err);
      setError(err.message || 'Failed to delete song');
    }
  };

  const selectedSong = selectedSongId ? songs.find(s => s.id === selectedSongId) : null;
  const hasVoted = selectedSongId ? !!userVotes[selectedSongId] : false;
  const userVote = selectedSongId ? userVotes[selectedSongId] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header with Add Song Button */}
      {user && (
        <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
            >
              + Add Song
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
          <div className="glass border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 font-bold text-xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {authLoading && (
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="glass rounded-3xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <p className="mt-6 text-slate-300 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!authLoading && user && (
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {isLoading ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
              <p className="mt-6 text-slate-300 font-medium">Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center glow">
              <div className="text-6xl mb-6">🎼</div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                No Songs Yet
              </h2>
              <p className="text-slate-300 mb-8 text-lg">
                Be the first to add a song for your band practise!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
              >
                Add First Song
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-200px)]">
              {/* Song List Sidebar */}
              <div className="w-full md:w-80 flex-shrink-0 glass rounded-3xl p-4 overflow-y-auto border border-white/10 max-h-[40vh] md:max-h-none">
                <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent px-2">
                  Songs ({songs.length})
                </h2>
                <div className="space-y-2">
                  {songs.map((song) => {
                    const hasVotedForThis = !!userVotes[song.id];
                    const isSelected = selectedSongId === song.id;
                    const isOwner = user && song.userId === user.id;
                    
                    return (
                      <div
                        key={song.id}
                        className={`relative group ${
                          isSelected
                            ? 'glass border-2 border-purple-500/50 bg-purple-500/10'
                            : hasVotedForThis
                            ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-white/10'
                        } rounded-xl transition-all duration-200`}
                      >
                        <button
                          onClick={() => setSelectedSongId(song.id)}
                          className="w-full text-left p-3 pr-10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold truncate ${
                                isSelected ? 'text-white' : hasVotedForThis ? 'text-emerald-300' : 'text-slate-300'
                              }`}>
                                {song.title}
                              </p>
                              <p className={`text-sm truncate ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}>
                                {song.artist}
                              </p>
                              {hasVotedForThis && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-emerald-400 font-semibold">
                                    Voted: {userVotes[song.id].rating}/10
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSong(song.id);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-sm font-bold z-10 shadow-lg"
                            title="Delete song"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Song Detail View */}
              <div className="flex-1 w-full md:w-auto">
                {selectedSong ? (
                  <SongCard
                    song={selectedSong}
                    onVote={handleVote}
                    isActive={true}
                    initialRating={userVote?.rating}
                    initialComment={userVote?.comment}
                    onDelete={handleDeleteSong}
                  />
                ) : (
                  <div className="h-full min-h-[400px] md:min-h-0 glass rounded-3xl p-12 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-6">🎵</div>
                      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        Select a Song
                      </h3>
                      <p className="text-slate-400">
                        Choose a song from the list to start voting
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddSongModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSong}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

