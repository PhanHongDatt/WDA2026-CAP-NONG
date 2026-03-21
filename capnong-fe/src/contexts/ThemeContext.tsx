"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/* ─── Types ─── */
type Theme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/* ─── Provider ─── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("capnong-theme") as Theme | null;
    const storedFontSize = localStorage.getItem("capnong-font-size") as FontSize | null;

    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    if (storedFontSize) {
      setFontSizeState(storedFontSize);
    }

    setMounted(true);
  }, []);

  // Apply classes to <html>
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;

    // Theme
    html.classList.toggle("dark", theme === "dark");
    localStorage.setItem("capnong-theme", theme);

    // Font size — remove existing, add new
    html.classList.remove("font-small", "font-medium", "font-large");
    html.classList.add(`font-${fontSize}`);
    localStorage.setItem("capnong-font-size", fontSize);
  }, [theme, fontSize, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Hook ─── */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
