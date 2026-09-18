import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";

// Phase 16.5: EDUBBA theme-aware brand integration — structural tests.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// === 1. The supplied per-theme assets exist on disk ===
test("every theme ships its pre-colored EDUBBA logo and mark assets", () => {
  for (const theme of ["after-dark", "signal", "deep-space"]) {
    for (const asset of ["edubba-logo.svg", "edubba-mark.svg", "edubba-appicon.png"]) {
      const path = `public/edubba-theme-system/${theme}/${asset}`;
      assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} must exist`);
    }
  }
});

// === 2. Theme → asset mapping selects pre-made files; no recoloring ===
test("the brand component maps each theme to its own asset URL", () => {
  const source = read("components/edubba-brand.tsx");
  assert.match(source, /^"use client"/m);
  // Uses the single existing theme provider — no parallel state.
  assert.match(source, /useTheme\(\)/);
  assert.doesNotMatch(source, /createContext|ThemeProvider/);
  for (const theme of ["after-dark", "signal", "deep-space"]) {
    assert.match(source, new RegExp(`${theme}/edubba-logo\\.svg`), `${theme} logo URL`);
    assert.match(source, new RegExp(`${theme}/edubba-mark\\.svg`), `${theme} mark URL`);
  }
  // Logo color rule: no CSS filters, no opacity hacks, no recoloring
  // (match actual CSS usage, not prose in comments).
  assert.doesNotMatch(source, /filter\s*:|invert\s*\(|hue-rotate|saturate\s*\(|opacity\s*:/i);
});

// === 3. Wordmark selects by theme AND mode; marks stay theme-only ===
test("light mode swaps the wordmark to the black variant; marks stay theme-only", () => {
  const source = read("components/edubba-brand.tsx");
  assert.match(source, /const \{ theme, mode \} = useTheme\(\);/);
  assert.match(source, /mode === "light" \? logoByTheme\[theme\]\.light : logoByTheme\[theme\]\.dark/);
  for (const theme of ["after-dark", "signal", "deep-space"]) {
    assert.match(source, new RegExp(`${theme}/edubba-logo-light\\.svg`), `${theme} light wordmark URL`);
  }
  // Marks have no mode variants — mid-tone theme colors read on both modes.
  assert.doesNotMatch(source, /markByThemeMode|mark-light/);
});

// === 3b. The three light assets are exact structural copies with black wordmarks ===
test("each light logo preserves geometry and theme marks with the black wordmark", () => {
  for (const theme of ["after-dark", "signal", "deep-space"]) {
    const path = `public/edubba-theme-system/${theme}/edubba-logo-light.svg`;
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} must exist`);
    const light = read(path);
    // Black wordmark from the supplied comfy-light asset.
    assert.match(light, /scale\(\.91\)"?><g fill="#0B1220"/);
    // The theme's own mark colors remain (first mark rect per theme).
    const dark = read(`public/edubba-theme-system/${theme}/edubba-logo.svg`);
    const markFill = dark.match(/<g transform="translate\(12 10\)"><rect[^>]*fill="(#[0-9A-F]{6})"/)?.[1];
    assert.ok(markFill, `${theme} dark logo must expose a mark fill`);
    assert.ok(light.includes(markFill), `${theme} light logo keeps its mark color ${markFill}`);
    // Same viewBox and geometry anchors.
    for (const anchor of ['viewBox="0 0 420 128"', "translate(12 10)", "translate(116 38) scale(.91)"]) {
      assert.ok(light.includes(anchor), `${theme} light keeps ${anchor}`);
      assert.ok(dark.includes(anchor), `${theme} dark keeps ${anchor}`);
    }
    // No CSS filter hacks introduced anywhere.
    assert.doesNotMatch(light, /filter|invert/i);
  }
});

// === 4. Accessible labeling and link behavior ===
test("brand images are labeled without duplicate announcements", () => {
  const source = read("components/edubba-brand.tsx");
  // Full variant: the link carries the name; images stay decorative.
  assert.match(source, /aria-label="EDUBBA — Dashboard"/);
  assert.match(source, /className="edubba-logo"[\s\S]{0,120}?alt=""/);
  assert.match(source, /className="edubba-mark"[\s\S]{0,120}?alt=""/);
  // Mark variant: the image is the identity, so it carries the alt text.
  assert.match(source, /alt="EDUBBA"/);
  // Exactly one link; the mark variant renders a span (no nested anchors).
  assert.equal((source.match(/<Link/g) ?? []).length, 1);
  assert.doesNotMatch(source, /variant === "mark"[\s\S]{0,400}?<Link/);
});

