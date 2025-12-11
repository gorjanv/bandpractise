import styled from 'styled-components';
import { Container, GlassCard, PrimaryButton, Heading2, Heading3, Text } from '@/styles/styledComponents';
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

export const HeaderSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
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
    height: calc(100vh - 73px - 127px); /* 73px = nav height, 127px = padding + margins */
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

export const SongListItem = styled.div<{ $isSelected: boolean; $hasVoted: boolean }>`
  position: relative;
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  
  ${props => {
    if (props.$isSelected) {
      return `
        background: ${theme.colors.glass.background};
        border: 2px solid rgba(168, 85, 247, 0.5);
        background-color: rgba(168, 85, 247, 0.1);
      `;
    } else if (props.$hasVoted) {
      return `
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        
        &:hover {
          background: rgba(16, 185, 129, 0.2);
        }
      `;
    } else {
      return `
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
        
        &:hover {
          background: ${theme.colors.slate[800]};
          border-color: ${theme.colors.glass.borderLight};
        }
      `;
    }
  }}
`;

export const SongListButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  padding-right: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
`;

export const SongListTitle = styled.p<{ $isSelected: boolean; $hasVoted: boolean }>`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  
  ${props => {
    if (props.$isSelected) {
      return `color: white;`;
    } else if (props.$hasVoted) {
      return `color: ${theme.colors.emerald[300]};`;
    } else {
      return `color: ${theme.colors.slate[300]};`;
    }
  }}
`;

export const SongListArtist = styled.p<{ $isSelected: boolean }>`
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0 0.25rem 0;
  
  ${props => props.$isSelected ? `color: ${theme.colors.slate[300]};` : `color: ${theme.colors.slate[500]};`}
`;

export const SongListRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const SongListRatingText = styled(Text)`
  font-size: 0.75rem;
  color: ${theme.colors.emerald[400]};
  font-weight: 600;
`;

export const SongListDeleteButton = SmallDeleteButton;

export const DetailView = styled.div`
  flex: 1;
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

export const SelectSongPrompt = styled(GlassCard)`
  height: 100%;
  min-height: 25rem;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    min-height: 0;
  }
`;

export const PromptContent = styled.div`
  text-align: center;
`;

export const PromptIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1.5rem;
`;

export const PromptText = styled(Text)`
  color: ${theme.colors.slate[400]};
  margin-top: 1rem;
`;

export { PrimaryButton, Heading2, Heading3 };

