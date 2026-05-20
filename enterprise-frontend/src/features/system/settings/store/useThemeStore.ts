import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Palette = 'gold' | 'blue' | 'green' | 'black';
export type Mode = 'light' | 'dark';

interface ThemeState {
  palette: Palette;
  mode: Mode;
  setPalette: (palette: Palette) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  // Legacy compat: some files used toggleTheme
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      palette: 'gold',
      mode: 'dark',
      setPalette: (palette) => set({ palette }),
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
      toggleTheme: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'pos-ui-theme-v2' }
  )
);

/** Apply theme attributes to <html> element */
export function applyTheme(palette: Palette, mode: Mode) {
  const root = document.documentElement;
  root.setAttribute('data-palette', palette);
  root.setAttribute('data-mode', mode);
  // Keep legacy data-theme attribute for older components using [data-theme='light']
  root.setAttribute('data-theme', mode === 'light' ? 'light' : 'dark');
}

// Default export for backward compatibility with existing files using:
// import useThemeStore from '...'
export default useThemeStore;
