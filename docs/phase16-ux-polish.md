# Phase 16 — UX Polish & Responsive Experience

A refinement pass, not a redesign: the visual identity, information
architecture, lesson engine, APIs, and data model are untouched. Every change
below answers a concrete usability problem found in the audit.

## UX audit findings (concrete)

1. **Broken tablet icon rail (768–1120px).** The CSS collapses the sidebar to
   a 76px icon rail by hiding `.nav a span`, but the nav labels were raw text
   nodes — nothing was wrapped in spans. At tablet widths the rail showed
   full labels ("Current lesson") that wrapped across three lines.
2. **Invisible segmented progress bar.** `.pxbar` had no base CSS anywhere —
   only a `.course-progress .pxbar` sizing rule. The `<i>` segments on every
   course page hero rendered as empty inline elements: the bar was invisible.
3. **Double-inset page on small screens.** `.main` gained horizontal padding
   (24px at ≤1120px, 18px at ≤760px) on top of `.content`/`.mast-inner`'s own
   32px → 50–56px gutters per side; 320–430px viewports lost ~100px of width.
4. **Topbar overflow on phones.** `.topbar`/`.crumb` were `white-space:
   nowrap` with up to four switcher groups (theme, mode, language,
   Robin/Source) on lesson pages — guaranteed horizontal overflow at ≤430px.
5. **Course card grid collision at ≤760px.** Four visible children were
   placed into a 3-column grid (38px 1fr 18px): the progress bar landed in
   the 18px column and the arrow wrapped onto a second row.
6. **Cramped continue panel at ≤600px.** `grid-template-columns:
   minmax(0,1fr) auto` with a 190px action column left ~90px for the lesson
   content on 320px phones.
7. **Touch targets too small.** Switcher buttons (~24px), code-copy buttons
   (~20px), thinking-order arrows (30px), sandbox starters (~31px) — all
   below any comfortable touch minimum.
8. **Dashboard showed fake progress.** "Your path" hardcoded stale states
   (Variables current, Operators locked, "mastered 4/4") and the mastery
   panel claimed "2 of 11 lessons · 18%" — contradicting the real 36% shown
   on the course page.

## Changes implemented

- **`components/app-shell.tsx`** — nav labels wrapped in `<span>` (fixes the
  tablet rail), `aria-current="page"` on the active nav link.
- **`app/globals.css`**:
  - Base `.pxbar` / `.pxbar i` / `.pxbar i.f` rules — course hero progress
    bars now actually render.
  - `.main` media padding is now vertical-only (bottom clearance for the
    fixed bottom nav); horizontal gutters live once on
    `.content`/`.mast-inner`, reduced to 18px at ≤600px.
  - `.topbar` wraps; `.crumb` truncates with ellipsis; at ≤600px `.top-right`
    becomes a 2×2 grid with full-width, centered switcher buttons.
  - Course cards at ≤760px: 2-column grid (index + main), honest progress
    bar on its own row (`grid-column: 2`), arrow hidden.
  - `.continue-in` stacks at ≤600px with full-width action buttons.
  - `@media (pointer: coarse)` — switcher buttons 36px, answer options and
    code-copy 44px hit area, send button 44×44, thinking-order arrows 40px,
    sandbox starters 38px, companion action rows 40px. Desktop click
    precision untouched.
  - Bottom nav link min-width 64px so four items fit 320px.
  - `.bin-check` phone padding reduced to 16px.
- **`app/page.tsx` (dashboard)** — the path and mastery panels are now
  derived from persisted progress (the same per-lesson fetch the course
  pages use), with an honest neutral state when progress is unavailable:
  one real module row ("Programming Building Blocks"), the six implemented
  lessons with real done/current/not-started states, and honest counts
  ("N of 6 lessons · X%"). All fabricated "mastered"/"locked"/"4/4" rows and
  the "18%" claim are gone.
- **`components/lesson-client.tsx` + `propositions-lesson.tsx`** — empty
  source lists render a quiet honest note instead of a bare section.

## Responsive behavior summary

| Viewport | Behavior |
| --- | --- |
| 320–430px | Bottom fixed nav (4 items, 64px each), 18px page gutters, truncated breadcrumb, 2×2 switcher grid, stacked course cards with progress on row 2, stacked continue actions, single-column lesson/practice/sandbox grids, coarse-pointer targets active |
| 768–820px | 76px icon sidebar rail (labels hidden — now actually working), single-column main grids, course cards drop stats column |
| 1024px | Icon rail or full sidebar depending on width; two-column grids where they fit |
| 1280–1536px | Full 236px sidebar, 1180px max-width content, lesson article capped at 720px reading width |
| 1920px+ | Same 1180px container + 720px reading column — no edge-to-edge stretching |

## Accessibility

- `aria-current="page"` on active nav links; existing `aria-pressed` switcher
  semantics and visible `:focus-visible` outlines preserved.
- Touch targets raised on coarse pointers (44px for primary actions).
- Breadcrumb truncation uses ellipsis, not overflow.
- Color is never the only signal (existing ✓/× markers, borders, weights).

## Files

- Created: `tests/ux-polish.test.mjs` (12 structural regression tests),
  `docs/phase16-ux-polish.md`.
- Changed: `components/app-shell.tsx`, `app/globals.css`, `app/page.tsx`,
  `components/lesson-client.tsx`, `components/propositions-lesson.tsx`.

## Verification

- **Tests: 431/431 passed** (419 existing + 12 new; no existing test weakened
  or deleted).
- **TypeScript: PASSED** (direct `tsc --noEmit`; pnpm remains
  Device-Guard-blocked on this machine).
- **`git diff --check`: PASSED.**
- **Runtime:** all 16 sampled routes return 200 (dashboard, courses, all 7
  course pages, golden + standard lessons, all Practice modes); key APIs
  healthy; rendered DOM confirms the span-wrapped nav, `aria-current`, and
  honest dashboard states.
- No visual browser/screenshot verification was performed — responsive
  behavior is verified by structural CSS/DOM assertions.

## Safety confirmations

- Existing functionality preserved: lesson engine, deterministic grading,
  Robin, Smart Feedback, mastery, progress, Practice Lab, Sandbox, Thinking,
  localization all untouched.
- **No schema changes, no API changes, no new SQL to apply.**
- No URLs changed; golden routes intact.

## Known limitations / remaining responsive risks

- Visual verification at exact pixel widths was not performed (policy: no
  screenshots); the media-query boundaries are verified structurally.
- The dashboard mini-chat and Robin companion panels rely on wrapping
  flexbox at narrow widths rather than a dedicated phone layout.
- The diagnostics `/dev` lab pages keep their older responsive treatment.
- `touch-action` / gesture conflicts (e.g. horizontal scroll inside code
  blocks vs. page scroll) rely on browser defaults.

## Recommendations for Phase 17

- Real course-progress aggregation (activity-weighted, per module) to replace
  lesson-count percentages.
- Dashboard expansion beyond Programming (course switcher or multi-course
  path summary).
- Visual cross-browser QA session on real devices.
- Consider a lightweight print stylesheet for lesson reading.
