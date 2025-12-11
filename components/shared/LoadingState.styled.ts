import styled from 'styled-components';
import { GlassCard, Text, Spinner } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

export const LoadingContainer = styled(GlassCard)`
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const LoadingText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-weight: 500;
  margin-top: 1.5rem;
`;

export { Spinner };


