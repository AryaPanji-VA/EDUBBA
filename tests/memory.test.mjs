import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";

// Run the pure TypeScript modules without a new test-runner dependency.
function load(relativePath, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const code = stripTypeScriptTypes(source, { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/import "server-only";/g, '')
    .replace(/export (const|function|class|async function) (\w+)/g, '$1 $2')
    + "\nObject.assign(exports, {" + [...source.matchAll(/export (?:const|function|class|async function) (\w+)/g)].map((match) => match[1]).join(",") + "});";
  const exports = {};
  vm.runInNewContext(code, { ...globals, exports, require: (name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}
const types = load("../lib/memory/types.ts");
const { parseMemoryCommand: parse } = load("../lib/memory/commands.ts", { "./types": types });

test("explicit preferences and learning commands", () => {
  for (const [message, key, value] of [
    ["bin inget ya gue lebih gampang ngerti kalau lu kasih analogi dulu", "explanation_style", "analogy-first"],
    ["inget gue lebih suka contoh kode dulu", "explanation_style", "code-first"],
    ["jawaban pendek dulu lebih enak, inget ya", "answer_length", "concise"],
    ["bin catet gue masih suka ketuker assignment sama comparison", "assignment_vs_comparison", "shaky"],
    ["bin assignment sama comparison sekarang udah aman, inget ya", "assignment_vs_comparison", "understood"],
    ["bin catet gue masih bingung name binding", "name_binding", "struggling"],
  ]) {
    const command = parse(message);
    assert.equal(command.type, "save");
    assert.equal(command.memory.key, key);
    assert.equal(command.memory.value, value);
    assert.ok(types.validateMemory(command.memory));
  }
});
test("forget is exact and bounded", () => {
  assert.equal(parse("bin lupain preference analogi gue").value, "analogy-first");
  assert.equal(parse("hapus memory soal answer length").key, "answer_length");
  assert.equal(parse("jangan inget variables udah aman").type, "forget");
  for (const message of ["hapus memory gue", "lupain analogi dan jawaban pendek", "jangan hapus analogi", "lupain bukan analogi", "hapus analogi dan simpan formal"]) {
    assert.equal(parse(message).type, "clarify");
  }
});
test("ordinary conversation never writes", () => {
  for (const message of ["bin function apaan?", "gue suka analogi", "variables udah aman", "jangan analogi dulu, jelasin formal"]) {
    assert.equal(parse(message).type, "normal");
  }
});
test("sensitive, negated, quoted and ambiguous intent does not write", () => {
  for (const message of ["inget password gue analogi", "inget gue nggak suka analogi", 'contoh: "inget analogi"', "inget analogi?", "inget analogi dan formal", "inget alamat rumah gue", "inget variables belum paham dan udah aman"]) {
    assert.equal(parse(message).type, "clarify");
  }
});
test("API vocabulary rejects arbitrary fields and inconsistent learning status", () => {
  const valid = { category: "preference", key: "explanation_style", value: "analogy-first", status: null };
  assert.ok(types.validateMemory(valid));
  for (const input of [null, [], { ...valid, category: "secret" }, { ...valid, value: "arbitrary personal text" }, { ...valid, sql: "DELETE" }, { ...valid, key: "__proto__" }, { category: "learning", key: "variables", value: "understood", status: "shaky" }]) {
    assert.equal(types.validateMemory(input), null);
  }
});

test("privileged credentials prefer the modern key and retain legacy fallback", () => {
  for (const [env, expected] of [
    [{ SUPABASE_SECRET_KEY: " test-modern " }, "test-modern"],
    [{ SUPABASE_SERVICE_ROLE_KEY: " test-legacy " }, "test-legacy"],
    [{ SUPABASE_SECRET_KEY: "test-modern", SUPABASE_SERVICE_ROLE_KEY: "test-legacy" }, "test-modern"],
    [{ SUPABASE_SECRET_KEY: "  ", SUPABASE_SERVICE_ROLE_KEY: "test-legacy" }, "test-legacy"],
  ]) {
    let received;
    const client = load("../lib/supabase/memory-server.ts", {
      "@supabase/supabase-js": { createClient: (_url, key) => { received = key; return {}; } },
    }, { process: { env: { SUPABASE_URL: "https://example.invalid", ...env } } });
    client.createMemorySupabaseClient();
    assert.equal(received, expected);
  }
});

test("missing credentials never reach Supabase and ordinary context fails safely", async () => {
  let calls = 0;
  const client = load("../lib/supabase/memory-server.ts", {
    "@supabase/supabase-js": { createClient: () => { calls++; throw new Error("must not call"); } },
  }, { process: { env: { SUPABASE_URL: "https://example.invalid" } } });
  assert.throws(() => client.createMemorySupabaseClient(), /setup required/);
  assert.equal(calls, 0);
  const server = load("../lib/memory/server.ts", {
    "@/lib/supabase/memory-server": client, "./types": types,
  }, { process: { env: { NODE_ENV: "development" } }, URL, Response });
  const request = new Request("http://localhost:3000/api/robin/memory");
  assert.match(await server.loadMemoryContext(request), /unavailable/);
  await assert.rejects(server.listMemories());
  assert.equal(server.memoryFailure(new Error("private upstream details")).status, 503);
  assert.doesNotMatch(await server.memoryFailure(new Error("private upstream details")).text(), /private upstream/);
  for (const bad of [new Request("https://public.example/api/robin/memory"), new Request(request, { headers: { origin: "https://other.example" } })]) {
    assert.throws(() => server.requireLocalMemory(bad));
  }
  const production = load("../lib/memory/server.ts", {
    "@/lib/supabase/memory-server": client, "./types": types,
  }, { process: { env: { NODE_ENV: "production" } }, URL, Response });
  assert.throws(() => production.requireLocalMemory(request));
  assert.equal(calls, 0);
});
