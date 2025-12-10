'use client';

import { useState, useEffect } from 'react';
import { Song, VoteWithDetails } from '@/types';
import { fetchSongs, getSongVotesWithDetails, deleteSong, addSong } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import AddSongModal from '@/components/AddSongModal';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [votesMap, setVotesMap] = useState<Record<string, VoteWithDetails[]>>({});
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadSongs();
      setShowAuthModal(false);
    } else if (!authLoading && !user) {
      setShowAuthModal(true);
      setLoadingSongs(false);
    }
  }, [authLoading, user]);

  const loadSongs = async () => {
    try {
      setLoadingSongs(true);
      setError(null);
      const loadedSongs = await fetchSongs();
      setSongs(loadedSongs);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs. Please refresh the page.');
    } finally {
      setLoadingSongs(false);
    }
  };

  const loadVotesForSong = async (songId: string) => {
    // Toggle: if already loaded, clear it
    if (votesMap[songId]) {
      setVotesMap(prev => {
        const newMap = { ...prev };
        delete newMap[songId];
        return newMap;
      });
      return;
    }

    try {
      setLoadingVotes(prev => ({ ...prev, [songId]: true }));
      const votes = await getSongVotesWithDetails(songId);
      setVotesMap(prev => ({ ...prev, [songId]: votes }));
    } catch (err) {
      console.error('Error loading votes:', err);
    } finally {
      setLoadingVotes(prev => ({ ...prev, [songId]: false }));
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'from-emerald-500 to-teal-500';
    if (rating >= 6) return 'from-cyan-500 to-blue-500';
    if (rating >= 4) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const handleAddSong = async (songData: Omit<Song, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => {
    try {
      setError(null);
      const newSong = await addSong(songData);
      setSongs(prev => [newSong, ...prev]);
      setShowAddModal(false);
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
      // Remove votes if loaded
      setVotesMap(prev => {
        const newMap = { ...prev };
        delete newMap[songId];
        return newMap;
      });
    } catch (err: any) {
      console.error('Error deleting song:', err);
      setError(err.message || 'Failed to delete song');
    }
  };

  if (authLoading || loadingSongs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="glass rounded-3xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <p className="mt-6 text-slate-300 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-400">View all songs and their ratings</p>
          </div>
          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
            >
              + Add Song
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 glass border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 font-bold text-xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Songs Grid */}
        {songs.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center glow">
            <div className="text-6xl mb-6">🎼</div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              No Songs Yet
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Start adding songs to see them here!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
            >
              Add First Song
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => {
              const votes = votesMap[song.id] || [];
              const isLoadingVotes = loadingVotes[song.id];
              const isOwner = user && song.userId === user.id;

              return (
                <div
                  key={song.id}
                  className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] glow"
                >
                  {/* Song Artwork */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 overflow-hidden">
                    <img
                      src={song.artwork}
                      alt={`${song.artist} - ${song.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
                        title="Delete song"
                      >
                        ×
                      </button>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{song.title}</h3>
                      <p className="text-slate-200 text-sm mb-1">{song.artist}</p>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        Added by {song.addedBy}
                      </p>
                    </div>
                  </div>

                  {/* Song Details */}
                  <div className="p-6">
                    {/* Rating Summary */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-400">Average Rating</span>
                        <span className="text-xs text-slate-500">
                          {song.votes.totalVotes} vote{song.votes.totalVotes !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 h-3 bg-slate-800 rounded-full overflow-hidden`}>
                          <div
                            className={`h-full bg-gradient-to-r ${getRatingColor(song.votes.averageRating)} transition-all duration-500`}
                            style={{ width: `${(song.votes.averageRating / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-2xl font-bold bg-gradient-to-r ${getRatingColor(song.votes.averageRating)} bg-clip-text text-transparent`}>
                          {song.votes.averageRating > 0 ? song.votes.averageRating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Votes Section */}
                    {song.votes.totalVotes > 0 && (
                      <div>
                        <button
                          onClick={() => loadVotesForSong(song.id)}
                          className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-colors border border-white/10 mb-3"
                        >
                          {isLoadingVotes ? 'Loading...' : votes.length > 0 ? `Hide ${votes.length} votes` : `View ${song.votes.totalVotes} vote${song.votes.totalVotes !== 1 ? 's' : ''}`}
                        </button>

                      {/* Votes List */}
                      {votes.length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {votes.map((vote) => (
                            <div
                              key={vote.id}
                              className="glass border border-white/5 rounded-xl p-4 hover:border-purple-500/20 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                    {vote.userName[0].toUpperCase()}
                                  </div>
                                  <span className="text-sm font-semibold text-white">{vote.userName}</span>
                                </div>
                                <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getRatingColor(vote.rating)} text-white text-sm font-bold`}>
                                  {vote.rating}/10
                                </div>
                              </div>
                              {vote.comment && (
                                <p className="text-sm text-slate-300 mt-2 pl-8">{vote.comment}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-2 pl-8">
                                {new Date(vote.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      </div>
                    )}
                    {song.votes.totalVotes === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No votes yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {user && (
        <AddSongModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSong}
        />
      )}
    </div>
  );
}

