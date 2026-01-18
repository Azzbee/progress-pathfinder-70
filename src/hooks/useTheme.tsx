import { createContext, useContext, useEffect, useState } from 'react';

// Simple theme hook - only softer theme is available
interface ThemeContextType {
  theme: 'softer';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<'softer'>('softer');

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.add('theme-softer');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default if not in provider
    return { theme: 'softer' as const };
  }
  return context;
}