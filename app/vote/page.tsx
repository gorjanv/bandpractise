'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import { fetchSongs, addSong, submitVote, getUserVoteForSong, deleteSong } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAddSongModal } from '@/contexts/AddSongModalContext';
import SongCard from '@/components/SongCard/SongCard';
import AddSongModal from '@/components/AddSongModal';
import AuthModal from '@/components/AuthModal';
import { PageContainer, AnimatedBackground } from '@/styles/styledComponents';
import * as S from './VotePage.styled';

interface UserVote {
  rating: number;
  comment?: string;
}

export default function VotePage() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: showAddModal, closeModal: closeAddModal } = useAddSongModal();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSongs = await fetchSongs();
      setSongs(loadedSongs);
      
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
      const updatedVotes = await submitVote(
        currentSong.id,
        rating,
        comment
      );

      setUserVotes(prev => ({
        ...prev,
        [currentSong.id]: { rating, comment },
      }));

      setSongs(prevSongs =>
        prevSongs.map(song =>
          song.id === currentSong.id ? { ...song, votes: updatedVotes } : song
        )
      );
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
      setSongs(prev => prev.filter(s => s.id !== songId));
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[songId];
        return newVotes;
      });
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
    <PageContainer>
      <AnimatedBackground />
      

      {error && (
        <S.ContentWrapper>
          <S.ErrorBanner>
            <S.ErrorText>{error}</S.ErrorText>
            <S.CloseErrorButton onClick={() => setError(null)}>×</S.CloseErrorButton>
          </S.ErrorBanner>
        </S.ContentWrapper>
      )}

      {authLoading && (
        <S.ContentWrapper>
          <S.LoadingContainer>
            <S.Spinner />
            <S.LoadingText>Loading...</S.LoadingText>
          </S.LoadingContainer>
        </S.ContentWrapper>
      )}

      {!authLoading && user && (
        <S.ContentWrapper>
          {isLoading ? (
            <S.LoadingContainer>
              <S.Spinner />
              <S.LoadingText>Loading songs...</S.LoadingText>
            </S.LoadingContainer>
          ) : songs.length === 0 ? (
            <S.EmptyState>
              <S.EmptyIcon>🎼</S.EmptyIcon>
              <S.Heading2>No Songs Yet</S.Heading2>
              <S.EmptyText>Be the first to add a song for your band practise!</S.EmptyText>
            </S.EmptyState>
          ) : (
            <S.MainLayout>
              <S.Sidebar>
                <S.SidebarTitle>Songs ({songs.length})</S.SidebarTitle>
                <S.SongList>
                  {songs.map((song) => {
                    const hasVotedForThis = !!userVotes[song.id];
                    const isSelected = selectedSongId === song.id;
                    const isOwner = user && song.userId === user.id;
                    
                    return (
                      <S.SongListItem
                        key={song.id}
                        $isSelected={isSelected}
                        $hasVoted={hasVotedForThis}
                      >
                        <S.SongListButton onClick={() => setSelectedSongId(song.id)}>
                          <S.SongListTitle $isSelected={isSelected} $hasVoted={hasVotedForThis}>
                            {song.title}
                          </S.SongListTitle>
                          <S.SongListArtist $isSelected={isSelected}>
                            {song.artist}
                          </S.SongListArtist>
                          {hasVotedForThis && (
                            <S.SongListRating>
                              <S.SongListRatingText>
                                Voted: {userVotes[song.id].rating}/10
                              </S.SongListRatingText>
                            </S.SongListRating>
                          )}
                        </S.SongListButton>
                        {isOwner && (
                          <S.SongListDeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSong(song.id);
                            }}
                            title="Delete song"
                          >
                            ×
                          </S.SongListDeleteButton>
                        )}
                      </S.SongListItem>
                    );
                  })}
                </S.SongList>
              </S.Sidebar>

              <S.DetailView>
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
                  <S.SelectSongPrompt>
                    <S.PromptContent>
                      <S.PromptIcon>🎵</S.PromptIcon>
                      <S.Heading3>Select a Song</S.Heading3>
                      <S.PromptText>Choose a song from the list to start voting</S.PromptText>
                    </S.PromptContent>
                  </S.SelectSongPrompt>
                )}
              </S.DetailView>
            </S.MainLayout>
          )}
        </S.ContentWrapper>
      )}

      <AddSongModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        onAdd={handleAddSong}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </PageContainer>
  );
}
