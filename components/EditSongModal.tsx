'use client';

import { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';
import { Song } from '@/types';
import { ModalOverlay, Input, PrimaryButton, SecondaryButton } from '@/styles/styledComponents';
import * as S from './shared/Modal.styled';
import { ErrorMessage } from './shared/ErrorBanner.styled';

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onEdit: (songId: string, song: Omit<Song, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => Promise<void>;
}

export default function EditSongModal({ isOpen, onClose, song, onEdit }: EditSongModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when song changes
  useEffect(() => {
    if (song) {
      setYoutubeUrl(song.youtubeUrl);
      setTitle(song.title);
      setArtist(song.artist);
      setError('');
    }
  }, [song]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!song) return;

    if (!youtubeUrl || !title || !artist) {
      setError('Please fill in all fields');
      return;
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      setError('Invalid YouTube URL. Please paste a valid YouTube link.');
      return;
    }

    setIsLoading(true);

    try {
      const artwork = getYouTubeThumbnail(youtubeId);
      
      await onEdit(song.id, {
        title: title.trim(),
        artist: artist.trim(),
        artwork,
        youtubeUrl: youtubeUrl.trim(),
        youtubeId,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !song) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalIcon>✏️</S.ModalIcon>
          <S.Heading2>Edit Song</S.Heading2>
        </S.ModalHeader>

        <S.ModalForm onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.FormLabel>YouTube URL</S.FormLabel>
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <S.HelpText>Paste any YouTube URL or video ID</S.HelpText>
          </S.FormGroup>

          <S.FormGroup>
            <S.FormLabel>Song Title</S.FormLabel>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.FormLabel>Artist</S.FormLabel>
            <Input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
            />
          </S.FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <S.ButtonGroup>
            <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Song'}
            </PrimaryButton>
          </S.ButtonGroup>
        </S.ModalForm>
      </S.ModalContent>
    </ModalOverlay>
  );
}

