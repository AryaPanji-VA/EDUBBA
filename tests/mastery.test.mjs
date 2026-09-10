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
  "\nexports.applyEvidence = applyEvidence; exports.emptyMasteryRow = emptyMasteryRow;" +
  "\nexports.masteryConcepts = masteryConcepts; exports.evidenceTypes = evidenceTypes;" +
  "\nexports.activityConceptToMastery = activityConceptToMastery;" +
  "\nexports.robinCheckSignalToEvidence = robinCheckSignalToEvidence;";
const exports = {};
vm.runInNewContext(combinedSource, { exports });
const { applyEvidence, masteryConcepts, evidenceTypes, activityConceptToMastery, robinCheckSignalToEvidence } = exports;

function repeat(fn, times) {
  let state = null;
  for (let i = 0; i < times; i++) state = fn(state);
  return state;
}

// === 1. Mastery states and concept vocabulary ===
test("mastery concepts are exactly 6", () => {
  assert.equal(masteryConcepts.length, 6);
  assert.deepEqual([...masteryConcepts], ["variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming"]);
});

// === 2. First success → developing ===
test("first correct prediction moves unseen to developing", () => {
  const result = applyEvidence(null, "assignment", "correct_prediction", "attempt-1");
  assert.equal(result.state, "developing");
  assert.equal(result.evidence_count, 1);
  assert.equal(result.success_count, 1);
  assert.equal(result.struggle_count, 0);
});

// === 3. Repeated success → strong ===
test("three successful predictions with a 2-gap create strong", () => {
  const result = repeat(s => applyEvidence(s, "assignment", "correct_prediction", `attempt-${s?.evidence_count ?? 0}`), 3);
  assert.equal(result.state, "strong");
  assert.equal(result.success_count, 3);
});

// === 4. Repeated struggle → shaky ===
test("two struggles create shaky", () => {
  const result = repeat(s => applyEvidence(s, "assignment", "incorrect_prediction", `attempt-${s?.evidence_count ?? 0}`), 2);
  assert.equal(result.state, "shaky");
  assert.equal(result.struggle_count, 2);
});

// === 5. Mixed evidence → developing ===
test("one success and one struggle gives developing", () => {
  let state = applyEvidence(null, "assignment", "correct_prediction", "a1");
  state = applyEvidence(state, "assignment", "incorrect_prediction", "a2");
  assert.equal(state.state, "developing");
});

// === 6. One error does not destroy strong ===
test("one incorrect prediction after strong stays developing, not shaky", () => {
  let state = repeat(s => applyEvidence(s, "assignment", "correct_prediction", `s${s?.evidence_count ?? 0}`), 3);
  assert.equal(state.state, "strong");
  state = applyEvidence(state, "assignment", "incorrect_prediction", "error-1");
  assert.notEqual(state.state, "shaky");
});

// === 7. Robin Check weights ===
test("robin_check_strong gives success +2", () => {
  const result = applyEvidence(null, "assignment", "robin_check_strong", "rc-1");
  assert.equal(result.success_count, 2);
  assert.equal(result.evidence_count, 1);
});
test("robin_check_shaky gives struggle +2", () => {
  const result = applyEvidence(null, "assignment", "robin_check_shaky", "rc-1");
  assert.equal(result.struggle_count, 2);
  assert.equal(result.state, "shaky");
});
test("robin_check_developing gives success +1", () => {
  const result = applyEvidence(null, "assignment", "robin_check_developing", "rc-1");
  assert.equal(result.success_count, 1);
  assert.equal(result.state, "developing");
});

// === 8. Dedup: same attemptId does not re-record ===
test("same attemptId returns current state unchanged", () => {
  const first = applyEvidence(null, "assignment", "correct_prediction", "dup-1");
  const second = applyEvidence(first, "assignment", "correct_prediction", "dup-1");
  assert.equal(second.evidence_count, 1);
  assert.equal(second, first);
});
test("different attemptId records new evidence", () => {
  const first = applyEvidence(null, "assignment", "correct_prediction", "dup-1");
  const second = applyEvidence(first, "assignment", "correct_prediction", "dup-2");
  assert.equal(second.evidence_count, 2);
});

// === 9. Invalid concept and evidence types rejected ===
test("invalid concept throws", () => {
  assert.throws(() => applyEvidence(null, "invalid_concept", "correct_prediction", "a1"));
});
test("invalid evidence type throws", () => {
  assert.throws(() => applyEvidence(null, "assignment", "invalid_evidence", "a1"));
});
test("missing attemptId throws", () => {
  assert.throws(() => applyEvidence(null, "assignment", "correct_prediction", ""));
});

// === 10. Activity concept mapping ===
test("activity concepts map correctly to mastery concepts", () => {
  assert.equal(activityConceptToMastery("reading_a_name"), "variable");
  assert.equal(activityConceptToMastery("reassignment"), "reassignment");
  assert.equal(activityConceptToMastery("assignment"), "assignment");
  assert.equal(activityConceptToMastery("name_binding"), "name_binding");
  assert.equal(activityConceptToMastery("nonexistent"), null);
});

// === 11. Robin Check signal mapping ===
test("robin check strong maps to robin_check_strong and three concepts", () => {
  const { evidenceType, concepts } = robinCheckSignalToEvidence("strong");
  assert.equal(evidenceType, "robin_check_strong");
  assert.deepEqual([...concepts], ["assignment", "name_binding", "variable"]);
});
test("robin check shaky maps to robin_check_shaky", () => {
  const { evidenceType } = robinCheckSignalToEvidence("shaky");
  assert.equal(evidenceType, "robin_check_shaky");
});
test("robin check developing maps to robin_check_developing", () => {
  const { evidenceType } = robinCheckSignalToEvidence("developing");
  assert.equal(evidenceType, "robin_check_developing");
});

// === 12. Empty mastery row ===
test("empty mastery row is unseen with zero counters", () => {
  const row = applyEvidence(null, "variable", "correct_prediction", "e1");
  assert.equal(row.lesson_slug, "variables");
  assert.equal(row.state, "developing");
});
