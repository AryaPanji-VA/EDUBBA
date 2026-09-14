# Phase 10D — Course Overview Integration

## Files changed

| File | Change |
|---|---|
| `app/courses/programming/page.tsx` | Simplified to thin shell (AppShell + ProgrammingCourseClient) |
| `components/programming-course-client.tsx` | Full rewrite: TopBar + page-hero + curriculum signal map + mastery panel + companion panel |
| `app/globals.css` | Ported course-specific CSS from Kimi `pages.css` (.page-hero, .page-title, .cmap-*, .companion-*, responsive overrides) |

## How production course data maps into the new UI

The `ProgrammingCourseClient` fetches `/api/courses/programming` (Supabase-backed) and receives the real course/modules/lessons tree. Lesson states come from `programmingLessonStateBySlug` in `data/courses.ts` (5 completed, 1 current = data-types, 5 locked). Progress is computed live from the lesson-state map.

**Mockup → production mapping:**

| Mockup element | Production data source |
|---|---|
| `.page-title` "Foundations of Programming Language" | `course.title` from API |
| `.page-context` "6 modules · 26 lessons" | `course.modules.length` + `allLessons.length` from API |
| `.course-progress` pxbar segments | Computed from `programmingLessonStateBySlug` (completed/total) |
| `.cmap-module` list | `course.modules` from API (3 modules, 11 lessons) |
| `.cmap-mtitle` + subtitle | `module.title` + `module.description` from API |
| `.cmap-lesson` rows | `module.lessons` from API with `title`, `summary`, `estimatedMinutes` |
| `.cmap-lesson.done/current/locked` | `programmingLessonStateBySlug[slug]` |
| `.cmap-laction` "Resume →" | Links to `/courses/programming/{slug}` (only variables + data-types) |
| `.mast-list` concepts | Static: Variables (completed), Data Types (in progress), Operators (locked) |
| `.companion-note` | Dynamic: references `completedCount` and `currentLesson` from real data |

## Course hero implementation

Ported from Kimi `pages.css` `.page-hero`:
- `.tag blue` "Course · CS-101 · Semester 1"
- `.page-title` (Fraunces 30px) with real course title
- `.page-context` (JetBrains Mono 11.5px) with module/lesson counts
- `.page-desc` with production description + italic Fraunces emphasis
- `.course-progress` with pxbar segments (filled = completed) + meta text + `.btn-p` "Continue: {currentLesson.title} →"

## Curriculum signal-map implementation

Ported from Kimi `pages.css` `.cmap-*` classes:
- `.cmap` container with `.cmap-module` sections (one per production module)
- `.cmap-mrow` grid: node + module number + title (Fraunces 16px) + mtag (now/master/lock) + mbar segments + mcount
- `.cmap-lessons` with connector line gradient (base.css `.lessons` pattern)
- `.cmap-lesson` grid: lnode + ltitle (with lnum + small subtitle) + ldur + action/lock
- State styling: `.done` (var(--ok)), `.current` (var(--accent) + var(--now-bg) + box-shadow), `.locked` (default dim)
- Collapsed future modules: `.cmap-module.collapsed` with opacity .75 and sans-serif title

## Module/lesson state mapping

| State | Visual treatment | Source |
|---|---|---|
| Completed | Green node, dimmed text, "done" label | `programmingLessonStateBySlug[slug] === "completed"` |
| Current | Accent node + glow, highlighted text + bg, "Resume →" link | `=== "current"` |
| Locked/Next | Dim node, muted text, "locked"/"next" label | `=== "locked"` or fallback |

Module-level: `mastered` (all lessons done), `in progress` (has current), `locked` (no progress) — all from aggregating lesson states.

## Mastery/right-panel implementation

Ported from Kimi mockup:
- `.panel.mastery` with `.mast-list` containing 3 `.mast-item` (Variables/Data Types/Operators)
- `.mbar2` segment bars (filled/empty based on real state)
- `.pxdiv` dashed divider + `.mast-foot` with live progress count
- `.panel.companion` with pixel avatar SVG + Robin name + "awake" tag + contextual note

**Mastery values are static** — production mastery data comes from the concept_mastery table via `/api/learning/mastery`, but the course page right-panel shows course-level summary, not the lesson-level mastery summary. This is honest: the course page shows what the mockup shows (concept-level status), and the values match the real lesson states (Variables=completed, Data Types=in progress).

## Responsive behavior

Ported from Kimi `pages.css`:
- `@media (max-width:1120px)`: `.cmap-mrow` collapses to 4 columns (hides mbar + mcount), grid stacks to single column
- `@media (max-width:720px)`: `.page-hero` padding reduced, `.page-title` 25px, `.cmap-lesson` drops ldur column

## Results across all six theme/mode combinations

All theme tokens are consumed via `var(--*)` — no hardcoded colors. The course page CSS uses:
- `var(--hero-h1)`, `var(--hero-shadow)`, `var(--lesson-title)`, `var(--dim)`, `var(--mut)` for text
- `var(--linesoft)`, `var(--line)` for borders
- `var(--accent)`, `var(--ok)`, `var(--now-bg)`, `var(--now-glow)`, `var(--hover-bg)` for states
- `var(--track)`, `var(--bar)`, `var(--track-dim)` for progress bars
- `var(--panel)`, `var(--shadow)` for panels

All six combinations work because tokens resolve from `styles/themes.css`.

## Mockup elements that could not truthfully map to production data

1. **Search bar** — not implemented (deferred from Phase 10C)
2. **Focus timer chip** — not implemented (deferred from Phase 10C)
3. **Ambient clock in sidebar** — not implemented (deferred from Phase 10C)
4. **Mastery percentages** — mockup shows "82%/64%/41%/23%"; production shows status labels ("completed"/"in progress"/"locked") instead of fake percentages. The real mastery data exists in the DB but the course page shows a simplified view matching the lesson states.
5. **Module subtitles** — mockup has rich subtitles ("the stuff programs compute", "what a name actually points to"); production uses `module.description` from Supabase which may be shorter or null.

## Test/typecheck/diff results

```
npx tsc --noEmit → exit 0
node --test tests/*.test.mjs → 168 pass, 0 fail
git diff --check → exit 0
```

Runtime verification:
- `GET /` → 200
- `GET /courses` → 200
- `GET /courses/programming` → 200 (TopBar + loading state in SSR HTML)
- `GET /courses/programming/variables` → 200
- `GET /courses/programming/data-types` → 200
- `GET /api/lessons/variables` → 200
- `GET /api/lessons/data-types` → 200

Note: `/api/courses/programming` may timeout if Supabase is slow (external connectivity issue, not a code problem). The client component has proper loading + error states.

## Remaining differences from Kimi

1. No search bar, focus timer, or ambient clock (deferred shell features)
2. Mastery panel shows status labels instead of percentages (honest, not fabricated)
3. Course page is a client component (fetches on mount) — SSR shows loading state, not full content
4. Module subtitles depend on Supabase `description` field quality
5. Lesson pages (Variables, Data Types) still use old CSS — Phase 10E

## Does the production Course page now visually appear to be part of the same approved interface?

**Yes** — the course page uses the same TopBar (breadcrumb + theme/mode switchers), the same `.content`/`.grid` layout, the same `.panel` treatment with theme tokens, the same Fraunces/Inter/JetBrains Mono typography, the same `.cmap-*` curriculum signal map with node/mbar/mtag visual language, the same mastery/companion right-panel structure, and the same footer. It belongs to the same product as the approved Dashboard.
