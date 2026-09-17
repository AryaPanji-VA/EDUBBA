// Deterministic curriculum diff — compares a validated incoming manifest
// against a snapshot of the known curriculum state. Pure comparison, no
// repair, no AI. Statuses:
//   add       : present in incoming, absent in snapshot (safe to apply)
//   unchanged : identical structural metadata
//   conflict  : exists in both but structural metadata differs (never applied)
//   missing   : present in snapshot, absent in incoming (reported only —
//               ingestion never deletes anything)
// Incoming manifests should be complete for existing entries: an omitted
// optional field (e.g. totalLessons) where the snapshot has a value counts
// as a conflict, so nothing is silently dropped.

import type {
  CourseManifest,
  CurriculumManifest,
  LessonManifest,
  ModuleManifest,
  SemesterManifest,
} from "@/data/curriculum-manifest";

export type CurriculumDiffStatus = "add" | "unchanged" | "conflict" | "missing";

export type CurriculumDiffEntry = {
  kind: "semester" | "course" | "module" | "lesson";
  status: CurriculumDiffStatus;
  path: string;
  // Field names whose values differ (conflict entries only).
  changes: string[];
  semesterNumber: number | null;
  courseSlug: string | null;
  moduleSlug: string | null;
  lessonSlug: string | null;
};

export type CurriculumDiff = {
  entries: CurriculumDiffEntry[];
  summary: { add: number; unchanged: number; conflict: number; missing: number };
};

type SnapshotIndex = {
  semesters: Map<number, SemesterManifest>;
  courses: Map<string, { course: CourseManifest; semesterNumber: number }>;
  modules: Map<string, { module: ModuleManifest; courseSlug: string }>;
  lessons: Map<string, LessonManifest>;
};

const moduleKey = (courseSlug: string, moduleSlug: string) => `${courseSlug}::${moduleSlug}`;
const lessonKey = (courseSlug: string, moduleSlug: string, lessonSlug: string) => `${courseSlug}::${moduleSlug}::${lessonSlug}`;

function indexSnapshot(snapshot: CurriculumManifest): SnapshotIndex {
  const index: SnapshotIndex = {
    semesters: new Map(),
    courses: new Map(),
    modules: new Map(),
    lessons: new Map(),
  };
  for (const semester of snapshot.semesters) {
    index.semesters.set(semester.number, semester);
    for (const course of semester.courses) {
      index.courses.set(course.slug, { course, semesterNumber: semester.number });
      for (const courseModule of course.modules) {
        index.modules.set(moduleKey(course.slug, courseModule.slug), { module: courseModule, courseSlug: course.slug });
        for (const lesson of courseModule.lessons) {
          index.lessons.set(lessonKey(course.slug, courseModule.slug, lesson.slug), lesson);
        }
      }
    }
  }
  return index;
}

function compareFields(incoming: Record<string, unknown>, existing: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((field) => incoming[field] !== existing[field]);
}

