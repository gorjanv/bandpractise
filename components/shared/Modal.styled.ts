import styled from 'styled-components';
import { GlassCard, Heading2 } from '@/styles/styledComponents';
import { theme } from '@/styles/theme';

export const ModalContent = styled(GlassCard)`
  max-width: 28rem;
  width: 100%;
  padding: 2rem;
  box-shadow: ${theme.shadows.glow};
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const ModalIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.xl};
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${theme.colors.slate[300]};
  margin-bottom: 0.5rem;
`;

export const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${theme.colors.slate[500]};
  margin: 0.5rem 0 0 0;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  
  button {
    flex: 1;
  }
`;

export const VersionDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.5rem 0 1rem 0;
  padding-top: 1.5rem;
  border-top: 1px solid ${theme.colors.glass.border};
`;

export const VersionLabel = styled(FormLabel)`
  margin: 0;
  font-size: 0.875rem;
  color: ${theme.colors.slate[400]};
`;

export const RemoveVersionButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.red[400]};
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: ${theme.colors.red[300]};
  }
`;

export const AddVersionButton = styled.button`
  background: none;
  border: 1px dashed ${theme.colors.glass.border};
  color: ${theme.colors.purple[400]};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  transition: all ${theme.transitions.normal} ease;
  width: 100%;
  margin-top: 0.5rem;
  
  &:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: ${theme.colors.purple[500]};
    color: ${theme.colors.purple[400]};
  }
`;

export { Heading2 };


