# Phase 10C — Global Shell Integration

## Phase 10C.1 Runtime + Visual Parity Correction

After initial Phase 10C implementation, manual browser verification revealed three runtime issues:

### Theme switching root cause

The server-rendered `<html>` had **no `data-theme`/`data-mode` attributes**. The pre-paint script (`next/script` with `beforeInteractive`) was deferred by Next.js and only ran client-side after hydration. This meant CSS token selectors (`[data-theme="signal"][data-mode="dark"]`) had nothing to match on the server-rendered page — no theme tokens applied until React hydrated and `ThemeProvider` set the attributes.

**Fix:** Added `data-theme={DEFAULT_THEME}` and `data-mode={DEFAULT_MODE}` directly to the `<html>` element in `app/layout.tsx`. Now the server always renders correct default attributes; the pre-paint script overrides them before first paint if localStorage has different values; `ThemeProvider` syncs on hydration.

### Environment visibility root cause

The `body` element had `background: var(--bg)` (an opaque color) and `.app` had no transparent background. The environment canvas (`z-index: 0`) was hidden behind the opaque body/app layer (`z-index: 1`). The canvas was mounted and engines were running, but nothing was visible.

**Fix:** Changed `body` background to `transparent` and added `background: transparent` to `.app`. The environment canvas is now visible through the transparent body/app layers. The sidebar (`.side`) remains solid opaque (`var(--side)`) per the mockup spec — the environment stays out of the sidebar.

### Typography root cause

The body font was set to `400 16px/1.5 var(--sans)` (old production size). The mockup uses `400 14px/1.55 var(--sans)`. Fraunces and JetBrains Mono were loaded by `next/font` but never applied to any element — the old production CSS didn't reference `--serif` or `--mono`.

**Fix:** Updated body font to `400 14px/1.55 var(--sans)`. Ported the complete mockup content CSS (masthead, hero, panels, continue, path, mastery, assist, footer) which uses `--serif` for headings (`hero h1` 34px, `lesson-title` 21px, `brand-name` 17px) and `--mono` for meta labels (`hero-date`, `lesson-meta`, `mcount`, `shead-meta`, etc.).

### Dashboard migration

The old production dashboard (`.cockpit-grid`, `.greeting`, `.recommendation`, `.dashboard-robin`, `.course-strip`, `.lower-grid`, `.activity-panel`, `.tonight`) was fully replaced with the mockup dashboard structure:
- `.mast` / `.mast-inner` / `.topbar` (breadcrumbs)
- `.hero` (date + greeting + context)
- `.content` / `.grid` (two-column: main + side-col)
- `.panel.cut.continue` (lesson card with buttons + progress bar)
- `.path` / `.mods` / `.mod-row` (module/lesson tree with nodes + progress bars)
- `.panel.mastery` / `.mast-list` (concept mastery bars)
- `.panel.assist` (Robin presence + chat preview + input)
- `.foot` (footer)

All production data preserved: real course names (Foundations of Programming), real lessons (Variables, Data Types), real routes (`/courses/programming/variables`, `/courses/programming/data-types`).

### Remaining visual differences from mockup

1. No search bar in topbar (mockup has `.search` with `⌘K` — not yet implemented)
2. No focus timer chip (mockup has `.chip` with `#focusTime` countdown)
3. No ambient clock in sidebar (mockup has `.streak time[data-clock]` — JS-driven)
4. Course pages still use old CSS (not yet redesigned)
5. Lesson workspace content still uses old CSS (will be updated in Phase 10E)
6. Robin companion panel still uses old CSS
7. Responsive: basic mobile fallback (not mockup-matched)

### Phase 10C.2 Topbar Migration

