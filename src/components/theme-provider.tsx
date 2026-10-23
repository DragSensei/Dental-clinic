"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "dental-demo-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const hasExplicitChoice = useRef(false);

  useEffect(() => {
    const stored = (() => {
      try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return value === "dark" || value === "light" ? value : null;
      } catch {
        return null;
      }
    })();
    hasExplicitChoice.current = stored !== null;

    const syncTheme = (next: Theme) => {
      applyTheme(next);
      setTheme(next);
    };

    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    syncTheme(stored ?? (preference.matches ? "dark" : "light"));
    if (stored) return;

    const followSystem = (event: MediaQueryListEvent) => {
      if (!hasExplicitChoice.current) syncTheme(event.matches ? "dark" : "light");
    };
    preference.addEventListener("change", followSystem);
    return () => preference.removeEventListener("change", followSystem);
  }, []);

  const toggleTheme = () => {
    hasExplicitChoice.current = true;
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Theme switching remains available when browser storage is disabled.
    }
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
