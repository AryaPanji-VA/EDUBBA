import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 15: Semester 1 content expansion — architecture + representative content.

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

const grade = loadModule("lib/robin/quiz-feedback.ts");

// === 1. All seven Semester 1 courses resolve with implemented lessons ===
test("all seven courses have implemented lessons and overview routes", () => {
  const courseData = read("data/courses.ts");
  const implementedMap = loadModule("data/courses.ts");
  const expected = {
    programming: 16, "discrete-math": 3, "design-thinking": 3, hci: 3, algorithms: 3, parallel: 2, networking: 3,
  };
  for (const [slug, count] of Object.entries(expected)) {
    const list = implementedMap.implementedLessonSlugsByCourse[slug];
    assert.ok(Array.isArray(list) && list.length === count, `${slug} must list ${count} implemented lessons`);
    assert.ok(implementedMap.courseOverviewRouteBySlug[slug], `${slug} must have an overview route`);
  }
  assert.equal(Object.keys(implementedMap.implementedLessonSlugsByCourse).length, 7);
  // The map matches the per-course lists exactly.
  assert.deepEqual(implementedMap.implementedLessonSlugsByCourse["discrete-math"], implementedMap.implementedDiscreteMathLessonSlugs);
  assert.deepEqual(implementedMap.implementedLessonSlugsByCourse.networking, implementedMap.implementedNetworkingLessonSlugs);
  // Lesson slugs are globally unique across courses (flat registry constraint).
  const allSlugs = Object.values(implementedMap.implementedLessonSlugsByCourse).flat();
  assert.equal(new Set(allSlugs).size, allSlugs.length);
  void courseData;
});

// === 2. defaultCurrentLesson is map-derived, not hardcoded ===
test("the fallback current lesson derives from the implemented map, never a hardcoded course", () => {
  const courses = loadModule("data/courses.ts");
  assert.equal(courses.defaultCurrentLesson.courseSlug, "programming");
  // Phase 20.1A: the beginner onboarding lesson is the map-derived entry point.
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming");
  const source = read("data/courses.ts");
  assert.match(source, /firstImplemented/);
  assert.doesNotMatch(source, /courseSlug: "programming",\s*\n\s*lessonSlug: "variables"/);
  // The progress hook uses it without a hardcoded course.
  const hook = read("lib/progress/use-current-lesson.ts");
  assert.match(hook, /defaultCurrentLesson/);
  assert.doesNotMatch(hook, /courseSlug: "programming"/);
  const server = read("lib/progress/server.ts");
  assert.match(server, /defaultCurrentLesson/);
  assert.doesNotMatch(server, /courseSlug: "programming"/);
});

// === 3. Fake progress is gone; real progress derives from persistence ===
test("no presentation-fallback progress values remain in course data", () => {
  const courseData = read("data/courses.ts");
  for (const fake of ["progress: 36", "progress: 22", "progress: 16"]) {
    assert.doesNotMatch(courseData, new RegExp(fake.replace(/:/, ": ")), `fallback ${fake} must be gone`);
  }
  // All static courses now carry an honest neutral baseline.
  assert.match(courseData, /progress: 0, lessons: 11, status: "Not started"/);
  // The API derives real progress from persisted completion.
  const api = read("app/api/courses/route.ts");
  assert.match(api, /loadCompletedLessonCountsByCourse/);
  assert.match(api, /completedCount > 0 \? "In progress" : "Not started"/);
});

// === 4. Generic routes validate trusted course ownership ===
test("generic course and lesson routes validate registry-trusted ownership", () => {
  const lessonPage = read("app/courses/[courseSlug]/[lessonSlug]/page.tsx");
  assert.match(lessonPage, /definition\.courseSlug !== courseSlug/);
  assert.match(lessonPage, /notFound\(\)/);
  assert.match(lessonPage, /getLessonDisplay/);
  const lessonApi = read("app/api/lessons/[lessonSlug]/route.ts");
  assert.match(lessonApi, /getLessonDefinition\(lessonSlug\)/);
  assert.match(lessonApi, /definition\.loadLesson\(\)/);
  const coursePage = read("app/courses/[courseSlug]/page.tsx");
  assert.match(coursePage, /implementedLessonSlugsByCourse\[courseSlug\]/);
  assert.match(coursePage, /notFound\(\)/);
  // Static routes remain for the golden lessons and existing URLs.
  const page = read("app/courses/programming/variables/page.tsx");
  assert.match(page, /VariablesLesson/);
});

