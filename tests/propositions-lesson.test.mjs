import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 14B: Propositions and Connectives golden lesson tests.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

// Load real lesson content and infrastructure modules.
const { propositionsLessonContent } = loadModule("content/lessons/discrete-math/propositions.ts");
const { propositionsActivities } = loadModule("content/lessons/discrete-math/propositions-activities.ts");
const { propositionsMasteryConfig } = loadModule("content/lessons/discrete-math/propositions-mastery.ts");
const { propositionsRelevance } = loadModule("content/lessons/discrete-math/propositions-relevance.ts");
const { gradeActivity } = loadModule("lib/robin/quiz-feedback.ts");

// === 1. Content scope: proposition, truth value, negation, conjunction, disjunction ===
test("Propositions content covers the requested beginner scope and nothing more", () => {
  assert.equal(propositionsLessonContent.slug, "propositions");
  assert.equal(propositionsLessonContent.codeExamples.length, 4);
  assert.ok(propositionsLessonContent.keyTerms.length >= 6);
  assert.ok(propositionsLessonContent.commonMistakes.length >= 4);
  assert.equal(propositionsLessonContent.quickChecks.length, 3);
  const text = JSON.stringify(propositionsLessonContent);
  for (const token of ["proposition", "truth", "¬", "∧", "∨", "truth table", "inclusive"]) {
    assert.match(text, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `scope must mention ${token}`);
  }
  // Out of scope: implication, biconditional, quantifiers, sets, proofs, De Morgan.
  for (const forbidden of ["implication", "biconditional", "quantifier", "∀", "∃", "De Morgan", "proof technique"]) {
    assert.doesNotMatch(text, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `scope must not include ${forbidden}`);
  }
  for (const check of propositionsLessonContent.quickChecks) assert.ok(check.options.includes(check.answer));
});

// === 2. Learning flow: 15 activities, existing types only, no new primitives ===
test("Propositions learning flow uses only existing activity primitives", () => {
  assert.equal(propositionsActivities.length, 15);
  assert.deepEqual(Array.from(propositionsActivities.map((activity) => activity.type)), [
    "intro", "explain", "example", "predict", "predict", "example", "practice",
    "example", "predict", "example", "predict", "practice", "formalize", "robin_check", "connect",
  ]);
  assert.equal(new Set(propositionsActivities.map((activity) => activity.id)).size, 15);
  assert.ok(propositionsActivities.some((activity) => activity.type === "robin_check"));
  assert.ok(propositionsActivities.some((activity) => activity.type === "connect"));
});

// === 3. Deterministic grading: proposition identification ===
test("proposition identification grading is deterministic with per-answer misconceptions", () => {
  const identify = propositionsActivities.find((activity) => activity.id === "identify");
  const correct = gradeActivity(identify, "2 + 2 = 4");
  assert.equal(correct.isCorrect, true);
  assert.equal(correct.likelyMisconception, null);
  const command = gradeActivity(identify, "Close the door!");
  assert.equal(command.isCorrect, false);
  assert.equal(command.likelyMisconception, "command_is_proposition");
  const question = gradeActivity(identify, "Where do you live?");
  assert.equal(question.isCorrect, false);
  assert.equal(question.likelyMisconception, "question_is_proposition");
});

// === 4. Deterministic grading: false statements are still propositions ===
test("truth-value grading detects the proposition_requires_true misconception", () => {
  const truthValue = propositionsActivities.find((activity) => activity.id === "truth-value");
  assert.equal(gradeActivity(truthValue, "A proposition with truth value F").isCorrect, true);
  const wrong = gradeActivity(truthValue, "Not a proposition, because it is false");
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.likelyMisconception, "proposition_requires_true");
});

// === 5. Deterministic grading: negation practice accepts normalized answers ===
test("negation practice accepts true/false and benar/salah, rejects the rest", () => {
  const tryNegation = propositionsActivities.find((activity) => activity.id === "try-negation");
  for (const answer of ["false", "FALSE", "False", " false ", "salah", "SALAH"]) {
    assert.equal(tryNegation.checkAnswer(answer), true, `"${answer}" must be accepted`);
  }
  for (const answer of ["true", "benar", "T", "F", "", "not false", "¬p"]) {
    assert.equal(tryNegation.checkAnswer(answer), false, `"${answer}" must be rejected`);
  }
});

