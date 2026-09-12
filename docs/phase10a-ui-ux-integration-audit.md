# Phase 10A — UI/UX Integration Audit

## 1. Production UI inventory

| Component/file | Responsibility | Key state/props | Logic that MUST be preserved | Safe-to-redesign areas |
|---|---|---|---|---|
| `app/layout.tsx` | Root layout, `<html lang>` | — | `lang` attribute | Wrap with theme provider |
| `app/page.tsx` | Dashboard | — | None (static) | Full visual redesign |
| `app/globals.css` | All styles (225 lines, 129 classes) | CSS custom properties (12 tokens: `--void`, `--cyan`, etc.) | Signal background animation, focus states, scrollbar | Token system, color values, all class styling |
| `components/app-shell.tsx` | Sidebar + main wrapper | `active`, `signalMode`, `signalPulse` | Signal background mode, nav active state | Sidebar visual, layout grid |
| `components/signal-background.tsx` | Animated SVG background | `intensity`, `pulse` | Signal animation states | Replace with theme engine |
| `components/progress-bar.tsx` | Course progress bar | `progress` | None | Full visual redesign |
| `components/courses-client.tsx` | Course list/grid | courses data | Course links | Card visual |
| `components/programming-course-client.tsx` | Module/lesson list | `lesson.slug === "variables" \|\| "data-types"` slug check | Clickable lesson links | List visual |
| `components/variables-lesson.tsx` | Variables lesson page | `sourceMode`, `language`, `lesson`, state | Language persistence, lesson load, Source Mode toggle, passes `copy`/`reinforcement`/`masteryConceptLabels` to renderer | Layout, breadcrumbs, topbar |
| `components/data-types-lesson.tsx` | Data Types lesson page | Same as Variables (lesson-specific) | Same | Same |
| `components/lesson-activity-renderer.tsx` | Step navigation + answer forms | `step`, `answers`, `complete`, `copied`; props: `activities`, `lessonSlug`, `language`, `copy`, `masteryConceptLabels`, `sourceMode`, `robinCheck`, `robinCheckComplete`, `children` | `canContinue` gate, `attemptId` generation, `checkAnswer` call, SmartFeedback mounting | Step meta, nav buttons, activity content layout |
| `components/smart-feedback.tsx` | AI feedback panel | `result`, `loading`, `lastFetch`; props: `activityId`, `lessonSlug`, `language`, `copy`, `sourceMode`, `submitted`, `learnerAnswer`, `attemptId` | Effect deps `[submitted, sourceMode, attemptId]`, `useEffectEvent`, `startFeedbackRequest` lifecycle | Feedback box visual |
| `components/robin-check.tsx` | Explain-back UI | `answer`, `retryAnswer`, `result`, `retryResult`, `busy`, `error`, `skipped`; props: `lessonSlug`, `language`, `copy`, `sourceMode`, `onCompleteChange`, `reinforcement` | Abort-aware fetch, retry, skip, `onCompleteChange` | Check box visual, textarea |
| `components/mastery-summary.tsx` | Concept mastery panel | `entries`; props: `lessonSlug`, `language`, `copy`, `conceptLabels` | Fetch on mount, refresh button | Mastery box visual |
| `components/robin-companion.tsx` | Robin chat panel | `messages`, `draft`, `state`, `error`, `memoryNotice`; props: `lessonSlug`, `sourceMode`, `onStateChange` | 8-message history, `AbortController`, grounding badge, memory notice, Enter-to-send, Source Mode returns null | Chat panel visual, message bubbles |
| `components/robin-memory.tsx` | ROBIN LAB memory panel | `memories`, `busy`, `error`, `notice` | CRUD via API, window.confirm, refresh | Panel visual |
| `components/backend-test.tsx` | ROBIN LAB DB test | `aiConfigured` | Fetch test | Panel visual |