// === 5. The generic lesson client drives every standard lesson ===
test("the LessonClient uses display data, progress, Source Mode, and the shared renderer", () => {
  const client = read("components/lesson-client.tsx");
  assert.match(client, /getLessonDisplay\(lessonSlug\)/);
  assert.match(client, /useProgress\(lessonSlug, activities, courseSlug\)/);
  assert.match(client, /sourceMode/);
  assert.match(client, /RobinCheck lessonSlug=\{lessonSlug\}/);
  assert.match(client, /RobinCompanion lessonSlug=\{lessonSlug\}/);
  assert.match(client, /LearningLogOffer lessonSlug=\{lessonSlug\}/);
  assert.match(client, /LessonActivityRenderer/);
});

// === 6. The display registry covers every registered lesson, and nothing else ===
test("the display registry covers exactly the implemented lessons", () => {
  const display = read("lib/lessons/display.ts");
  const implemented = loadModule("data/courses.ts");
  const allSlugs = Object.values(implemented.implementedLessonSlugsByCourse).flat();
  for (const slug of allSlugs) {
    assert.match(display, new RegExp(`\\["${slug}",`), `display registry must cover ${slug}`);
  }
  // No unimplemented lesson has display data.
  const entryCount = [...display.matchAll(/^  \["([a-z-]+)",/gm)].length;
  assert.equal(entryCount, allSlugs.length);
});

// === 7. Generic course client is used by the five new courses ===
test("the five new courses are served by the generic route and client", () => {
  const client = read("components/generic-course-client.tsx");
  assert.match(client, /implementedLessonSlugsByCourse\[courseSlug\]/);
  assert.match(client, /\/api\/courses\/\$\{encodeURIComponent\(courseSlug\)\}/);
  assert.match(client, /completed_at/);
  assert.doesNotMatch(client, /progress: 16|coursePresentationBySlug/);
  // The dynamic course route serves the five new courses — no static pages,
  // no bespoke clients.
  const dynamicRoute = read("app/courses/[courseSlug]/page.tsx");
  assert.match(dynamicRoute, /GenericCourseClient/);
  assert.match(dynamicRoute, /implementedLessonSlugsByCourse\[courseSlug\]/);
  for (const forbidden of ["DesignThinkingCourseClient", "HciCourseClient", "AlgorithmsCourseClient", "ParallelCourseClient", "NetworkingCourseClient"]) {
    assert.doesNotMatch(read("components/generic-course-client.tsx"), new RegExp(forbidden));
  }
  // Static routes remain for programming and discrete-math.
  assert.match(read("app/courses/programming/page.tsx"), /ProgrammingCourseClient/);
  assert.match(read("app/courses/discrete-math/page.tsx"), /DiscreteMathCourseClient/);
});

// === 8. Representative deterministic grading: discrete math ===
test("implication and sets grading is deterministic with misconception mapping", () => {
  const { implicationActivities } = loadModule("content/lessons/discrete-math/implication-activities.ts");
  const falseCase = implicationActivities.find((activity) => activity.id === "predict-false-case");
  assert.equal(grade.gradeActivity(falseCase, "false").isCorrect, true);
  const missed = grade.gradeActivity(falseCase, "true");
  assert.equal(missed.isCorrect, false);
  assert.equal(missed.likelyMisconception, "false_case_missed");
  const vacuous = implicationActivities.find((activity) => activity.id === "predict-vacuous");
  const rejected = grade.gradeActivity(vacuous, "false");
  assert.equal(rejected.isCorrect, false);
  assert.equal(rejected.likelyMisconception, "vacuous_truth_rejected");

  const { setsIntroActivities } = loadModule("content/lessons/discrete-math/sets-intro-activities.ts");
  const elementVsSubset = setsIntroActivities.find((activity) => activity.id === "predict-element-vs-subset");
  const confused = grade.gradeActivity(elementVsSubset, "true — because 2 is in A");
  assert.equal(confused.isCorrect, false);
  assert.equal(confused.likelyMisconception, "element_subset_confusion");
  const tryMembership = setsIntroActivities.find((activity) => activity.id === "try");
  assert.equal(tryMembership.checkAnswer("true"), true);
  assert.equal(tryMembership.checkAnswer("benar "), true);
  assert.equal(tryMembership.checkAnswer("false"), false);
});

// === 9. Representative deterministic grading: design thinking ===
test("design thinking grading classifies iteration and human-centered answers", () => {
  const { whatIsDesignThinkingActivities } = loadModule("content/lessons/design-thinking/what-is-design-thinking-activities.ts");
  const iteration = whatIsDesignThinkingActivities.find((activity) => activity.id === "predict-linear");
  const linear = grade.gradeActivity(iteration, "Yes — completing the stages in order is the whole process");
  assert.equal(linear.isCorrect, false);
  assert.equal(linear.likelyMisconception, "linear_pipeline_confusion");
  assert.equal(grade.gradeActivity(iteration, "No — tests send you back to earlier stages; it is a loop").isCorrect, true);
  const start = whatIsDesignThinkingActivities.find((activity) => activity.id === "try");
  assert.equal(start.checkAnswer("orang"), true);
  assert.equal(start.checkAnswer("pengguna"), true);
  assert.equal(start.checkAnswer(" USER "), true);
  assert.equal(start.checkAnswer("aplikasi"), false);

  const { empathyAndDefineActivities } = loadModule("content/lessons/design-thinking/empathy-and-define-activities.ts");
  const classify = empathyAndDefineActivities.find((activity) => activity.id === "predict-classify");
  const wrong = grade.gradeActivity(classify, "B — it describes visible behavior");
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.likelyMisconception, "observation_assumption_confusion");
});

