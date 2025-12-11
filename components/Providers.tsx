'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { AddSongModalProvider } from '@/contexts/AddSongModalContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AddSongModalProvider>
          {children}
        </AddSongModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

