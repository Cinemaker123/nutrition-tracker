'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  
  console.log('[ThemeToggle] Render - mounted:', mounted, 'theme:', theme);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    console.log('[ThemeToggle] Not mounted yet, showing placeholder');
    return (
      <div className="fixed top-4 right-4 p-2 rounded-lg bg-white shadow-md z-50">
        <div className="w-5 h-5" />
      </div>
    );
  }

  console.log('[ThemeToggle] Mounted, rendering button for theme:', theme);

  return (
    <button
      onClick={() => {
        console.log('[ThemeToggle] Button clicked');
        toggleTheme();
      }}
      className="fixed top-4 right-4 p-2 rounded-lg bg-white  shadow-md hover:shadow-lg transition-all z-50"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}