// === 6. Deterministic grading: conjunction ===
test("conjunction grading is deterministic and flags and_requires_one_true", () => {
  const predict = propositionsActivities.find((activity) => activity.id === "predict-conjunction");
  assert.equal(gradeActivity(predict, "false").isCorrect, true);
  const wrong = gradeActivity(predict, "true");
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.likelyMisconception, "and_requires_one_true");
  assert.equal(gradeActivity(predict, "It cannot be determined").isCorrect, false);
});

// === 7. Deterministic grading: disjunction ===
test("disjunction grading is deterministic and flags or_is_exclusive", () => {
  const predict = propositionsActivities.find((activity) => activity.id === "predict-disjunction");
  assert.equal(gradeActivity(predict, "true").isCorrect, true);
  const wrong = gradeActivity(predict, "false");
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.likelyMisconception, "or_is_exclusive");
  const tryDisjunction = propositionsActivities.find((activity) => activity.id === "try-disjunction");
  for (const answer of ["true", "TRUE", " true ", "benar", "Benar"]) {
    assert.equal(tryDisjunction.checkAnswer(answer), true, `"${answer}" must be accepted`);
  }
  for (const answer of ["false", "salah", "", "maybe"]) {
    assert.equal(tryDisjunction.checkAnswer(answer), false, `"${answer}" must be rejected`);
  }
});

