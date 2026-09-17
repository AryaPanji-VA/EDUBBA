import type { PracticeExercise, PracticeTrack } from "@/content/practice/types";
import { variablesPracticeExercises } from "@/content/practice/python/variables-exercises";
import { dataTypesPracticeExercises } from "@/content/practice/python/data-types-exercises";
import { operatorsPracticeExercises } from "@/content/practice/python/operators-exercises";
import { conditionalsPracticeExercises } from "@/content/practice/python/conditionals-exercises";
import { loopsPracticeExercises } from "@/content/practice/python/loops-exercises";
import { functionsPracticeExercises } from "@/content/practice/python/functions-exercises";

// Explicit static registration — no dynamic loading, no filesystem discovery.
// Mirrors lib/lessons/registry.ts conventions.

const pythonTrack: PracticeTrack = {
  slug: "python",
  title: "Python Fundamentals",
  description: "A small coding gym for the concepts from Foundations of Programming.",
  topics: [
    { lessonSlug: "variables", title: "Variables", exercises: variablesPracticeExercises },
    { lessonSlug: "data-types", title: "Data Types", exercises: dataTypesPracticeExercises },
    { lessonSlug: "operators", title: "Operators", exercises: operatorsPracticeExercises },
    { lessonSlug: "conditionals", title: "Conditionals", exercises: conditionalsPracticeExercises },
    { lessonSlug: "loops", title: "Loops", exercises: loopsPracticeExercises },
    { lessonSlug: "functions", title: "Functions", exercises: functionsPracticeExercises },
  ],
};

const tracks: Map<string, PracticeTrack> = new Map([
  ["python", pythonTrack],
]);

export function getPracticeTrack(slug: string): PracticeTrack | null {
  return tracks.get(slug) ?? null;
}

export function isRegisteredPracticeTrack(slug: string): boolean {
  return tracks.has(slug);
}

export function getPracticeExercise(id: string): PracticeExercise | null {
  for (const track of tracks.values()) {
    for (const topic of track.topics) {
      const exercise = topic.exercises.find((item) => item.id === id);
      if (exercise) return exercise;
    }
  }
  return null;
}
