'use client';

import { useState, useEffect } from 'react';
import { Song, VoteWithDetails } from '@/types';
import { fetchSongs, getSongVotesWithDetails, deleteSong, addSong } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useAddSongModal } from '@/contexts/AddSongModalContext';
import AuthModal from '@/components/AuthModal';
import AddSongModal from '@/components/AddSongModal';
import { PageContainer, AnimatedBackground } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';
import * as S from './Dashboard.styled';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen: showAddModal, closeModal: closeAddModal } = useAddSongModal();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
      closeAddModal();
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
        <S.ContentWrapper>
          <S.LoadingContainer>
            <S.Spinner />
            <S.LoadingText>Loading dashboard...</S.LoadingText>
          </S.LoadingContainer>
        </S.ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AnimatedBackground />
      <S.ContentWrapper>
        <S.Header>
          <S.HeaderText>
            <S.Heading1>Dashboard</S.Heading1>
            <S.Subtitle>View all songs and their ratings</S.Subtitle>
          </S.HeaderText>
        </S.Header>

        {error && (
          <S.ErrorBanner>
            <S.ErrorText>{error}</S.ErrorText>
            <S.CloseErrorButton onClick={() => setError(null)}>×</S.CloseErrorButton>
          </S.ErrorBanner>
        )}

        {songs.length === 0 ? (
          <S.EmptyState>
            <S.EmptyIcon>🎼</S.EmptyIcon>
            <S.Heading2>No Songs Yet</S.Heading2>
            <S.EmptyText>Start adding songs to see them here!</S.EmptyText>
          </S.EmptyState>
        ) : (
          <S.SongsGrid>
            {songs.map((song) => {
              const votes = votesMap[song.id] || [];
              const isLoadingVotes = loadingVotes[song.id];
              const isOwner = user && song.userId === user.id;
              const ratingColors = getRatingColor(song.votes.averageRating);

              return (
                <S.SongTile key={song.id}>
                  <S.ArtworkWrapper>
                    <S.ArtworkImage
                      src={song.artwork}
                      alt={`${song.artist} - ${song.title}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
                      }}
                    />
                    <S.ArtworkOverlay />
                    {isOwner && (
                      <S.TileDeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(song.id);
                        }}
                        title="Delete song"
                      >
                        ×
                      </S.TileDeleteButton>
                    )}
                    <S.ArtworkInfo>
                      <S.SongTitle>{song.title}</S.SongTitle>
                      <S.SongArtist>{song.artist}</S.SongArtist>
                      <S.AddedByText>
                        <S.Dot />
                        Added by {song.addedBy}
                      </S.AddedByText>
                    </S.ArtworkInfo>
                  </S.ArtworkWrapper>

                  <S.TileContent>
                    <S.RatingSection>
                      <S.RatingHeader>
                        <S.RatingLabel>Average Rating</S.RatingLabel>
                        <S.VoteCount>
                          {song.votes.totalVotes} vote{song.votes.totalVotes !== 1 ? 's' : ''}
                        </S.VoteCount>
                      </S.RatingHeader>
                      <S.RatingBar>
                        <S.RatingBarFill
                          $width={(song.votes.averageRating / 10) * 100}
                          $from={ratingColors.from}
                          $to={ratingColors.to}
                        />
                        <S.RatingValue $from={ratingColors.from} $to={ratingColors.to}>
                          {song.votes.averageRating > 0 ? song.votes.averageRating.toFixed(1) : '—'}
                        </S.RatingValue>
                      </S.RatingBar>
                    </S.RatingSection>

                    {song.votes.totalVotes > 0 && (
                      <div>
                        <S.ExpandButton onClick={() => loadVotesForSong(song.id)}>
                          {isLoadingVotes ? 'Loading...' : votes.length > 0 ? `Hide ${votes.length} votes` : `View ${song.votes.totalVotes} vote${song.votes.totalVotes !== 1 ? 's' : ''}`}
                        </S.ExpandButton>

                        {votes.length > 0 && (
                          <S.VotesList>
                            {votes.map((vote) => {
                              const voteColors = getRatingColor(vote.rating);
                              return (
                                <S.VoteCard key={vote.id}>
                                  <S.VoteHeader>
                                    <S.VoteUser>
                                      <S.UserAvatar>
                                        {vote.userName[0].toUpperCase()}
                                      </S.UserAvatar>
                                      <S.UserName>{vote.userName}</S.UserName>
                                    </S.VoteUser>
                                    <S.VoteRating $from={voteColors.from} $to={voteColors.to}>
                                      {vote.rating}/10
                                    </S.VoteRating>
                                  </S.VoteHeader>
                                  {vote.comment && (
                                    <S.VoteComment>{vote.comment}</S.VoteComment>
                                  )}
                                  <S.VoteDate>
                                    {new Date(vote.timestamp).toLocaleDateString()}
                                  </S.VoteDate>
                                </S.VoteCard>
                              );
                            })}
                          </S.VotesList>
                        )}
                      </div>
                    )}
                    {song.votes.totalVotes === 0 && (
                      <S.NoVotesText>No votes yet</S.NoVotesText>
                    )}
                  </S.TileContent>
                </S.SongTile>
              );
            })}
          </S.SongsGrid>
        )}
      </S.ContentWrapper>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {user && (
      <AddSongModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        onAdd={handleAddSong}
      />
      )}
    </PageContainer>
  );
}
