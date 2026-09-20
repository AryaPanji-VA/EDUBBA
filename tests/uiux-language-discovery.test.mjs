import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Discovery + language recovery pass: focused structural coverage.
// Settings owns language, lessons follow it, first-run detection is honest,
// and the lightweight learning search uses existing routes only.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// Load the flat UI dictionary without a test-only dependency (same technique
// as lesson-localization.test.mjs).
function loadUiCopy() {
  const source = stripTypeScriptTypes(read("lib/i18n/ui-copy.ts"), { mode: "transform" })
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/export type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/export /g, "") + "\nexports.uiCopy = uiCopy; exports.fillTemplate = fillTemplate;";
  const exports = {};
  vm.runInNewContext(source, { exports });
  return exports;
}

// === 1. Settings owns language selection ===
test("settings page hosts LanguageSwitcher under a Language section", () => {
  const settings = read("app/settings/page.tsx");
  assert.match(settings, /LanguageSwitcher/, "Settings must render the language control");
  assert.match(settings, /copy\["settings\.language"\]/, "Language section must be labelled from the dictionary");
  assert.match(settings, /ThemeSwitcher/, "Appearance section stays intact");
});

test("the language switcher exposes a clear selected state, not color alone", () => {
  const switcher = read("components/language-switcher.tsx");
  assert.match(switcher, /aria-pressed=\{language === option\.value\}/);
  assert.match(switcher, /className=\{language === option\.value \? "on" : ""\}/);
  assert.match(switcher, /"Bahasa Indonesia"/);
  assert.match(switcher, /"English"/);
});