// === 10. Representative deterministic grading: HCI ===
test("HCI grading attributes failure to the interface, not the user", () => {
  const { hciIntroActivities } = loadModule("content/lessons/hci/hci-intro-activities.ts");
  const blame = hciIntroActivities.find((activity) => activity.id === "predict-blame");
  const blaming = grade.gradeActivity(blame, "The users are indecisive shoppers");
  assert.equal(blaming.isCorrect, false);
  assert.equal(blaming.likelyMisconception, "blame_the_user");
  assert.equal(grade.gradeActivity(blame, "The screen has a design problem — that many users share only the interface").isCorrect, true);

  const { affordancesAndFeedbackActivities } = loadModule("content/lessons/hci/affordances-and-feedback-activities.ts");
  const silence = affordancesAndFeedbackActivities.find((activity) => activity.id === "predict-silence");
  const silent = grade.gradeActivity(silence, "Confidently move on, assuming success");
  assert.equal(silent.isCorrect, false);
  assert.equal(silent.likelyMisconception, "silence_confusion");
});

// === 11. Representative deterministic grading: algorithms ===
test("algorithm grading traces mechanically and names growth", () => {
  const { pseudocodeAndTracingActivities } = loadModule("content/lessons/algorithms/pseudocode-and-tracing-activities.ts");
  const update = pseudocodeAndTracingActivities.find((activity) => activity.id === "predict-trace");
  assert.equal(grade.gradeActivity(update, "7").isCorrect, true);
  const guard = pseudocodeAndTracingActivities.find((activity) => activity.id === "predict-no-update");
  const failed = grade.gradeActivity(guard, "5 — the assignment always runs");
  assert.equal(failed.isCorrect, false);
  assert.equal(failed.likelyMisconception, "trace_condition_failed");
  const fullTrace = pseudocodeAndTracingActivities.find((activity) => activity.id === "try");
  assert.equal(fullTrace.checkAnswer("7"), true);
  assert.equal(fullTrace.checkAnswer("4"), false);

  const { efficiencyIntuitionActivities } = loadModule("content/lessons/algorithms/efficiency-intuition-activities.ts");
  const binary = efficiencyIntuitionActivities.find((activity) => activity.id === "predict-binary");
  const linearGuess = grade.gradeActivity(binary, "About half a million");
  assert.equal(linearGuess.isCorrect, false);
  assert.equal(linearGuess.likelyMisconception, "linear_assumption");
  const growth = efficiencyIntuitionActivities.find((activity) => activity.id === "try");
  assert.equal(growth.checkAnswer("linear"), true);
  assert.equal(growth.checkAnswer("linier"), true);
});

