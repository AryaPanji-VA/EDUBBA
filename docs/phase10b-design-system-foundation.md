# Phase 10B — Design System Foundation

## Token architecture

Six approved visual states (3 themes × 2 modes) implemented as CSS custom properties in `styles/themes.css`. Tokens are scoped to `html[data-theme="X"][data-mode="Y"]` — CSS-only switching, zero React remount.

**Two token layers:**
1. **Editor palettes** (`[data-theme="X"]` only, mode-independent) — always dark ("monitor in a daylit room"): `--editor-bg/-bar/-line/-linesoft`, `--ed-file/-meta`, `--ln`, `--fsq`, `--tok-k/-b/-n/-c/-p/-plain`, `--editor-hover`
2. **Combination blocks** (`[data-theme="X"][data-mode="Y"]`) — ~50 tokens per block: surfaces, text, accents, semantic states, nav, buttons, veil, bird

**Token groups:** `--bg/-bg-image`, `--side/-panel/-inset`, `--line/-linesoft`, `--text/-mut/-dim/-bright`, `--blue/-bar/-accent/-accent-text`, `--ok/-ok-opt/-ok-fb/-streak`, `--nav-rgb (RGB triplet)`, `--hero-*`, `--btn-*`, `--ghost-bd*`, `--now-*/--hover-bg`, `--code-*`, `--bubble`, `--input-*`, `--thumb`, `--sel/-sel-ink`, `--shadow`, `--veil-rgb/-veil-end`, `--bird-*`, `--danger`

**Compatibility mapping** in `globals.css`: old production tokens (`--void`, `--cyan`, `--success`, etc.) now alias the new theme-aware tokens (`--bg`, `--accent`, `--ok`). All existing CSS classes resolve to theme-specific values without rewriting.

## Six combinations

| Theme | Mode | Accent | Veil end |
|---|---|---|---|
| after-dark | dark | amber `#E9AC58` | .9 |
| after-dark | light | morning amber `#DFA558` | .9 |
| signal | dark | cyan `#79C7E2` | .9 |
| signal | light | muted cyan `#79B4CC` | .9 |
| deep-space | dark | cyan-blue `#93C6E4` | .88 |
| deep-space | light | soft indigo `#93A4D8` | .88 |

## Typography

Loaded via `next/font` in `app/layout.tsx` (SSR-safe, self-hosted):
- **Fraunces** (variable, opsz 9..144, 400/500/600 + italic) — `--serif` / `--font-fraunces` — display/editorial (available; not yet applied to existing text)
- **Inter** (400/500/600) — `--sans` / `--font-inter` — body/interface (replaces the OS fallback that was silently loading Segoe UI)
- **JetBrains Mono** (400/500) — `--mono` / `--font-jetbrains` — code/technical (available; not yet applied)

## Theme model + persistence

Two independent dimensions stored as `data-theme` / `data-mode` on `<html>`:
- theme ∈ {`after-dark`, `signal`, `deep-space`}; default `signal`
- mode ∈ {`dark`, `light`}; default `dark`

Resolution: `?query → localStorage → default` (query is a test/deep-link aid). Keys: `robin-theme`, `robin-mode`. Switching one axis never changes the other. `ThemeProvider` (React context) provides `{theme, mode, setTheme, setMode}`; setTheme/setMode update the DOM data attributes + persist — the React tree is not keyed by theme/mode, so lesson state (step, answers, attemptId, Source Mode, language) survives every switch.

## Pre-paint / hydration strategy

Inline `<script>` in `<head>` runs synchronously before first paint: resolves theme/mode (same precedence as provider), writes `dataset.theme/mode` on `<html>`. `suppressHydrationWarning` on `<html>` prevents React hydration mismatch warnings for the mutated attributes. No flash of the default state on reload.

## Environment architecture

`components/environment-layer.tsx` — presentational, owns no app state:
- Two `<canvas class="env">` (double-buffer) + one `<div class="veil">`
- `ENGINES` dispatch: after-dark→cityEngine (pixel city, 650ms interval, `image-rendering:pixelated`), signal→signalEngine (waves/nodes/pulse, rAF, DPR≤2), deep-space→spaceEngine (nebulae/stars/planet, rAF, DPR≤2)
- Crossfade: `.xfade` class → 0.6s CSS opacity transition; old engine stopped after 680ms
- Engines ported from the mockup with exact colors, seeded geometry (`rng(20260910)` / `rng(20260912)`)
- Cleanup: `stop()` clears interval/cancels rAF; scroll/resize listeners removed on unmount; crossfade timeout cleared
- Scroll parallax: engines read `window.scrollY` inside `draw()` (no listeners)

**Z-index layering:** env canvases (0) → veil (0, above canvases via DOM order) → workspace (1) → sidebar (3) → mobile nav (20).

## Reduced motion

`useReducedMotion()` is a **live** `matchMedia` hook with a `change` listener (fixes the mockup's static-snapshot bug). Under reduced motion: engines draw one static frame (`draw(0)`), no interval/rAF runs, crossfade is a hard swap, scroll veil still updates, and scroll-parallax redraw happens inside the rAF batch (fixes the mockup's synchronous hot path).

## Existing background migration

The old animated SVG signal background (`.signal-field`/`.signal-line` + `signal-drift`/`field-pulse` keyframes) was removed from `globals.css`. `AppShell` now renders `EnvironmentLayer` instead of `SignalBackground`. `components/signal-background.tsx` still exists because `components/backend-test.tsx` (ROBIN LAB page only) references it — the lab is a diagnostics page, not a production learning surface, so the old SVG there does not compete with the environment on lesson pages.

## What intentionally remains visually old

- Dashboard, course pages, lesson workspace, Robin panels, ROBIN LAB — all existing CSS classes and layout unchanged
- Existing text does not yet use Fraunces or JetBrains Mono (fonts are loaded and available; applying them per-surface is Phase 10C+)
- The token compatibility mapping means existing classes now render in the active theme's colors, but their layout/spacing/structure is untouched

## Phase 10C handoff

Available for consumption: `useTheme()` (context), all `--*` tokens, three font variables, `EnvironmentLayer` (self-contained), `smooth01`/`rng` helpers. Phase 10C should build the theme/mode switcher UI (segmented controls) in the shell topbar and begin restyling the sidebar per the mockup.

## Verification

```
npx tsc --noEmit → exit 0
node --test tests/*.test.mjs → 142 pass, 0 fail (128 existing + 14 new)
git diff --check → exit 0
```

Manual six-state check: open the app and append `?theme=X&mode=Y` (e.g. `?theme=after-dark&mode=light`) — all six combinations render with correct background engine, token colors, and veil.