// === 8. Misconception taxonomy stays lesson-owned and closed ===
test("every activity misconception maps into the lesson feedback vocabulary", () => {
  const registry = read("lib/lessons/registry.ts");
  const allowedMatch = registry.match(/propositionsDefinition[\s\S]*?feedback: \{[\s\S]*?misconceptions: \[([^\]]+)\]/);
  assert.ok(allowedMatch, "propositions feedback misconceptions must be declared");
  const allowed = [...allowedMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(allowed, ["command_is_proposition", "question_is_proposition", "proposition_requires_true", "and_requires_one_true", "or_is_exclusive"]);
  for (const activity of propositionsActivities) {
    for (const misconception of Object.values(activity.misconceptionsByAnswer ?? {})) {
      assert.ok(allowed.includes(misconception), `activity ${activity.id} uses undeclared misconception ${misconception}`);
    }
  }
});

// === 9. Robin Check configuration ===
test("Robin Check config evaluates the conjunction explain-back with the existing signal schema", () => {
  const registry = read("lib/lessons/registry.ts");
  const defMatch = registry.match(/const propositionsDefinition[\s\S]*?^};/m);
  assert.ok(defMatch);
  const defSource = defMatch[0];
  assert.match(defSource, /question: "Kalau p bernilai true dan q bernilai false[^"]*p ∧ q[^"]*"/);
  assert.match(defSource, /concepts: \["proposition", "truth_value", "conjunction"\]/);
  assert.match(defSource, /misconceptions: \["and_requires_one_true", "and_confused_with_or"\]/);
  assert.match(defSource, /rubric: propositionsCheckInstructions/);

  const rubric = read("content/lessons/discrete-math/propositions-check-instructions.ts");
  assert.match(rubric, /Return only JSON/);
  assert.match(rubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(rubric, /and_requires_one_true/);
  assert.match(rubric, /and_confused_with_or/);
  assert.match(rubric, /If misconceptions is non-empty, signal must be shaky/);
  assert.match(rubric, /Judge meaning, not wording/);
  // AI never decides objective correctness — the rubric is explain-back only.
  assert.match(rubric, /Robin Check for the beginner Propositions lesson/);
});

// === 10. Mastery configuration ===
test("mastery tracks exactly the five taught concepts with deterministic evidence", () => {
  const concepts = Array.from(propositionsMasteryConfig.concepts);
  assert.deepEqual(concepts, ["proposition", "truth_value", "negation", "conjunction", "disjunction"]);
  const mapped = new Set();
  for (const activity of propositionsActivities) {
    const concept = propositionsMasteryConfig.activityConceptToMastery(activity.concept);
    if (concept === null) continue;
    assert.ok(concepts.includes(concept), `${activity.concept} maps to unknown concept ${concept}`);
    mapped.add(concept);
  }
  // Every concept receives evidence from at least one activity.
  for (const concept of concepts) assert.ok(mapped.has(concept), `${concept} has no evidence source`);
  // Only structural summary activities map to null.
  assert.equal(propositionsMasteryConfig.activityConceptToMastery("formal_definitions"), null);
  assert.equal(propositionsMasteryConfig.activityConceptToMastery("connections"), null);
  assert.equal(propositionsMasteryConfig.activityConceptToMastery("not-a-thing"), null);

  const strong = propositionsMasteryConfig.robinCheckSignalToEvidence("strong");
  assert.equal(strong.evidenceType, "robin_check_strong");
  assert.deepEqual(Array.from(strong.concepts), ["proposition", "truth_value", "conjunction"]);
  assert.equal(propositionsMasteryConfig.robinCheckSignalToEvidence("shaky").evidenceType, "robin_check_shaky");

  // Relevance stays inside the concept vocabulary.
  for (const concept of [...propositionsRelevance.checkConcepts(), ...propositionsRelevance.chatConcepts("jelasin p ∧ q dan benar salah")]) {
    assert.ok(concepts.includes(concept), `relevance leaked ${concept}`);
  }
  assert.equal(propositionsRelevance.chatConcepts("how do for loops repeat code").length, 0);
  assert.equal(propositionsRelevance.chatConcepts("apa itu variable").length, 0);
});

// === 11. Source Mode: the lesson stays fully usable without AI ===
test("the lesson is AI-independent: definitions, notation, truth tables, and deterministic activities", () => {
  assert.ok(propositionsLessonContent.academicExplanation.length >= 3);
  const exampleText = propositionsLessonContent.codeExamples.map((example) => example.code).join("\n");
  assert.ok(exampleText.includes("p │ ¬p"));
  assert.ok(exampleText.includes("p │ q │ p ∧ q"));
  assert.ok(exampleText.includes("p │ q │ p ∨ q"));
  for (const table of ["T │ T │ T", "T │ F │ F", "F │ T │ F", "F │ F │ F"]) {
    assert.ok(exampleText.includes(table), `truth table must list row ${table}`);
  }
  // Every objective activity is deterministically checkable offline.
  for (const activity of propositionsActivities) {
    if (activity.type === "predict") {
      assert.ok(activity.options && activity.options.length >= 2, `${activity.id} needs options`);
      assert.ok(activity.options.includes(activity.correctAnswer), `${activity.id} needs a valid correctAnswer`);
    }
    if (activity.type === "practice") {
      assert.equal(typeof activity.checkAnswer, "function", `${activity.id} needs a lesson-owned checker`);
    }
  }
});

// === 12. Cross-course generalization: trusted course resolution ===
test("the progress API resolves course ownership from the registry, never from hardcoded values", () => {
  const route = read("app/api/learning/progress/route.ts");
  assert.match(route, /loadProgress\(localUserId, definition\.courseSlug, lesson\)/);
  assert.match(route, /input\.courseSlug !== definition\.courseSlug/);
  assert.doesNotMatch(route, /loadProgress\("programming"/);
  assert.doesNotMatch(route, /courseSlug !== "programming"/);
  assert.doesNotMatch(route, /discrete-math/);
});

test("Robin chat log previews use the trusted registry course, never a hardcoded one", () => {
  const chat = read("app/api/robin/chat/route.ts");
  assert.match(chat, /courseSlug: definition\.courseSlug/);
  assert.doesNotMatch(chat, /courseSlug: "programming"/);
});

// === 13. Curriculum structure: ROBIN provenance, honest labels ===
test("the Logic Foundations structure is declared with robin provenance under discrete-math", () => {
  const manifest = loadModule("data/curriculum-manifest.ts").currentCurriculumManifest;
  const discreteMath = manifest.semesters[0].courses.find((course) => course.slug === "discrete-math");
  const logicFoundations = discreteMath.modules.find((module) => module.slug === "logic-foundations");
  assert.equal(logicFoundations.provenance.sourceType, "robin");
  const propositions = logicFoundations.lessons.find((lesson) => lesson.slug === "propositions");
  assert.equal(propositions.provenance.sourceType, "robin");
  // The course itself remains official; only the learning structure is robin.
  assert.equal(discreteMath.provenance.sourceType, "official");
  // Phase 15: all six other courses declare their own robin-provenance
  // structure — the Propositions golden lesson keeps its original slot.
  assert.equal(propositions.position, 1);
});

// === 14. The Phase 15 structure SQL matches the ingestion generator output ===
test("phase15 structure SQL matches the Phase 13.3 ingestion generator output", () => {
  const manifestModule = loadModule("data/curriculum-manifest.ts");
  const { currentCurriculumManifest, curriculumProvenanceSourceTypes } = manifestModule;
  const { validateCurriculumManifest } = loadModule("lib/curriculum/validation.ts", { curriculumProvenanceSourceTypes });
  const { diffCurriculumManifest } = loadModule("lib/curriculum/diff.ts");
  const { generateCurriculumApplySql } = loadModule("lib/curriculum/apply-sql.ts", {
    validateCurriculumManifest,
    diffCurriculumManifest,
  });

  // Snapshot: the database as of Phase 14B — only logic-foundations/propositions
  // existed outside programming.
  const incoming = JSON.parse(JSON.stringify(currentCurriculumManifest));
  const snapshot = JSON.parse(JSON.stringify(currentCurriculumManifest));
  for (const course of snapshot.semesters[0].courses) {
    if (course.slug === "programming") continue;
    if (course.slug === "discrete-math") {
      const logic = course.modules.find((module) => module.slug === "logic-foundations");
      course.modules = logic ? [logic] : [];
      if (logic) logic.lessons = logic.lessons.filter((lesson) => lesson.slug === "propositions");
    } else {
      course.modules = [];
    }
  }

  const result = generateCurriculumApplySql(incoming, snapshot);
  assert.equal(result.ok, true);
  assert.deepEqual({ ...result.planned }, { semesters: 0, courses: 0, modules: 6, lessons: 16 });
  const sqlFile = read("database/phase15-semester1-structure.sql");
  assert.equal(sqlFile, result.sql);
  // Additive and idempotent by construction.
  assert.match(sqlFile, /on conflict \(course_id, slug\) do nothing/);
  assert.match(sqlFile, /on conflict \(module_id, slug\) do nothing/);
  assert.doesNotMatch(sqlFile, /\bdrop\b|\bdelete\b|\btruncate\b|\balter\s+table\b|\bupdate\s+public\./i);
  // Existing Programming structure is never touched.
  assert.doesNotMatch(sqlFile, /'programming'/);
});

// === 15. Sources SQL follows the established idempotent pattern ===
test("propositions sources SQL is idempotent, discrete-math scoped, and honest", () => {
  const sql = read("database/phase14b-propositions-sources.sql");
  assert.match(sql, /on conflict \(url\) do update/);
  assert.match(sql, /on conflict \(lesson_id, source_id\) do update/);
  assert.match(sql, /c\.slug = 'discrete-math'/);
  assert.match(sql, /m\.slug = 'logic-foundations'/);
  assert.match(sql, /l\.slug = 'propositions'/);
  assert.match(sql, /REQUIRES database\/phase14b-propositions-structure\.sql/);
  assert.doesNotMatch(sql, /'programming'/);
  // The loader tolerates sources being absent (lesson usable before seeding).
  const loader = read("lib/lessons/propositions.ts");
  assert.match(loader, /const sources: LessonSource\[\] = \[\]/);
  assert.match(loader, /if \(sourceLinks\.length > 0\)/);
});

// === 16. Course navigation and lesson routes follow existing conventions ===
test("discrete-math course navigation and the propositions route follow existing conventions", () => {
  const route = read("app/api/lessons/propositions/route.ts");
  assert.match(route, /loadPropositionsLesson/);
  const page = read("app/courses/discrete-math/propositions/page.tsx");
  assert.match(page, /PropositionsLesson/);
  const coursePage = read("app/courses/discrete-math/page.tsx");
  assert.match(coursePage, /DiscreteMathCourseClient/);
  const component = read("components/propositions-lesson.tsx");
  assert.match(component, /useProgress\("propositions", activities, "discrete-math"\)/);
  assert.match(component, /RobinCheck lessonSlug="propositions"/);
  assert.match(component, /RobinCompanion lessonSlug="propositions"/);
  assert.match(component, /LearningLogOffer lessonSlug="propositions"/);
  assert.match(component, /sourceMode/);
  const courseClient = read("components/discrete-math-course-client.tsx");
  assert.match(courseClient, /href=\{`\/courses\/discrete-math\/\$\{currentLesson\.slug\}`\}/);
  // The shared overview loader is used by both course API routes.
  const programmingRoute = read("app/api/courses/programming/route.ts");
  const discreteRoute = read("app/api/courses/discrete-math/route.ts");
  assert.match(programmingRoute, /loadCourseOverview\("programming"\)/);
  assert.match(discreteRoute, /loadCourseOverview\("discrete-math"\)/);
  assert.match(discreteRoute, /phase14b-propositions-structure\.sql/);
});

// === 17. The course page is truthful: no fake progress, no fake content ===
test("the discrete-math course page shows only real persisted progress", () => {
  const client = read("components/discrete-math-course-client.tsx");
  assert.match(client, /completed_at/);
  assert.match(client, /progress\?lesson=/);
  assert.doesNotMatch(client, /progress: 16/);
  assert.doesNotMatch(client, /coursePresentationBySlug/);
  // No Programming-only tools are wired into the math course page.
  assert.doesNotMatch(client, /python-sandbox|practice-lab|PracticeLab|ThinkingLab/);
});

// === 18. Programming-only tools stay Programming-only ===
test("no Programming-only practice or sandbox content references propositions", () => {
  for (const file of ["lib/practice/registry.ts", "content/practice/thinking/activities.ts", "content/sandbox/python-starters.ts", "lib/practice/progress-registry.ts"]) {
    const source = read(file);
    assert.doesNotMatch(source, /propositions/, `${file} must not reference propositions`);
  }
  // The thinking registry lesson vocabulary stays programming-scoped.
  const thinkingTypes = read("content/practice/thinking/types.ts");
  assert.doesNotMatch(thinkingTypes, /propositions/);
});

// === 19. Programming behavior is unchanged by the generalization ===
test("the shared renderer keeps the python code-block default and copy-driven labels", () => {
  const renderer = read("components/lesson-activity-renderer.tsx");
  assert.match(renderer, /copy\.codeLabel \?\? "python"/);
  // Programming lessons do not define codeLabel, so they keep "python".
  for (const file of ["content/lessons/programming/operators-localization.ts", "content/lessons/programming/conditionals-localization.ts"]) {
    const source = read(file);
    assert.doesNotMatch(source, /codeLabel/, `${file} must not override the python default`);
  }
  const localization = read("content/lessons/discrete-math/propositions-localization.ts");
  assert.match(localization, /codeLabel: "notasi"/);
  assert.match(localization, /oneLine: "Jawaban kamu \(true \/ false\)"/);
});

test("all Programming lessons keep their registry course identity", () => {
  const registry = read("lib/lessons/registry.ts");
  const programming = [...registry.matchAll(/courseSlug: "programming"/g)].length;
  assert.equal(programming, 6);
  // Phase 15: 7 non-programming lessons use the factory (16 standard lessons
  // + propositions written explicitly).
  const discrete = [...registry.matchAll(/courseSlug: "discrete-math"/g)].length;
  assert.equal(discrete, 3);
  const designThinking = [...registry.matchAll(/courseSlug: "design-thinking"/g)].length;
  assert.equal(designThinking, 3);
  const hci = [...registry.matchAll(/courseSlug: "hci"/g)].length;
  assert.equal(hci, 3);
  const algorithms = [...registry.matchAll(/courseSlug: "algorithms"/g)].length;
  assert.equal(algorithms, 3);
  const parallel = [...registry.matchAll(/courseSlug: "parallel"/g)].length;
  assert.equal(parallel, 2);
  const networking = [...registry.matchAll(/courseSlug: "networking"/g)].length;
  assert.equal(networking, 3);
  // The flat-registry global uniqueness constraint is documented.
  assert.match(registry, /globally unique/);
});
