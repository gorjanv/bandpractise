import styled from 'styled-components';
import { Container, GlassCard, PrimaryButton, Heading1, Heading2, Heading3, Text } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';
import { ErrorBanner, ErrorText, CloseErrorButton } from '@/components/shared/ErrorBanner.styled';
import { LoadingContainer, LoadingText, Spinner } from '@/components/shared/LoadingState.styled';
import { EmptyState, EmptyIcon, EmptyText } from '@/components/shared/EmptyState.styled';
import { ArtworkWrapper, ArtworkImage, ArtworkOverlay, ArtworkInfo } from '@/components/shared/Artwork.styled';
import { Dot } from '@/components/shared/Dot.styled';
import { DeleteButton } from '@/components/shared/DeleteButton.styled';

export const ContentWrapper = styled(Container)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: ${theme.zIndex.base};
`;

export const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    height: calc(100vh - 73px - 127px);
  }
`;

export const Sidebar = styled.div`
  width: 100%;
  flex-shrink: 0;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius['3xl']};
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid ${theme.colors.glass.border};
  max-height: 40vh;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: 20rem;
    max-height: none;
  }
`;

export const SidebarTitle = styled(Heading2)`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
`;

export const SongList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SongListItem = styled.div<{ $isSelected: boolean }>`
  position: relative;
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  background: ${props => props.$isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)'};
  border: 1px solid ${props => props.$isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.$isSelected ? 'rgba(59, 130, 246, 0.3)' : theme.colors.slate[800]};
    border-color: ${props => props.$isSelected ? 'rgba(59, 130, 246, 0.7)' : theme.colors.glass.borderLight};
  }
`;

export const SongListContent = styled.div`
  padding: 0.75rem;
  width: 100%;
`;

export const SongListTitle = styled.p`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  color: ${theme.colors.slate[300]};
`;

export const SongListArtist = styled.p`
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  color: ${theme.colors.slate[500]};
`;

export const SongListRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${theme.colors.emerald[400]};
  font-weight: 600;
`;

export const SongListVoteCount = styled.span`
  color: ${theme.colors.slate[500]};
  font-weight: 400;
`;

export const MainContent = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

export const SelectSongPrompt = styled(GlassCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 20rem;
  padding: 2rem;
`;

export const PromptContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const PromptIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1.5rem;
`;

export const PromptText = styled(Text)`
  color: ${theme.colors.slate[400]};
  margin-top: 1rem;
`;

export { ErrorBanner, ErrorText, CloseErrorButton };
export { LoadingContainer, LoadingText, Spinner };
export { EmptyState, EmptyIcon, EmptyText };
export { ArtworkWrapper, ArtworkImage, ArtworkOverlay, ArtworkInfo };
export { Dot };
export { DeleteButton as TileDeleteButton };

export const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 1.5rem;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  background: ${theme.colors.slate[900]};
`;

export const VideoIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export const SongTile = styled(GlassCard)`
  overflow: hidden;
  border: 1px solid ${theme.colors.glass.border};
  transition: all ${theme.transitions.slow} ease;
  
  &:hover {
    border-color: rgba(168, 85, 247, 0.3);
  }
`;

export const SongTitle = styled(Heading3)`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SongArtist = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.25rem;
`;

export const AddedByText = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[300]};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const TileContent = styled.div`
  padding: 1.5rem;
`;

export const RatingSection = styled.div`
  margin-bottom: 1rem;
`;

export const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export const RatingLabel = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[400]};
`;

export const VoteCount = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
`;

export const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const RatingBarFill = styled.div<{ $width: number; $from: string; $to: string }>`
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

export const RatingValue = styled.span<{ $from: string; $to: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, ${props => props.$from}, ${props => props.$to});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const ExpandButton = styled.button`
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

export const VotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 24rem;
  overflow-y: auto;
`;

export const VoteCard = styled(GlassCard)`
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  transition: all ${theme.transitions.normal} ease;
  box-shadow: none;
  &:hover {
    border-color: rgba(168, 85, 247, 0.2);
  }
`;

export const VoteHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

export const VoteUser = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UserAvatar = styled.div`
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

export const UserName = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
`;

export const VoteRating = styled.div<{ $from: string; $to: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.lg};
  background: linear-gradient(to right, ${props => props.$from}, ${props => props.$to});
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
`;

export const VoteComment = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[300]};
  margin-top: 0.5rem;
`;

export const VoteDate = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin-top: 0.5rem;
`;

export const NoVotesText = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[500]};
  text-align: center;
  padding: 1rem 0;
`;

export { PrimaryButton, Heading1, Heading2, Heading3 };

