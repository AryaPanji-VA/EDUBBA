import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// === 1. Theme switcher calls existing ThemeProvider ===
test("theme-switcher uses useTheme from the existing provider", () => {
  const source = readFileSync(new URL("../components/theme-switcher.tsx", import.meta.url), "utf8");
  assert.match(source, /from "@\/lib\/theme\/theme-provider"/, "Must import useTheme from the existing provider");
  assert.match(source, /setTheme/, "Must call setTheme");
  assert.match(source, /setMode/, "Must call setMode");
});

// === REGRESSION: no Server Component directly invokes useTheme() ===
test("app-shell does not call useTheme (it renders as a Server Component)", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /useTheme/, "AppShell must not call useTheme — it renders from server components");
  assert.doesNotMatch(source, /"use client"/, "AppShell stays server-compatible; client concerns live in theme-switcher/environment-layer");
});
test("any file that calls useTheme has a use client directive", () => {
  const files = [
    "../components/theme-switcher.tsx",
    "../components/environment-layer.tsx",
    "../lib/theme/theme-provider.tsx",
  ];
  for (const f of files) {
    const source = readFileSync(new URL(f, import.meta.url), "utf8");
    if (/useTheme\(\)/.test(source)) {
      assert.match(source, /^"use client"/m, `${f} calls useTheme and must start with "use client"`);
    }
  }
});

// === REGRESSION: pre-paint uses supported Next.js mechanism ===
test("layout uses next/script beforeInteractive for pre-paint (no raw script tags)", () => {
  const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layoutSource, /from "next\/script"/, "Must import from next/script");
  assert.match(layoutSource, /beforeInteractive/, "Must use beforeInteractive strategy");
  assert.doesNotMatch(layoutSource, /dangerouslySetInnerHTML/, "Must not use dangerouslySetInnerHTML for scripts");
});

// === 2. All 3 themes selectable ===
test("all three themes appear in the switcher", () => {
  const source = readFileSync(new URL("../components/theme-switcher.tsx", import.meta.url), "utf8");
  assert.match(source, /after-dark/i, "After Dark must be a button");
  assert.match(source, /signal/i, "Signal must be a button");
  assert.match(source, /deep-space/i, "Deep Space must be a button");
});

// === 3. Both modes selectable ===
test("both modes appear in the switcher", () => {
  const source = readFileSync(new URL("../components/theme-switcher.tsx", import.meta.url), "utf8");
  assert.match(source, /"dark"/, "Dark must be a button");
  assert.match(source, /"light"/, "Light must be a button");
});

// === 4. No duplicate theme state implementation ===
test("there is only one ThemeProvider, no second state system", () => {
  const shellSource = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  const switcherSource = readFileSync(new URL("../components/theme-switcher.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(shellSource, /localStorage.*theme/i, "Shell must not manage its own theme localStorage");
  assert.doesNotMatch(switcherSource, /localStorage/i, "Switcher must not manage its own localStorage");
  assert.doesNotMatch(switcherSource, /document\.documentElement\.dataset/i, "Switcher must not set data attributes directly");
});

// === 5. Shell does not key/remount children by theme ===
test("app shell does not key children by theme or mode", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /key=\{.*(theme|mode)/, "Must not key children by theme/mode");
});

// === 6. Active navigation derives from props ===
test("app shell derives active nav from the active prop", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.match(source, /active === "dashboard"/, "Must check active === dashboard");
  assert.match(source, /active === "courses"/, "Must check active === courses");
  assert.match(source, /active === "lesson"/, "Must check active === lesson");
});

// === 7. Shell uses EnvironmentLayer (not old SignalBackground) ===
test("app shell uses EnvironmentLayer, not SignalBackground", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.match(source, /EnvironmentLayer/, "Must import and render EnvironmentLayer");
  assert.doesNotMatch(source, /SignalBackground/, "Must not use old SignalBackground");
});

// === 8. Shell has mockup sidebar structure ===
test("app shell has mockup sidebar structure (.app, .side, .brand, .nav, .side-foot)", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.match(source, /className=.*app/, "Must have .app root");
  assert.match(source, /className="side"/, "Must have .side sidebar");
  assert.match(source, /className="brand"/, "Must have .brand");
  assert.match(source, /className="nav"/, "Must have .nav");
  assert.match(source, /className="side-foot"/, "Must have .side-foot");
});

// === 9. Shell uses real production routes ===
test("app shell links to real production routes", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  const currentLink = readFileSync(new URL("../components/current-lesson-link.tsx", import.meta.url), "utf8");
  assert.match(source, /href="\/"/, "Dashboard links to /");
  assert.match(source, /href="\/courses"/, "Courses links to /courses");
  assert.match(source, /CurrentLessonLink/, "Lesson navigation uses persisted current progress");
  assert.match(currentLink, /`\/courses\/\$\{current\.courseSlug\}\/\$\{current\.lessonSlug\}`/, "Lesson link resolves a real persisted course/lesson route");
});

