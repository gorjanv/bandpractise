import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/styles/theme';

export const Nav = styled.nav`
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${theme.colors.glass.border};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${theme.zIndex.sticky};
`;

export const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 73px; /* Ensures consistent height for content padding */
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;

  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: 0.5rem;
  }
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

export const AddSongButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 6.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  background: linear-gradient(to right, ${theme.colors.purple[600]}, ${theme.colors.pink[600]}, ${theme.colors.cyan[600]});
  color: white;
  box-shadow: ${theme.shadows.purple};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.purple}, ${theme.shadows.glow};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const LogoIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.xl};
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(to right, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  white-space: nowrap;

  @media (max-width: 400px) {
    font-size: 1rem;
  }
`;

export const DesktopNav = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.tablet}) {
    display: block;
  }
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const NavLink = styled(Link)<{ $isActive: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  font-weight: 600;
  text-decoration: none;
  transition: all ${theme.transitions.slow} ease;
  
  ${props => props.$isActive ? `
    background: linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(34, 211, 238, 0.8));
    color: white;
    box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3);
  ` : `
    color: ${theme.colors.slate[300]};
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.05);
    }
  `}
`;

export const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid ${theme.colors.glass.border};
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.xl};
`;

export const Avatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
`;

export const UserDetails = styled.div`
  display: none;
  
  @media (min-width: 640px) {
    display: block;
  }
`;

export const UserName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  margin: 0;
`;

export const SignOutButton = styled.button`
  font-size: 0.75rem;
  color: ${theme.colors.slate[400]};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color ${theme.transitions.normal} ease;
  
  &:hover {
    color: white;
  }
`;

// Mobile Menu Styles
export const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: ${theme.zIndex.overlay};
  color: white;

  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const HamburgerIcon = styled.div<{ $isOpen: boolean }>`
  width: 1.5rem;
  height: 1.25rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  span {
    display: block;
    height: 2px;
    width: 100%;
    background: white;
    border-radius: 2px;
    transition: all ${theme.transitions.normal} ease;
    transform-origin: center;
  }

  ${props => props.$isOpen ? `
    span:nth-child(1) {
      transform: rotate(45deg) translate(0.375rem, 0.375rem);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: rotate(-45deg) translate(0.375rem, -0.375rem);
    }
  ` : ''}
`;

export const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: ${props => !props.$isOpen ? 'fixed' : ''};
  top: 73px;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.background.primary};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid ${theme.colors.glass.border};
  z-index: ${props => props.$isOpen ? theme.zIndex.overlay : theme.zIndex.sticky};
  overflow-y: auto;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};

  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const MobileMenuContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MobileNavLink = styled(Link)<{ $isActive: boolean }>`
  padding: 1rem;
  border-radius: ${theme.borderRadius.xl};
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all ${theme.transitions.normal} ease;
  
  ${props => props.$isActive ? `
    background: linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(34, 211, 238, 0.8));
    color: white;
    box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3);
  ` : `
    color: ${theme.colors.slate[300]};
    background: rgba(255, 255, 255, 0.05);
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

export const MobileUserSection = styled.div`
  padding-top: 1.5rem;
  border-top: 1px solid ${theme.colors.glass.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const MobileUserName = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: white;
  margin: 0;
`;

export const MobileSignOutButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.xl};
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid ${theme.colors.red[500]};
  background: rgba(239, 68, 68, 0.1);
  color: ${theme.colors.red[400]};
  cursor: pointer;
  transition: all ${theme.transitions.normal} ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: ${theme.colors.red[400]};
  }
`;

