import styled from 'styled-components';
import { GlassCard, Text, Spinner } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

export const LoadingContainer = styled(GlassCard)`
  padding: 3rem;
  text-align: center;
`;

export const LoadingText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-weight: 500;
  margin-top: 1.5rem;
`;

export { Spinner };


