import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// Phase 16: UX polish & responsive experience — structural regression tests.
// These assert that the responsive scaffolding exists (nav spans, media
// queries, touch-target rules, honest progress) without pixel testing.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// === 1. Sidebar labels are wrapped so the tablet icon rail works ===
test("nav labels are wrapped in spans for the tablet icon rail", () => {
  const shell = read("components/app-shell.tsx");
  // Every nav label needs a span: the ≤1120px rail hides .nav a span.
  for (const label of ["Dashboard", "Courses", "Practice", "Current lesson"]) {
    assert.match(shell, new RegExp(`<span>${label}</span>`), `${label} must be span-wrapped`);
  }
  // Active state is also exposed to assistive tech.
  assert.match(shell, /aria-current=\{active === "dashboard" \? "page" : undefined\}/);
});

// === 2. The tablet rail and bottom-nav rules exist ===
test("responsive shell rules collapse the rail and reflow the bottom nav", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.brand > div, \.nav a span, \.side-foot \{ display: none; \}/);
  assert.match(css, /\.nav a span \{ display: block; \}/);
  // Bottom nav fits 320px viewports.
  assert.match(css, /\.nav a \{ min-width: 64px;/);
});

// === 3. Page containers are not double-inset on small screens ===
test("main content is not double-padded at small viewports", () => {
  const css = read("app/globals.css");
  // .main keeps only vertical padding in its media queries; the horizontal
  // gutters live on .content/.mast-inner once.
  assert.doesNotMatch(css, /\.main \{ padding: 22px 24px 66px; \}/);
  assert.doesNotMatch(css, /\.main \{ padding: 22px 18px 96px; \}/);
  assert.match(css, /\.main \{ padding: 0 0 66px; \}/);
  assert.match(css, /\.main \{ padding: 0 0 96px; \}/);
  // Phone gutters applied to the single owning containers.
  assert.match(css, /\.mast-inner, \.content \{ padding-inline: 18px; \}/);
});

// === 4. The topbar degrades safely on phones ===
test("topbar wraps, breadcrumb truncates, and switchers grid on phones", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.topbar \{[^}]*flex-wrap: wrap/);
  assert.match(css, /\.crumb \{[^}]*text-overflow: ellipsis/);
  assert.match(css, /\.top-right \{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; \}/);
  assert.match(css, /\.top-right \.switcher button \{ flex: 1 1 0; justify-content: center; \}/);
});

// === 5. Course cards keep their progress bar on phones ===
test("course rows restructure instead of squeezing progress into 18px", () => {
  const css = read("app/globals.css");
  assert.doesNotMatch(css, /\.course-row \{ grid-template-columns:  38px 1fr 18px/);
  assert.match(css, /\.course-row \{ grid-template-columns: 38px minmax\(0, 1fr\); gap: 10px 12px/);
  assert.match(css, /\.course-row \.course-progress \{ grid-column: 2; justify-content: flex-start; \}/);
  assert.match(css, /\.course-row \.row-arrow \{ display: none; \}/);
});

// === 6. The segmented progress bar has base styles ===
test("pxbar segments actually render (base display rule exists)", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.pxbar \{ display: flex; gap: 2px;/);
  assert.match(css, /\.pxbar i \{[^}]*height: 6px;/);
  assert.match(css, /\.pxbar i\.f \{/);
  // Course pages use it behind their hero progress.
  const client = read("components/generic-course-client.tsx");
  assert.match(client, /className="pxbar"/);
});

// === 7. Touch targets are raised on coarse pointers only ===
test("coarse-pointer rules raise small controls without touching desktop", () => {
  const css = read("app/globals.css");
  assert.match(css, /@media \(pointer: coarse\) \{/);
  assert.match(css, /\.switcher button \{ min-height: 36px;/);
  assert.match(css, /\.answer-options button \{ min-height: 44px; \}/);
  assert.match(css, /\.a-send \{ width: 44px; height: 44px; \}/);
  assert.match(css, /\.code-head button \{ min-height: 36px; min-width: 44px;/);
  assert.match(css, /\.thinking-order button \{ width: 40px; height: 40px; \}/);
});

// === 8. Continue panel stacks on phones ===
test("the continue panel stacks actions below content on phones", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.continue-in \{ grid-template-columns: minmax\(0, 1fr\); gap: 16px;/);
  assert.match(css, /\.continue-actions \.btn-p, \.continue-actions \.btn-g \{ flex: 1 1 0; \}/);
});

// === 9. Dashboard progress is honest and data-driven ===
test("dashboard path and mastery panels derive from real progress", () => {
  const dash = read("app/page.tsx");
  // Progress fetch for the implemented lessons (same pattern as course pages).
  assert.match(dash, /implementedProgrammingLessonSlugs\.map\(\(slug\) =>/);
  assert.match(dash, /\/api\/learning\/progress\?lesson=/);
  assert.match(dash, /stateFor\(slug\)/);
  // No fabricated module rows or percentages remain.
  assert.doesNotMatch(dash, /mtag master">mastered/);
  assert.doesNotMatch(dash, /2 of 11 lessons/);
  assert.doesNotMatch(dash, /mcount">4\/4/);
  assert.doesNotMatch(dash, /11 lessons · 3 modules/);
  // Counts derive from the implemented list.
  assert.match(dash, /completedImplemented of \{implementedTotal\}|completedImplemented\} of \{implementedTotal\}/);
});

// === 10. Empty sources get a quiet note instead of a blank list ===
test("lesson source lists render an honest empty note", () => {
  for (const file of ["components/lesson-client.tsx", "components/propositions-lesson.tsx"]) {
    const source = read(file);
    assert.match(source, /lesson\.sources\.length === 0 \?/, `${file} handles empty sources`);
    assert.match(source, /Belum ada sumber yang ditautkan/);
  }
});

// === 11. Reduced motion remains respected ===
test("prefers-reduced-motion keeps suppressing animations", () => {
  const css = read("app/globals.css");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

// === 12. Reading widths stay intentional on large screens ===
test("lesson and practice articles keep a comfortable max reading width", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.lesson-grid > article \{ max-width: 720px; \}/);
  assert.match(css, /\.practice-grid > article \{ max-width: 720px; \}/);
  assert.match(css, /\.content \{[^}]*max-width: 1180px/);
  assert.match(css, /\.mast-inner \{[^}]*max-width: 1180px/);
});