// === 10. Shell CSS has mockup classes ===
test("globals.css has mockup shell CSS (.app, .side, .switcher)", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.app\s*\{/, "Must have .app rule");
  assert.match(css, /\.side\s*\{/, "Must have .side rule");
  assert.match(css, /\.switcher\s*\{/, "Must have .switcher rule");
  assert.match(css, /\.nav a\.on/, "Must have .nav a.on rule");
  assert.doesNotMatch(css, /\.workspace\s*\{/, "Must NOT have old .workspace rule");
  assert.doesNotMatch(css, /\.sidebar\s*\{/, "Must NOT have old .sidebar rule");
});

// === 11. Layout SSR-renders default data-theme/data-mode ===
test("layout server-renders default data-theme and data-mode on <html>", () => {
  const source = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(source, /data-theme=\{DEFAULT_THEME\}/, "Must SSR data-theme with default");
  assert.match(source, /data-mode=\{DEFAULT_MODE\}/, "Must SSR data-mode with default");
});

// === 12. Body is transparent so environment canvas is visible ===
test("body background is transparent (not opaque) so canvas shows through", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /body\s*\{[^}]*background:\s*transparent/, "Body must be transparent");
  assert.match(css, /\.app\s*\{[^}]*background:\s*transparent/, ".app must be transparent");
});

// === 13. Dashboard uses mockup content structure ===
test("dashboard page uses TopBar + mockup content structure", () => {
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /TopBar/, "Must use TopBar component");
  assert.match(source, /className="content"/, "Must have .content");
  assert.match(source, /className="grid"/, "Must have .grid");
  assert.match(source, /className="hero"/, "Must have .hero");
  assert.match(source, /className="panel cut continue"/, "Must have .panel.cut.continue");
  assert.match(source, /className="path"/, "Must have .path");
  assert.match(source, /className="panel mastery"/, "Must have .panel.mastery");
  assert.match(source, /className="panel assist"/, "Must have .panel.assist");
  assert.doesNotMatch(source, /cockpit-grid/, "Must NOT have old .cockpit-grid");
  assert.doesNotMatch(source, /dashboard-robin/, "Must NOT have old .dashboard-robin");
  assert.doesNotMatch(source, /lesson-topbar/, "Must NOT have old .lesson-topbar");
  assert.doesNotMatch(source, /mode-control/, "Must NOT have old .mode-control");
});

// === 14. TopBar component exists and uses ThemeSwitcher ===
test("top-bar component renders breadcrumb and ThemeSwitcher", () => {
  const source = readFileSync(new URL("../components/top-bar.tsx", import.meta.url), "utf8");
  assert.match(source, /ThemeSwitcher/, "Must render ThemeSwitcher");
  assert.match(source, /className="topbar"/, "Must have .topbar class");
  assert.match(source, /className="crumb"/, "Must have .crumb for breadcrumb");
  assert.match(source, /className="top-right"/, "Must have .top-right for controls");
  assert.match(source, /contextual/, "Must accept contextual controls prop");
});

// === 15. Lesson pages use TopBar with contextual controls ===
test("variables-lesson uses TopBar with ID/EN and Source Mode contextual controls", () => {
  const source = readFileSync(new URL("../components/variables-lesson.tsx", import.meta.url), "utf8");
  assert.match(source, /TopBar/, "Must use TopBar");
  assert.match(source, /contextual/, "Must pass contextual controls");
  assert.match(source, /changeLanguage/, "Must include language toggle in contextual");
  assert.match(source, /setSourceMode/, "Must include Source Mode in contextual");
  assert.doesNotMatch(source, /lesson-topbar/, "Must NOT have old .lesson-topbar");
});

test("data-types-lesson uses TopBar with ID/EN and Source Mode contextual controls", () => {
  const source = readFileSync(new URL("../components/data-types-lesson.tsx", import.meta.url), "utf8");
  assert.match(source, /TopBar/, "Must use TopBar");
  assert.match(source, /contextual/, "Must pass contextual controls");
  assert.match(source, /changeLanguage/, "Must include language toggle in contextual");
  assert.match(source, /setSourceMode/, "Must include Source Mode in contextual");
  assert.doesNotMatch(source, /lesson-topbar/, "Must NOT have old .lesson-topbar");
});

// === 16. Sidebar no longer has ThemeSwitcher ===
test("app-shell sidebar does not render ThemeSwitcher (moved to topbar)", () => {
  const source = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /ThemeSwitcher/, "Sidebar must not import/render ThemeSwitcher");
  assert.match(source, /BrandTagline/, "Must still render BrandTagline");
  assert.match(source, /LocalProfileSummary/, "Must render the focused local profile island");
});
