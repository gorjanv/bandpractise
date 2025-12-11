'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import { fetchSongs, addSong, submitVote, getUserVoteForSong, deleteSong } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SongCard from '@/components/SongCard';
import AddSongModal from '@/components/AddSongModal';
import AuthModal from '@/components/AuthModal';
import styled from 'styled-components';
import { PageContainer, AnimatedBackground, Container, GlassCard, PrimaryButton, Heading2, Heading3, Text, Spinner } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

interface UserVote {
  rating: number;
  comment?: string;
}

const ContentWrapper = styled(Container)`
  padding-top: 1.5rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: ${theme.zIndex.base};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
`;

const ErrorBanner = styled.div`
  margin-bottom: 1.5rem;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ErrorText = styled(Text)`
  color: ${theme.colors.red[300]};
`;

const CloseErrorButton = styled.button`
  color: ${theme.colors.red[400]};
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    color: ${theme.colors.red[300]};
    background: rgba(239, 68, 68, 0.2);
  }
`;

const LoadingContainer = styled(GlassCard)`
  padding: 3rem;
  text-align: center;
`;

const LoadingText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-weight: 500;
  margin-top: 1.5rem;
`;

const EmptyState = styled(GlassCard)`
  padding: 3rem;
  text-align: center;
  box-shadow: ${theme.shadows.glow};
`;

const EmptyIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1.5rem;
`;

const EmptyText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-size: 1.125rem;
  margin: 1rem 0 2rem 0;
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    height: calc(100vh - 200px);
  }
`;

const Sidebar = styled.div`
  width: 100%;
  flex-shrink: 0;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius['3xl']};
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid ${theme.colors.glass.border};
  max-height: 40vh;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: 20rem;
    max-height: none;
  }
`;

const SidebarTitle = styled(Heading2)`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
`;

const SongList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SongListItem = styled.div<{ $isSelected: boolean; $hasVoted: boolean }>`
  position: relative;
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  
  ${props => {
    if (props.$isSelected) {
      return `
        background: ${theme.colors.glass.background};
        border: 2px solid rgba(168, 85, 247, 0.5);
        background-color: rgba(168, 85, 247, 0.1);
      `;
    } else if (props.$hasVoted) {
      return `
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        
        &:hover {
          background: rgba(16, 185, 129, 0.2);
        }
      `;
    } else {
      return `
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
        
        &:hover {
          background: ${theme.colors.slate[800]};
          border-color: ${theme.colors.glass.borderLight};
        }
      `;
    }
  }}
`;

const SongListButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  padding-right: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

const SongListTitle = styled.p<{ $isSelected: boolean; $hasVoted: boolean }>`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  
  ${props => {
    if (props.$isSelected) {
      return `color: white;`;
    } else if (props.$hasVoted) {
      return `color: ${theme.colors.emerald[300]};`;
    } else {
      return `color: ${theme.colors.slate[300]};`;
    }
  }}
`;

const SongListArtist = styled.p<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  
  ${props => props.$isSelected ? `color: ${theme.colors.slate[300]};` : `color: ${theme.colors.slate[500]};`}
`;

const SongListRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const SongListRatingText = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.emerald[400]};
  font-weight: 600;
`;

const SongListDeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  z-index: ${theme.zIndex.dropdown};
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: ${theme.shadows.lg};
  
  &:hover {
    background: ${theme.colors.red[600]};
    transform: scale(1.1);
  }
`;

const DetailView = styled.div`
  flex: 1;
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

const SelectSongPrompt = styled(GlassCard)`
  height: 100%;
  min-height: 25rem;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    min-height: 0;
  }
`;

const PromptContent = styled.div`
  text-align: center;
`;

const PromptIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1.5rem;
`;

const PromptText = styled(Text)`
  color: ${theme.colors.slate[400]};
  margin-top: 1rem;
`;

export default function VotePage() {
  const { user, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});
  const [showAddModal, setShowAddModal] = useState(false);
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
      
      {user && (
        <ContentWrapper>
          <HeaderSection>
            <PrimaryButton onClick={() => setShowAddModal(true)}>
              + Add Song
            </PrimaryButton>
          </HeaderSection>
        </ContentWrapper>
      )}

      {error && (
        <ContentWrapper>
          <ErrorBanner>
            <ErrorText>{error}</ErrorText>
            <CloseErrorButton onClick={() => setError(null)}>×</CloseErrorButton>
          </ErrorBanner>
        </ContentWrapper>
      )}

      {authLoading && (
        <ContentWrapper>
          <LoadingContainer>
            <Spinner />
            <LoadingText>Loading...</LoadingText>
          </LoadingContainer>
        </ContentWrapper>
      )}

      {!authLoading && user && (
        <ContentWrapper>
          {isLoading ? (
            <LoadingContainer>
              <Spinner />
              <LoadingText>Loading songs...</LoadingText>
            </LoadingContainer>
          ) : songs.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🎼</EmptyIcon>
              <Heading2>No Songs Yet</Heading2>
              <EmptyText>Be the first to add a song for your band practise!</EmptyText>
              <PrimaryButton onClick={() => setShowAddModal(true)}>
                Add First Song
              </PrimaryButton>
            </EmptyState>
          ) : (
            <MainLayout>
              <Sidebar>
                <SidebarTitle>Songs ({songs.length})</SidebarTitle>
                <SongList>
                  {songs.map((song) => {
                    const hasVotedForThis = !!userVotes[song.id];
                    const isSelected = selectedSongId === song.id;
                    const isOwner = user && song.userId === user.id;
                    
                    return (
                      <SongListItem
                        key={song.id}
                        $isSelected={isSelected}
                        $hasVoted={hasVotedForThis}
                      >
                        <SongListButton onClick={() => setSelectedSongId(song.id)}>
                          <SongListTitle $isSelected={isSelected} $hasVoted={hasVotedForThis}>
                            {song.title}
                          </SongListTitle>
                          <SongListArtist $isSelected={isSelected}>
                            {song.artist}
                          </SongListArtist>
                          {hasVotedForThis && (
                            <SongListRating>
                              <SongListRatingText>
                                Voted: {userVotes[song.id].rating}/10
                              </SongListRatingText>
                            </SongListRating>
                          )}
                        </SongListButton>
                        {isOwner && (
                          <SongListDeleteButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSong(song.id);
                            }}
                            title="Delete song"
                          >
                            ×
                          </SongListDeleteButton>
                        )}
                      </SongListItem>
                    );
                  })}
                </SongList>
              </Sidebar>

              <DetailView>
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
                  <SelectSongPrompt>
                    <PromptContent>
                      <PromptIcon>🎵</PromptIcon>
                      <Heading3>Select a Song</Heading3>
                      <PromptText>Choose a song from the list to start voting</PromptText>
                    </PromptContent>
                  </SelectSongPrompt>
                )}
              </DetailView>
            </MainLayout>
          )}
        </ContentWrapper>
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
    </PageContainer>
  );
}