**Current design system:** 12 CSS custom properties in `:root` (`--void`, `--black`, `--surface`, `--surface-up`, `--line`, `--line-bright`, `--text`, `--soft`, `--muted`, `--cyan`, `--cyan-soft`, `--violet`, `--success`, `--danger`). Font: Inter (no Fraunces, no JetBrains Mono). No theme switching. No light mode. Single animated SVG signal background (`signal-background.tsx`). No `prefers-reduced-motion` handling. Single breakpoint at 600px.

## 2. Mockup inventory

**Location:** `C:\Users\user\OneDrive\Documents\Default Project\design-mockup\` (original After Dark mockup) + `design-explorations\` (three theme explorations + unified prototype).

**Structure:** Three themes × two modes = six approved visual states. The unified prototype (`design-explorations\unified-theme-prototype\`) ports all six into one runtime with:
- `index.html` — markup (399 lines)
- `styles/base.css` — shared structure (302 lines, token-agnostic)
- `styles/themes.css` — all design tokens (182 lines, ~45 tokens per combination × 6 combinations + 3 editor palettes)
- `styles/environments.css` — canvas + veil plumbing (23 lines)
- `scripts/theme-controller.js` — state, persistence, three canvas engines, ambient layer (822 lines)

### Themes
| Theme | Dark name | Light name | Accent | Environment |
|---|---|---|---|---|
| After Dark | After Dark | Morning City | Warm amber `#E9AC58` | Pixel city skyline |
| Signal | Signal | Day Signal | Cyan `#79C7E2` | Transmission lines + nodes |
| Deep Space | Deep Space | Cosmic Mist | Cyan-blue `#93C6E4` | Nebulae + stars + planet |

### Design tokens (per combination, ~45 each)
Surfaces: `--bg`, `--bg-image`, `--side`, `--panel`, `--inset`, `--line`, `--linesoft`, `--text`, `--mut`, `--dim`, `--bright`. Accents: `--blue`, `--bar`, `--accent`, `--accent-text`, `--ok`, `--ok-opt`, `--ok-fb`, `--streak`. Nav: `--nav-rgb`, `--nav-hov`, `--nav-on`, `--chip-bg`, `--kbd-bg`, `--course-bg`, `--track`, `--track-dim`, `--cbar`, `--avatar-bg`, `--avatar-ink`. Hero: `--hero-h1`, `--hero-shadow`, `--hero-hl`, `--lesson-title`. Buttons: `--btn-ink`, `--btn-hover`, `--btn-shadow`, `--ghost-bd`, `--ghost-bd-h`. States: `--now-bg`, `--now-glow`, `--hover-bg`. Editor (always dark): `--editor-bg` through `--tok-plain` (15 tokens). Misc: `--code-bg`, `--code-ink`, `--bubble`, `--ava-bg`, `--ava-dim`, `--key-bd`, `--input-bg`, `--input-focus`, `--thumb`, `--sel`, `--sel-ink`, `--shadow`, `--veil-rgb`, `--veil-end`, `--bird-body/wing/breast/beak/eye`.

### Typography
- Fraunces (editorial serif): headings, brand, lesson titles
- Inter (UI sans-serif): body, labels, buttons
- JetBrains Mono (monospace): code, meta labels, eyebrows

### Layout
- `.app` grid: `236px minmax(0,1fr)`, min-height 100vh
- `.side` (sidebar): sticky, 100vh, solid opaque, no environmental artwork
- `.mast`/`.mast-inner` (hero band): max-width 1180px, padding 0 32px
- `.content`: max-width 1180px, padding 0 32px 44px
- `.grid`: `minmax(0,1fr) 352px`, gap 22px; side-col has padding-top 30px (deliberate vertical offset)

### Environment layer model (back → front)
1. Env canvas (z0, `pointer-events:none`) — theme-specific procedural art
2. Scroll veil (z0, fixed bottom gradient, smoothstep opacity) — readability protection
3. `.app` (z1) — the interface
4. `.content` (z3)

