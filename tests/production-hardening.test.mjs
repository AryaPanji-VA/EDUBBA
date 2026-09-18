import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadGate(env) {
  const source = stripTypeScriptTypes(read("lib/dev/gate.ts"), { mode: "transform" })
    .replace('import "server-only";', "")
    .replace(/export /g, "") + "\nexports.devToolsEnabled = devToolsEnabled;";
  const exports = {};
  vm.runInNewContext(source, { exports, process: { env }, Response });
  return exports.devToolsEnabled;
}

test("production dev tools are deny-by-default with an explicit opt-in", () => {
  assert.equal(loadGate({ NODE_ENV: "development" })(), true);
  assert.equal(loadGate({ NODE_ENV: "production" })(), false);
  assert.equal(loadGate({ NODE_ENV: "production", ENABLE_DEV_TOOLS: "false" })(), false);
  assert.equal(loadGate({ NODE_ENV: "production", ENABLE_DEV_TOOLS: "true" })(), true);
});

test("the dev page and diagnostic APIs all use the shared gate", () => {
  const devPage = read("app/dev/page.tsx");
  assert.match(devPage, /if \(!devToolsEnabled\(\)\) notFound\(\)/);
  assert.doesNotMatch(devPage, /9Inference/);

  for (const route of ["app/api/db-test/route.ts", "app/api/hello/route.ts"]) {
    const source = read(route);
    assert.match(source, /if \(!devToolsEnabled\(\)\) return devToolsDisabledResponse\(\)/);
  }
});

test("baseline security headers are configured globally", () => {
  const config = read("next.config.ts");
  assert.match(config, /X-Content-Type-Options[\s\S]*nosniff/);
  assert.match(config, /Referrer-Policy[\s\S]*strict-origin-when-cross-origin/);
  assert.match(config, /X-Frame-Options[\s\S]*DENY/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /source: "\/:path\*"/);
});

test("production documentation states the preview and authentication limits", () => {
  const docs = read("docs/phase19-2-production-hardening.md");
  assert.match(docs, /preview\/demo/);
  assert.match(docs, /not real authentication/);
  assert.match(docs, /Do not enable production persistence/);
});