// === 12. Representative deterministic grading: parallel and networking ===
test("parallel and networking grading checks dependencies and roles", () => {
  const { sequentialVsParallelActivities } = loadModule("content/lessons/parallel/sequential-vs-parallel-activities.ts");
  const split = sequentialVsParallelActivities.find((activity) => activity.id === "predict-independence");
  const dependent = grade.gradeActivity(split, "The sauce and the onions it requires — start both now");
  assert.equal(dependent.isCorrect, false);
  assert.equal(dependent.likelyMisconception, "dependency_ignored");
  const amdahl = sequentialVsParallelActivities.find((activity) => activity.id === "predict-amdahl");
  const unbounded = grade.gradeActivity(amdahl, "Unboundedly faster");
  assert.equal(unbounded.isCorrect, false);
  assert.equal(unbounded.likelyMisconception, "amdahl_ignored");

  const { whatIsANetworkActivities } = loadModule("content/lessons/networking/what-is-a-network-activities.ts");
  const protocol = whatIsANetworkActivities.find((activity) => activity.id === "predict-protocol");
  const memory = grade.gradeActivity(protocol, "Yes — the cable carries meaning by itself");
  assert.equal(memory.isCorrect, false);
  assert.equal(memory.likelyMisconception, "connection_equals_communication");
  const router = whatIsANetworkActivities.find((activity) => activity.id === "try");
  assert.equal(router.checkAnswer("router"), true);
  assert.equal(router.checkAnswer("switch"), false);

  const { clientServerAndLayersActivities } = loadModule("content/lessons/networking/client-server-and-layers-activities.ts");
  const initiator = clientServerAndLayersActivities.find((activity) => activity.id === "predict-initiator");
  const serverFirst = grade.gradeActivity(initiator, "The server — it pushes pages to browsers");
  assert.equal(serverFirst.isCorrect, false);
  assert.equal(serverFirst.likelyMisconception, "server_initiates_confusion");
});

// === 13. Every standard lesson has the standard shape ===
test("every standard lesson has the standard learning shape and AI-independent structure", () => {
  const files = [
    ["content/lessons/discrete-math/implication-activities.ts", "implicationActivities"],
    ["content/lessons/discrete-math/sets-intro-activities.ts", "setsIntroActivities"],
    ["content/lessons/design-thinking/what-is-design-thinking-activities.ts", "whatIsDesignThinkingActivities"],
    ["content/lessons/design-thinking/empathy-and-define-activities.ts", "empathyAndDefineActivities"],
    ["content/lessons/design-thinking/ideate-prototype-test-activities.ts", "ideatePrototypeTestActivities"],
    ["content/lessons/hci/hci-intro-activities.ts", "hciIntroActivities"],
    ["content/lessons/hci/affordances-and-feedback-activities.ts", "affordancesAndFeedbackActivities"],
    ["content/lessons/hci/interface-evaluation-activities.ts", "interfaceEvaluationActivities"],
    ["content/lessons/algorithms/what-is-an-algorithm-activities.ts", "whatIsAnAlgorithmActivities"],
    ["content/lessons/algorithms/pseudocode-and-tracing-activities.ts", "pseudocodeAndTracingActivities"],
    ["content/lessons/algorithms/efficiency-intuition-activities.ts", "efficiencyIntuitionActivities"],
    ["content/lessons/parallel/sequential-vs-parallel-activities.ts", "sequentialVsParallelActivities"],
    ["content/lessons/parallel/distributed-basics-activities.ts", "distributedBasicsActivities"],
    ["content/lessons/networking/what-is-a-network-activities.ts", "whatIsANetworkActivities"],
    ["content/lessons/networking/packets-and-protocols-activities.ts", "packetsAndProtocolsActivities"],
    ["content/lessons/networking/client-server-and-layers-activities.ts", "clientServerAndLayersActivities"],
  ];
  for (const [path, exportName] of files) {
    const { [exportName]: activities } = loadModule(path);
    assert.ok(activities.length >= 9, `${path} needs a complete flow (${activities.length})`);
    assert.equal(new Set(activities.map((activity) => activity.id)).size, activities.length, `${path} needs unique ids`);
    assert.ok(activities.some((activity) => activity.type === "robin_check"), `${path} needs a Robin Check`);
    assert.ok(activities.some((activity) => activity.type === "connect"), `${path} needs a connect`);
    assert.ok(activities.some((activity) => activity.type === "formalize"), `${path} needs a formalize`);
    // Source Mode: every objective activity is deterministically checkable.
    for (const activity of activities) {
      if (activity.type === "predict") {
        assert.ok(activity.options?.includes(activity.correctAnswer), `${path}:${activity.id} needs a valid correctAnswer`);
      }
      if (activity.type === "practice") {
        assert.equal(typeof activity.checkAnswer, "function", `${path}:${activity.id} needs a checker`);
      }
    }
    // Only the existing activity types are used.
    for (const activity of activities) {
      assert.ok(["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"].includes(activity.type), `${path}:${activity.id} uses unknown type ${activity.type}`);
    }
  }
});

