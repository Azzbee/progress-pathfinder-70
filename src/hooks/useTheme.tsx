import { createContext, useContext, useEffect, useState } from 'react';
import { useUserSettings } from './useUserSettings';

export type Theme = 'softer' | 'hacker';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('softer');
  const { settings, updateSettings, loading } = useUserSettings();

  // Sync with user settings from database
  useEffect(() => {
    if (!loading && settings) {
      const savedTheme = (settings as any).theme as Theme;
      if (savedTheme && (savedTheme === 'softer' || savedTheme === 'hacker')) {
        setThemeState(savedTheme);
      }
    }
  }, [settings, loading]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'hacker') {
      root.classList.add('theme-hacker');
      root.classList.remove('theme-softer');
    } else {
      root.classList.add('theme-softer');
      root.classList.remove('theme-hacker');
    }
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    // Save to database
    await updateSettings({ theme: newTheme } as any);
  };

  const toggleTheme = () => {
    setTheme(theme === 'softer' ? 'hacker' : 'softer');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