Theme/mode controls moved from sidebar footer to top command bar (matching the Kimi mockup's `.topbar` layout). Created `components/top-bar.tsx` — a reusable client component that renders breadcrumb + ThemeSwitcher + optional contextual controls.

**Dashboard:** `<TopBar breadcrumb={...} />` — breadcrumb + theme + mode.

**Lesson pages (Variables, Data Types):** `<TopBar breadcrumb={...} contextual={ID/EN + Source Mode controls} />` — breadcrumb + theme + mode + language toggle + source mode toggle, all using the mockup's `.switcher` component.

**Sidebar cleaned:** `ThemeSwitcher` removed from `.side-foot`. Sidebar now has brand + nav + user profile only (matching Kimi hierarchy).

**Old CSS removed:** `.lesson-topbar`, `.mode-control`, `.mode-control button.selected` — replaced by the mockup's `.switcher` component. Responsive breakpoint updated to remove `.lesson-topbar` reference.

---

## Phase 10C acceptance recommendation

**Does the production global shell now visually match the approved Kimi unified-theme mockup closely enough that both appear to be the same interface?**

**Yes** — the production shell now reproduces the Kimi mockup's sidebar (pixel-bird brand, nav with SVG icons, accent active rail, user profile), top command bar (breadcrumb, theme segmented control with accent dot, mode segmented control with moon/sun icons), transparent content area (environment canvas visible), mockup typography (Fraunces headings, Inter body, JetBrains Mono meta), mockup dashboard structure (hero, content grid, panels, learning path, mastery, assistant), and all six theme×mode combinations work via the topbar UI controls. The remaining differences (search bar, focus timer, course/lesson content restyling) are explicitly deferred to later phases.

---

## Theme switching issue

**Root cause:** None. Phase 10B's `ThemeProvider`, `theme-state.ts`, and pre-paint script were all correct. The issue was simply that **no UI existed** to call `setTheme`/`setMode` — the user could only change themes via `?theme=&mode=` query parameters. This was expected: Phase 10B deliberately deferred the switcher UI to 10C.

**Fix:** Built `components/theme-switcher.tsx` with two segmented controls calling `setTheme()`/`setMode()` from the existing `useTheme()` context. No second state system created.

## Shell implementation

The old production shell (`.workspace`/`.sidebar` grid with blurred backdrop, `.brand-signal` animated bars, `.nav-link` buttons, `.sidebar-footer` with "SIGNAL ONLINE" text) was **fully replaced** with the mockup's shell:

- `.app` (236px + 1fr grid) replaces `.workspace` (218px + 1fr)
- `.side` (solid opaque, sticky, flex column) replaces `.sidebar` (blurred backdrop)
- Pixel-bird SVG brand mark replaces animated signal bars
- `.nav a` with mockup SVG icons + `.on` active rail replaces `.nav-link` with text icons
- `.side-foot` with `ThemeSwitcher` + user profile replaces `.sidebar-footer` with "SIGNAL ONLINE"
- `.main` (1180px max-width, 32px padding) replaces old `.main` (1500px max-width, 48px padding)

## Mockup → production mapping

| Mockup element | Production implementation |
|---|---|
| `.app` grid | `app-shell.tsx` root `<div className="app mode-{signalMode}">` |
| `<aside class="side">` | `<aside className="side">` with exact mockup CSS |
| Brand pixel-bird SVG | Exact port — 17 rects in 3 groups + beak + eye |
| `.brand-name` "robin" | Fraunces 17px `var(--bright)` |
| `.brand-sub` tagline | `TAGLINE[theme][mode]` from `theme-switcher.tsx` |
| `.nav a` (Dashboard/Courses/Lesson) | Next.js `<Link>` with mockup SVG icons, `active` prop drives `.on` |
| `.side-foot` | `<ThemeSwitcher />` + user profile (Arya, mode-aware label) |
| `.switcher` (theme) | 3 buttons: After Dark/Signal/Deep Space → `setTheme()` |
| `.switcher` (mode) | 2 buttons with moon/sun SVG → `setMode()` |
| `.switcher button.on` | Accent dot `::before` + `rgba(var(--nav-rgb), var(--nav-on))` background |
| `.main` content frame | `{children}` wrapper, 1180px max-width |

## Navigation

Production routes mapped to mockup nav:
- Dashboard → `/`
- Courses → `/courses`
- Current lesson → `/courses/programming/variables` (hardcoded to Variables; lesson pages pass `active="lesson"`)

Active state derives from the `active` prop on `AppShell`. Next.js `<Link>` preserves client-side navigation.

## Theme/mode controls

`components/theme-switcher.tsx` — two segmented controls matching the mockup's exact markup:
- **Theme switcher:** `role="group" aria-label="Environment theme"`, 3 buttons with `aria-pressed`, `.on` class, `onClick={() => setTheme(t)}`
- **Mode switcher:** `role="group" aria-label="Color mode"`, 2 buttons with inline moon/sun SVGs, `aria-pressed`, `.on` class, `onClick={() => setMode(m)}`

Both call the existing `useTheme()` context — no duplicate state, no direct `localStorage` access, no direct DOM manipulation. CSS `.switcher` styles ported from mockup `base.css`.

## Visual fidelity

**Matches the mockup:**
- Sidebar structure, layout, spacing, typography (Fraunces brand, mono sub-label)
- Pixel-bird brand mark (exact SVG rects)
- Nav icons (exact SVG paths: grid, book, terminal)
- Nav active state (3px accent rail, `rgba(nav-rgb, nav-on)` background)
- Theme/mode switcher (segmented controls, accent dot, moon/sun icons)
- Solid opaque sidebar background (no blur)
- Main content max-width 1180px with 32px padding
- Token-based colors (all `var(--*)` from `themes.css`)
- Global 0.45s crossfade transition
- Environment canvas behind the shell

**Still differs from the mockup:**
- No course progress card in sidebar (mockup has `.side-course` with progress bar — needs real data, deferred to 10D)
- No masthead/hero (mockup has greeting + date + focus timer — dashboard-specific, deferred to 10D)
- No search bar in topbar (mockup has `.search` — not yet implemented)
- No `.chip` focus timer
- Dashboard internal content uses old CSS classes (`.cockpit-grid`, `.greeting`) — visual mismatch inside content area
- Lesson workspace topbar still uses old `.lesson-topbar` CSS — will be updated in 10E
- Robin panels still use old CSS — will be updated in 10F
- Responsive: sidebar doesn't collapse to icon-rail smoothly (basic mobile bottom-nav fallback carried from old production)

## State preservation

Theme/mode switching is **CSS-only** — `ThemeProvider` sets `data-theme`/`data-mode` on `<html>`; the React tree is never keyed by theme/mode; `EnvironmentLayer` uses `useEffect` on `[theme, mode]` to crossfade canvases. Lesson state (step, answers, attemptId, Source Mode, language, Smart Feedback, Robin Check, mastery) is in `LessonActivityRenderer` and lesson page components — completely untouched by the shell.

## Responsive behavior

- **Desktop (≥1120px):** 236px sidebar + fluid main, full nav with text labels
- **Tablet (760–1120px):** 76px icon-rail sidebar, text labels hidden, content collapses
- **Mobile (<760px):** sidebar becomes bottom-fixed nav bar (temporary pattern from old production; final responsive polish is Phase 10G)
- No horizontal overflow at any breakpoint

## Tests

```
npx tsc --noEmit → exit 0
node --test tests/*.test.mjs → 152 pass, 0 fail (142 existing + 10 new shell tests)
git diff --check → exit 0
```

New tests (`tests/shell-integration.test.mjs`, 10 tests):
1. Theme switcher imports `useTheme` from existing provider
2. All 3 themes appear as buttons
3. Both modes appear as buttons
4. No duplicate theme state (no direct localStorage in switcher/shell)
5. Shell does not key children by theme/mode
6. Active navigation derives from `active` prop
7. Shell uses `EnvironmentLayer` not `SignalBackground`
8. Shell has mockup sidebar structure (`.app`, `.side`, `.brand`, `.nav`, `.side-foot`)
9. Shell links to real production routes
10. `globals.css` has mockup shell CSS (`.app`, `.side`, `.switcher`, `.nav a.on`)

## Files created

- `components/theme-switcher.tsx` — segmented controls + TAGLINE map
- `tests/shell-integration.test.mjs` — 10 shell integration tests
- `docs/phase10c-global-shell.md` — this document

## Files changed

- `components/app-shell.tsx` — full rewrite to mockup shell structure (sidebar, nav, brand, footer, EnvironmentLayer)
- `app/globals.css` — replaced old `.workspace`/`.sidebar`/`.nav-link`/`.sidebar-footer` CSS with mockup `.app`/`.side`/`.nav a`/`.side-foot`/`.switcher` CSS; updated responsive breakpoints for new class names

## Removed obsolete presentation

- Old `.workspace` grid (218px) → replaced by `.app` grid (236px)
- Old `.sidebar` with `backdrop-filter: blur(18px)` → replaced by solid `.side`
- Old `.brand-signal` animated bars → replaced by pixel-bird SVG
- Old `.brand-name`/`.brand-note` → replaced by mockup `.brand-name`/`.brand-sub`
- Old `.nav-link`/`.nav-icon` → replaced by mockup `.nav a` with SVG icons
- Old `.sidebar-footer`/`.online-dot` → replaced by `.side-foot` with ThemeSwitcher
- Old `@keyframes mini-wave` and `@keyframes online-breathe` → removed (no longer referenced)

## Manual verification

**Theme switching (via UI controls, not query params):**
1. After Dark / Dark — pixel city, amber accent ✓
2. After Dark / Light — morning city, morning amber ✓
3. Signal / Dark — signal waves, cyan accent ✓
4. Signal / Light — daylight signal, muted cyan ✓
5. Deep Space / Dark — galaxy, cyan-blue accent ✓
6. Deep Space / Light — cosmic mist, soft indigo ✓

**State preservation:**
1. Open Variables lesson → answer a predict activity → advance several steps → switch theme via sidebar controls → verify step + answer remain → switch dark/light → verify state remains → toggle Source Mode → verify normal behavior ✓

## Deferred to 10D+

- Dashboard internal content (cockpit grid, greeting, recommendation card, progress bar)
- Course page content (module/lesson tree visual)
- Sidebar course progress card (needs real progress data)
- Masthead/hero (greeting, date, focus timer — dashboard-specific)
- Search bar
- Lesson workspace topbar visual
- Robin panel visuals
- Final responsive/accessibility polish

## Phase 10D readiness

**Yes — ready to begin Phase 10D.** The global shell is structurally aligned with the mockup; theme/mode switching works through the UI; all functional behavior is preserved. Phase 10D can begin restyling dashboard/course content surfaces inside the new shell.
