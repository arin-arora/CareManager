import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme) => {
      // Remove transition briefly to prevent flicker during load
      root.classList.remove('theme-transition');
      root.classList.remove('light', 'dark');

      let activeTheme = currentTheme;
      if (currentTheme === 'system') {
        activeTheme = 'light';
      }

      root.classList.add(activeTheme);

      // Force a reflow to apply the classes without transition
      void root.offsetHeight;

      root.classList.add('theme-transition');
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
