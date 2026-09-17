import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Practice exercise registry + definition validation (Phase 11B).
function strip(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadModule(path, exportsNames, shims = {}) {
  const exports = {};
  vm.runInNewContext(strip(path) + exportsNames.map((name) => `\nexports.${name}=${name};`).join(""), {
    exports,
    require: (name) => {
      if (name in shims) return shims[name];
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}

function loadExerciseSet(path, exportName) {
  // Exercise content files only carry type imports, which are stripped.
  return loadModule(path, [exportName])[exportName];
}

function loadRegistry() {
  const variables = loadExerciseSet("../content/practice/python/variables-exercises.ts", "variablesPracticeExercises");
  const dataTypes = loadExerciseSet("../content/practice/python/data-types-exercises.ts", "dataTypesPracticeExercises");
  const operators = loadExerciseSet("../content/practice/python/operators-exercises.ts", "operatorsPracticeExercises");
  const conditionals = loadExerciseSet("../content/practice/python/conditionals-exercises.ts", "conditionalsPracticeExercises");
  const loops = loadExerciseSet("../content/practice/python/loops-exercises.ts", "loopsPracticeExercises");
  const functions = loadExerciseSet("../content/practice/python/functions-exercises.ts", "functionsPracticeExercises");
  return loadModule("../lib/practice/registry.ts", ["getPracticeTrack", "getPracticeExercise", "isRegisteredPracticeTrack"], {
    "@/content/practice/python/variables-exercises": { variablesPracticeExercises: variables },
    "@/content/practice/python/data-types-exercises": { dataTypesPracticeExercises: dataTypes },
    "@/content/practice/python/operators-exercises": { operatorsPracticeExercises: operators },
    "@/content/practice/python/conditionals-exercises": { conditionalsPracticeExercises: conditionals },
    "@/content/practice/python/loops-exercises": { loopsPracticeExercises: loops },
    "@/content/practice/python/functions-exercises": { functionsPracticeExercises: functions },
  });
}

// Lesson mastery vocabularies the practice exercises must stay inside.
const masteryByLesson = {
  variables: loadExerciseSet("../content/lessons/programming/variables-mastery.ts", "variablesMasteryConfig").concepts,
  "data-types": loadExerciseSet("../content/lessons/programming/data-types-mastery.ts", "dataTypesMasteryConfig").concepts,
  operators: loadExerciseSet("../content/lessons/programming/operators-mastery.ts", "operatorsMasteryConfig").concepts,
  conditionals: loadExerciseSet("../content/lessons/programming/conditionals-mastery.ts", "conditionalsMasteryConfig").concepts,
  loops: loadExerciseSet("../content/lessons/programming/loops-mastery.ts", "loopsMasteryConfig").concepts,
  functions: loadExerciseSet("../content/lessons/programming/functions-mastery.ts", "functionsMasteryConfig").concepts,
};

function allExercises() {
  const registry = loadRegistry();
  return registry.getPracticeTrack("python").topics.flatMap((topic) => topic.exercises);
}

test("registry exposes the python track with all lesson topics and finds exercises by id", () => {
  const registry = loadRegistry();
  assert.equal(registry.isRegisteredPracticeTrack("python"), true);
  assert.equal(registry.isRegisteredPracticeTrack("rust"), false);
  const track = registry.getPracticeTrack("python");
  assert.deepEqual(Array.from(track.topics.map((topic) => topic.lessonSlug)), ["variables", "data-types", "operators", "conditionals", "loops", "functions"]);
  assert.equal(track.topics[0].exercises.length, 6);
  assert.equal(track.topics[1].exercises.length, 6);
  assert.equal(track.topics[2].exercises.length, 6);
  assert.equal(track.topics[3].exercises.length, 6);
  assert.equal(track.topics[4].exercises.length, 6);
  assert.equal(track.topics[5].exercises.length, 6);
  for (const topic of track.topics) {
    for (const exercise of topic.exercises) {
      // Cross-realm vm objects: compare by identity of the id, not deep reference.
      assert.equal(registry.getPracticeExercise(exercise.id)?.id, exercise.id);
    }
  }
  assert.equal(registry.getPracticeExercise("missing-exercise"), null);
});

test("exercise definitions are complete, unique, and type-consistent", () => {
  const exercises = allExercises();
  const ids = new Set(exercises.map((exercise) => exercise.id));
  assert.equal(ids.size, exercises.length);
  for (const exercise of exercises) {
    assert.match(exercise.id, /^(variables|data-types|operators|conditionals|loops|functions)-(predict|fix|write)-\d$/);
    assert.ok(["predict_output", "fix_code", "write_code"].includes(exercise.type));
    assert.equal(exercise.language, "python");
    assert.ok(exercise.prompt.trim(), `${exercise.id} needs a prompt`);
    assert.ok(exercise.hint.trim(), `${exercise.id} needs an offline hint`);
    assert.ok(exercise.explanation.trim(), `${exercise.id} needs an explanation`);
    if (exercise.type === "predict_output") {
      assert.ok(exercise.expectedOutput?.trim(), `${exercise.id} needs an expected output`);
      assert.ok(exercise.code?.trim(), `${exercise.id} needs code to read`);
      assert.ok(!exercise.requiredPatterns?.length, `${exercise.id} must not carry code patterns`);
    } else {
      assert.ok(exercise.requiredPatterns?.length, `${exercise.id} needs required patterns`);
      if (exercise.type === "fix_code") assert.ok(exercise.starterCode?.trim(), `${exercise.id} needs broken starter code`);
    }
  }
});

test("mastery concepts stay inside the grounded lesson's mastery vocabulary", () => {
  for (const exercise of allExercises()) {
    const allowed = masteryByLesson[exercise.lessonSlug];
    assert.ok(allowed, `${exercise.id} grounds in an unregistered lesson`);
    for (const concept of exercise.masteryConcepts) {
      assert.ok(allowed.includes(concept), `${exercise.id} uses unknown concept ${concept}`);
    }
    assert.ok(exercise.masteryConcepts.length > 0, `${exercise.id} records no mastery evidence`);
  }
});

test("every required pattern compiles, matches its sample solution, and rejects the broken starter", () => {
  for (const exercise of allExercises()) {
    for (const pattern of exercise.requiredPatterns ?? []) {
      let regex;
      assert.doesNotThrow(() => { regex = new RegExp(pattern.source); }, `${exercise.id} pattern must compile`);
      assert.ok(exercise.sampleSolution, `${exercise.id} needs a sample solution anchor`);
      assert.match(exercise.sampleSolution.replace(/\r\n/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").trim(), regex,
        `${exercise.id} pattern must match its sample solution`);
    }
    if (exercise.starterCode) {
      // Not every pattern targets the bug ("keep printing total" legitimately
      // matches the broken starter) — but the broken code must not already pass.
      const broken = exercise.starterCode.replace(/\r\n/g, "\n").trim();
      const allMatch = (exercise.requiredPatterns ?? []).every((pattern) => new RegExp(pattern.source).test(broken));
      assert.equal(allMatch, false, `${exercise.id} broken starter must not already pass all patterns`);
    }
  }
});

test("misconception vocabulary never tags a correct answer", () => {
  for (const exercise of allExercises()) {
    for (const entry of exercise.misconceptionPatterns ?? []) {
      let regex;
      assert.doesNotThrow(() => { regex = new RegExp(entry.source); }, `${exercise.id} misconception pattern must compile`);
      assert.doesNotMatch(exercise.sampleSolution.replace(/\r\n/g, "\n").trim(), regex,
        `${exercise.id} must not tag its sample solution as a misconception`);
      assert.ok(entry.note.trim(), `${exercise.id} misconception needs an offline note`);
    }
    for (const entry of exercise.misconceptionOutputs ?? []) {
      assert.notEqual(entry.output, exercise.expectedOutput, `${exercise.id} must not tag the expected output`);
      assert.ok(entry.note.trim(), `${exercise.id} misconception output needs an offline note`);
    }
  }
});

test("the set covers all three exercise types for every topic", () => {
  const exercises = allExercises();
  for (const lessonSlug of ["variables", "data-types", "operators", "conditionals", "loops", "functions"]) {
    const set = exercises.filter((exercise) => exercise.lessonSlug === lessonSlug);
    for (const type of ["predict_output", "fix_code", "write_code"]) {
      assert.equal(set.filter((exercise) => exercise.type === type).length, 2, `${lessonSlug} needs 2 ${type}`);
    }
  }
});
