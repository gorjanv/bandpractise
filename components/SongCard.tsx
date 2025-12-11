'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

interface SongCardProps {
  song: Song;
  onVote: (rating: number, comment?: string) => void;
  isActive: boolean;
  initialRating?: number;
  initialComment?: string;
  onDelete?: (songId: string) => void;
}

const Card = styled.div`
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
  border-radius: ${theme.borderRadius['3xl']};
  overflow: hidden;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.glass.border};
  box-shadow: ${theme.shadows.glow};
  transition: all ${theme.transitions.slow} ease;
`;

const ArtworkContainer = styled.div`
  position: relative;
  height: 16rem;
  background: linear-gradient(to bottom right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  overflow: hidden;
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DeleteButton = styled.button`
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

const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.dropdown};
`;

const ClosePreviewButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  height: 60%;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
`;

const SongInfo = styled.div`
  margin-bottom: 1rem;
`;

const SongTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SongArtist = styled.p`
  font-size: 1.125rem;
  color: ${theme.colors.slate[300]};
  margin: 0 0 0.5rem 0;
`;

const AddedBy = styled.p`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
`;

const Dot = styled.span`
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: ${theme.colors.purple[500]};
`;

const RatingSection = styled.div`
  margin-bottom: 1rem;
`;

const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const RatingLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[300]};
`;

const RatingDisplay = styled.div`
  padding: 0.25rem 0.75rem;
  background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba(34, 211, 238, 0.3));
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(168, 85, 247, 0.3);
`;

const RatingValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, ${theme.colors.purple[400]}, ${theme.colors.cyan[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SliderContainer = styled.div`
  position: relative;
`;

const Slider = styled.input.attrs({ type: 'range' })<{ $value: number }>`
  width: 100%;
  height: 0.75rem;
  background: ${theme.colors.slate[700]};
  border-radius: ${theme.borderRadius.lg};
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(
    to right,
    ${theme.colors.purple[400]} 0%,
    ${theme.colors.purple[400]} ${props => (props.$value - 1) * 11.11}%,
    ${theme.colors.slate[700]} ${props => (props.$value - 1) * 11.11}%,
    ${theme.colors.slate[700]} 100%
  );
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: linear-gradient(135deg, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
    cursor: pointer;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
    border: 2px solid white;
  }
  
  &::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: linear-gradient(135deg, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
    cursor: pointer;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
    border: 2px solid white;
  }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin-top: 0.25rem;
`;

const CommentSection = styled.div`
  margin-bottom: 1rem;
  flex: 1;
`;

const CommentLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.5rem;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid ${theme.colors.glass.borderLight};
  border-radius: ${theme.borderRadius.xl};
  color: white;
  font-size: 1rem;
  resize: none;
  transition: all ${theme.transitions.normal} ease;
  font-family: inherit;
  
  &::placeholder {
    color: ${theme.colors.slate[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PreviewButton = styled.button`
  padding: 0.75rem 1rem;
  background: linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(34, 211, 238, 0.8));
  color: white;
  font-weight: 600;
  border-radius: ${theme.borderRadius.xl};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.slow} ease;
  box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3);
  
  &:hover {
    background: linear-gradient(to right, ${theme.colors.purple[500]}, ${theme.colors.cyan[500]});
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, ${theme.colors.emerald[500]}, #14b8a6);
  color: white;
  font-weight: 600;
  border-radius: ${theme.borderRadius.xl};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.slow} ease;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  
  &:hover {
    background: linear-gradient(to right, ${theme.colors.emerald[400]}, #2dd4bf);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export default function SongCard({ song, onVote, isActive, initialRating, initialComment, onDelete }: SongCardProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(initialRating || 5);
  const [comment, setComment] = useState(initialComment || '');
  const [showPreview, setShowPreview] = useState(false);
  const isOwner = user && song.userId === user.id;

  useEffect(() => {
    if (initialRating !== undefined) {
      setRating(initialRating);
    } else {
      setRating(5);
    }
    if (initialComment !== undefined) {
      setComment(initialComment);
    } else {
      setComment('');
    }
  }, [initialRating, initialComment, song.id]);

  const handleSubmit = () => {
    if (rating >= 1 && rating <= 10) {
      onVote(rating, comment.trim() || undefined);
    }
  };

  if (!isActive) return null;

  return (
    <Card>
      <ArtworkContainer>
        {isOwner && onDelete && (
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this song? This will also delete all votes.')) {
                onDelete(song.id);
              }
            }}
            title="Delete song"
          >
            ×
          </DeleteButton>
        )}
        <ArtworkImage
          src={song.artwork}
          alt={`${song.artist} - ${song.title}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
          }}
        />
        {showPreview && (
          <PreviewOverlay>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&enablejsapi=1`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
            <ClosePreviewButton
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
            >
              ✕
            </ClosePreviewButton>
          </PreviewOverlay>
        )}
      </ArtworkContainer>

      <Content>
        <SongInfo>
          <SongTitle>{song.title}</SongTitle>
          <SongArtist>{song.artist}</SongArtist>
          <AddedBy>
            <Dot />
            Added by {song.addedBy}
          </AddedBy>
        </SongInfo>

        <RatingSection>
          <RatingHeader>
            <RatingLabel>Rate this song (1-10)</RatingLabel>
            <RatingDisplay>
              <RatingValue>{rating}</RatingValue>
            </RatingDisplay>
          </RatingHeader>
          <SliderContainer>
            <Slider
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              $value={rating}
            />
            <SliderLabels>
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </SliderLabels>
          </SliderContainer>
        </RatingSection>

        <CommentSection>
          <CommentLabel>Add a comment (optional)</CommentLabel>
          <CommentTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain your rating..."
            rows={3}
          />
        </CommentSection>

        <ActionButtons>
          <PreviewButton onClick={() => setShowPreview(true)}>
            🎵 Preview
          </PreviewButton>
          <SubmitButton onClick={handleSubmit}>
            Submit Vote
          </SubmitButton>
        </ActionButtons>
      </Content>
    </Card>
  );
}
