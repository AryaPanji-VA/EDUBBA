import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// Phase 16.1: mobile-only floating navigation (FAB) — structural tests.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// === 1. The FAB component implements the required behavior ===
test("mobile nav renders a FAB with an expanding vertical menu", () => {
  const source = read("components/mobile-nav.tsx");
  assert.match(source, /"use client"/);
  // Reuses the persisted current-lesson logic.
  assert.match(source, /useCurrentLesson\(\)/);
  assert.match(source, /`\/courses\/\$\{current\.courseSlug\}\/\$\{current\.lessonSlug\}`/);
  // Destinations with icon + short label; labels come from the shared UI dictionary.
  for (const key of ["nav.dashboard", "nav.courses", "nav.lesson", "nav.practice"]) {
    assert.match(source, new RegExp(`label: copy\\["${key.replace(".", "\\.")}"\\]`));
  }
  // Vertical stack (flex column) comes from CSS; items close the menu on select.
  assert.match(source, /onClick=\{\(\) => setOpen\(false\)\}/);
  // Accessible button/menu behavior.
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /aria-controls="mobile-nav-menu"/);
  assert.match(source, /aria-label=\{open \? copy\["nav\.closeMenu"\] : copy\["nav\.openMenu"\]\}/);
  assert.match(source, /hidden=\{!open\}/);
  assert.match(source, /aria-current=\{active === item\.key \? "page" : undefined\}/);
  // Close on Escape (with focus return) and outside tap.
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /fabRef\.current\?\.focus\(\)/);
  assert.match(source, /document\.addEventListener\("pointerdown", onPointerDown\)/);
  assert.match(source, /!rootRef\.current\.contains\(event\.target as Node\)/);
});

// === 2. The shell mounts the mobile nav with the active destination ===
test("app shell mounts MobileNav and passes the active prop", () => {
  const shell = read("components/app-shell.tsx");
  assert.match(shell, /import \{ MobileNav \} from "@\/components\/mobile-nav"/);
  assert.match(shell, /<MobileNav active=\{active\} \/>/);
});

// === 3. The FAB is phone-only and the old bottom nav is hidden there ===
test("FAB shows and the old bottom nav hides at ≤430px only", () => {
  const css = read("app/globals.css");
  // Base: hidden everywhere.
  assert.match(css, /\.mobile-nav \{ display: none; \}/);
  // The phone media query is 430px — not 760px, so tablets keep their nav.
  // (The stylesheet has several 430px blocks; the shell rules live in one of them.)
  const phoneBlocks = css.match(/@media \(max-width: 430px\) \{[\s\S]*?\n\}/g) ?? [];
  const phoneBlock = phoneBlocks.join("\n");
  assert.ok(phoneBlocks.length > 0, "max-width: 430px blocks must exist");
  assert.match(phoneBlock, /\.side \{ display: none; \}/);
  assert.match(phoneBlock, /\.mobile-nav \{ display: block; \}/);
});

// === 4. Safe areas and touch sizing ===
test("FAB and menu respect safe-area insets with a ≥52px touch target", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.mobile-fab \{[^}]*bottom: calc\(16px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(css, /\.mobile-fab \{[^}]*width: 54px; height: 54px; border-radius: 50%/);
  assert.match(css, /\.mobile-menu \{[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  // Menu items are comfortable touch targets.
  assert.match(css, /\.mobile-menu a \{[^}]*min-height: 46px/);
  // Page content clears the FAB including safe areas.
  assert.match(css, /\.main \{ padding: 0 0 calc\(112px \+ env\(safe-area-inset-bottom, 0px\)\); \}/);
});

// === 5. No horizontal overflow ===
test("the menu can never exceed the viewport width", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.mobile-menu \{[^}]*max-width: calc\(100vw - 32px\)/);
  assert.match(css, /\.mobile-menu \{[^}]*min-width: 0;/);
});

// === 6. Transitions are subtle and reduced motion is respected ===
test("menu entrance is a subtle CSS animation covered by reduced motion", () => {
  const css = read("app/globals.css");
  assert.match(css, /animation: mobile-menu-in \.18s ease-out/);
  assert.match(css, /@keyframes mobile-menu-in \{ from \{ opacity: 0; transform: translateY\(10px\); \} \}/);
  // The global reduced-motion rule suppresses all animations/transitions.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-duration: \.01ms !important/);
});

// === 7. Tablet navigation (431–760px bottom nav) and desktop are untouched ===
test("the 760px bottom-nav and desktop sidebar rules remain unchanged", () => {
  const css = read("app/globals.css");
  // Bottom bar still exists between 431–760px.
  assert.match(css, /\.side \{ position: fixed; inset: auto 0 0; z-index: 20; width: 100%; height: 68px;/);
  assert.match(css, /\.nav a \{ min-width: 64px; flex-direction: column/);
  // Desktop sidebar and its 236px grid column are intact.
  assert.match(css, /\.app \{[^}]*grid-template-columns: 236px minmax\(0, 1fr\)/);
  assert.match(css, /\.side \{\s*position: sticky; top: 0; height: 100vh;/);
  // The old 760px bottom padding (bottom-nav clearance) still exists.
  assert.match(css, /\.main \{ padding: 0 0 96px; \}/);
});