### Theme/mode switching
- `data-theme` ∈ {after-dark, signal, deep-space}; `data-mode` ∈ {dark, light}
- Independent dimensions: switching one preserves the other
- Pre-paint inline script in `<head>` (no FOUC)
- Persistence: `localStorage["robin-theme"]`/`["robin-mode"]`
- `?theme=&mode=` query override (test aid)
- Global 0.45s CSS transition on color/bg/border/fill/shadow (crossfade)
- 0.6s canvas opacity crossfade between two double-buffered canvases

### Motion
- After Dark: 650ms stepped ticks (cloud drift, window toggle, star twinkle, beacon blink)
- Signal: continuous rAF (wave curves, node activation every 7s, carrier pulse 26s loop)
- Deep Space: continuous (nebula breathing, star drift, twinkle cycles)
- `prefers-reduced-motion`: static render, scroll parallax retained

### Responsive
- `@media (max-width:1240px)`: hide topbar search
- `@media (max-width:1120px)`: grid stacks to one column, side-col padding-top reset
- No mobile variant yet (desktop-first)

### Semantic colors (locked across all themes)
- Correct/mastered: `--ok` (green family, theme-adjusted)
- In-progress/now: `--accent` (theme-specific)
- Locked/disabled: dim text
- Streak: warm ember (After Dark/Deep Space) or accent (Signal)

## 3. Component mapping

| Mockup element | Production equivalent | Integration approach | Risk |
|---|---|---|---|
| Theme switcher (segmented control) | None (no theme system) | NEW PRESENTATIONAL COMPONENT — theme state + toggle UI | Low (additive, no existing logic) |
| Mode switcher (dark/light) | None | NEW PRESENTATIONAL COMPONENT — mode state + toggle UI | Low |
| `.side` (sidebar with brand, nav, course card, profile) | `AppShell` | REPLACE VISUAL ONLY — keep nav active state, add course card | Medium — AppShell is simple, safe to restyle |
| `.mast` (hero band with greeting, date, focus timer) | None (dashboard is static) | NEW PRESENTATIONAL COMPONENT — ambient greeting/clock (JS) | Low |
| `.content` grid (main + side-col) | Lesson page layout (`lesson-grid`) | WRAP — keep lesson content, wrap in new grid | Medium — grid is lesson-specific |
| `.continue` panel (current lesson card with progress) | None in lesson page (course page has progress) | NEW PRESENTATIONAL COMPONENT on dashboard | Low |
| `.path` (module/lesson navigation tree) | `programming-course-client.tsx` | REPLACE VISUAL ONLY — keep lesson links | Low |
| `.pred` (knowledge check: editor + options + feedback) | `lesson-activity-renderer.tsx` (predict/practice steps) | REPLACE VISUAL ONLY — keep answer state, grading, SmartFeedback | HIGH — most complex component |
| `.mastery` (concept mastery list) | `mastery-summary.tsx` | REPLACE VISUAL ONLY — keep fetch, entries state | Low |
| `.assist` (Robin chat panel) | `robin-companion.tsx` | REPLACE VISUAL ONLY — keep message history, fetch, grounding | Medium |
| `.editor` (code block with syntax tokens) | `<pre><code>` in renderer + content | REPLACE VISUAL ONLY — add syntax token classes | Low |
| Environment canvas (pixel city / signal / galaxy) | `signal-background.tsx` (SVG) | REPLACE — new canvas-based theme engine replaces SVG | Medium — different technology |
| Scroll veil | None | NEW PRESENTATIONAL COMPONENT — fixed gradient layer | Low |
| `.switcher` (segmented control primitive) | None | NEW PRESENTATIONAL COMPONENT | Low |
| `.panel` (generic card) | Various `.lesson-box`, `.lab-panel` | REPLACE VISUAL ONLY — unify under `.panel` token | Low |
| Robin Check UI | `robin-check.tsx` | REPLACE VISUAL ONLY — keep all logic | Medium |
| Smart Feedback UI | `smart-feedback.tsx` | REPLACE VISUAL ONLY — keep all logic | Medium |
| Language toggle (ID/EN) | Lesson page topbar | WRAP — keep in topbar, restyle | Low |
| Source Mode toggle | Lesson page topbar | WRAP — keep in topbar, restyle | Low |

