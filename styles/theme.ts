export const theme = {
  colors: {
    // Background colors
    background: {
      primary: '#0a0a0f',
      secondary: '#1e1e2e',
      gradient: {
        from: '#0f172a', // slate-950
        via: '#581c87', // purple-950
        to: '#0f172a', // slate-900
      },
    },
    
    // Glass morphism
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderLight: 'rgba(255, 255, 255, 0.05)',
    },
    
    // Purple/Pink/Cyan gradient colors
    purple: {
      400: '#a855f7',
      500: '#9333ea',
      600: '#7e22ce',
    },
    pink: {
      400: '#ec4899',
      500: '#ec4899',
      600: '#db2777',
    },
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0', // slate-300
      tertiary: '#94a3b8', // slate-400
      muted: '#64748b', // slate-500
    },
    
    // Status colors
    emerald: {
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
    },
    red: {
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    
    // Slate colors
    slate: {
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Rating colors
    rating: {
      high: { from: '#10b981', to: '#14b8a6' }, // emerald to teal
      medium: { from: '#06b6d4', to: '#3b82f6' }, // cyan to blue
      low: { from: '#eab308', to: '#f97316' }, // yellow to orange
      veryLow: { from: '#ef4444', to: '#ec4899' }, // red to pink
    },
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
    purple: '0 10px 15px -3px rgba(168, 85, 247, 0.3)',
  },
  
  breakpoints: {
    mobile: '767px',
    tablet: '768px',
    desktop: '1024px',
  },
  
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 40,
    modal: 50,
  },
  
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
};

export type Theme = typeof theme;

