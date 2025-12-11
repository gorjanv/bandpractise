import styled from 'styled-components';
import { Text } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

export const ErrorBanner = styled.div`
  margin-bottom: 1.5rem;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ErrorText = styled(Text)`
  color: ${theme.colors.red[300]};
`;

export const CloseErrorButton = styled.button`
  color: ${theme.colors.red[400]};
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    color: ${theme.colors.red[300]};
    background: rgba(239, 68, 68, 0.2);
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: ${theme.colors.red[300]};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
`;

