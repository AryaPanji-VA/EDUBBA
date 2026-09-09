import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import { variablesActivities } from "../content/lessons/programming/variables-activities.ts";
import { variablesLessonContent } from "../content/lessons/programming/variables.ts";

// Resolve the existing extensionless content import without another test dependency.
const source = stripTypeScriptTypes(readFileSync(new URL("../content/lessons/variables-localization.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{ variablesActivities \} from "[^"]+";/, "")
  .replace(/export /g, "") + "\nexports.getVariablesActivities = getVariablesActivities; exports.lessonCopy = lessonCopy; exports.localizeVariablesContent = localizeVariablesContent;";
const exports = {};
vm.runInNewContext(source, { exports, variablesActivities });

test("ID and EN change prose without changing exercise identity or grading", () => {
  const id = exports.getVariablesActivities("id");
  const en = exports.getVariablesActivities("en");
  assert.equal(id.length, 9);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title);
  }
  assert.equal(id[4].optionLabels["92 and 110"], "92 dan 110");
  assert.equal(Object.keys(exports.lessonCopy.id).sort().join(","), Object.keys(exports.lessonCopy.en).sort().join(","));
});

test("supplemental code and deterministic Quick Check answers remain unchanged", () => {
  const id = exports.localizeVariablesContent(variablesLessonContent, "id");
  for (let index = 0; index < id.codeExamples.length; index++) assert.equal(id.codeExamples[index].code, variablesLessonContent.codeExamples[index].code);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.equal(id.quickChecks[index].code, variablesLessonContent.quickChecks[index].code);
    assert.equal(id.quickChecks[index].answer, variablesLessonContent.quickChecks[index].answer);
    assert.deepEqual(id.quickChecks[index].options, variablesLessonContent.quickChecks[index].options);
    assert.notEqual(id.quickChecks[index].question, variablesLessonContent.quickChecks[index].question);
  }
});
