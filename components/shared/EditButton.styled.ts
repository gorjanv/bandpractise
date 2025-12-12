import styled from 'styled-components';
import { theme } from '@/styles/theme';

export const EditButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 3.5rem;
  width: 2rem;
  height: 2rem;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  z-index: ${theme.zIndex.dropdown};
  font-size: 1rem;
  box-shadow: ${theme.shadows.lg};
  
  &:hover {
    background: rgba(37, 99, 235, 0.9);
    transform: scale(1.1);
  }
`;
