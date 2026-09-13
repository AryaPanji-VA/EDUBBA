export const THEMES = ["after-dark", "signal", "deep-space"] as const;
export type Theme = (typeof THEMES)[number];

export const MODES = ["dark", "light"] as const;
export type Mode = (typeof MODES)[number];

export const THEME_STORAGE_KEY = "robin-theme";
export const MODE_STORAGE_KEY = "robin-mode";

export const DEFAULT_THEME: Theme = "signal";
export const DEFAULT_MODE: Mode = "dark";

const THEME_RE = /^(after-dark|signal|deep-space)$/;
const MODE_RE = /^(dark|light)$/;

export function validTheme(t: unknown): t is Theme {
  return typeof t === "string" && THEME_RE.test(t);
}

export function validMode(m: unknown): m is Mode {
  return typeof m === "string" && MODE_RE.test(m);
}

export type ThemeState = { theme: Theme; mode: Mode };

// Resolve theme/mode from: ?query → localStorage → default(signal/dark).
// Each axis is independent. Safe in private mode (try/catch around localStorage).
export function resolveThemeState(): ThemeState {
  let theme: Theme = DEFAULT_THEME;
  let mode: Mode = DEFAULT_MODE;

  try {
    const th = localStorage.getItem(THEME_STORAGE_KEY);
    const md = localStorage.getItem(MODE_STORAGE_KEY);
    if (validTheme(th)) theme = th;
    if (validMode(md)) mode = md;
  } catch { /* localStorage unavailable */ }

  try {
    const qs = new URLSearchParams(location.search);
    const qt = qs.get("theme");
    const qm = qs.get("mode");
    if (validTheme(qt)) theme = qt;
    if (validMode(qm)) mode = qm;
  } catch { /* location unavailable */ }

  return { theme, mode };
}

export function persistThemeState(theme: Theme, mode: Mode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch { /* localStorage unavailable */ }
}
