import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('clockify-theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Store preference (but not system)
    if (theme !== 'system') {
      localStorage.setItem('clockify-theme', theme);
    } else {
      localStorage.removeItem('clockify-theme');
    }
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    effectiveTheme,
    systemTheme,
    toggleTheme,
    setTheme: setThemeMode
  };
}