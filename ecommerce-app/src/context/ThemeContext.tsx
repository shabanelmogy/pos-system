"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Palette = "gold" | "blue" | "green" | "black";
export type Mode = "light" | "dark";

interface ThemeContextType {
  palette: Palette;
  mode: Mode;
  setPalette: (palette: Palette) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [palette, setPaletteState] = useState<Palette>("gold");
  const [mode, setModeState] = useState<Mode>("dark");

  // Load theme from localStorage on initial mount
  useEffect(() => {
    const savedPalette = localStorage.getItem("nexus-ecommerce-palette") as Palette;
    const savedMode = localStorage.getItem("nexus-ecommerce-mode") as Mode;

    if (savedPalette) setPaletteState(savedPalette);
    if (savedMode) setModeState(savedMode);
  }, []);

  // Sync DOM attributes whenever mode or palette changes
  useEffect(() => {
    const root = document.documentElement;

    // Temporarily suppress transitions during change to avoid flash
    root.classList.add("no-transition");

    root.setAttribute("data-palette", palette);
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-theme", mode);

    const timer = requestAnimationFrame(() => {
      root.classList.remove("no-transition");
    });

    return () => cancelAnimationFrame(timer);
  }, [palette, mode]);

  const setPalette = (newPalette: Palette) => {
    setPaletteState(newPalette);
    localStorage.setItem("nexus-ecommerce-palette", newPalette);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("nexus-ecommerce-mode", newMode);
  };

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ palette, mode, setPalette, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
