"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme/theme-provider";
import { THEMES, type Theme, type Mode } from "@/lib/theme/theme-state";

const THEME_LABELS: Record<Theme, string> = {
  "after-dark": "After Dark",
  "signal": "Signal",
  "deep-space": "Deep Space",
};

const TAGLINE: Record<Theme, Record<Mode, string>> = {
  "after-dark": { dark: "cs, after dark", light: "cs, at dawn" },
  "signal": { dark: "cs, tuned in", light: "cs, tuned in" },
  "deep-space": { dark: "cs, in orbit", light: "cs, in orbit" },
};

const MoonIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d="M10 7.5A4.5 4.5 0 1 1 4.5 2 3.5 3.5 0 0 0 10 7.5z" />
  </svg>
);

const SunIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="6" cy="6" r="2.6" />
    <path d="M6 1v1.4M6 9.6V11M1 6h1.4M9.6 6H11M2.5 2.5l1 1M8.5 8.5l1 1M9.5 2.5l-1 1M3.5 8.5l-1 1" />
  </svg>
);

// Reusable theme/mode segmented controls — ported from Kimi mockup's .switcher
export function ThemeSwitcher() {
  const { theme, mode, setTheme, setMode } = useTheme();

  return (
    <>
      <div className="switcher" role="group" aria-label="Environment theme">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            className={theme === t ? "on" : ""}
            aria-pressed={theme === t}
            onClick={() => setTheme(t)}
          >
            {THEME_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="switcher" role="group" aria-label="Color mode">
        <button
          type="button"
          className={mode === "dark" ? "on" : ""}
          aria-pressed={mode === "dark"}
          onClick={() => setMode("dark")}
        >
          <MoonIcon /> Dark
        </button>
        <button
          type="button"
          className={mode === "light" ? "on" : ""}
          aria-pressed={mode === "light"}
          onClick={() => setMode("light")}
        >
          <SunIcon /> Light
        </button>
      </div>
    </>
  );
}

// Theme-dependent brand tagline for the sidebar
export function BrandTagline() {
  const { theme, mode } = useTheme();
  return <span className="brand-sub">{TAGLINE[theme][mode]}</span>;
}

// Theme-dependent learner label for the sidebar profile
export function LearnerLabel() {
  const { mode } = useTheme();
  return <div className="me-sub">{mode === "dark" ? "evening learner" : "morning learner"}</div>;
}
