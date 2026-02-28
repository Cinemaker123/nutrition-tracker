'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('[ThemeProvider] useEffect running - checking storage/system preference');
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme') as Theme | null;
    console.log('[ThemeProvider] Saved theme from localStorage:', saved);
    
    if (saved) {
      console.log('[ThemeProvider] Using saved theme:', saved);
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('[ThemeProvider] No saved theme, using system preference: dark');
      setTheme('dark');
    } else {
      console.log('[ThemeProvider] No saved theme, using default: light');
    }
    setMounted(true);
    console.log('[ThemeProvider] Mounted set to true');
  }, []);

  useEffect(() => {
    console.log('[ThemeProvider] Theme changed to:', theme);
    console.log('[ThemeProvider] Document classes before:', document.documentElement.classList.toString());
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('[ThemeProvider] Document classes after:', document.documentElement.classList.toString());
    localStorage.setItem('theme', theme);
    console.log('[ThemeProvider] Saved theme to localStorage');
  }, [theme]);

  const toggleTheme = () => {
    console.log('[ThemeProvider] toggleTheme called, current theme:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('[ThemeProvider] Switching to:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
