import assert from "node:assert/strict";
import test from "node:test";
import { parseRobinReply } from "../lib/robin/parse-reply.ts";

test("parses lesson-grounded JSON", () => {
  assert.deepEqual(parseRobinReply('{"reply":"Assignment mengikat nama.","grounding":"grounded"}'),
    { reply: "Assignment mengikat nama.", grounding: "grounded" });
});
test("parses fenced JSON", () => {
  assert.deepEqual(parseRobinReply('\x60\x60\x60json\n{"reply":"Penjelasan.","grounding":"general"}\n\x60\x60\x60'),
    { reply: "Penjelasan.", grounding: "general" });
});
test("plain text falls back to general", () => {
  assert.deepEqual(parseRobinReply("  Ini jawaban biasa.  "),
    { reply: "Ini jawaban biasa.", grounding: "general" });
});
test("malformed JSON falls back to general text", () => {
  assert.equal(parseRobinReply('{"reply":"Belum tertutup').grounding, "general");
});
test("unknown or missing grounding never becomes grounded", () => {
  for (const grounding of ["verified", null, undefined]) {
    assert.equal(parseRobinReply(JSON.stringify({ reply: "Answer", grounding })).grounding, "general");
  }
});
test("empty and non-answer JSON fail safely", () => {
  for (const text of [" ", "null", "[]", "{}", '{"reply":42}', '{"reply":""}']) {
    assert.throws(() => parseRobinReply(text));
  }
});
test("bounds an overlong reply and downgrades its grounding", () => {
  const result = parseRobinReply(JSON.stringify({ reply: "x".repeat(3001), grounding: "grounded" }));
  assert.equal(result.reply.length, 3000);
  assert.equal(result.grounding, "general");
});
test("JSON strings are general knowledge", () => {
  assert.deepEqual(parseRobinReply('"Simple explanation"'),
    { reply: "Simple explanation", grounding: "general" });
});
