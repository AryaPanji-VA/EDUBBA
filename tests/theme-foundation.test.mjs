import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load theme-state.ts (pure functions, no React) via VM.
const themeSource = stripTypeScriptTypes(readFileSync(new URL("../lib/theme/theme-state.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/export /g, "");
const themeExports = {};
vm.runInNewContext(themeSource + "\nexports.validTheme = validTheme; exports.validMode = validMode; exports.THEMES = THEMES; exports.MODES = MODES; exports.resolveThemeState = resolveThemeState; exports.THEME_STORAGE_KEY = THEME_STORAGE_KEY; exports.MODE_STORAGE_KEY = MODE_STORAGE_KEY;", {
  exports: themeExports,
  // Simulated browser globals for resolveThemeState
  localStorage: { getItem: () => null },
  location: { search: "" },
  URLSearchParams: URLSearchParams,
});
const { validTheme, validMode, THEMES, MODES, resolveThemeState } = themeExports;

// === 1. Valid themes are accepted ===
test("valid themes accepted, invalid rejected", () => {
  for (const t of ["after-dark", "signal", "deep-space"]) assert.ok(validTheme(t), `${t} should be valid`);
  for (const t of ["variables", "light", "dark", "", null, undefined, "After-Dark", "signal "]) assert.equal(validTheme(t), false, `${t} should be invalid`);
});

// === 2. Invalid persisted theme falls back to default ===
test("resolveThemeState falls back to signal/dark when nothing valid stored", () => {
  const state = resolveThemeState();
  assert.equal(state.theme, "signal");
  assert.equal(state.mode, "dark");
});

// === 3. Valid modes are accepted ===
test("valid modes accepted, invalid rejected", () => {
  for (const m of ["dark", "light"]) assert.ok(validMode(m), `${m} should be valid`);
  for (const m of ["after-dark", "blue", "", null, undefined, "Dark", "light "]) assert.equal(validMode(m), false, `${m} should be invalid`);
});

// === 4. Invalid persisted mode falls back safely ===
test("resolveThemeState rejects invalid persisted values", () => {
  const exports4 = {};
  vm.runInNewContext(stripTypeScriptTypes(readFileSync(new URL("../lib/theme/theme-state.ts", import.meta.url), "utf8"), { mode: "transform" }).replace(/export /g, "") + "\nexports.resolveThemeState = resolveThemeState;", {
    exports: exports4,
    localStorage: { getItem: (k) => k === "robin-theme" ? "bogus" : "also-bogus" },
    location: { search: "" },
    URLSearchParams,
  });
  const badState = exports4.resolveThemeState();
  assert.equal(badState.theme, "signal");
  assert.equal(badState.mode, "dark");
});

// === 5. Theme and mode resolve independently ===
test("query params override stored values independently", () => {
  const exports5 = {};
  vm.runInNewContext(stripTypeScriptTypes(readFileSync(new URL("../lib/theme/theme-state.ts", import.meta.url), "utf8"), { mode: "transform" }).replace(/export /g, "") + "\nexports.resolveThemeState = resolveThemeState;", {
    exports: exports5,
    localStorage: { getItem: (k) => k === "robin-theme" ? "after-dark" : "light" },
    location: { search: "?theme=deep-space" }, // override theme only
    URLSearchParams,
  });
  const stateFn = exports5.resolveThemeState();
  assert.equal(stateFn.theme, "deep-space"); // query wins for theme
  assert.equal(stateFn.mode, "light"); // localStorage wins for mode (no query)
});

// === 6. Theme changes do not remount lesson state (architecture test) ===
test("theme-provider uses CSS data attributes, not React keys", () => {
  const providerSource = readFileSync(new URL("../lib/theme/theme-provider.tsx", import.meta.url), "utf8");
  // The provider must NOT key children by theme/mode (which would remount)
  assert.doesNotMatch(providerSource, /key=\{.*(theme|mode)/, "Provider must not key children by theme/mode");
  // The provider must set data attributes on <html> for CSS-only switching
  assert.match(providerSource, /dataset\.theme/, "Provider must set dataset.theme");
  assert.match(providerSource, /dataset\.mode/, "Provider must set dataset.mode");
});

// === 7. Environment selection maps to correct engine ===
test("environment layer dispatches to correct engine per theme", () => {
  const envSource = readFileSync(new URL("../components/environment-layer.tsx", import.meta.url), "utf8");
  assert.match(envSource, /"after-dark":\s*cityEngine/, "after-dark maps to cityEngine");
  assert.match(envSource, /"signal":\s*signalEngine/, "signal maps to signalEngine");
  assert.match(envSource, /"deep-space":\s*spaceEngine/, "deep-space maps to spaceEngine");
});

// === 8. Reduced-motion path is safe ===
test("reduced motion is handled live (not static)", () => {
  const hookSource = readFileSync(new URL("../lib/theme/use-reduced-motion.ts", import.meta.url), "utf8");
  assert.match(hookSource, /addEventListener\("change"/, "Must listen for changes (not static snapshot)");
});

// === 9. Engines respect reduced motion (no interval/rAF when reduced) ===
test("city engine skips interval when reduced", () => {
  const engineSource = readFileSync(new URL("../lib/theme/engines/city-engine.ts", import.meta.url), "utf8");
  assert.match(engineSource, /if \(!reduced && !timer\)/, "City engine must guard interval on reduced");
});
test("signal and space engines guard rAF when reduced", () => {
  for (const file of ["signal-engine", "space-engine"]) {
    const engineSource = readFileSync(new URL(`../lib/theme/engines/${file}.ts`, import.meta.url), "utf8");
    assert.match(engineSource, /if \(!reduced && !raf\)/, `${file} must guard rAF on reduced`);
  }
});

// === 10. Themes CSS has all six combinations ===
test("themes.css defines all six theme×mode combinations", () => {
  const themesCss = readFileSync(new URL("../styles/themes.css", import.meta.url), "utf8");
  for (const theme of ["after-dark", "signal", "deep-space"]) {
    for (const mode of ["dark", "light"]) {
      assert.match(themesCss, new RegExp(`\\[data-theme="${theme}"\\]\\[data-mode="${mode}"\\]`), `${theme}/${mode} block must exist`);
    }
  }
});

// === 11. Pre-paint script exists in layout ===
test("layout includes pre-paint theme resolution", () => {
  const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layoutSource, /theme-init\.js/, "Pre-paint script must load from public/");
  assert.match(layoutSource, /beforeInteractive/, "Pre-paint script must use beforeInteractive strategy");
  assert.doesNotMatch(layoutSource, /dangerouslySetInnerHTML/, "Must not render raw script tags in React");
  // The actual pre-paint logic exists in the public file
  const initScript = readFileSync(new URL("../public/theme-init.js", import.meta.url), "utf8");
  assert.match(initScript, /dataset\.theme/, "Init script must set dataset.theme");
  assert.match(initScript, /dataset\.mode/, "Init script must set dataset.mode");
  assert.match(initScript, /localStorage\.getItem\("robin-theme"\)/, "Init script must read robin-theme");
});

// === 12. Global transition for theme crossfade ===
test("globals.css includes global transition for theme crossfade", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /transition-property:\s*background-color.*border-color.*color.*fill.*box-shadow/s, "Global transition must animate color properties");
});

// === 13. Old SVG signal background removed from shared shell ===
test("app-shell no longer renders the old SVG signal background", () => {
  const shellSource = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(shellSource, /SignalBackground/, "AppShell must not use SignalBackground");
  assert.match(shellSource, /EnvironmentLayer/, "AppShell must use EnvironmentLayer");
});
