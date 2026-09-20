import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.6 — Module 06 (Collections) journey audit. The four lessons must
// read as one progressive journey with clean conceptual ownership:
// Scope Basics → Lists → Dictionaries → Tuples → Sets → Module 07 · Errors.
// The grouped mastery row derives from the same persisted lessonStates as
// every other row, and no locking is reintroduced.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/import "[^"]+";/g, "")
    .replace(/export type \{[^}]+\};/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name}=${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

const journeys = [
  ["lists", "Dictionaries"],
  ["dictionaries", "Tuples"],
  ["tuples", "Sets"],
  ["sets", "Errors"],
];

const contents = {
  lists: loadModule("content/lessons/programming/lists-activities.ts").listsActivities,
  dictionaries: loadModule("content/lessons/programming/dictionaries-activities.ts").dictionariesActivities,
  tuples: loadModule("content/lessons/programming/tuples-activities.ts").tuplesActivities,
  sets: loadModule("content/lessons/programming/sets-activities.ts").setsActivities,
};

// === 1. Every Module 06 connect follows the roadmap ===
test("each Module 06 connect hands off to the next roadmap lesson", () => {
  for (const [slug, next] of journeys) {
    const connect = contents[slug].find((a) => a.type === "connect");
    assert.ok(connect, `${slug} has a connect activity`);
    assert.match(connect.content[0], new RegExp(next), `${slug} must hand off to ${next}`);
  }
  // Scope Basics (Module 05) already hands off to Lists.
  const scope = loadModule("content/lessons/programming/scope-basics-activities.ts").scopeBasicsActivities;
  const connect = scope.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Lists/);
});

// === 2. Conceptual ownership: one collection model per lesson ===
test("ownership stays clean: ordered vs keyed vs fixed vs unique", () => {
  // Lists: one ordered collection, zero-based, mutable. No dict/set content.
  const listText = contents.lists.map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(listText, /names\[1\] = /);
  assert.match(listText, /names\[0\]/);
  assert.doesNotMatch(listText, /{"[a-z]+":/, "no dictionary teaching in Lists");
  assert.doesNotMatch(listText, /\(10, 20\)/, "no tuple teaching in Lists");
  // Dictionaries: key → value with the list contrast; no tuple/set teaching.
  const dictText = contents.dictionaries.map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(dictText, /student\["name"\]|student\[\\"name\\"\]|key/i);
  assert.doesNotMatch(dictText, /\(10, 20\)/, "no tuple teaching in Dictionaries");
  // Tuples: fixed items vs mutable list; no set teaching.
  const tupleText = contents.tuples.map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(tupleText, /point = \(10, 20\)/);
  assert.doesNotMatch(tupleText, /\{\\"python\\"|"python" in tags/, "no set teaching in Tuples");
  // Sets: uniqueness + membership, never positional, no order promise.
  const setText = contents.sets.map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(setText, /unique|unik|duplicat|duplikat|collaps/i);
  assert.match(setText, /tags\[0\]/, "the invalid positional access is named");
});

// === 3. All four lessons are genuinely new, standard registrations ===
test("Module 06 lessons follow the standard registration architecture", () => {
  const registry = read("lib/lessons/registry.ts");
  for (const [slug, definition] of [
    ["lists", "listsDefinition"],
    ["dictionaries", "dictionariesDefinition"],
    ["tuples", "tuplesDefinition"],
    ["sets", "setsDefinition"],
  ]) {
    assert.match(registry, new RegExp(`\\["${slug}",\\s*${definition}\\]`), `${slug} registered`);
  }
  // sets (programming) stays distinct from the discrete-math sets-intro.
  assert.match(registry, /\["sets-intro",\s*setsIntroDefinition\]/);
  const courses = read("data/courses.ts");
  assert.match(courses, /"lists"/);
  assert.match(courses, /"sets"/);
});

// === 4. Roadmap order, grouped mastery row, and no-lock behavior ===
test("Module 06 order, grouped mastery row, and no-lock availability", () => {
  const courses = loadModule("data/courses.ts");
  const list = Array.from(courses.implementedProgrammingLessonSlugs);
  const module06 = list.slice(list.indexOf("lists"), list.indexOf("sets") + 1);
  assert.deepEqual(module06, ["lists", "dictionaries", "tuples", "sets"]);
  assert.equal(list[list.indexOf("scope-basics") + 1], "lists", "Lists follows Scope Basics");
  assert.equal(list[list.indexOf("sets") + 1], "try-except-basics", "Errors / Try Except Basics follows Sets");

  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 06 · Collections/);
  const groups = [...client.matchAll(/group: \[([\s\S]*?)\]/g)].map((match) => match[1]);
  assert.equal(groups.length, 7, "seven module groups exist");
  assert.deepEqual(
    groups[5].match(/"[a-z-]+"/g).map((token) => token.slice(1, -1)),
    ["lists", "dictionaries", "tuples", "sets"],
    "the Module 06 group has exactly the four Collections lessons",
  );
  // The group state derives from the shared persisted lessonStates — the same
  // source as Modules 01–05, no parallel progress, no hardcoded completion.
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion values");

  // The migration is metadata-safe: insert-only, no deletes, no resets.
  const migration = read("database/phase20-6-module06.sql");
  for (const slug of ["lists", "dictionaries", "tuples", "sets"]) {
    assert.match(migration, new RegExp(`'${slug}'`));
  }
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from|truncate|drop /i, "migration must never delete data");
});
