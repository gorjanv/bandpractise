import styled from 'styled-components';
import { Container, GlassCard, PrimaryButton, Heading1, Heading2, Heading3, Text } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';
import { ErrorBanner, ErrorText, CloseErrorButton } from '@/components/shared/ErrorBanner.styled';
import { LoadingContainer, LoadingText, Spinner } from '@/components/shared/LoadingState.styled';
import { EmptyState, EmptyIcon, EmptyText } from '@/components/shared/EmptyState.styled';
import { SmallDeleteButton } from '@/components/shared/DeleteButton.styled';

export const ContentWrapper = styled(Container)`
  padding-top: 1.5rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: ${theme.zIndex.base};
`;

export { ErrorBanner, ErrorText, CloseErrorButton };
export { LoadingContainer, LoadingText, Spinner };
export { EmptyState, EmptyIcon, EmptyText };

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

export const SongListItem = styled.div<{ $isDragging: boolean }>`
  position: relative;
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: grab;
  
  &:hover {
    background: ${theme.colors.slate[800]};
    border-color: ${theme.colors.glass.borderLight};
  }
  
  &:active {
    cursor: grabbing;
  }
  
  ${props => props.$isDragging ? `
    opacity: 0.5;
  ` : ''}
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

export const SetlistArea = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

export const SetlistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const SetlistsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SetlistCard = styled(GlassCard)<{ $isSelected: boolean }>`
  padding: 1.5rem;
  transition: all ${theme.transitions.normal} ease;
  border: 2px solid ${props => props.$isSelected ? 'rgba(168, 85, 247, 0.5)' : 'transparent'};
  box-shadow: none;
  ${props => props.$isSelected ? `
    background-color: rgba(168, 85, 247, 0.1);
  ` : ''}
`;

export const SetlistCardHeader = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.$isSelected ? '1rem' : '0'};
  gap: 1rem;
`;

export const SetlistCardTitle = styled.div`
  flex: 1;
  cursor: pointer;
`;

export const SetlistName = styled(Heading3)`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: white;
`;

export const SetlistDate = styled(Text)`
  font-size: 0.875rem;
  color: ${theme.colors.slate[400]};
`;

export const SetlistDeleteButton = styled(SmallDeleteButton)`
  flex-shrink: 0;
`;

export const SetlistSongsContainer = styled.div`
  margin-top: 1rem;
`;

export const SetlistSongsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SetlistSongItem = styled.div<{ $isDragging: boolean; $isDragOver: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  cursor: grab;
  
  &:hover {
    background: ${theme.colors.slate[800]};
    border-color: ${theme.colors.glass.borderLight};
  }
  
  &:active {
    cursor: grabbing;
  }
  
  ${props => {
    if (props.$isDragging) {
      return `
        opacity: 0.4;
        cursor: grabbing;
      `;
    }
    if (props.$isDragOver) {
      return `
        background: rgba(168, 85, 247, 0.15);
        border-color: rgba(168, 85, 247, 0.5);
        border-width: 2px;
        transform: scale(1.02);
      `;
    }
    return '';
  }}
`;

export const SongNumber = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  border-radius: ${theme.borderRadius.full};
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
`;

export const SetlistSongContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
`;

export const SetlistSongInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SetlistSongTitle = styled.p`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  color: white;
  font-size: 0.9375rem;
`;

export const SetlistSongDetails = styled.p`
  font-size: 0.8125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  color: ${theme.colors.slate[400]};
`;

export const RemoveSongButton = styled.button`
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.red[400]};
  font-size: 1.25rem;
  font-weight: 300;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: ${theme.colors.red[400]};
    transform: scale(1.1);
  }
`;

export const EmptySetlistText = styled(Text)`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.slate[500]};
  font-style: italic;
`;

export { PrimaryButton, Heading1, Heading2, Heading3 };

