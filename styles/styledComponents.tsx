import styled, { css } from 'styled-components';
import { theme } from './theme';

// Container Components
export const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

export const PageContainer = styled.div`
  height: 100vh;
  background: linear-gradient(to bottom right, ${theme.colors.background.gradient.from}, ${theme.colors.background.gradient.via}, ${theme.colors.background.gradient.to});
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 73px; /* Navigation height - adjust if nav height changes */
  box-sizing: border-box;
`;

export const AnimatedBackground = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 24rem;
    height: 24rem;
    border-radius: 50%;
    filter: blur(80px);
    animation: pulse 4s ease-in-out infinite;
  }
  
  &::before {
    top: 0;
    left: 25%;
    background: rgba(168, 85, 247, 0.2);
  }
  
  &::after {
    bottom: 0;
    right: 25%;
    background: rgba(34, 211, 238, 0.2);
    animation-delay: 1s;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

// Glass morphism effect
export const GlassCard = styled.div`
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.glass.border};
  border-radius: ${theme.borderRadius['3xl']};
  box-shadow: ${theme.shadows.glow};
`;

// Button Components
const buttonBase = css`
  padding: 0.625rem 1.5rem;
  font-weight: 600;
  border-radius: ${theme.borderRadius.xl};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  font-size: 1rem;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  background: linear-gradient(to right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  color: white;
  box-shadow: ${theme.shadows.purple};
  
  &:hover {
    box-shadow: ${theme.shadows.purple}, ${theme.shadows.glow};
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase}
  background: ${theme.colors.slate[800]};
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.glass.borderLight};
  
  &:hover {
    background: ${theme.colors.slate[700]};
    color: ${theme.colors.text.primary};
  }
`;

export const SuccessButton = styled.button`
  ${buttonBase}
  background: linear-gradient(to right, ${theme.colors.emerald[500]}, #14b8a6);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.5);
  }
`;

export const DangerButton = styled.button`
  ${buttonBase}
  background: ${theme.colors.red[500]};
  color: white;
  
  &:hover {
    background: ${theme.colors.red[600]};
  }
`;

// Input Components
export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.slate[800]};
  border: 1px solid ${theme.colors.glass.borderLight};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  transition: all ${theme.transitions.normal} ease;
  
  &::placeholder {
    color: ${theme.colors.slate[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${theme.colors.slate[800]};
  border: 1px solid ${theme.colors.glass.borderLight};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  resize: none;
  transition: all ${theme.transitions.normal} ease;
  font-family: inherit;
  
  &::placeholder {
    color: ${theme.colors.slate[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
  }
`;

// Typography
export const Heading1 = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

export const Heading2 = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

export const Heading3 = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

export const Text = styled.p<{ variant?: 'primary' | 'secondary' | 'muted' }>`
  margin: 0;
  color: ${props => {
    switch (props.variant) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'muted':
        return theme.colors.text.muted;
      default:
        return theme.colors.text.primary;
    }
  }};
`;

// Modal Overlay
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: 1rem;
`;

// Loading Spinner
export const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(168, 85, 247, 0.3);
  border-top-color: ${theme.colors.purple[500]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Utility functions for responsive design
export const media = {
  mobile: (styles: string) => `
    @media (max-width: ${theme.breakpoints.mobile}) {
      ${styles}
    }
  `,
  tablet: (styles: string) => `
    @media (min-width: ${theme.breakpoints.tablet}) {
      ${styles}
    }
  `,
  desktop: (styles: string) => `
    @media (min-width: ${theme.breakpoints.desktop}) {
      ${styles}
    }
  `,
};