// === 5. Shell integration: EDUBBA primary, Robin companion separate ===
test("app shell brands with EDUBBA and keeps Robin as companion context", () => {
  const shell = read("components/app-shell.tsx");
  assert.match(shell, /import \{ EdubbaBrand \} from "@\/components\/edubba-brand"/);
  assert.match(shell, /<EdubbaBrand>/);
  // The atmospheric theme tagline stays as secondary context under the logo.
  assert.match(shell, /<BrandTagline \/>/);
  assert.match(shell, /<LocalProfileSummary \/>/);
  // Robin is no longer the shell's primary brand mark.
  assert.doesNotMatch(shell, /RobinBird/);
  assert.doesNotMatch(shell, /brand-name">robin/);
  // Shell stays a Server Component (client concerns live in child components).
  assert.doesNotMatch(shell, /useTheme/);
  assert.doesNotMatch(shell, /^"use client"/m);
});

// === 6. Sidebar/rail responsive swap ===
test("CSS swaps wordmark for compact mark in the tablet rail", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.edubba-logo \{ display: block; width: 148px; height: auto; \}/);
  assert.match(css, /\.edubba-mark \{ display: none; width: 32px; height: auto; \}/);
  const rail = css.match(/@media \(max-width: 1120px\) \{[\s\S]*?\n\}/g) ?? [];
  assert.ok(rail.some((block) => /\.edubba-logo, \.edubba-tag \{ display: none; \}/.test(block) && /\.edubba-mark \{ display: block; \}/.test(block)), "rail rules must exist in a ≤1120px block");
  // No filters on the brand images anywhere.
  assert.doesNotMatch(css, /\.edubba-(logo|mark)[^{]*\{[^}]*filter/);
});

// === 7. Mobile integration: compact topbar mark, phones only ===
test("topbar carries a compact EDUBBA mark visible only on phones", () => {
  const topbar = read("components/top-bar.tsx");
  assert.match(topbar, /<EdubbaBrand variant="mark" \/>/);
  const css = read("app/globals.css");
  assert.match(css, /\.edubba-mark-only \{ display: none; align-items: center; flex: none; \}/);
  const phone = css.match(/@media \(max-width: 430px\) \{[\s\S]*?\n\}/g) ?? [];
  assert.ok(phone.some((block) => /\.edubba-mark-only \{ display: inline-flex; \}/.test(block)), "phone block must show the mark");
  // The breadcrumb shares the mark's row on phones.
  assert.ok(phone.some((block) => /\.crumb \{ flex: 1 1 auto; \}/.test(block)));
});

// === 8. Metadata: EDUBBA title, existing app icon wired, no new assets ===
test("metadata titles EDUBBA and wires an existing appicon without generating assets", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /title: "EDUBBA — Arya's CS workspace"/);
  assert.match(layout, /Robin, the AI study companion/);
  assert.match(layout, /icons: \{ icon: "\/edubba-theme-system\/signal\/edubba-appicon\.png" \}/);
  // The wired icon must be one of the supplied files on disk.
  assert.equal(existsSync(new URL("../public/edubba-theme-system/signal/edubba-appicon.png", import.meta.url)), true);
});

// === 9. Footers state the platform/companion relationship ===
test("footer lines say EDUBBA with robin as companion", () => {
  for (const file of ["app/page.tsx", "components/programming-course-client.tsx", "components/discrete-math-course-client.tsx", "components/generic-course-client.tsx"]) {
    const source = read(file);
    assert.match(source, /edubba — a place to learn computer science slowly, with robin\./, `${file} footer`);
    assert.doesNotMatch(source, /robin — a place to learn/, `${file} must not brand robin as the platform`);
  }
});

// === 10. Hydration safety follows the existing pattern ===
test("brand component follows the established client/theme sync pattern", () => {
  const source = read("components/edubba-brand.tsx");
  // Client component (required for useTheme) inside the server shell.
  assert.match(source, /^"use client"/m);
  // The provider it consumes is the one and only ThemeProvider.
  assert.match(source, /from "@\/lib\/theme\/theme-provider"/);
  const provider = read("lib/theme/theme-provider.tsx");
  assert.match(provider, /SSR defaults to avoid hydration mismatch/);
});
