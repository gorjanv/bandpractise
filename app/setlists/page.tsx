'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song, Setlist } from '@/types';
import { fetchSongs, fetchSetlists, createSetlist, addSongToSetlist, removeSongFromSetlist, reorderSetlistSongs, deleteSetlist } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import CreateSetlistModal from '@/components/CreateSetlistModal';
import { PageContainer, AnimatedBackground } from '@/styles/styledComponents';
import * as S from './SetlistsPage.styled';

export default function SetlistsPage() {
  const { user, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlistId, setSelectedSetlistId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedSongId, setDraggedSongId] = useState<string | null>(null);
  const [draggedSetlistSongId, setDraggedSetlistSongId] = useState<string | null>(null);
  const [dragOverSongId, setDragOverSongId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
      setShowAuthModal(false);
    } else if (!authLoading && !user) {
      setShowAuthModal(true);
      setIsLoading(false);
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [loadedSongs, loadedSetlists] = await Promise.all([
        fetchSongs(),
        fetchSetlists(),
      ]);
      setSongs(loadedSongs);
      setSetlists(loadedSetlists);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSetlist = async (data: { name?: string; rehearsalDate: string }) => {
    try {
      setError(null);
      const newSetlist = await createSetlist(data);
      setSetlists(prev => [newSetlist, ...prev]);
      setSelectedSetlistId(newSetlist.id);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create setlist. Please try again.');
      throw err;
    }
  };

  const handleDeleteSetlist = async (setlistId: string) => {
    if (!confirm('Are you sure you want to delete this setlist?')) {
      return;
    }

    try {
      setError(null);
      await deleteSetlist(setlistId);
      setSetlists(prev => prev.filter(s => s.id !== setlistId));
      if (selectedSetlistId === setlistId) {
        setSelectedSetlistId(null);
      }
    } catch (err) {
      console.error('Error deleting setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete setlist');
    }
  };

  const handleDragStart = (songId: string) => {
    setDraggedSongId(songId);
  };

  const handleDragEnd = () => {
    setDraggedSongId(null);
    setDraggedSetlistSongId(null);
    setDragOverSongId(null);
  };

  const handleDropOnSetlist = async (setlistId: string) => {
    if (!draggedSongId) return;

    try {
      setError(null);
      await addSongToSetlist(setlistId, draggedSongId);
      await loadData(); // Reload to get updated setlists
    } catch (err) {
      console.error('Error adding song to setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add song to setlist');
    }
  };

  const handleDragStartSetlistSong = (songId: string) => {
    setDraggedSetlistSongId(songId);
  };

  const handleDragOverSetlistSong = (e: React.DragEvent, targetSongId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSetlistSongId && draggedSetlistSongId !== targetSongId) {
      setDragOverSongId(targetSongId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSongId(null);
  };

  const handleDropOnSetlistSong = async (e: React.DragEvent, targetSongId: string, setlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSongId(null);

    if (!draggedSetlistSongId || draggedSetlistSongId === targetSongId) return;

    const selectedSetlist = setlists.find(s => s.id === setlistId);
    if (!selectedSetlist || !selectedSetlist.songs) return;

    const songIds = selectedSetlist.songs.map(ss => ss.songId);
    const draggedIndex = songIds.indexOf(draggedSetlistSongId);
    const targetIndex = songIds.indexOf(targetSongId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder array: move dragged item to target position
    const newOrder = [...songIds];
    
    // If dragging down (forward), we need to adjust: remove first, then insert
    // If dragging up (backward), insert first, then remove (to avoid index shifting)
    if (draggedIndex < targetIndex) {
      // Dragging down: remove first, then insert at target (which is correct after removal)
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
    } else {
      // Dragging up: insert first, then remove (to avoid shifting the insert position)
      const draggedItem = newOrder[draggedIndex];
      newOrder.splice(targetIndex, 0, draggedItem);
      newOrder.splice(draggedIndex + 1, 1); // Remove from original position (now +1 because we inserted)
    }

    try {
      setError(null);
      await reorderSetlistSongs(setlistId, newOrder);
      await loadData();
    } catch (err) {
      console.error('Error reordering songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder songs');
    }
  };

  const handleRemoveSongFromSetlist = async (setlistId: string, songId: string) => {
    try {
      setError(null);
      await removeSongFromSetlist(setlistId, songId);
      await loadData();
    } catch (err) {
      console.error('Error removing song from setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove song from setlist');
    }
  };

  const selectedSetlist = selectedSetlistId ? setlists.find(s => s.id === selectedSetlistId) : null;

  if (authLoading || isLoading) {
    return (
      <PageContainer>
        <AnimatedBackground />
        <S.ContentWrapper>
          <S.LoadingContainer>
            <S.Spinner />
            <S.LoadingText>Loading...</S.LoadingText>
          </S.LoadingContainer>
        </S.ContentWrapper>
      </PageContainer>
    );
  }

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

      {!authLoading && user && (
        <S.ContentWrapper>
          <S.MainLayout>
            <S.Sidebar>
              <S.SidebarTitle>Songs ({songs.length})</S.SidebarTitle>
              <S.SongList>
                {songs.map((song) => (
                  <S.SongListItem
                    key={song.id}
                    draggable
                    onDragStart={() => handleDragStart(song.id)}
                    onDragEnd={handleDragEnd}
                    $isDragging={draggedSongId === song.id}
                  >
                    <S.SongListContent>
                      <S.SongListTitle>{song.title}</S.SongListTitle>
                      <S.SongListArtist>{song.artist}</S.SongListArtist>
                      {song.votes.totalVotes > 0 && (
                        <S.SongListRating>
                          Avg: {song.votes.averageRating.toFixed(1)}/10
                        </S.SongListRating>
                      )}
                    </S.SongListContent>
                  </S.SongListItem>
                ))}
              </S.SongList>
            </S.Sidebar>

            <S.SetlistArea>
              {setlists.length === 0 ? (
                <S.EmptyState>
                  <S.EmptyIcon>📋</S.EmptyIcon>
                  <S.Heading2>No Setlists Yet</S.Heading2>
                  <S.EmptyText>Create your first setlist to start organizing songs for rehearsals!</S.EmptyText>
                  <S.PrimaryButton onClick={() => setShowCreateModal(true)}>
                    Create Setlist
                  </S.PrimaryButton>
                </S.EmptyState>
              ) : (
                <>
                  <S.SetlistHeader>
                    <S.Heading1>Setlists</S.Heading1>
                    <S.PrimaryButton onClick={() => setShowCreateModal(true)}>
                      + Create Setlist
                    </S.PrimaryButton>
                  </S.SetlistHeader>

                  <S.SetlistsList>
                    {setlists.map((setlist) => {
                      const isSelected = selectedSetlistId === setlist.id;
                      
                      return (
                        <S.SetlistCard
                          key={setlist.id}
                          $isSelected={isSelected}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedSongId) {
                              handleDropOnSetlist(setlist.id);
                            }
                          }}
                        >
                          <S.SetlistCardHeader $isSelected={isSelected}>
                            <S.SetlistCardTitle onClick={() => setSelectedSetlistId(setlist.id)}>
                              <S.SetlistName>
                                {setlist.name || 'Untitled Setlist'}
                              </S.SetlistName>
                              <S.SetlistDate>
                                {new Date(setlist.rehearsalDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </S.SetlistDate>
                            </S.SetlistCardTitle>
                            <S.SetlistDeleteButton
                              onClick={() => handleDeleteSetlist(setlist.id)}
                              title="Delete setlist"
                            >
                              ×
                            </S.SetlistDeleteButton>
                          </S.SetlistCardHeader>

                          {isSelected && (
                            <S.SetlistSongsContainer>
                              {setlist.songs && setlist.songs.length > 0 ? (
                                <S.SetlistSongsList>
                                  {setlist.songs.map((setlistSong, index) => {
                                    const song = setlistSong.song;
                                    if (!song) return null;

                                    return (
                                      <S.SetlistSongItem
                                        key={setlistSong.id}
                                        draggable={true}
                                        onDragStart={(e) => {
                                          handleDragStartSetlistSong(song.id);
                                          e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => {
                                          if (draggedSetlistSongId) {
                                            handleDragOverSetlistSong(e, song.id);
                                          }
                                        }}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => {
                                          if (draggedSetlistSongId) {
                                            handleDropOnSetlistSong(e, song.id, setlist.id);
                                          }
                                        }}
                                        $isDragging={draggedSetlistSongId === song.id}
                                        $isDragOver={dragOverSongId === song.id}
                                      >
                                        <S.SongNumber>{index + 1}</S.SongNumber>
                                        <S.SetlistSongContent>
                                          <S.SetlistSongInfo>
                                            <S.SetlistSongTitle>{song.title}</S.SetlistSongTitle>
                                            <S.SetlistSongDetails>
                                              {song.artist} • Avg: {song.votes.averageRating > 0 ? song.votes.averageRating.toFixed(1) : '—'}/10
                                            </S.SetlistSongDetails>
                                          </S.SetlistSongInfo>
                                          <S.RemoveSongButton
                                            onClick={() => handleRemoveSongFromSetlist(setlist.id, song.id)}
                                            title="Remove song"
                                          >
                                            ×
                                          </S.RemoveSongButton>
                                        </S.SetlistSongContent>
                                      </S.SetlistSongItem>
                                    );
                                  })}
                                </S.SetlistSongsList>
                              ) : (
                                <S.EmptySetlistText>
                                  Drag songs here to add them to this setlist
                                </S.EmptySetlistText>
                              )}
                            </S.SetlistSongsContainer>
                          )}
                        </S.SetlistCard>
                      );
                    })}
                  </S.SetlistsList>
                </>
              )}
            </S.SetlistArea>
          </S.MainLayout>
        </S.ContentWrapper>
      )}

      <CreateSetlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSetlist}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </PageContainer>
  );
}

