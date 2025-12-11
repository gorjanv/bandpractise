import styled from 'styled-components';
import { GlassCard, Text, Heading2 } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

export const EmptyState = styled(GlassCard)`
  padding: 3rem;
  text-align: center;
  box-shadow: ${theme.shadows.glow};
`;

export const EmptyIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1.5rem;
`;

export const EmptyText = styled(Text)`
  color: ${theme.colors.slate[300]};
  font-size: 1.125rem;
  margin: 1rem 0 2rem 0;
`;

export { Heading2 };