// === 14. Programming-only tools remain Programming-only ===
test("no Programming-only tool references the new lessons", () => {
  for (const file of ["lib/practice/registry.ts", "content/practice/thinking/activities.ts", "content/sandbox/python-starters.ts", "lib/practice/progress-registry.ts"]) {
    const source = read(file);
    for (const slug of ["implication", "sets-intro", "what-is-design-thinking", "empathy-and-define", "ideate-prototype-test", "hci-intro", "affordances-and-feedback", "interface-evaluation", "what-is-an-algorithm", "pseudocode-and-tracing", "efficiency-intuition", "sequential-vs-parallel", "distributed-basics", "what-is-a-network", "packets-and-protocols", "client-server-and-layers"]) {
      assert.doesNotMatch(source, new RegExp(`["']${slug}["']`), `${file} must not reference ${slug}`);
    }
  }
});

// === 15. Provenance: every Phase 15 structure entry is robin ===
test("every Phase 15 manifest entry declares robin provenance under official courses", () => {
  const manifest = loadModule("data/curriculum-manifest.ts").currentCurriculumManifest;
  const semester1 = manifest.semesters[0];
  for (const course of semester1.courses) {
    assert.equal(course.provenance.sourceType, "official", `${course.slug} course stays official`);
    if (course.slug === "programming") continue;
    for (const module of course.modules) {
      assert.equal(module.provenance.sourceType, "robin");
      for (const lesson of module.lessons) {
        assert.equal(lesson.provenance.sourceType, "robin");
      }
    }
  }
  // Semesters 2-8 remain empty.
  for (const semester of manifest.semesters.slice(1)) {
    assert.equal(semester.courses.length, 0);
  }
});

// === 16. The phase15 SQL is the generator's ADD-only output ===
test("phase15 structure SQL adds 6 modules and 16 lessons idempotently", () => {
  const sql = read("database/phase15-semester1-structure.sql");
  assert.match(sql, /^begin;/);
  assert.match(sql, /commit;/);
  assert.match(sql, /Planned: 0 semesters, 0 courses, 6 modules, 16 lessons\./);
  const inserts = (sql.match(/insert into/g) ?? []).length;
  const conflicts = (sql.match(/on conflict .* do nothing/g) ?? []).length;
  assert.equal(inserts, conflicts);
  assert.doesNotMatch(sql, /\bdrop\b|\bdelete\b|\btruncate\b|\bupdate\s+public\./i);
  assert.doesNotMatch(sql, /'programming'/);
  // Sources SQL is idempotent and covers every lesson.
  const sources = read("database/phase15-semester1-sources.sql");
  assert.match(sources, /on conflict \(url\) do update/);
  assert.match(sources, /on conflict \(lesson_id, source_id\) do update/);
  assert.match(sources, /REQUIRES database\/phase15-semester1-structure\.sql/);
  for (const slug of ["implication", "sets-intro", "what-is-design-thinking", "empathy-and-define", "ideate-prototype-test", "hci-intro", "affordances-and-feedback", "interface-evaluation", "what-is-an-algorithm", "pseudocode-and-tracing", "efficiency-intuition", "sequential-vs-parallel", "distributed-basics", "what-is-a-network", "packets-and-protocols", "client-server-and-layers"]) {
    assert.match(sources, new RegExp(`'${slug}'`), `sources must cover ${slug}`);
  }
});

// === 17. Loaders reference the phase15 SQL for setup errors ===
test("standard lesson loaders point to the phase15 SQL for structure errors", () => {
  for (const file of ["lib/lessons/implication.ts", "lib/lessons/what-is-design-thinking.ts", "lib/lessons/hci-intro.ts", "lib/lessons/what-is-an-algorithm.ts", "lib/lessons/sequential-vs-parallel.ts", "lib/lessons/what-is-a-network.ts"]) {
    const source = read(file);
    assert.match(source, /phase15-semester1-structure\.sql/, `${file} must name the setup SQL`);
    assert.match(source, /const sources: LessonSource\[\] = \[\]/, `${file} tolerates empty sources`);
    assert.match(source, /if \(sourceLinks\.length > 0\)/);
  }
});

// === 18. Unknown lessons fail safely on the generic route ===
test("unknown or mismatched lesson/course pairs fail closed", () => {
  const registrySource = read("lib/lessons/registry.ts");
  assert.match(registrySource, /registry\.get\(slug\) \?\? null/);
  // The generic API 404s on unregistered lessons.
  const lessonApi = read("app/api/lessons/[lessonSlug]/route.ts");
  assert.match(lessonApi, /Lesson not registered\./);
});
