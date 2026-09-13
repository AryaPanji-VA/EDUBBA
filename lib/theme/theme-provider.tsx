"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME, DEFAULT_MODE, validTheme, validMode, persistThemeState, type Theme, type Mode } from "./theme-state";

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (t: Theme) => void;
  setMode: (m: Mode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with SSR defaults to avoid hydration mismatch.
  // The pre-paint script already set the correct data-theme/data-mode on <html>
  // from localStorage before first paint. After hydration, we read those DOM
  // values and sync React state to match.
  const [state, setState] = useState<{ theme: Theme; mode: Mode }>({
    theme: DEFAULT_THEME,
    mode: DEFAULT_MODE,
  });

  const apply = useCallback((theme: Theme, mode: Mode) => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    persistThemeState(theme, mode);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setState((prev) => {
      const next = { theme: t, mode: prev.mode };
      apply(next.theme, next.mode);
      return next;
    });
  }, [apply]);

  const setMode = useCallback((m: Mode) => {
    setState((prev) => {
      const next = { theme: prev.theme, mode: m };
      apply(next.theme, next.mode);
      return next;
    });
  }, [apply]);

  // After hydration: sync React state from the DOM data attributes that the
  // pre-paint script set from localStorage. This runs once on mount and ensures
  // the client state matches what the user persisted (e.g. after-dark instead
  // of the SSR default signal).
  useEffect(() => {
    const root = document.documentElement;
    const domTheme = root.dataset.theme;
    const domMode = root.dataset.mode;
    const theme = validTheme(domTheme) ? domTheme : DEFAULT_THEME;
    const mode = validMode(domMode) ? domMode : DEFAULT_MODE;
    setState((prev) => {
      if (prev.theme === theme && prev.mode === mode) return prev;
      // Persist the resolved values to keep localStorage in sync.
      persistThemeState(theme, mode);
      return { theme, mode };
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: state.theme, mode: state.mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