// === 2. Language persistence reuses the existing mechanism ===
test("the global provider persists through the existing lesson-language key only", () => {
  const provider = read("lib/i18n/language-provider.tsx");
  assert.match(provider, /lessonLanguageStorageKey } from "@\/content\/lessons\/shared-copy"/);
  assert.match(provider, /localStorage\.getItem\(lessonLanguageStorageKey\)/);
  assert.match(provider, /localStorage\.setItem\(lessonLanguageStorageKey, next\)/);
  assert.match(provider, /window\.addEventListener\("storage"/, "cross-tab sync stays wired");
  assert.doesNotMatch(provider, /localStorage\.(get|set)Item\((?!lessonLanguageStorageKey)/, "no second persistence key");
  // The root layout mounts exactly one LanguageProvider.
  const layout = read("app/layout.tsx");
  assert.match(layout, /LanguageProvider/);
  assert.equal((layout.match(/LanguageProvider/g) ?? []).length, 3, "import + open/close tags, no duplicate providers");
});

// === 3. Selected language affects global UI copy ===
test("id and en dictionaries cover the same keys and differ on chrome copy", () => {
  const { uiCopy, fillTemplate } = loadUiCopy();
  const idKeys = Object.keys(uiCopy.id).sort();
  const enKeys = Object.keys(uiCopy.en).sort();
  assert.deepEqual(idKeys, enKeys, "id/en key parity");
  assert.notEqual(uiCopy.id["nav.dashboard"], uiCopy.en["nav.dashboard"]);
  assert.notEqual(uiCopy.id["status.notStarted"], uiCopy.en["status.notStarted"]);
  assert.equal(fillTemplate(uiCopy.en["dash.pathCount"], { done: 2, total: 4, pct: 50 }), "2 of 4 lessons · 50%");
  // Course codes and proper names are never translated.
  assert.equal(uiCopy.id["course.tag"].includes("{code}"), true);
});

test("lesson surfaces read language from the provider instead of owning a header selector", () => {
  const client = read("components/lesson-client.tsx");
  assert.match(client, /useLanguage/);
  assert.doesNotMatch(client, /changeLanguage/);
  assert.doesNotMatch(client, /aria-pressed=\{language === value\}/, "no inline ID/EN segmented control in the lesson header");
});

// === 4. Robin quick prompts follow locale and safe tone ===
test("robin quick prompts are locale-specific and free of rude wording", () => {
  const companion = read("components/robin-companion.tsx");
  for (const label of ["Jelasin lebih sederhana", "Kasih analogi", "Kasih contoh kode", "Gue ngerti setengah", "Quiz gue", "Catat pembelajaran"]) {
    assert.match(companion, new RegExp(`label: "${label}"`), `ID prompt: ${label}`);
  }
  for (const label of ["Explain it simpler", "Give an analogy", "Show a code example", "I half get it", "Quiz me", "Save what I learned"]) {
    assert.match(companion, new RegExp(`label: "${label}"`), `EN prompt: ${label}`);
  }
  for (const rude of ["goblok", "tolol", "bego", "bodoh", "stupid", "idiot", "goblok"]) {
    assert.doesNotMatch(companion, new RegExp(rude, "i"), `prompt copy must not contain "${rude}"`);
  }
  assert.match(companion, /shortcutsByLanguage\[language\]/, "prompts follow the selected language");
});

// === 5. First-run dashboard appears only for genuinely unstarted users ===
test("first-run detection requires no persisted history and no current progress", () => {
  const dash = read("app/page.tsx");
  assert.match(dash, /const isFirstRun = hasHistory === false && !currentHasProgress;/);
  assert.match(dash, /responses\.some\(\(response\) => response\?\.progress\)/, "any started lesson counts as history");
  assert.doesNotMatch(dash, /const .*completedLessons === 0/, "first-run never derives from a completion count alone");
  assert.doesNotMatch(dash, /isNewUser/, "no invented new-user state");
});

test("the first-run surface offers a guided start, courses, search, and a quiet path empty state", () => {
  const { uiCopy } = loadUiCopy();
  const dash = read("app/page.tsx");
  assert.match(dash, /copy\["dash\.firstTitle"\]/);
  // Primary guided start targets the existing first foundational lesson route.
  assert.match(dash, /className="btn-p first-start" href=\{`\/courses\/\$\{defaultCurrentLesson\.courseSlug\}\/\$\{defaultCurrentLesson\.lessonSlug\}`\}/);
  assert.match(dash, /import \{[^}]*defaultCurrentLesson[^}]*\} from "@\/data\/courses"/);
  // Secondary course browsing is a quieter action pointing at the Courses route.
  assert.match(dash, /className="first-browse" href="\/courses">\{copy\["dash\.firstCta"\]\}<\/Link>/);
  assert.match(dash, /className="first-actions"/);
  assert.match(dash, /className="content first-run"/);
  assert.match(dash, /className="path path-quiet"/);
  assert.match(dash, /copy\["dash\.firstPathEmpty"\]/);
  assert.equal(uiCopy.id["dash.firstTitle"], "Mulai pelajaran pertamamu");
  assert.equal(uiCopy.id["dash.firstSub"], "Belum tahu harus mulai dari mana? Mulai dari dasar, lalu lanjut sesuai ritmemu.");
  assert.equal(uiCopy.id["dash.firstStart"], "Mulai pelajaran pertama");
  assert.equal(uiCopy.id["dash.firstCta"], "Lihat semua mata kuliah");
  assert.equal(uiCopy.id["dash.firstPathEmpty"], "Jalur belajarmu akan muncul di sini setelah kamu memulai pelajaran.");
  assert.equal(uiCopy.en["dash.firstTitle"], "Start your first lesson");
  assert.equal(uiCopy.en["dash.firstSub"], "Not sure where to begin? Start with the basics, then continue at your own pace.");
  assert.equal(uiCopy.en["dash.firstStart"], "Start your first lesson");
  assert.equal(uiCopy.en["dash.firstCta"], "Explore all courses");
  assert.equal(uiCopy.en["dash.firstPathEmpty"], "Your learning path will appear here after you start a lesson.");
});