export function diffCurriculumManifest(incoming: CurriculumManifest, snapshot: CurriculumManifest): CurriculumDiff {
  const index = indexSnapshot(snapshot);
  const entries: CurriculumDiffEntry[] = [];
  const visitedSemesters = new Set<number>();
  const visitedCourses = new Set<string>();
  const visitedModules = new Set<string>();
  const visitedLessons = new Set<string>();

  const push = (entry: Omit<CurriculumDiffEntry, "changes"> & { changes?: string[] }) => {
    entries.push({ changes: [], ...entry });
  };

  for (const semester of incoming.semesters) {
    const semesterPath = `s${semester.number}`;
    const existingSemester = index.semesters.get(semester.number);
    if (!existingSemester) {
      push({ kind: "semester", status: "add", path: semesterPath, semesterNumber: semester.number, courseSlug: null, moduleSlug: null, lessonSlug: null });
    } else {
      visitedSemesters.add(semester.number);
      const changes = compareFields(semester as unknown as Record<string, unknown>, existingSemester as unknown as Record<string, unknown>, ["title"]);
      push({
        kind: "semester",
        status: changes.length === 0 ? "unchanged" : "conflict",
        path: semesterPath,
        changes,
        semesterNumber: semester.number,
        courseSlug: null,
        moduleSlug: null,
        lessonSlug: null,
      });
    }

    for (const course of semester.courses) {
      const coursePath = `${semesterPath}/${course.slug}`;
      const existingCourse = index.courses.get(course.slug);
      if (!existingCourse) {
        push({ kind: "course", status: "add", path: coursePath, semesterNumber: semester.number, courseSlug: course.slug, moduleSlug: null, lessonSlug: null });
      } else {
        visitedCourses.add(course.slug);
        const changes = compareFields(
          { semesterNumber: semester.number, ...course } as unknown as Record<string, unknown>,
          { semesterNumber: existingCourse.semesterNumber, ...existingCourse.course } as unknown as Record<string, unknown>,
          ["semesterNumber", "title", "description", "totalLessons"],
        );
        push({
          kind: "course",
          status: changes.length === 0 ? "unchanged" : "conflict",
          path: coursePath,
          changes,
          semesterNumber: semester.number,
          courseSlug: course.slug,
          moduleSlug: null,
          lessonSlug: null,
        });
      }

      for (const courseModule of course.modules) {
        const modulePath = `${coursePath}/${courseModule.slug}`;
        const existingModule = index.modules.get(moduleKey(course.slug, courseModule.slug));
        if (!existingModule) {
          push({ kind: "module", status: "add", path: modulePath, semesterNumber: semester.number, courseSlug: course.slug, moduleSlug: courseModule.slug, lessonSlug: null });
        } else {
          visitedModules.add(moduleKey(course.slug, courseModule.slug));
          const changes = compareFields(
            courseModule as unknown as Record<string, unknown>,
            existingModule.module as unknown as Record<string, unknown>,
            ["title", "description", "position"],
          );
          push({
            kind: "module",
            status: changes.length === 0 ? "unchanged" : "conflict",
            path: modulePath,
            changes,
            semesterNumber: semester.number,
            courseSlug: course.slug,
            moduleSlug: courseModule.slug,
            lessonSlug: null,
          });
        }

        for (const lesson of courseModule.lessons) {
          const lessonPath = `${modulePath}/${lesson.slug}`;
          const existingLesson = index.lessons.get(lessonKey(course.slug, courseModule.slug, lesson.slug));
          if (!existingLesson) {
            push({ kind: "lesson", status: "add", path: lessonPath, semesterNumber: semester.number, courseSlug: course.slug, moduleSlug: courseModule.slug, lessonSlug: lesson.slug });
          } else {
            visitedLessons.add(lessonKey(course.slug, courseModule.slug, lesson.slug));
            const changes = compareFields(
              lesson as unknown as Record<string, unknown>,
              existingLesson as unknown as Record<string, unknown>,
              ["title", "summary", "estimatedMinutes", "position"],
            );
            push({
              kind: "lesson",
              status: changes.length === 0 ? "unchanged" : "conflict",
              path: lessonPath,
              changes,
              semesterNumber: semester.number,
              courseSlug: course.slug,
              moduleSlug: courseModule.slug,
              lessonSlug: lesson.slug,
            });
          }
        }
      }
    }
  }

  // Snapshot entries absent from the incoming manifest — reported, never deleted.
  for (const [number, semester] of index.semesters) {
    if (!visitedSemesters.has(number)) {
      push({ kind: "semester", status: "missing", path: `s${number}`, semesterNumber: number, courseSlug: null, moduleSlug: null, lessonSlug: null });
    }
  }
  for (const [slug, { semesterNumber }] of index.courses) {
    if (!visitedCourses.has(slug)) {
      push({ kind: "course", status: "missing", path: `s${semesterNumber}/${slug}`, semesterNumber, courseSlug: slug, moduleSlug: null, lessonSlug: null });
    }
  }
  for (const [key, { courseSlug, module }] of index.modules) {
    if (!visitedModules.has(key)) {
      push({ kind: "module", status: "missing", path: `${courseSlug}/${module.slug}`, semesterNumber: null, courseSlug, moduleSlug: module.slug, lessonSlug: null });
    }
  }
  for (const [key, lesson] of index.lessons) {
    if (!visitedLessons.has(key)) {
      const [courseSlug, moduleSlug, lessonSlug] = key.split("::");
      push({ kind: "lesson", status: "missing", path: `${courseSlug}/${moduleSlug}/${lessonSlug}`, semesterNumber: null, courseSlug, moduleSlug, lessonSlug });
    }
  }

  const summary = { add: 0, unchanged: 0, conflict: 0, missing: 0 };
  for (const entry of entries) summary[entry.status] += 1;
  return { entries, summary };
}
