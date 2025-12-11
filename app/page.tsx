'use client';

import { useState, useEffect } from 'react';
import { Song, VoteWithDetails } from '@/types';
import { fetchSongs, getSongVotesWithDetails, deleteSong, addSong } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import AddSongModal from '@/components/AddSongModal';
import styled from 'styled-components';
import { PageContainer, AnimatedBackground, Container, GlassCard, PrimaryButton, Heading1, Heading2, Heading3, Text, Spinner } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

const ContentWrapper = styled(Container)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: ${theme.zIndex.base};
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderText = styled.div``;

const Subtitle = styled(Text)`
  color: ${theme.colors.slate[400]};
  margin-top: 0.5rem;
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

const SongsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const SongTile = styled(GlassCard)`
  overflow: hidden;
  border: 1px solid ${theme.colors.glass.border};
  transition: all ${theme.transitions.slow} ease;
  
  &:hover {
    border-color: rgba(168, 85, 247, 0.3);
    transform: scale(1.02);
  }
`;

const ArtworkWrapper = styled.div`
  position: relative;
  height: 12rem;
  background: linear-gradient(to bottom right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  overflow: hidden;
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ArtworkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
`;

const ArtworkInfo = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
`;

const SongTitle = styled(Heading3)`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SongArtist = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.25rem;
`;

const AddedByText = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[300]};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Dot = styled.span`
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: ${theme.colors.purple[400]};
`;

const TileDeleteButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
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
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: ${theme.shadows.lg};
  
  &:hover {
    background: ${theme.colors.red[600]};
    transform: scale(1.1);
  }
`;

const TileContent = styled.div`
  padding: 1.5rem;
`;

const RatingSection = styled.div`
  margin-bottom: 1rem;
`;

const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const RatingLabel = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[400]};
`;

const VoteCount = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RatingBarFill = styled.div<{ $width: number; $from: string; $to: string }>`
  flex: 1;
  height: 0.75rem;
  background: ${theme.colors.slate[800]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$width}%;
    background: linear-gradient(to right, ${props => props.$from}, ${props => props.$to});
    transition: width ${theme.transitions.slow} ease;
  }
`;

const RatingValue = styled.span<{ $from: string; $to: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, ${props => props.$from}, ${props => props.$to});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ExpandButton = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  color: ${theme.colors.slate[300]};
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.glass.borderLight};
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  margin-bottom: 0.75rem;
  
  &:hover {
    background: ${theme.colors.slate[800]};
  }
`;

const VotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 24rem;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const VoteCard = styled(GlassCard)`
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    border-color: rgba(168, 85, 247, 0.2);
  }
`;

const VoteHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const VoteUser = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserAvatar = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
`;

const UserName = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
`;

const VoteRating = styled.div<{ $from: string; $to: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.lg};
  background: linear-gradient(to right, ${props => props.$from}, ${props => props.$to});
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
`;

const VoteComment = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[300]};
  margin-top: 0.5rem;
  padding-left: 2rem;
`;

const VoteDate = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin-top: 0.5rem;
  padding-left: 2rem;
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

const LoadingContainer = styled(GlassCard)`
  padding: 3rem;
  text-align: center;
`;

const LoadingText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-weight: 500;
  margin-top: 1.5rem;
`;

const NoVotesText = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[500]};
  text-align: center;
  padding: 1rem 0;
