'use client';

import { useState, useEffect } from 'react';
import { Song, VoteWithDetails, SongInput } from '@/types';
import { fetchSongs, getSongVotesWithDetails, deleteSong, addSong, updateSong, submitVote, getUserVoteForSong } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useAddSongModal } from '@/contexts/AddSongModalContext';
import AuthModal from '@/components/AuthModal';
import AddSongModal from '@/components/AddSongModal';
import EditSongModal from '@/components/EditSongModal';
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
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<Record<string, number>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [userComments, setUserComments] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'current' | 'my'>>({});

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
      
      // Load user ratings for all songs
      if (user) {
        const ratings: Record<string, number> = {};
        const comments: Record<string, string> = {};
        
        // Load user votes for all songs in parallel
        const votePromises = loadedSongs.map(async (song) => {
          try {
            const userVote = await getUserVoteForSong(song.id);
            if (userVote) {
              ratings[song.id] = userVote.rating;
              comments[song.id] = userVote.comment || '';
            }
          } catch (err) {
            // Silently fail for individual songs
            console.error(`Error loading vote for song ${song.id}:`, err);
          }
        });
        
        await Promise.all(votePromises);
        setUserRatings(prev => ({ ...prev, ...ratings }));
        setUserComments(prev => ({ ...prev, ...comments }));
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs. Please refresh the page.');
    } finally {
      setLoadingSongs(false);
    }
  };

  const loadVotesForSong = async (songId: string, forceReload: boolean = false) => {
    if (votesMap[songId] && !forceReload) {
      return; // Votes already loaded
    }

    try {
      setLoadingVotes(prev => ({ ...prev, [songId]: true }));
      // Clear existing votes if forcing reload
      if (forceReload) {
        setVotesMap(prev => {
          const newMap = { ...prev };
          delete newMap[songId];
          return newMap;
        });
      }
      const votes = await getSongVotesWithDetails(songId);
      setVotesMap(prev => ({ ...prev, [songId]: votes }));
    } catch (err) {
      console.error('Error loading votes:', err);
    } finally {
      setLoadingVotes(prev => ({ ...prev, [songId]: false }));
    }
  };

  const handleSongSelect = async (songId: string) => {
    setSelectedSongId(songId);
    loadVotesForSong(songId);
    // Initialize version selection when selecting a new song (default to first version)
    const song = songs.find(s => s.id === songId);
    if (song) {
      // Always set to 0 (first version) when selecting a song
      // If no versions exist, we'll use the primary youtubeId
      setSelectedVersionIndex(prev => ({ ...prev, [songId]: 0 }));
    }
    // Initialize tab to 'current' (default)
    setActiveTab(prev => ({ ...prev, [songId]: 'current' }));
    // Load user's existing vote if any
    if (user) {
      try {
        const userVote = await getUserVoteForSong(songId);
        if (userVote) {
          setUserRatings(prev => ({ ...prev, [songId]: userVote.rating }));
          setUserComments(prev => ({ ...prev, [songId]: userVote.comment || '' }));
        } else {
          // Initialize with default values if no vote exists
          setUserRatings(prev => ({ ...prev, [songId]: 5 }));
          setUserComments(prev => ({ ...prev, [songId]: '' }));
        }
      } catch (err) {
        console.error('Error loading user vote:', err);
        // Initialize with default values on error
        setUserRatings(prev => ({ ...prev, [songId]: 5 }));
        setUserComments(prev => ({ ...prev, [songId]: '' }));
      }
    }
  };

  const handleVersionSelect = (songId: string, versionIndex: number) => {
    setSelectedVersionIndex(prev => ({ ...prev, [songId]: versionIndex }));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return { from: theme.colors.emerald[500], to: '#14b8a6' };
    if (rating >= 6) return { from: theme.colors.cyan[500], to: theme.colors.purple[400] };
    if (rating >= 4) return { from: '#eab308', to: '#f97316' };
    return { from: theme.colors.red[500], to: theme.colors.pink[500] };
  };

  const handleAddSong = async (songData: SongInput) => {
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
      if (selectedSongId === songId) {
        setSelectedSongId(null);
      }
    } catch (err: any) {
      console.error('Error deleting song:', err);
      setError(err.message || 'Failed to delete song');
    }
  };

  const handleEditSong = (song: Song) => {
    setSongToEdit(song);
    setShowEditModal(true);
  };

  const handleUpdateSong = async (songId: string, songData: SongInput) => {
    try {
      setError(null);
      const updatedSong = await updateSong(songId, songData);
      setSongs(prev => prev.map(s => s.id === songId ? updatedSong : s));
      setShowEditModal(false);
      setSongToEdit(null);
      // Reload votes if the selected song was updated
      if (selectedSongId === songId) {
        await loadVotesForSong(songId);
      }
    } catch (err) {
      console.error('Error updating song:', err);
      setError(err instanceof Error ? err.message : 'Failed to update song');
      throw err;
    }
  };

  const handleVote = async (songId: string, rating: number, comment?: string) => {
    if (!user) return;

    try {
      setError(null);
      const updatedVotes = await submitVote(songId, rating, comment);
      
      // Update the song's vote stats
      setSongs(prev => prev.map(song =>
        song.id === songId ? { ...song, votes: updatedVotes } : song
      ));
      
      // Force reload votes to show the new/updated vote in the list
      await loadVotesForSong(songId, true);
      
      // Update local state
      setUserRatings(prev => ({ ...prev, [songId]: rating }));
      setUserComments(prev => ({ ...prev, [songId]: comment || '' }));
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
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
          <S.MainLayout>
            <S.Sidebar>
              <S.SidebarTitle>Songs ({songs.length})</S.SidebarTitle>
              <S.SongList>
                {songs.map((song) => {
                  const isSelected = selectedSongId === song.id;
                  return (
                    <S.SongListItem
                      key={song.id}
                      onClick={() => handleSongSelect(song.id)}
                      $isSelected={isSelected}
                    >
                      <S.SongListContent>
                        <S.SongListTitle>{song.title}</S.SongListTitle>
                        <S.SongListArtist>{song.artist}</S.SongListArtist>
                        {song.votes.totalVotes > 0 && (
                          <S.SongListRating>
                            Avg rating: {song.votes.averageRating.toFixed(1)}/10
                            <S.SongListVoteCount>
                              ({song.votes.totalVotes} vote{song.votes.totalVotes !== 1 ? 's' : ''})
                            </S.SongListVoteCount>
                          </S.SongListRating>
                        )}
                        {user && (
                          <S.SongListMyRating $hasRated={!!userRatings[song.id]}>
                            My rating: <S.SongListMyRatingValue $hasRated={!!userRatings[song.id]}>
                              {userRatings[song.id] ? `${userRatings[song.id]}/10` : '/'}
                            </S.SongListMyRatingValue>
                          </S.SongListMyRating>
                        )}
                      </S.SongListContent>
                    </S.SongListItem>
                  );
                })}
              </S.SongList>
            </S.Sidebar>

            <S.MainContent>
              {selectedSongId ? (
                (() => {
                  const song = songs.find(s => s.id === selectedSongId);
                  if (!song) return null;
                  const votes = votesMap[song.id] || [];
                  const isLoadingVotes = loadingVotes[song.id];
                  const isOwner = user && song.userId === user.id;
                  const ratingColors = getRatingColor(song.votes.averageRating);
                  
                  // Determine which version to show
                  const versions = song.versions && song.versions.length > 0 ? song.versions : null;
                  const currentVersionIndex = selectedVersionIndex[song.id] ?? 0;
                  const currentVersion = versions 
                    ? versions[currentVersionIndex] 
                    : { youtubeId: song.youtubeId, performedBy: null };
                  const currentYoutubeId = currentVersion.youtubeId;
                  const currentArtwork = versions 
                    ? `https://img.youtube.com/vi/${currentYoutubeId}/maxresdefault.jpg`
                    : song.artwork;
                  
                  return (
                    <S.SongTile key={song.id}>
                      <S.ArtworkWrapper>
                        <S.ArtworkImage
                          key={`${song.id}-${currentYoutubeId}`}
                          src={currentArtwork}
                          alt={`${song.artist} - ${song.title}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentYoutubeId}/maxresdefault.jpg`;
                          }}
                        />
                        <S.ArtworkOverlay />
                        {isOwner && (
                          <>
                            <S.TileEditButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSong(song);
                              }}
                              title="Edit song"
                            >
                              ✏️
                            </S.TileEditButton>
                            <S.TileDeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSong(song.id);
                              }}
                              title="Delete song"
                            >
                              ×
                            </S.TileDeleteButton>
                          </>
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
                        {versions && versions.length > 1 && (
                          <S.VersionsList>
                            {versions.map((version, index) => (
                              <S.VersionItem
                                key={version.id}
                                $isSelected={currentVersionIndex === index}
                                onClick={() => handleVersionSelect(song.id, index)}
                              >
                                Preview - {version.performedBy}
                              </S.VersionItem>
                            ))}
                          </S.VersionsList>
                        )}
                        
                        <S.VideoContainer>
                          <S.VideoIframe
                            key={`${song.id}-${currentYoutubeId}`}
                            src={`https://www.youtube.com/embed/${currentYoutubeId}?rel=0`}
                            title={song.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </S.VideoContainer>
                        
                        <S.RatingTabs>
                          <S.RatingTab
                            $isActive={activeTab[song.id] === 'current' || !activeTab[song.id]}
                            onClick={() => setActiveTab(prev => ({ ...prev, [song.id]: 'current' }))}
                          >
                            Current rating
                          </S.RatingTab>
                          {user && (
                            <S.RatingTab
                              $isActive={activeTab[song.id] === 'my'}
                              onClick={() => setActiveTab(prev => ({ ...prev, [song.id]: 'my' }))}
                            >
                              My rating
                            </S.RatingTab>
                          )}
                        </S.RatingTabs>
                        
                        {(activeTab[song.id] === 'current' || !activeTab[song.id]) ? (
                          <>
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
                                {isLoadingVotes ? (
                                  <S.LoadingText>Loading votes...</S.LoadingText>
                                ) : votes.length > 0 ? (
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
                                ) : (
                                  <S.NoVotesText>No votes yet</S.NoVotesText>
                                )}
                              </div>
                            )}
                            {song.votes.totalVotes === 0 && (
                              <S.NoVotesText>No votes yet</S.NoVotesText>
                            )}
                          </>
                        ) : (
                          user && (
                            <>
                              <S.VoteRatingSection>
                                <S.VoteRatingHeader>
                                  <S.VoteRatingLabel>Rate this song (1-10)</S.VoteRatingLabel>
                                  <S.VoteRatingDisplay>
                                    <S.VoteRatingValue>{userRatings[song.id] ?? 5}</S.VoteRatingValue>
                                  </S.VoteRatingDisplay>
                                </S.VoteRatingHeader>
                                <S.VoteSliderContainer>
                                  <S.VoteSlider
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={userRatings[song.id] ?? 5}
                                    onChange={(e) => setUserRatings(prev => ({ ...prev, [song.id]: Number(e.target.value) }))}
                                    $value={userRatings[song.id] ?? 5}
                                  />
                                  <S.VoteSliderLabels>
                                    <span>1</span>
                                    <span>5</span>
                                    <span>10</span>
                                  </S.VoteSliderLabels>
                                </S.VoteSliderContainer>
                              </S.VoteRatingSection>

                              <S.VoteCommentSection>
                                <S.VoteCommentLabel>Add a comment (optional)</S.VoteCommentLabel>
                                <S.VoteCommentTextarea
                                  value={userComments[song.id] ?? ''}
                                  onChange={(e) => setUserComments(prev => ({ ...prev, [song.id]: e.target.value }))}
                                  placeholder="Explain your rating..."
                                  rows={3}
                                />
                              </S.VoteCommentSection>

                              <S.VoteSubmitButton
                                onClick={() => handleVote(song.id, userRatings[song.id] ?? 5, userComments[song.id] || undefined)}
                              >
                                Submit Vote
                              </S.VoteSubmitButton>
                            </>
                          )
                        )}
                      </S.TileContent>
                    </S.SongTile>
                  );
                })()
              ) : (
                <S.SelectSongPrompt>
                  <S.PromptContent>
                    <S.PromptIcon>🎵</S.PromptIcon>
                    <S.Heading3>Select a Song</S.Heading3>
                    <S.PromptText>Choose a song from the list to see the details</S.PromptText>
                  </S.PromptContent>
                </S.SelectSongPrompt>
              )}
            </S.MainContent>
          </S.MainLayout>
        )}
      </S.ContentWrapper>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {user && (
        <>
          <AddSongModal
            isOpen={showAddModal}
            onClose={closeAddModal}
            onAdd={handleAddSong}
          />
          <EditSongModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSongToEdit(null);
            }}
            song={songToEdit}
            onEdit={handleUpdateSong}
          />
        </>
      )}
    </PageContainer>
  );
}
