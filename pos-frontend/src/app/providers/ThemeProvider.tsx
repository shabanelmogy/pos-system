import React, { useEffect } from 'react';
import { useThemeStore, applyTheme } from "@/features/system/settings/store/useThemeStore";

/**
 * ThemeProvider
 * Must wrap your entire app. On mount and on any palette/mode change,
 * it applies the correct data attributes to <html> so CSS variables cascade.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { palette, mode } = useThemeStore();

  useEffect(() => {
    // Suppress transition flash on initial load
    document.documentElement.classList.add('no-transition');
    applyTheme(palette, mode);
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition');
    });
  }, [palette, mode]);

  return <>{children}</>;
};