## 4. Functional preservation map

| Feature | Source of truth | Can mockup UI safely consume it? | What must NOT be duplicated |
|---|---|---|---|
| Lesson slug | Lesson page component state (`"variables"` / `"data-types"`) | Yes — pass as prop | Do not hardcode in the shell |
| Activity index | `LessonActivityRenderer.step` (useState) | Yes — the renderer stays | Do not create a second step state in the shell |
| Answer state | `LessonActivityRenderer.answers` (useState, keyed by activity ID) | Yes — renderer owns it | Do not duplicate answer state |
| Attempt ID | `LessonActivityRenderer.updateAnswer` → `crypto.randomUUID()` | Yes — renderer owns it | Do not generate attempt IDs elsewhere |
| Deterministic grading | `activity.checkAnswer` / `answer === correctAnswer` (renderer) + `gradeActivity` (server) | Yes — both stay | Do not add client-side AI grading |
| Smart Feedback lifecycle | `SmartFeedback` component + `startFeedbackRequest` helper + `/api/robin/feedback` route | Yes — all stay | Do not create a second feedback request path |
| Robin Check lifecycle | `RobinCheck` component + `/api/robin/check` route | Yes — all stay | Do not merge with Smart Feedback |
| Mastery fetch/render | `MasterySummary` component + `/api/learning/mastery` route | Yes — stays | Do not add a second mastery fetch |
| Source Mode | Lesson page `sourceMode` state + component guards | Yes — stays | Do not add a second Source Mode state |
| Language | Lesson page `language` state + `localStorage` | Yes — stays | Do not create a second language state in the shell |
| Adaptation | Server-side `/api/robin/feedback` + `/api/robin/check` + `/api/robin/chat` routes | Yes — invisible to UI | Do not add client-side adaptation |
| Lesson content | TypeScript content modules + Supabase metadata | Yes — loader stays | Do not duplicate content in the shell |
| Lesson-owned concept labels | Lesson config files (`variables-lesson-config.ts`, `data-types-lesson-config.ts`) | Yes — passed as props | Do not hardcode labels in shared components |
| Retry behavior | `LessonActivityRenderer.updateAnswer` new `attemptId` on resubmit | Yes — renderer owns it | Do not add retry logic in the shell |

**Critical rule:** The redesign must consume existing state. Do NOT introduce a second copy of lesson/activity state just to match the mockup. The mockup's placeholder content (Maya, "Python Foundations", etc.) is illustrative — production uses real learner data.

## 5. Design system extraction

### Color tokens
The mockup defines ~45 CSS custom properties per theme×mode combination. The three light modes share most non-accent values; the three dark modes share structure but differ in base tone.

Key token groups:
- **Surfaces:** `--bg`, `--side`, `--panel`, `--inset`, `--line`, `--linesoft`
- **Text:** `--text`, `--mut`, `--dim`, `--bright`
- **Accents:** `--accent` (theme-specific), `--accent-text`, `--blue`, `--bar`
- **Semantic:** `--ok`, `--ok-opt`, `--ok-fb`, `--streak`
- **Interactive:** `--nav-rgb` (RGB triplet for rgba), `--nav-hov`, `--nav-on`, `--hover-bg`, `--now-bg`, `--now-glow`
- **Hero:** `--hero-h1`, `--hero-shadow`, `--hero-hl`
- **Buttons:** `--btn-ink`, `--btn-hover`, `--btn-shadow`, `--ghost-bd`, `--ghost-bd-h`
- **Editor (always dark):** `--editor-bg` through `--tok-plain` (15 tokens)
- **Bird brand:** `--bird-body/wing/breast/beak/eye`

