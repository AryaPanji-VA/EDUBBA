import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load the engine + types modules via VM, mirroring the quiz-feedback test pattern.
const typesSource = stripTypeScriptTypes(readFileSync(new URL("../lib/mastery/types.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "");
const engineSource = stripTypeScriptTypes(readFileSync(new URL("../lib/mastery/engine.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "");
const combinedSource = typesSource + "\n" + engineSource +
  "\nexports.applyEvidence = applyEvidence;";
const exports = {};
vm.runInNewContext(combinedSource, { exports });
const { applyEvidence } = exports;

function repeat(fn, times) {
  let state = null;
  for (let i = 0; i < times; i++) state = fn(state);
  return state;
}

// === 1. First success → developing ===
test("first correct prediction moves unseen to developing", () => {
  const result = applyEvidence(null, "variables", "assignment", "correct_prediction", "attempt-1");
  assert.equal(result.state, "developing");
  assert.equal(result.evidence_count, 1);
  assert.equal(result.success_count, 1);
  assert.equal(result.struggle_count, 0);
  assert.equal(result.lesson_slug, "variables");
});

// === 2. Repeated success → strong ===
test("three successful predictions with a 2-gap create strong", () => {
  const result = repeat(s => applyEvidence(s, "variables", "assignment", "correct_prediction", `attempt-${s?.evidence_count ?? 0}`), 3);
  assert.equal(result.state, "strong");
  assert.equal(result.success_count, 3);
});

// === 3. Repeated struggle → shaky ===
test("two struggles create shaky", () => {
  const result = repeat(s => applyEvidence(s, "variables", "assignment", "incorrect_prediction", `attempt-${s?.evidence_count ?? 0}`), 2);
  assert.equal(result.state, "shaky");
  assert.equal(result.struggle_count, 2);
});

// === 4. Mixed evidence → developing ===
test("one success and one struggle gives developing", () => {
  let state = applyEvidence(null, "variables", "assignment", "correct_prediction", "a1");
  state = applyEvidence(state, "variables", "assignment", "incorrect_prediction", "a2");
  assert.equal(state.state, "developing");
});

// === 5. One error does not destroy strong ===
test("one incorrect prediction after strong stays developing, not shaky", () => {
  let state = repeat(s => applyEvidence(s, "variables", "assignment", "correct_prediction", `s${s?.evidence_count ?? 0}`), 3);
  assert.equal(state.state, "strong");
  state = applyEvidence(state, "variables", "assignment", "incorrect_prediction", "error-1");
  assert.notEqual(state.state, "shaky");
});

// === 6. Robin Check weights ===
test("robin_check_strong gives success +2", () => {
  const result = applyEvidence(null, "variables", "assignment", "robin_check_strong", "rc-1");
  assert.equal(result.success_count, 2);
  assert.equal(result.evidence_count, 1);
});
test("robin_check_shaky gives struggle +2", () => {
  const result = applyEvidence(null, "variables", "assignment", "robin_check_shaky", "rc-1");
  assert.equal(result.struggle_count, 2);
  assert.equal(result.state, "shaky");
});
test("robin_check_developing gives success +1", () => {
  const result = applyEvidence(null, "variables", "assignment", "robin_check_developing", "rc-1");
  assert.equal(result.success_count, 1);
  assert.equal(result.state, "developing");
});

// === 7. Dedup: same attemptId does not re-record ===
test("same attemptId returns current state unchanged", () => {
  const first = applyEvidence(null, "variables", "assignment", "correct_prediction", "dup-1");
  const second = applyEvidence(first, "variables", "assignment", "correct_prediction", "dup-1");
  assert.equal(second.evidence_count, 1);
  assert.equal(second, first);
});
test("different attemptId records new evidence", () => {
  const first = applyEvidence(null, "variables", "assignment", "correct_prediction", "dup-1");
  const second = applyEvidence(first, "variables", "assignment", "correct_prediction", "dup-2");
  assert.equal(second.evidence_count, 2);
});

// === 8. Invalid inputs rejected ===
test("invalid evidence type throws", () => {
  assert.throws(() => applyEvidence(null, "variables", "assignment", "invalid_evidence", "a1"));
});
test("missing attemptId throws", () => {
  assert.throws(() => applyEvidence(null, "variables", "assignment", "correct_prediction", ""));
});
test("missing lesson slug throws", () => {
  assert.throws(() => applyEvidence(null, "", "assignment", "correct_prediction", "a1"));
});

// === 9. Lesson slug is accepted from caller, not hardcoded ===
test("lesson slug is preserved from caller not defaulted", () => {
  const result = applyEvidence(null, "data-types", "integers", "correct_prediction", "a1");
  assert.equal(result.lesson_slug, "data-types");
  assert.equal(result.concept_key, "integers");
});