test("the first-run guided-start styles center the block and stack cleanly on phones", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.first-run \{ max-width: 660px; margin: 0 auto;/, "centered, comfortable max-width");
  assert.match(css, /\.first-actions \{ display: flex; align-items: center; gap: 18px; flex-wrap: wrap;/);
  assert.match(css, /\.first-browse \{ color: var\(--mut\);/, "secondary action stays visually quiet");
  assert.match(css, /\.first-browse:focus-visible \{ outline: 2px solid var\(--accent\)/);
  assert.match(css, /\.first-actions \{ flex-direction: column; align-items: stretch; gap: 14px; \}/, "phone stacking");
  assert.match(css, /\.first-start \{ width: 100%; justify-content: center; \}/, "primary CTA full width on phones");
  assert.doesNotMatch(css, /\.first-run \{[^}]*#[0-9a-f]{3,6}/, "no hardcoded colors");
});

test("the returning-user dashboard keeps its polished surfaces", () => {
  const dash = read("app/page.tsx");
  assert.match(dash, /className="panel cut continue"/, "Continue surface stays");
  assert.match(dash, /<span className="tag blue">\{fillTemplate\(copy\["dash\.pathTag"\]/, "Your Path stays");
  assert.match(dash, /className="panel mastery"/, "Mastery stays");
  assert.match(dash, /<RobinMiniChat/, "Robin mini-chat stays");
});

// === 6. Learning search: existing metadata, existing routes, honest states ===
test("the learning search indexes courses and lessons from existing metadata", () => {
  const search = read("components/learning-search.tsx");
  assert.match(search, /currentCurriculumManifest/);
  assert.match(search, /courseCatalog|courses as courseCatalog/);
  assert.match(search, /implementedLessonSlugsByCourse/);
  assert.match(search, /normalize\(`\$\{lesson\.title\}/, "lesson haystack includes its title");
});

test("search results resolve only existing routes and coming-soon lessons stay inert", () => {
  const search = read("components/learning-search.tsx");
  assert.match(search, /courseOverviewRouteBySlug\[course\.slug\]/, "course results use the trusted overview routes");
  assert.match(search, /href: implemented \? `\/courses\/\$\{course\.slug\}\/\$\{lesson\.slug\}` : null/, "lessons use existing lesson routes only");
  assert.match(search, /<div className=\{`\$\{className\} is-soon`\} aria-disabled="true">/, "coming-soon results render inert, never as links");
  assert.match(search, /<Link className=\{className\} href=\{entry\.href\}/, "actionable results use Link");
});

test("the search copy is localized including the no-results state and the input is labelled", () => {
  const { uiCopy, fillTemplate } = loadUiCopy();
  const search = read("components/learning-search.tsx");
  assert.match(search, /aria-label=\{copy\["search\.ariaLabel"\]\}/);
  assert.match(search, /placeholder=\{copy\["search\.placeholder"\]\}/);
  assert.match(search, /fillTemplate\(copy\["search\.noResults"\], \{ q: query\.trim\(\) \}\)/);
  assert.match(search, /event\.key === "Escape"/, "Escape dismissal stays wired");
  assert.equal(uiCopy.id["search.placeholder"], "Cari mata kuliah, pelajaran, atau topik...");
  assert.equal(uiCopy.en["search.placeholder"], "Search courses, lessons, or topics...");
  assert.equal(fillTemplate(uiCopy.id["search.noResults"], { q: "xyz" }), "Tidak ada hasil untuk “xyz”. Coba kata lain atau kode course.");
  assert.equal(fillTemplate(uiCopy.en["search.noResults"], { q: "xyz" }), "Nothing found for “xyz”. Try another word or course code.");
});

// === 7. Returning users get the compact trigger; first-run keeps the bar ===
test("the returning dashboard mounts the compact trigger beside the breadcrumb", () => {
  const dash = read("app/page.tsx");
  assert.match(dash, /contextual=\{<LearningSearch presentation="trigger" \/>\}/, "trigger sits in the top content bar");
  assert.match(dash, /first-hero[\s\S]*<LearningSearch \/>/, "first-run keeps the prominent inline search");
  // The first-run branch renders its own TopBar without the search trigger.
  const firstRunStart = dash.indexOf("if (isFirstRun)");
  const firstRunReturn = dash.indexOf("return (", firstRunStart);
  const returningReturn = dash.indexOf("return (", firstRunReturn + 10);
  const firstRunSection = dash.slice(firstRunReturn, returningReturn);
  assert.doesNotMatch(firstRunSection, /presentation="trigger"/);
  assert.match(firstRunSection, /<LearningSearch \/>/, "first-run keeps the prominent inline search");
});

test("the trigger is a localized labelled button that reveals the existing search", () => {
  const { uiCopy } = loadUiCopy();
  const search = read("components/learning-search.tsx");
  assert.match(search, /<button[\s\S]*className="lsearch-pill"/, "native button trigger");
  assert.match(search, /aria-expanded=\{expanded\}/, "open state exposed without relying on color");
  assert.match(search, /aria-controls="learning-search-popover"/);
  assert.match(search, /copy\["search\.trigger"\]/);
  assert.match(search, /copy\["search\.triggerShort"\]/);
  assert.match(search, /inputRef\.current\?\.focus\(\)/, "opening focuses the existing input");
  assert.match(search, /document\.addEventListener\("pointerdown", onPointerDown\)/, "outside tap closes");
  assert.match(search, /event\.key === "Escape"[\s\S]{0,80}close\(\)/, "Escape closes the trigger popover");
  assert.equal(uiCopy.id["search.trigger"], "Cari pelajaran");
  assert.equal(uiCopy.en["search.trigger"], "Search lessons");
  assert.equal(uiCopy.id["search.triggerShort"], "Cari");
  assert.equal(uiCopy.en["search.triggerShort"], "Search");
});

test("trigger presentation styles stay subtle, token-based, and mobile-safe", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.lsearch-pill \{[^}]*height: 42px/);
  assert.match(css, /\.lsearch-pill \{[^}]*min-width: 176px/);
  assert.match(css, /\.lsearch-pill:focus-visible \{ outline: 2px solid var\(--accent\)/);
  assert.match(css, /\.lsearch-pill\[aria-expanded="true"\]/);
  assert.match(css, /\.lsearch-popover \{[^}]*width: 440px/);
  assert.match(css, /@keyframes lsearch-in/);
  assert.match(css, /animation: lsearch-in \.16s ease-out/);
  assert.doesNotMatch(css, /\.lsearch-pill \{[^}]*#[0-9a-f]{3,6}/, "no hardcoded colors on the trigger");
  // Phones swap to the short label and reveal the search at content width.
  assert.match(css, /\.lsearch-label-full \{ display: none; \}/);
  assert.match(css, /\.lsearch-label-short \{ display: inline; \}/);
  // The popover stays anchored to the trigger at content width — a fixed
  // position would push it below the viewport (top: 100% + offset).
  assert.match(css, /\.lsearch-popover \{ left: 0; right: 0; width: 100%; max-width: none; margin-top: 6px; \}/);
  assert.doesNotMatch(css, /max-width: 430px\) \{[^}]*\.lsearch-popover \{ position: fixed/s, "popover must not leave the viewport on phones");
  // Reduced motion is respected via the existing global rule.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

// === 8. Lesson experience polish: readable body, clear hierarchy ===
test("lesson reading surfaces use full-strength body text with softer helpers", () => {
  const css = read("app/globals.css");
  const polish = css.slice(css.indexOf("Lesson experience polish"), css.indexOf("/* Phase 11B:"));
  // Body paragraphs read at full text strength; helpers stay muted, not faint.
  assert.match(polish, /\.lesson-section p \{ color: var\(--text\); font-size: 15px; line-height: 1\.78;/);
  assert.match(polish, /\.learning-activity p \{ color: var\(--text\); \}/);
  assert.match(polish, /\.lesson-box dd, \.mistakes li \{ font-size: 13px;/);
  // Section hierarchy: step label legible, headings stronger.
  assert.match(polish, /\.section-number \{ color: var\(--mut\); font-size: 11px; letter-spacing: \.14em;/);
  assert.match(polish, /\.lesson-section h2 \{ font-size: 21px; font-weight: 600; \}/);
  assert.match(polish, /\.learning-activity h2 \{ font-size: 21px; \}/);
  // Token-only: no hardcoded hex colors in the polish layer.
  assert.doesNotMatch(polish, /#[0-9a-fA-F]{3,6}\b/, "polish rules must use existing tokens");
});

test("lesson completion and activity feedback read clearly", () => {
  const css = read("app/globals.css");
  const polish = css.slice(css.indexOf("Lesson experience polish"), css.indexOf("/* Phase 11B:"));
  assert.match(polish, /\.mock-feedback \{ padding: 12px 16px;[^}]*color: var\(--text\);/);
  assert.match(polish, /\.mock-feedback strong \{ color: var\(--ok\); \}/, "completion state distinct without implying more than it is");
  assert.match(polish, /\.answer-note strong \{ color: var\(--text\); \}/);
  assert.match(polish, /\.answer-note\.is-correct strong \{ color: var\(--ok\); \}/);
  assert.match(polish, /\.answer-note\.is-incorrect strong \{ color: var\(--danger\); \}/);
  assert.match(polish, /\.answer-options button:focus-visible \{ outline: 2px solid var\(--accent\)/);
  // Sources and accordion summaries stay readable.
  assert.match(polish, /\.source-item p \{ color: var\(--mut\); font-size: \.78rem; \}/);
  assert.match(polish, /details\.references summary \{ color: var\(--text\); \}/);
  // Hero compresses on phones.
  assert.match(polish, /@media \(max-width: 430px\) \{[^}]*\.lesson-title \{ padding: 34px 0 26px; \}/s);
});

// === 9. Lesson decoration safety: ambient skyline never fights text ===
test("lesson content sits on a theme-tinted backing above the decoration layer", () => {
  const css = read("app/globals.css");
  // Decoration layer stays at the back; content at the front.
  const env = read("styles/environments.css");
  assert.match(env, /\.env \{[^}]*z-index: 0/, "environment canvas stays at z-index 0");
  assert.match(css, /\.content \{ position: relative; z-index: 3;/, "content stays above decoration");
  // Lesson article gets a veil-tinted, blurred backing (theme-token color).
  assert.match(css, /\.lesson-grid > article \{[^}]*background: rgba\(var\(--veil-rgb\), \.72\)/);
  assert.match(css, /\.lesson-grid > article \{[^}]*backdrop-filter: blur\(6px\)/);
  assert.match(css, /@media \(max-width: 430px\) \{[^}]*\.lesson-grid > article \{ padding: 20px 16px 24px;/s);
  assert.doesNotMatch(css, /\.lesson-grid > article \{[^}]*#[0-9a-fA-F]{3,6}/, "backing uses theme tokens only");
});

// === 10. Practice sub-lab chrome follows the global language dictionary ===
test("guided practice chrome comes from the shared dictionary", () => {
  const lab = read("components/practice-lab.tsx");
  assert.match(lab, /useUiCopy/);
  assert.doesNotMatch(lab, /Predict Output"|Fix the Code"|Write Code"/, "exercise type labels are localized");
  assert.doesNotMatch(lab, /"Check"|"Hide hint"|"Open in Sandbox"|"Next exercise/, "buttons are localized");
  assert.match(lab, /copy\["guided\.eyebrow"\]/);
  assert.match(lab, /copy\["guided\.openSandbox"\]/);
  assert.match(lab, /copy\["guided\.topicComplete"\]/);
  assert.match(lab, /copy\["guided\.logSaved"\]/);
});

test("sandbox and thinking lab chrome come from the shared dictionary", () => {
  const sandbox = read("components/python-sandbox.tsx");
  assert.match(sandbox, /useUiCopy/);
  assert.doesNotMatch(sandbox, /sandboxRuntimeLabel\(/, "runtime status is localized through the dictionary");
  assert.match(sandbox, /copy\["sbox\.status\.ready"\]/);
  assert.match(sandbox, /copy\["sbox\.run"\]/);
  assert.match(sandbox, /copy\["sbox\.outputNote"\]/);
  assert.match(sandbox, /copy\["sbox\.assistExplainCode"\]/);
  const thinking = read("components/thinking-lab.tsx");
  assert.match(thinking, /useUiCopy/);
  assert.doesNotMatch(thinking, /"Check reasoning"|"Try this in Sandbox"|"Thinking set complete/, "thinking controls are localized");
  assert.match(thinking, /copy\["think\.checkBtn"\]/);
  assert.match(thinking, /copy\["think\.guide\.b1"\]/);
  assert.match(thinking, /copy\["think\.footnote"\]/);
});

test("practice sub-lab dictionary keys exist in both languages with natural copy", () => {
  const { uiCopy } = loadUiCopy();
  for (const key of ["guided.title", "sbox.title", "think.title", "practice.hideHint", "sbox.run", "think.checkBtn"]) {
    assert.ok(uiCopy.en[key], `en ${key}`);
    assert.ok(uiCopy.id[key], `id ${key}`);
    assert.notEqual(uiCopy.en[key], uiCopy.id[key], `${key} differs per language`);
  }
  // Proper/technical terms stay untranslated.
  assert.ok(uiCopy.id["sbox.eyebrow"].includes("Python Sandbox"));
  assert.ok(uiCopy.en["sbox.outputNote"].includes("Imports"));
});

// === 11. Mobile pass: narrow-width reflow keeps info, drops redundancy ===
test("narrow layouts reflow crowded rows instead of overflowing", () => {
  const css = read("app/globals.css");
  // Dashboard path module row: segmented bar and module number are redundant
  // at phone width; title, status tag, and count stay.
  assert.match(css, /@media \(max-width: 430px\) \{[\s\S]*\.mod-row \{ grid-template-columns: 16px minmax\(0, 1fr\) auto auto; \}/);
  assert.match(css, /@media \(max-width: 430px\) \{[\s\S]*\.mod-row \.mnum, \.mod-row \.mbar \{ display: none; \}/);
  // Course detail rows already compress at tablet/phone widths.
  assert.match(css, /@media \(max-width: 1120px\) \{\s*\.cmap-mrow \{ grid-template-columns: 18px 30px minmax\(0,1fr\) auto; \}/);
  assert.match(css, /@media \(max-width: 720px\) \{[\s\S]*\.cmap-lesson \{ grid-template-columns: 14px minmax\(0,1fr\) auto; \}/);
  // Course rows keep code/title/status/progress/CTA by stacking instead of squeezing.
  assert.match(css, /\.course-row \{ grid-template-columns: 38px minmax\(0, 1fr\); gap: 10px 12px/);
  assert.match(css, /\.course-row \.course-progress \{ grid-column: 2; justify-content: flex-start; \}/);
  // Phone gutters live on the single owning containers.
  assert.match(css, /\.mast-inner, \.content \{ padding-inline: 18px; \}/);
});

test("mobile search, settings, and FAB surfaces stay inside the viewport", () => {
  const css = read("app/globals.css");
  // Search trigger spans the topbar row, popover tracks content width.
  assert.match(css, /\.top-right \.lsearch-trigger \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /\.lsearch-pill \{ min-width: 0; height: 44px; width: 100%; justify-content: center; \}/);
  // Long status tags wrap instead of colliding with neighbours.
  assert.match(css, /\.mtag \{ white-space: normal; text-align: right; \}/);
  // Settings panels stack their controls and stay within the content column.
  assert.match(css, /\.settings-appearance \{ display: flex; flex-direction: column; gap: 10px; max-width: 420px; \}/);
  assert.match(css, /\.settings-appearance \.switcher button \{ min-height: 38px; padding: 6px 14px; \}/);
  // FAB stays phone-only, safe-area aware, and clear of the page.
  assert.match(css, /\.mobile-fab \{[^}]*bottom: calc\(16px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(css, /\.main \{ padding: 0 0 calc\(112px \+ env\(safe-area-inset-bottom, 0px\)\); \}/);
});

// === 12. Mobile pass 2: lesson, Robin, and practice phones ===
test("lesson/robin/practice touch controls and reflow stay phone-safe", () => {
  const css = read("app/globals.css");
  // Touch targets: companion prompts and lesson/practice navigation hit 44px on coarse pointers.
  assert.match(css, /\.companion-actions a, \.companion-actions button \{ min-height: 44px; \}/);
  assert.match(css, /\.learning-flow-nav \.button, \.practice-nav \.button, \.practice-actions \.button \{ min-height: 44px; \}/);
  // Robin stays secondary on phones: no forced tall bubble, capped conversation.
  assert.match(css, /@media \(max-width: 430px\) \{[\s\S]*\.robin-message \{ min-height: 0; \}/);
  assert.match(css, /@media \(max-width: 430px\) \{[\s\S]*\.robin-conversation \{ max-height: min\(420px, 52vh\); \}/);
  // Code blocks scroll horizontally instead of breaking the layout.
  assert.match(css, /\.code-block pre \{[^}]*overflow-x: auto/);
  assert.match(css, /\.sandbox-output \{[^}]*overflow: auto[^}]*white-space: pre-wrap/);
  // Practice surfaces stack instead of squeezing.
  assert.match(css, /\.sandbox-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(css, /\.thinking-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(css, /\.sandbox-stdin > div \{ flex-direction: column; \}/);
  // Lesson footer spacing clears the floating nav (layout already pads .main).
  assert.match(css, /\.learning-flow-nav \{ padding: 18px 0; gap: 14px; \}/);
});


