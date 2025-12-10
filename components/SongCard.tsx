'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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

  // Update state when initial values change (when switching songs)
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
    <div className="w-full max-w-2xl mx-auto rounded-3xl glass overflow-hidden border border-white/10 shadow-2xl glow transition-all duration-300">
      {/* Artwork/Image */}
      <div className="relative h-64 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 overflow-hidden">
        {isOwner && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this song? This will also delete all votes.')) {
                onDelete(song.id);
              }
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
            title="Delete song"
          >
            ×
          </button>
        )}
        <img
          src={song.artwork}
          alt={`${song.artist} - ${song.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${song.youtubeId}/maxresdefault.jpg`;
          }}
        />
        {showPreview && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&enablejsapi=1`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Song Info & Voting */}
      <div className="p-6 h-3/5 flex flex-col bg-slate-900/50 backdrop-blur-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-1 line-clamp-1">{song.title}</h2>
          <p className="text-lg text-slate-300 mb-2">{song.artist}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Added by {song.addedBy}
          </p>
        </div>

        {/* Rating Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-300">
              Rate this song (1-10)
            </label>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-lg border border-purple-500/30">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {rating}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(rating - 1) * 11.11}%, rgb(51, 65, 85) ${(rating - 1) * 11.11}%, rgb(51, 65, 85) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="mb-4 flex-1">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Add a comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain your rating..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-3 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            🎵 Preview
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
          >
            Submit Vote
          </button>
        </div>
      </div>
    </div>
  );
}