### Typography
- `--serif: "Fraunces", Georgia, serif` — headings, brand
- `--sans: "Inter", system-ui, sans-serif` — body, UI
- `--mono: "JetBrains Mono", monospace` — code, meta labels

### Spacing
- Sidebar width: 236px
- Content max-width: 1180px
- Grid gap: 22px
- Side-col vertical offset: 30px
- Panel border-radius: 12px
- General padding: 32px (content), 16px (sidebar)

### Effects
- Global crossfade transition: 0.45s ease on color/bg/border/fill/shadow
- Canvas opacity crossfade: 0.6s ease
- Scroll veil: fixed bottom gradient, smoothstep opacity 0→~0.9
- Panel shadow: `0 1px 0 rgba(...) + 0 18px 40px -18px rgba(...)` (dark); lighter in light
- Stepped clip-path notch (`.cut`) on continue panel

### Recommendation
Adopt the mockup's token architecture: `data-theme` + `data-mode` on `<html>`, CSS custom properties per combination. Replace production's 12-token `:root` with the mockup's ~45-token system. Load fonts (Fraunces, Inter, JetBrains Mono) via `next/font` for SSR-safe font loading.

## 6. Theme/mode model

The mockup cleanly separates two independent dimensions:
- **Theme** (`data-theme`): after-dark | signal | deep-space — determines the environment engine and accent hue
- **Mode** (`data-mode`): dark | light — determines light/dark surface palette

Switching theme preserves mode; switching mode preserves theme. Both persist to `localStorage`. Pre-paint inline script prevents FOUC.

**Recommendation:** Adopt this model directly. Add `data-theme` and `data-mode` to `<html>` in `app/layout.tsx`. Add a pre-paint script (inline in `<head>`) that reads localStorage before React hydrates. Theme/mode changes are CSS-only (no remount) — lesson state survives because React state is untouched.

## 7. Lesson experience mapping

