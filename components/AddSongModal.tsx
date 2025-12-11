'use client';

import { useState } from 'react';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';
import { Song } from '@/types';
import styled from 'styled-components';
import { ModalOverlay, GlassCard, Input, PrimaryButton, SecondaryButton, Heading2, Text } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (song: Omit<Song, 'id' | 'addedAt' | 'votes' | 'addedBy'>) => Promise<void>;
}

const ModalContent = styled(GlassCard)`
  max-width: 28rem;
  width: 100%;
  padding: 2rem;
  box-shadow: ${theme.shadows.glow};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Icon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.xl};
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.5rem;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin: 0.5rem 0 0 0;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: ${theme.colors.red[300]};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  
  button {
    flex: 1;
  }
`;

export default function AddSongModal({ isOpen, onClose, onAdd }: AddSongModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      
      await onAdd({
        title: title.trim(),
        artist: artist.trim(),
        artwork,
        youtubeUrl: youtubeUrl.trim(),
        youtubeId,
      });

      setYoutubeUrl('');
      setTitle('');
      setArtist('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>
          <Icon>🎵</Icon>
          <Heading2>Add New Song</Heading2>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>YouTube URL</Label>
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <HelpText>Paste any YouTube URL or video ID</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Song Title</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
            />
          </FormGroup>

          <FormGroup>
            <Label>Artist</Label>
            <Input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Song'}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}
