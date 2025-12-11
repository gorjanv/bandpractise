'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAddSongModal } from '@/contexts/AddSongModalContext';
import * as S from './Navigation/Navigation.styled';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { openModal } = useAddSongModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/vote', label: 'Vote', icon: '🎵' },
  ];

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <S.Nav>
      <S.NavContainer>
        <S.LeftSection>
          <S.LogoLink href="/" onClick={handleNavClick}>
            <S.LogoIcon>🎵</S.LogoIcon>
            <S.LogoText>Band Practise</S.LogoText>
          </S.LogoLink>
          {user && (
            <S.AddSongButton onClick={openModal}>
              <span>+</span>
              <span>Add Song</span>
            </S.AddSongButton>
          )}
        </S.LeftSection>

        {user && (
          <>
            <S.DesktopNav>
              <S.NavLinks>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <S.NavLink key={item.href} href={item.href} $isActive={isActive}>
                      <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                      {item.label}
                    </S.NavLink>
                  );
                })}

                <S.UserMenu>
                  <S.UserInfo>
                    <S.Avatar>
                      {(user.user_metadata?.name || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                    </S.Avatar>
                    <S.UserDetails>
                      <S.UserName>
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </S.UserName>
                      <S.SignOutButton onClick={handleSignOut}>
                        Sign Out
                      </S.SignOutButton>
                    </S.UserDetails>
                  </S.UserInfo>
                </S.UserMenu>
              </S.NavLinks>
            </S.DesktopNav>

            <S.MobileMenuButton
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-label="Toggle menu"
              type="button"
            >
              <S.HamburgerIcon $isOpen={isMobileMenuOpen}>
                <span></span>
                <span></span>
                <span></span>
              </S.HamburgerIcon>
            </S.MobileMenuButton>
          </>
        )}
      </S.NavContainer>

      {user && (
        <S.MobileMenu $isOpen={isMobileMenuOpen}>
          <S.MobileMenuContent>
            <S.MobileNavLinks>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <S.MobileNavLink
                    key={item.href}
                    href={item.href}
                    $isActive={isActive}
                    onClick={handleNavClick}
                  >
                    <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                    {item.label}
                  </S.MobileNavLink>
                );
              })}
            </S.MobileNavLinks>

            <S.MobileUserSection>
              <S.MobileUserInfo>
                <S.Avatar>
                  {(user.user_metadata?.name || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                </S.Avatar>
                <S.MobileUserName>
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </S.MobileUserName>
              </S.MobileUserInfo>
              <S.MobileSignOutButton onClick={handleSignOut}>
                Sign Out
              </S.MobileSignOutButton>
            </S.MobileUserSection>
          </S.MobileMenuContent>
        </S.MobileMenu>
      )}
    </S.Nav>
  );
}
