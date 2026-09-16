import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Practice mode navigation maps the three modes to their existing routes", () => {
  const nav = read("../components/practice-mode-nav.tsx");
  assert.match(nav, /Guided Practice.*\/practice\/python/s);
  assert.match(nav, /Sandbox.*\/practice\/python\/sandbox/s);
  assert.match(nav, /Logic & Thinking.*\/practice\/thinking/s);
  assert.match(nav, /aria-current=\{isActive \? "page"/);
});

test("all Practice experiences reuse the mode navigation with the correct active state", () => {
  assert.match(read("../components/practice-lab.tsx"), /<PracticeModeNav active="guided" \/>/);
  assert.match(read("../components/python-sandbox.tsx"), /<PracticeModeNav active="sandbox" \/>/);
  assert.match(read("../components/thinking-lab.tsx"), /<PracticeModeNav active="thinking" \/>/);
});

test("Practice landing presents three equal clickable mode cards", () => {
  const landing = read("../app/practice/page.tsx");
  assert.equal((landing.match(/className="panel practice-mode-card"/g) ?? []).length, 3);
  assert.match(landing, /<Link className="panel practice-mode-card" href="\/practice\/python">/);
  assert.match(landing, /<Link className="panel practice-mode-card" href="\/practice\/python\/sandbox">/);
  assert.match(landing, /<Link className="panel practice-mode-card" href="\/practice\/thinking">/);
});

test("mode navigation keeps explicit focus, active, and mobile behavior", () => {
  const css = read("../app/globals.css");
  assert.match(css, /\.practice-mode-nav a:focus-visible/);
  assert.match(css, /\.practice-mode-nav a\.active/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.practice-mode-nav \{ width: 100%; \}/);
  assert.match(css, /\.practice-mode-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});
