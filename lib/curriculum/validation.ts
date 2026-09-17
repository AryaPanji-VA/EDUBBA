// Deterministic curriculum manifest validation — no AI, no silent repair.
// Fail-closed over unknown input, mirroring the validator conventions in
// lib/progress/types.ts and lib/practice/types.ts. Validation never mutates
// or repairs the input; it either accepts it verbatim or reports errors.

import { curriculumProvenanceSourceTypes } from "@/data/curriculum-manifest";
import type {
  CourseManifest,
  CurriculumManifest,
  CurriculumProvenance,
  CurriculumProvenanceSourceType,
  LessonManifest,
  ModuleManifest,
  SemesterManifest,
} from "@/data/curriculum-manifest";

export type CurriculumValidationError = {
  path: string;
  code: string;
  message: string;
};

export type CurriculumValidationResult =
  | { ok: true; manifest: CurriculumManifest }
  | { ok: false; errors: CurriculumValidationError[] };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROVENANCE_TYPES = curriculumProvenanceSourceTypes as readonly string[];

function isProvenanceSourceType(value: unknown): value is CurriculumProvenanceSourceType {
  return typeof value === "string" && PROVENANCE_TYPES.includes(value);
}

const SEMESTER_KEYS = ["number", "title", "courses", "provenance"];
const COURSE_KEYS = ["slug", "title", "description", "totalLessons", "modules", "provenance"];
const MODULE_KEYS = ["slug", "title", "description", "position", "lessons", "provenance"];
const LESSON_KEYS = ["slug", "title", "summary", "estimatedMinutes", "position", "provenance"];
const PROVENANCE_KEYS = ["sourceType", "sourceLabel", "sourceUrl", "verifiedAt"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function fail(errors: CurriculumValidationError[], path: string, code: string, message: string) {
  errors.push({ path, code, message });
}

function checkUnknownKeys(
  row: Record<string, unknown>,
  keys: readonly string[],
  path: string,
  errors: CurriculumValidationError[],
) {
  for (const key of Object.keys(row)) {
    if (!keys.includes(key)) {
      fail(errors, path, "unknown_key", `${path} has unsupported key "${key}": the manifest carries curriculum structure only, not lesson learning content.`);
    }
  }
}

function readRequiredString(
  row: Record<string, unknown>,
  key: string,
  path: string,
  max: number,
  code: string,
  errors: CurriculumValidationError[],
): string | null {
  const value = row[key];
  if (typeof value !== "string" || !value.trim()) {
    fail(errors, path, code, `${path}.${key} must be a non-empty string.`);
    return null;
  }
  if (value !== value.trim()) {
    fail(errors, path, code, `${path}.${key} must not have leading or trailing whitespace.`);
    return null;
  }
  if (value.length > max) {
    fail(errors, path, code, `${path}.${key} must be at most ${max} characters.`);
    return null;
  }
  return value;
}

function readOptionalString(
  row: Record<string, unknown>,
  key: string,
  path: string,
  max: number,
  code: string,
  errors: CurriculumValidationError[],
): string | undefined {
  if (row[key] === undefined) return undefined;
  const value = readRequiredString(row, key, path, max, code, errors);
  return value ?? undefined;
}

function readSlug(row: Record<string, unknown>, path: string, errors: CurriculumValidationError[]): string | null {
  const value = readRequiredString(row, "slug", path, 60, "invalid_slug", errors);
  if (value === null) return null;
  if (!SLUG_PATTERN.test(value)) {
    fail(errors, path, "invalid_slug", `${path}.slug must be lowercase kebab-case ([a-z0-9-]).`);
    return null;
  }
  return value;
}

function readRequiredInteger(
  row: Record<string, unknown>,
  key: string,
  path: string,
  min: number,
  max: number,
  code: string,
  errors: CurriculumValidationError[],
): number | null {
  const value = row[key];
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(errors, path, code, `${path}.${key} must be an integer.`);
    return null;
  }
  if (value < min || value > max) {
    fail(errors, path, code, `${path}.${key} must be between ${min} and ${max}.`);
    return null;
  }
  return value;
}

