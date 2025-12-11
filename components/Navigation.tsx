'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

const Nav = styled.nav`
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${theme.colors.glass.border};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.xl};
  background: linear-gradient(to bottom right, ${theme.colors.purple[500]}, ${theme.colors.pink[500]}, ${theme.colors.cyan[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const LogoText = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(to right, ${theme.colors.purple[400]}, ${theme.colors.pink[400]}, ${theme.colors.cyan[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
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

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid ${theme.colors.glass.border};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.xl};
`;

const Avatar = styled.div`
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

const UserDetails = styled.div`
  display: none;
  
  @media (min-width: 640px) {
    display: block;
  }
`;

const UserName = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  margin: 0;
`;

const SignOutButton = styled.button`
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

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/vote', label: 'Vote', icon: '🎵' },
  ];

  return (
    <Nav>
      <NavContainer>
        <LogoLink href="/">
          <LogoIcon>🎵</LogoIcon>
          <LogoText>Band Practise</LogoText>
        </LogoLink>

        {user && (
          <NavLinks>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink key={item.href} href={item.href} $isActive={isActive}>
                  <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}

            <UserMenu>
              <UserInfo>
                <Avatar>
                  {(user.user_metadata?.name || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                </Avatar>
                <UserDetails>
                  <UserName>
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </UserName>
                  <SignOutButton onClick={handleSignOut}>
                    Sign Out
                  </SignOutButton>
                </UserDetails>
              </UserInfo>
            </UserMenu>
          </NavLinks>
        )}
      </NavContainer>
    </Nav>
  );
}
