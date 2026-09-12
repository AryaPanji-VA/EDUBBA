import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire, stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const componentCode = swc.transformSync(readFileSync(new URL("../components/smart-feedback.tsx", import.meta.url), "utf8"), {
  filename: "smart-feedback.tsx", jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
}).code;
const helperCode = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/feedback-request.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import .*?;/s, "").replace(/export /g, "") + "\nexports.startFeedbackRequest = startFeedbackRequest;";

// A small effect host runs the actual component, including setup/cleanup replay.
// No network, provider, database or extra test dependencies are used.
function mount() {
  const slots = [], effects = [], calls = [];
  let cursor = 0;
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], (value) => { slots[i] = value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffectEvent(callback) { const ref = react.useRef(callback); ref.current = callback; return (...args) => ref.current(...args); },
    useEffect(setup, deps) {
      const i = cursor++, previous = slots[i];
      if (!previous || deps.some((value, j) => !Object.is(value, previous.deps[j]))) {
        effects.push(() => { previous?.cleanup?.(); slots[i] = { deps, setup, cleanup: setup() }; });
      }
    },
  };
  const helper = {};
  vm.runInNewContext(helperCode, { exports: helper, AbortController, setTimeout, clearTimeout,
    parseQuizFeedbackResult: JSON.parse,
    fetch: (_url, options) => new Promise((resolve, reject) => {
      calls.push({ body: JSON.parse(options.body), signal: options.signal, resolve: () => resolve({ ok: true, json: async () => ({ result: { feedback: "Concept understood.", followUp: null } }) }) });
      options.signal.addEventListener("abort", () => reject(new Error("aborted")));
    }),
  });
  const component = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(componentCode, { exports: component, require(name) {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name.includes("variables-localization")) return { lessonCopy: { en: {}, id: {} } };
    if (name.includes("feedback-request")) return helper;
    throw new Error(`Unexpected import ${name}`);
  } });
  let props = { activityId: "predict", lessonSlug: "variables", language: "en", copy: {}, sourceMode: false, submitted: true, learnerAnswer: "92", attemptId: "attempt-1" };
  return {
    calls,
    render(changes = {}) { props = { ...props, ...changes }; cursor = 0; const view = component.SmartFeedback(props); effects.splice(0).forEach((effect) => effect()); return view; },
    replay() { for (const slot of slots) if (slot?.setup) { slot.cleanup?.(); slot.cleanup = slot.setup(); } },
    cleanup() { for (const slot of slots) slot?.cleanup?.(); },
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("Strict Mode replay sends one valid request and renders completed feedback", async () => {
  const app = mount(); app.render(); app.replay(); await settle();
  assert.equal(app.calls.length, 1);
  assert.equal(app.calls[0].signal.aborted, false);
  assert.equal(app.calls[0].body.attemptId, "attempt-1");
  app.calls[0].resolve(); await settle();
  assert.match(JSON.stringify(app.render()), /Concept understood/);
  app.cleanup();
});

test("language rerender preserves pending request and does not request again", async () => {
  const app = mount(); app.render(); await settle(); app.render({ language: "id" }); await settle();
  assert.equal(app.calls.length, 1); assert.equal(app.calls[0].signal.aborted, false);
  app.calls[0].resolve(); await settle(); app.render({ language: "en" }); await settle();
  assert.equal(app.calls.length, 1); app.cleanup();
});

test("Source Mode prevents requests and cancels pending feedback without replaying evidence", async () => {
  const app = mount(); assert.equal(app.render({ sourceMode: true }), null); await settle();
  assert.equal(app.calls.length, 0);
  app.render({ sourceMode: false }); await settle(); assert.equal(app.calls.length, 1);
  assert.equal(app.render({ sourceMode: true }), null); assert.equal(app.calls[0].signal.aborted, true);
  app.render({ sourceMode: false }); await settle(); assert.equal(app.calls.length, 1);
  app.cleanup();
});

test("stable mounted attempt is reused, while a new retry sends a new attempt", async () => {
  const app = mount(); app.render(); await settle(); app.calls[0].resolve(); await settle();
  app.render(); app.render(); await settle(); assert.equal(app.calls.length, 1);
  app.render({ submitted: false }); app.render({ submitted: true, attemptId: "attempt-2" }); await settle();
  assert.equal(app.calls.length, 2); assert.equal(app.calls[1].body.attemptId, "attempt-2");
  app.cleanup();
});