function readOptionalInteger(
  row: Record<string, unknown>,
  key: string,
  path: string,
  min: number,
  max: number,
  code: string,
  errors: CurriculumValidationError[],
): number | undefined {
  if (row[key] === undefined) return undefined;
  return readRequiredInteger(row, key, path, min, max, code, errors) ?? undefined;
}

function validateProvenance(
  value: unknown,
  path: string,
  errors: CurriculumValidationError[],
): CurriculumProvenance | null {
  if (!isPlainObject(value)) {
    fail(errors, path, "invalid_provenance", `${path}.provenance must be an object.`);
    return null;
  }
  checkUnknownKeys(value, PROVENANCE_KEYS, `${path}.provenance`, errors);
  const sourceType = value.sourceType;
  if (!isProvenanceSourceType(sourceType)) {
    fail(errors, path, "invalid_provenance", `${path}.provenance.sourceType must be one of: official, instructor, study-context, robin.`);
    return null;
  }
  const sourceLabel = readRequiredString(value, "sourceLabel", `${path}.provenance`, 200, "invalid_provenance", errors);
  if (sourceLabel === null) return null;
  let sourceUrl: string | undefined;
  if (value.sourceUrl !== undefined) {
    if (typeof value.sourceUrl !== "string") {
      fail(errors, path, "invalid_provenance", `${path}.provenance.sourceUrl must be a string.`);
      return null;
    }
    try {
      const parsed = new URL(value.sourceUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad protocol");
      sourceUrl = value.sourceUrl;
    } catch {
      fail(errors, path, "invalid_provenance", `${path}.provenance.sourceUrl must be a valid http(s) URL.`);
      return null;
    }
  }
  let verifiedAt: string | undefined;
  if (value.verifiedAt !== undefined) {
    if (typeof value.verifiedAt !== "string" || Number.isNaN(Date.parse(value.verifiedAt))) {
      fail(errors, path, "invalid_provenance", `${path}.provenance.verifiedAt must be a parseable date string.`);
      return null;
    }
    verifiedAt = value.verifiedAt;
  }
  return { sourceType, sourceLabel, ...(sourceUrl ? { sourceUrl } : {}), ...(verifiedAt ? { verifiedAt } : {}) };
}

export function validateCurriculumManifest(input: unknown): CurriculumValidationResult {
  const errors: CurriculumValidationError[] = [];

  if (!isPlainObject(input)) {
    fail(errors, "$", "invalid_type", "Curriculum manifest must be an object.");
    return { ok: false, errors };
  }
  checkUnknownKeys(input, ["semesters"], "$", errors);
  if (!Array.isArray(input.semesters) || input.semesters.length === 0) {
    fail(errors, "$.semesters", "invalid_type", "Manifest must contain at least one semester.");
    return { ok: false, errors };
  }

  const semesterNumbers = new Set<number>();
  const courseSlugs = new Set<string>();
  const semesters: SemesterManifest[] = [];

  input.semesters.forEach((rawSemester, semesterIndex) => {
    const semesterPath = `$.semesters[${semesterIndex}]`;
    if (!isPlainObject(rawSemester)) {
      fail(errors, semesterPath, "invalid_type", `${semesterPath} must be an object.`);
      return;
    }
    checkUnknownKeys(rawSemester, SEMESTER_KEYS, semesterPath, errors);

    const number = readRequiredInteger(rawSemester, "number", semesterPath, 1, 8, "invalid_semester_number", errors);
    if (number !== null) {
      if (semesterNumbers.has(number)) {
        fail(errors, semesterPath, "duplicate_semester_number", `Semester number ${number} appears more than once.`);
      } else {
        semesterNumbers.add(number);
      }
    }
    const title = readRequiredString(rawSemester, "title", semesterPath, 200, "invalid_title", errors);
    const provenance = rawSemester.provenance === undefined
      ? undefined
      : validateProvenance(rawSemester.provenance, semesterPath, errors) ?? undefined;

    if (!Array.isArray(rawSemester.courses)) {
      fail(errors, `${semesterPath}.courses`, "invalid_type", `${semesterPath}.courses must be an array (empty is valid).`);
      return;
    }

    const courses: CourseManifest[] = [];
    rawSemester.courses.forEach((rawCourse, courseIndex) => {
      const coursePath = `${semesterPath}.courses[${courseIndex}]`;
      if (!isPlainObject(rawCourse)) {
        fail(errors, coursePath, "invalid_type", `${coursePath} must be an object.`);
        return;
      }
      checkUnknownKeys(rawCourse, COURSE_KEYS, coursePath, errors);

      const slug = readSlug(rawCourse, coursePath, errors);
      if (slug !== null) {
        if (courseSlugs.has(slug)) {
          fail(errors, coursePath, "duplicate_course_slug", `Course slug "${slug}" appears more than once.`);
        } else {
          courseSlugs.add(slug);
        }
      }
      const courseTitle = readRequiredString(rawCourse, "title", coursePath, 200, "invalid_title", errors);
      const description = readRequiredString(rawCourse, "description", coursePath, 500, "invalid_description", errors);
      const totalLessons = readOptionalInteger(rawCourse, "totalLessons", coursePath, 0, 999, "invalid_total_lessons", errors);
      const courseProvenance = rawCourse.provenance === undefined
        ? null
        : validateProvenance(rawCourse.provenance, coursePath, errors);
      if (rawCourse.provenance === undefined) {
        fail(errors, coursePath, "invalid_provenance", `${coursePath}.provenance is required — curriculum entries must declare where they came from.`);
      }

      if (!Array.isArray(rawCourse.modules)) {
        fail(errors, `${coursePath}.modules`, "invalid_type", `${coursePath}.modules must be an array (empty is valid).`);
        return;
      }

      const moduleSlugs = new Set<string>();
      const modulePositions = new Set<number>();
      const lessonSlugsInCourse = new Set<string>();
      const modules: ModuleManifest[] = [];

      rawCourse.modules.forEach((rawModule, moduleIndex) => {
        const modulePath = `${coursePath}.modules[${moduleIndex}]`;
        if (!isPlainObject(rawModule)) {
          fail(errors, modulePath, "invalid_type", `${modulePath} must be an object.`);
          return;
        }
        checkUnknownKeys(rawModule, MODULE_KEYS, modulePath, errors);

        const moduleSlug = readSlug(rawModule, modulePath, errors);
        if (moduleSlug !== null) {
          if (moduleSlugs.has(moduleSlug)) {
            fail(errors, modulePath, "duplicate_module_slug", `Module slug "${moduleSlug}" appears more than once inside course.`);
          } else {
            moduleSlugs.add(moduleSlug);
          }
        }
        const moduleTitle = readRequiredString(rawModule, "title", modulePath, 200, "invalid_title", errors);
        const moduleDescription = readOptionalString(rawModule, "description", modulePath, 500, "invalid_description", errors);
        const modulePosition = readRequiredInteger(rawModule, "position", modulePath, 1, 99, "invalid_position", errors);
        if (modulePosition !== null) {
          if (modulePositions.has(modulePosition)) {
            fail(errors, modulePath, "duplicate_position", `Position ${modulePosition} is used by more than one module inside course.`);
          } else {
            modulePositions.add(modulePosition);
          }
        }
        const moduleProvenance = rawModule.provenance === undefined
          ? null
          : validateProvenance(rawModule.provenance, modulePath, errors);
        if (rawModule.provenance === undefined) {
          fail(errors, modulePath, "invalid_provenance", `${modulePath}.provenance is required.`);
        }

        if (!Array.isArray(rawModule.lessons)) {
          fail(errors, `${modulePath}.lessons`, "invalid_type", `${modulePath}.lessons must be an array (empty is valid).`);
          return;
        }

        const lessonSlugsInModule = new Set<string>();
        const lessonPositions = new Set<number>();
        const lessons: LessonManifest[] = [];

        rawModule.lessons.forEach((rawLesson, lessonIndex) => {
          const lessonPath = `${modulePath}.lessons[${lessonIndex}]`;
          if (!isPlainObject(rawLesson)) {
            fail(errors, lessonPath, "invalid_type", `${lessonPath} must be an object.`);
            return;
          }
          checkUnknownKeys(rawLesson, LESSON_KEYS, lessonPath, errors);

          const lessonSlug = readSlug(rawLesson, lessonPath, errors);
          if (lessonSlug !== null) {
            if (lessonSlugsInModule.has(lessonSlug)) {
              fail(errors, lessonPath, "duplicate_lesson_slug", `Lesson slug "${lessonSlug}" appears more than once inside module.`);
            } else {
              lessonSlugsInModule.add(lessonSlug);
            }
            if (lessonSlugsInCourse.has(lessonSlug)) {
              fail(errors, lessonPath, "duplicate_lesson_slug", `Lesson slug "${lessonSlug}" appears in more than one module of the same course.`);
            } else {
              lessonSlugsInCourse.add(lessonSlug);
            }
          }
          const lessonTitle = readRequiredString(rawLesson, "title", lessonPath, 200, "invalid_title", errors);
          const summary = readOptionalString(rawLesson, "summary", lessonPath, 500, "invalid_summary", errors);
          const estimatedMinutes = readOptionalInteger(rawLesson, "estimatedMinutes", lessonPath, 1, 600, "invalid_estimated_minutes", errors);
          const lessonPosition = readRequiredInteger(rawLesson, "position", lessonPath, 1, 99, "invalid_position", errors);
          if (lessonPosition !== null) {
            if (lessonPositions.has(lessonPosition)) {
              fail(errors, lessonPath, "duplicate_position", `Position ${lessonPosition} is used by more than one lesson inside module.`);
            } else {
              lessonPositions.add(lessonPosition);
            }
          }
          const lessonProvenance = rawLesson.provenance === undefined
            ? null
            : validateProvenance(rawLesson.provenance, lessonPath, errors);
          if (rawLesson.provenance === undefined) {
            fail(errors, lessonPath, "invalid_provenance", `${lessonPath}.provenance is required.`);
          }

          if (lessonSlug !== null && lessonTitle !== null && lessonProvenance !== null && lessonPosition !== null) {
            lessons.push({
              slug: lessonSlug,
              title: lessonTitle,
              ...(summary !== undefined ? { summary } : {}),
              ...(estimatedMinutes !== undefined ? { estimatedMinutes } : {}),
              position: lessonPosition,
              provenance: lessonProvenance,
            });
          }
        });

        if (moduleSlug !== null && moduleTitle !== null && moduleProvenance !== null && modulePosition !== null) {
          modules.push({
            slug: moduleSlug,
            title: moduleTitle,
            ...(moduleDescription !== undefined ? { description: moduleDescription } : {}),
            position: modulePosition,
            lessons,
            provenance: moduleProvenance,
          });
        }
      });

      if (slug !== null && courseTitle !== null && description !== null && courseProvenance !== null) {
        courses.push({
          slug,
          title: courseTitle,
          description,
          ...(totalLessons !== undefined ? { totalLessons } : {}),
          modules,
          provenance: courseProvenance,
        });
      }
    });

    if (number !== null && title !== null) {
      semesters.push({
        number,
        title,
        courses,
        ...(provenance !== undefined ? { provenance } : {}),
      });
    }
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: { semesters } };
}
