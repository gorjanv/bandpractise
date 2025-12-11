import styled from 'styled-components';
import { theme } from '@/styles/theme';

export const DeleteButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  z-index: ${theme.zIndex.dropdown};
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: ${theme.shadows.lg};
  
  &:hover {
    background: ${theme.colors.red[600]};
    transform: scale(1.1);
  }
`;

export const SmallDeleteButton = styled(DeleteButton)`
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.875rem;
  top: 0.5rem;
  right: 0.5rem;
`;

