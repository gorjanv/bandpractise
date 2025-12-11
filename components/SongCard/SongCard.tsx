'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import * as S from './SongCard.styled';

interface SongCardProps {
  song: Song;
  onVote: (rating: number, comment?: string) => void;
  isActive: boolean;
  initialRating?: number;
  initialComment?: string;
  onDelete?: (songId: string) => void;
}

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
    <S.Card>
      <S.ArtworkContainer>
        {isOwner && onDelete && (
          <S.DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this song? This will also delete all votes.')) {
                onDelete(song.id);
              }
            }}
            title="Delete song"
          >
            ×
          </S.DeleteButton>
        )}
        <S.ArtworkImage
          src={song.artwork}
          alt={`${song.artist} - ${song.title}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
          }}
        />
        {showPreview && (
          <S.PreviewOverlay>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&enablejsapi=1`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
            <S.ClosePreviewButton
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
            >
              ✕
            </S.ClosePreviewButton>
          </S.PreviewOverlay>
        )}
      </S.ArtworkContainer>

      <S.Content>
        <S.SongInfo>
          <S.SongTitle>{song.title}</S.SongTitle>
          <S.SongArtist>{song.artist}</S.SongArtist>
          <S.AddedBy>
            <S.Dot />
            Added by {song.addedBy}
          </S.AddedBy>
        </S.SongInfo>

        <S.RatingSection>
          <S.RatingHeader>
            <S.RatingLabel>Rate this song (1-10)</S.RatingLabel>
            <S.RatingDisplay>
              <S.RatingValue>{rating}</S.RatingValue>
            </S.RatingDisplay>
          </S.RatingHeader>
          <S.SliderContainer>
            <S.Slider
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              $value={rating}
            />
            <S.SliderLabels>
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </S.SliderLabels>
          </S.SliderContainer>
        </S.RatingSection>

        <S.CommentSection>
          <S.CommentLabel>Add a comment (optional)</S.CommentLabel>
          <S.CommentTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain your rating..."
            rows={3}
          />
        </S.CommentSection>

        <S.ActionButtons>
          <S.PreviewButton onClick={() => setShowPreview(true)}>
            🎵 Preview
          </S.PreviewButton>
          <S.SubmitButton onClick={handleSubmit}>
            Submit Vote
          </S.SubmitButton>
        </S.ActionButtons>
      </S.Content>
    </S.Card>
  );
}

