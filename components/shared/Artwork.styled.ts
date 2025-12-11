import styled from 'styled-components';
import { theme } from '@/styles/theme';

export const ArtworkWrapper = styled.div`
  position: relative;
  height: 8rem;
  background: linear-gradient(to bottom right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  overflow: hidden;
`;

export const ArtworkContainer = styled.div`
  position: relative;
  height: 16rem;
  background: linear-gradient(to bottom right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  overflow: hidden;
`;

export const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ArtworkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
`;

export const ArtworkInfo = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
`;