| Mockup section | Production component | Integration |
|---|---|---|
| `.continue` (current lesson card with progress) | Dashboard — not in lesson page | NEW on dashboard |
| `.path` (module → lesson tree) | Course page (`programming-course-client.tsx`) | REPLACE VISUAL ONLY |
| `.pred` (code editor + question + options + feedback) | `LessonActivityRenderer` predict step | REPLACE VISUAL ONLY — keep `answer`, `canContinue`, `SmartFeedback` |
| `.editor` (code block with line numbers + syntax tokens) | `<pre><code>` in renderer/content | REPLACE VISUAL ONLY — add token classes |
| `.opts` (answer option buttons with correct/incorrect states) | `answer-options` buttons in renderer | REPLACE VISUAL ONLY — keep selected/correct/incorrect classes |
| `.feedback` (deterministic explanation) | `answer-note` in renderer | REPLACE VISUAL ONLY |
| Robin Check panel | `RobinCheck` component (inside renderer's hidden div) | REPLACE VISUAL ONLY — keep all logic |
| Smart Feedback panel | `SmartFeedback` component (inside renderer) | REPLACE VISUAL ONLY — keep all logic |
| `.mastery` (concept list with states) | `MasterySummary` (at CONNECT step) | REPLACE VISUAL ONLY |
| Previous/Next nav | `learning-flow-nav` in renderer | REPLACE VISUAL ONLY — keep `step`, `canContinue` |
| Step meta ("Step 1 of 9") | `learning-flow-meta` in renderer | REPLACE VISUAL ONLY — uses `activities.length` |
| Source Mode toggle | Lesson page topbar | WRAP — keep state, restyle |
| Language toggle | Lesson page topbar | WRAP — keep state, restyle |

**Critical:** The redesigned UI MUST support arbitrary step counts. The renderer already uses `activities.length` — the mockup's fixed 4-step layout is illustrative only.

## 8. Robin UI mapping

The mockup shows a single `.assist` panel (Robin chat). Production has three distinct Robin features:

| Feature | Production component | Mockup equivalent | Integration |
|---|---|---|---|
| Robin Chat | `RobinCompanion` | `.assist` chat panel | REPLACE VISUAL ONLY — keep message history, fetch, grounding, memory notice, Source Mode guard |
| Smart Feedback | `SmartFeedback` | `.feedback` inside `.pred` | REPLACE VISUAL ONLY — keep effect lifecycle, attemptId dedup |
| Robin Check | `RobinCheck` | Not explicitly in mockup (would be a step type) | REPLACE VISUAL ONLY — keep submit/retry/skip, onCompleteChange |

**Recommendation:** Make them share a visual language (same `.bubble`/`.panel` tokens, same avatar treatment) but keep their functional lifecycle completely separate. The mockup's assistant panel is a visual reference for all three — do not merge their state machines.

## 9. Responsive findings

| Aspect | Mockup | Production | Gap |
|---|---|---|---|
| Desktop layout | 236px sidebar + flexible main, 1180px max-width | No max-width, fluid | Need max-width |
| Below 1240px | Hide topbar search | No search exists | N/A (no search yet) |
| Below 1120px | Grid stacks to 1 column, side-col padding resets | Single 600px breakpoint | Need 1120px breakpoint |
| Mobile | Not designed | Minimal | Needs design |
| Nav collapse | Not designed | None | Needs design |
| Robin placement | Side-col (right) | Side panel (right) | Compatible |
| Touch targets | Not specified | Standard buttons | Verify min 44px |

## 10. Accessibility findings

| Risk | Severity | Detail |
|---|---|---|
| Low contrast in light modes | Medium | Muted text `#5B6B86` on `#FCFDFE` — verify WCAG AA (4.5:1) |
| Neon/cyan text on dark | Medium | Signal/Deep Space accents on dark bg — verify contrast |
| Very small meta labels | Low | JetBrains Mono 9.5–11.5px with letter-spacing — verify readability |
| Hover-only controls | Low | Mockup uses buttons, not hover-only — good |
| Focus states | Low | Mockup has `:focus-visible` with `--blue` outline — good |
| Keyboard navigation | Low | Mockup uses semantic buttons with `aria-pressed` on switchers — good |
| `prefers-reduced-motion` | Medium | Mockup handles it (static render + scroll parallax) — must port |
| Form labels | Low | Mockup uses `<label>` for inputs — good |
| Animations impacting readability | Low | Scroll veil is subtle; canvas art is behind content — good |

## 11. Risk register

| Risk | Severity | Why | Mitigation |
|---|---|---|---|
| Losing lesson state during theme changes | HIGH | Theme switch could remount React tree if implemented wrong | CSS-only theme switching (`data-theme` on `<html>`, no React state change) |
| Duplicating activity state | HIGH | Mockup shows placeholder lesson content — tempting to copy | Use production `LessonActivityRenderer` as-is, only restyle |
| Breaking Source Mode | HIGH | Source Mode guards are in components — visual changes could break them | Keep all `sourceMode` checks; only change what renders around them |
| Smart Feedback stale attempts | MEDIUM | `attemptId` dedup is in the effect lifecycle | Don't change `useEffect` deps or `startFeedbackRequest` lifecycle |
| Robin Check state reset | MEDIUM | `onCompleteChange` callback drives lesson progression | Keep `RobinCheck` component contract unchanged |
| Language state mismatch | MEDIUM | `localStorage` key shared with lesson page | Don't create a second language state in the shell |
| Theme hydration mismatch | MEDIUM | Pre-paint script sets `data-theme` before React | Use `suppressHydrationWarning` on `<html>` or inline script |
| Mobile overflow | MEDIUM | Mockup is desktop-first; no mobile design | Add mobile breakpoints; test on small screens |
| Animations impacting performance | LOW | Canvas engines are procedural and optimized | Port engines; profile on low-end devices; respect `prefers-reduced-motion` |
| Redesign coupling shared UI to one lesson | LOW | Phase 9D removed all lesson-specific imports from shared components | Keep the prop-based contract; don't re-introduce lesson imports |

## 12. Migration plan

### Phase 10B — Design System Foundation
- Install fonts (Fraunces, Inter, JetBrains Mono) via `next/font`
- Replace `:root` CSS tokens with the mockup's token system (`data-theme` × `data-mode`)
- Create `styles/themes.css` with all six combination blocks
- Add pre-paint theme resolution script in `app/layout.tsx`
- Add `ThemeProvider` client component (theme/mode state + switcher UI)
- Create the environment canvas engine system (port `theme-controller.js`)
- Create the scroll veil component
- **Testable:** themes switch without remounting; fonts load; tokens resolve

### Phase 10C — Global Shell + Navigation
- Redesign `AppShell` with mockup sidebar layout (brand mark, nav, course card, profile)
- Add ambient masthead (greeting, date, focus timer) — optional, dashboard-only
- Add theme/mode switcher to topbar
- Keep `signalMode`/`signalPulse` props working (or replace with theme-aware equivalent)
- **Testable:** sidebar renders; nav works; theme switcher works; lesson links work

### Phase 10D — Dashboard / Course Surfaces
- Redesign dashboard with `.continue` panel, `.path` tree, course cards
- Redesign course page with module/lesson tree
- Keep `programming-course-client.tsx` slug check logic
- **Testable:** dashboard loads; course page lists lessons; lesson links navigate

### Phase 10E — Lesson Workspace
- Redesign lesson page topbar (breadcrumbs, language toggle, Source Mode)
- Redesign `LessonActivityRenderer` visual layer (panels, code blocks, answer options, nav)
- Keep all functional logic: `step`, `answers`, `canContinue`, `attemptId`, `checkAnswer`
- Redesign `MasterySummary` visual
- **Testable:** lesson loads; activities grade; feedback appears; mastery shows; Source Mode works

### Phase 10F — Robin Experience
- Redesign `RobinCompanion` chat panel visual
- Redesign `SmartFeedback` panel visual
- Redesign `RobinCheck` panel visual
- Keep all functional logic: fetch, abort, retry, skip, onCompleteChange
- **Testable:** chat works; Smart Feedback works for correct + incorrect; Robin Check works; Source Mode suppresses all

### Phase 10G — Responsive + Polish
- Add mobile breakpoints (nav collapse, grid stack, touch targets)
- Add `prefers-reduced-motion` handling
- Verify accessibility (contrast, keyboard, focus states)
- Verify all themes × modes render correctly on all pages
- Clean up deprecated CSS
- **Testable:** mobile usable; reduced motion works; all 6 visual states verified

## 13. Non-goals

- Do NOT replace working functional components with mockup placeholder logic
- Do NOT copy mockup HTML wholesale into production
- Do NOT change lesson content, mastery, adaptation, AI routes, database logic, or lesson architecture
- Do NOT merge Robin Chat / Smart Feedback / Robin Check into one state machine
- Do NOT hardcode step counts
- Do NOT introduce a second copy of any state
- Do NOT add curriculum/semester/course architecture
- Do NOT add authentication or multi-user features

## 14. Go/no-go recommendation

**Yes — ready to begin Phase 10B.**

The architecture is stable: shared components accept props with no lesson imports (Phase 9D); the registry contract is tested; mastery/adaptation/AI are lesson-scoped; 128 tests pass. The mockup provides a complete token system, three environment engines, and a clear theme/mode model. The migration plan is incremental — each phase is independently testable. The highest risk (losing lesson state during theme changes) has a clear mitigation (CSS-only switching, no React remount).
