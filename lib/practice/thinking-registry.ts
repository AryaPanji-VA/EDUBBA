import { thinkingActivities } from "@/content/practice/thinking/activities";
import type { ThinkingActivity, ThinkingActivityType } from "@/content/practice/thinking/types";

export const thinkingTypeLabels: Record<ThinkingActivityType, string> = {
  "decomposition": "Decomposition",
  "pattern-recognition": "Pattern Recognition",
  "abstraction": "Abstraction",
  "algorithm-ordering": "Algorithm Ordering",
  "trace-program": "Trace Program",
  "pseudocode": "Pseudocode",
  "debug-reasoning": "Debug Reasoning",
};

const registry = new Map(thinkingActivities.map((activity) => [activity.id, activity]));

export function getThinkingActivities(): ThinkingActivity[] {
  return thinkingActivities;
}

export function getThinkingActivity(id: string): ThinkingActivity | null {
  return registry.get(id) ?? null;
}

