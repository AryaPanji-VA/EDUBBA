import assert from "node:assert/strict";
import test from "node:test";
import { variablesActivities } from "../content/lessons/programming/variables-activities.ts";

const tryActivity = variablesActivities.find((activity) => activity.id === "try");

test("the golden lesson has nine ordered activities and unique IDs", () => {
  assert.deepEqual(variablesActivities.map((activity) => activity.type), ["intro", "explain", "predict", "example", "predict", "practice", "formalize", "robin_check", "connect"]);
  assert.equal(new Set(variablesActivities.map((activity) => activity.id)).size, 9);
  for (const activity of variablesActivities.filter((activity) => activity.type === "predict")) {
    assert.ok(activity.options.includes(activity.correctAnswer));
    assert.ok(activity.explanation);
  }
});
test("practice accepts the plain reassignment with ordinary whitespace", () => {
  assert.ok(tryActivity.checkAnswer);
  for (const answer of ["listeners = 150", "listeners=150", "  listeners = 150  "]) {
    assert.equal(tryActivity.checkAnswer(answer), true);
  }
});
test("practice rejects arithmetic forms, comparisons, and broken names", () => {
  for (const answer of ["", "listeners = listeners + 30", "listeners=150 + 0", "listeners == 150", "Listeners = 150", "list eners=150", "listeners=1 50", "listeners=120", "print(150)", "listeners=150;print(listeners)"]) {
    assert.equal(tryActivity.checkAnswer(answer), false);
  }
});
test("the practice checker lives on the lesson-owned activity, not shared code", async () => {
  const shared = await import("../content/lessons/activities.ts");
  assert.equal("isListenersAnswerCorrect" in shared, false);
  assert.equal(typeof tryActivity.checkAnswer, "function");
});
