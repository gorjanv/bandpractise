'use client';

import { useState, useEffect } from 'react';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube';
import { Song, SongInput } from '@/types';
import { ModalOverlay, Input, PrimaryButton, SecondaryButton } from '@/styles/styledComponents';
import * as S from './shared/Modal.styled';
import { ErrorMessage } from './shared/ErrorBanner.styled';

interface SongVersionInput {
  youtubeUrl: string;
  performedBy: string;
}

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onEdit: (songId: string, song: SongInput) => Promise<void>;
}

export default function EditSongModal({ isOpen, onClose, song, onEdit }: EditSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [versions, setVersions] = useState<SongVersionInput[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when song changes
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      
      // Initialize versions from song
      if (song.versions && song.versions.length > 0) {
        setVersions(song.versions.map(v => ({
          youtubeUrl: v.youtubeUrl,
          performedBy: v.performedBy,
        })));
      } else {
        // If no versions, create one from the primary song data
        setVersions([{
          youtubeUrl: song.youtubeUrl,
          performedBy: song.artist, // Default to artist name if no performedBy
        }]);
      }
      setError('');
    }
  }, [song]);

  const handleVersionChange = (index: number, field: keyof SongVersionInput, value: string) => {
    const newVersions = [...versions];
    newVersions[index] = { ...newVersions[index], [field]: value };
    setVersions(newVersions);
  };

  const handleAddVersion = () => {
    if (versions.length < 5) {
      setVersions([...versions, { youtubeUrl: '', performedBy: '' }]);
    }
  };

  const handleRemoveVersion = (index: number) => {
    if (versions.length > 1) {
      const newVersions = versions.filter((_, i) => i !== index);
      setVersions(newVersions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!song) return;

    if (!title || !artist) {
      setError('Please fill in title and artist');
      return;
    }

    // Validate all versions
    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      if (!version.youtubeUrl || !version.performedBy) {
        setError(`Please fill in all fields for version ${i + 1}`);
        return;
      }

      const youtubeId = extractYouTubeId(version.youtubeUrl);
      if (!youtubeId) {
        setError(`Invalid YouTube URL for version ${i + 1}. Please paste a valid YouTube link.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Use first version for primary artwork and default values
      const firstVersion = versions[0];
      const firstYoutubeId = extractYouTubeId(firstVersion.youtubeUrl)!;
      const artwork = getYouTubeThumbnail(firstYoutubeId);
      
      // Build versions array
      const songVersions = versions.map((version, index) => {
        const youtubeId = extractYouTubeId(version.youtubeUrl)!;
        return {
          youtubeUrl: version.youtubeUrl.trim(),
          youtubeId,
          performedBy: version.performedBy.trim(),
          position: index,
        };
      });
      
      await onEdit(song.id, {
        title: title.trim(),
        artist: artist.trim(),
        artwork,
        youtubeUrl: firstVersion.youtubeUrl.trim(),
        youtubeId: firstYoutubeId,
        versions: songVersions,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
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

          {versions.map((version, index) => (
            <div key={index}>
              {index > 0 && (
                <S.VersionDivider>
                  <S.VersionLabel>Version {index + 1}</S.VersionLabel>
                  {versions.length > 1 && (
                    <S.RemoveVersionButton
                      type="button"
                      onClick={() => handleRemoveVersion(index)}
                    >
                      Remove
                    </S.RemoveVersionButton>
                  )}
                </S.VersionDivider>
              )}
              <S.FormGroup>
                <S.FormLabel>
                  YouTube URL {index === 0 && '(Primary)'}
                </S.FormLabel>
                <Input
                  type="text"
                  value={version.youtubeUrl}
                  onChange={(e) => handleVersionChange(index, 'youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {index === 0 && (
                  <S.HelpText>Paste any YouTube URL or video ID</S.HelpText>
                )}
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>
                  Performed By {index === 0 && '*'}
                </S.FormLabel>
                <Input
                  type="text"
                  value={version.performedBy}
                  onChange={(e) => handleVersionChange(index, 'performedBy', e.target.value)}
                  placeholder="Enter performer name"
                  required
                />
              </S.FormGroup>
            </div>
          ))}

          {versions.length < 5 && (
            <S.AddVersionButton
              type="button"
              onClick={handleAddVersion}
            >
              + Add a different version
            </S.AddVersionButton>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <S.ButtonGroup>
            <SecondaryButton type="button" onClick={handleClose} disabled={isLoading}>
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