`;

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
    if (rating >= 8) return { from: theme.colors.emerald[500], to: '#14b8a6' };
    if (rating >= 6) return { from: theme.colors.cyan[500], to: theme.colors.purple[400] };
    if (rating >= 4) return { from: '#eab308', to: '#f97316' };
    return { from: theme.colors.red[500], to: theme.colors.pink[500] };
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
      setSongs(prev => prev.filter(s => s.id !== songId));
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
      <PageContainer>
        <AnimatedBackground />
        <ContentWrapper>
          <LoadingContainer>
            <Spinner />
            <LoadingText>Loading dashboard...</LoadingText>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AnimatedBackground />
      <ContentWrapper>
        <Header>
          <HeaderText>
            <Heading1>Dashboard</Heading1>
            <Subtitle>View all songs and their ratings</Subtitle>
          </HeaderText>
          {user && (
            <PrimaryButton onClick={() => setShowAddModal(true)}>
              + Add Song
            </PrimaryButton>
          )}
        </Header>

        {error && (
          <ErrorBanner>
            <ErrorText>{error}</ErrorText>
            <CloseErrorButton onClick={() => setError(null)}>×</CloseErrorButton>
          </ErrorBanner>
        )}

        {songs.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎼</EmptyIcon>
            <Heading2>No Songs Yet</Heading2>
            <EmptyText>Start adding songs to see them here!</EmptyText>
            <PrimaryButton onClick={() => setShowAddModal(true)}>
              Add First Song
            </PrimaryButton>
          </EmptyState>
        ) : (
          <SongsGrid>
            {songs.map((song) => {
              const votes = votesMap[song.id] || [];
              const isLoadingVotes = loadingVotes[song.id];
              const isOwner = user && song.userId === user.id;
              const ratingColors = getRatingColor(song.votes.averageRating);

              return (
                <SongTile key={song.id}>
                  <ArtworkWrapper>
                    <ArtworkImage
                      src={song.artwork}
                      alt={`${song.artist} - ${song.title}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
                      }}
                    />
                    <ArtworkOverlay />
                    {isOwner && (
                      <TileDeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song.id);
                        }}
                        title="Delete song"
                      >
                        ×
                      </TileDeleteButton>
                    )}
                    <ArtworkInfo>
                      <SongTitle>{song.title}</SongTitle>
                      <SongArtist>{song.artist}</SongArtist>
                      <AddedByText>
                        <Dot />
                        Added by {song.addedBy}
                      </AddedByText>
                    </ArtworkInfo>
                  </ArtworkWrapper>

                  <TileContent>
                    <RatingSection>
                      <RatingHeader>
                        <RatingLabel>Average Rating</RatingLabel>
                        <VoteCount>
                          {song.votes.totalVotes} vote{song.votes.totalVotes !== 1 ? 's' : ''}
                        </VoteCount>
                      </RatingHeader>
                      <RatingBar>
                        <RatingBarFill
                          $width={(song.votes.averageRating / 10) * 100}
                          $from={ratingColors.from}
                          $to={ratingColors.to}
                        />
                        <RatingValue $from={ratingColors.from} $to={ratingColors.to}>
                          {song.votes.averageRating > 0 ? song.votes.averageRating.toFixed(1) : '—'}
                        </RatingValue>
                      </RatingBar>
                    </RatingSection>

                    {song.votes.totalVotes > 0 && (
                      <div>
                        <ExpandButton onClick={() => loadVotesForSong(song.id)}>
                          {isLoadingVotes ? 'Loading...' : votes.length > 0 ? `Hide ${votes.length} votes` : `View ${song.votes.totalVotes} vote${song.votes.totalVotes !== 1 ? 's' : ''}`}
                        </ExpandButton>

                        {votes.length > 0 && (
                          <VotesList>
                            {votes.map((vote) => {
                              const voteColors = getRatingColor(vote.rating);
                              return (
                                <VoteCard key={vote.id}>
                                  <VoteHeader>
                                    <VoteUser>
                                      <UserAvatar>
                                        {vote.userName[0].toUpperCase()}
                                      </UserAvatar>
                                      <UserName>{vote.userName}</UserName>
                                    </VoteUser>
                                    <VoteRating $from={voteColors.from} $to={voteColors.to}>
                                      {vote.rating}/10
                                    </VoteRating>
                                  </VoteHeader>
                                  {vote.comment && (
                                    <VoteComment>{vote.comment}</VoteComment>
                                  )}
                                  <VoteDate>
                                    {new Date(vote.timestamp).toLocaleDateString()}
                                  </VoteDate>
                                </VoteCard>
                              );
                            })}
                          </VotesList>
                        )}
                      </div>
                    )}
                    {song.votes.totalVotes === 0 && (
                      <NoVotesText>No votes yet</NoVotesText>
                    )}
                  </TileContent>
                </SongTile>
              );
            })}
          </SongsGrid>
        )}
      </ContentWrapper>

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
    </PageContainer>
  );
}
