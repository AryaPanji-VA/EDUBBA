import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function source(path, exports) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "") + exports.map((name) => `\nexports.${name} = ${name};`).join("");
}

test("mastery read and write errors are safely logged; a failed read never overwrites evidence", async () => {
  for (const failAt of ["read", "write"]) {
    const warnings = [], writes = [];
    const query = {
      select() { return this; }, eq() { return this; },
      async maybeSingle() { return { data: null, error: failAt === "read" ? { message: "private error" } : null }; },
      async upsert(row) { writes.push(row); return { error: { message: "private error" } }; },
    };
    const exports = {};
    vm.runInNewContext(source("../lib/mastery/server.ts", ["recordEvidence", "loadMasteryContext"]), {
      exports, URL, process: { env: { NODE_ENV: "development" } }, console: { warn: (message) => warnings.push(message) },
      require(name) {
        if (name.includes("memory-server")) return { createMemorySupabaseClient: () => ({ from: () => query }) };
        if (name === "./engine") return { applyEvidence: () => ({ lesson_slug: "variables" }) };
        if (name === "./types") return { masteryConcepts: ["variable"] };
        throw new Error(name);
      },
    });
    await exports.recordEvidence("variables", "variable", "correct_prediction", "attempt");
    assert.equal(writes.length, failAt === "read" ? 0 : 1);
    assert.deepEqual(warnings, ["[ROBIN MASTERY] Evidence recording unavailable; learning continues."]);
    assert.equal(await exports.loadMasteryContext(new Request("https://public.example/api/robin/chat")), "");
  }
});

test("mastery GET returns the summary without caching and safely rejects unsupported lessons", async () => {
  const exports = {};
  vm.runInNewContext(source("../app/api/learning/mastery/route.ts", ["GET"]), {
    exports, URL, Response, require: () => ({ requireLocalMastery() {}, loadMasterySummary: async (lesson) => ({ lesson, concepts: [] }) }),
  });
  const response = await exports.GET(new Request("http://localhost/api/learning/mastery?lesson=variables"));
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { lesson: "variables", concepts: [] });
  assert.equal((await exports.GET(new Request("http://localhost/api/learning/mastery?lesson=other"))).status, 400);
});
