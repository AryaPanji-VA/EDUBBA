import { getPracticeTrack } from "./registry";
import { getThinkingActivities } from "./thinking-registry";

export type PracticeProgressDefinition = {
  activityIds: string[];
  logGroups: { lessonSlug: string; exerciseIds: string[] }[];
};

export function getPracticeProgressDefinition(slug: string): PracticeProgressDefinition | null {
  const track = getPracticeTrack(slug);
  if (track) {
    return {
      activityIds: track.topics.flatMap((topic) => topic.exercises.map((exercise) => exercise.id)),
      logGroups: track.topics.map((topic) => ({ lessonSlug: topic.lessonSlug, exerciseIds: topic.exercises.map((exercise) => exercise.id) })),
    };
  }
  if (slug === "thinking") {
    return { activityIds: getThinkingActivities().map((activity) => activity.id), logGroups: [] };
  }
  return null;
}

