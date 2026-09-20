"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { implementedLessonSlugsByCourse, type LessonPresentationState } from "@/data/courses";
import { deriveLessonStates } from "@/lib/courses/lesson-access";

type Lesson = {
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  estimatedMinutes: number;
};

type CourseModule = {
  slug: string;
  title: string;
  description: string | null;
  position: number;
  lessons: Lesson[];
};

type GenericCourse = {
  slug: string;
  title: string;
  description: string;
  modules: CourseModule[];
};

type CourseResponse = {
  course: GenericCourse;
  error?: string;
};

type ProgressResponse = {
  current?: { lessonSlug?: string; completedAt?: string | null };
  progress?: { lesson_slug: string; completed_at: string | null } | null;
};

// Shared minimal course overview (Phase 15), generalized from the Phase 14B
// Discrete Mathematics pattern. Truthful module/lesson listing, real persisted
// progress only — no presentation-fallback percentages, no cloned
// Programming-only tools. Presentation states derive through the same
// lesson-access rules as Programming: every implemented lesson stays open
// (no locks), one resume point, one recommended next step.
export function GenericCourseClient({ courseSlug, courseCode }: { courseSlug: string; courseCode: string }) {
  const implemented = implementedLessonSlugsByCourse[courseSlug] ?? [];
  const [course, setCourse] = useState<GenericCourse | null>(null);
  const [lessonStates, setLessonStates] = useState<Record<string, LessonPresentationState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}`);
      const data = await response.json() as CourseResponse;
      if (!response.ok) throw new Error(data.error ?? `Backend returned ${response.status}`);
      setCourse(data.course);

      // Persisted lesson progress is authoritative; unavailable progress falls
      // back to the shared derivation with no completions (first lesson is the
      // recommended next step).
      try {
        const [currentResponse, ...persisted] = await Promise.all([
          fetch("/api/learning/progress"),
          ...implemented.map((slug) =>
            fetch(`/api/learning/progress?lesson=${encodeURIComponent(slug)}`)
              .then((progressResponse) => progressResponse.ok ? progressResponse.json() as Promise<ProgressResponse> : null),
          ),
        ]);
        const currentData = currentResponse.ok
          ? await currentResponse.json() as ProgressResponse
          : null;
        const completedSlugs = implemented.filter(
          (slug, index) => persisted[index]?.progress?.completed_at,
        );
        const derived = deriveLessonStates({
          fallbackStates: {},
          implementedSlugs: implemented,
          completedSlugs,
          resumeSlug: currentData?.current?.lessonSlug ?? null,
        });
        setLessonStates(derived.states);
      } catch {
        setLessonStates(
          deriveLessonStates({
            fallbackStates: {},
            implementedSlugs: implemented,
            completedSlugs: [],
            resumeSlug: null,
          }).states,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Course request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadCourse(); }, [courseSlug]);

  const allLessons = course?.modules.flatMap((module) => module.lessons) ?? [];
  const completedCount = allLessons.filter((lesson) => lessonStates[lesson.slug] === "completed").length;
  // Resume point first; otherwise the recommended next step drives "Continue".
  const currentLesson = allLessons.find((lesson) => lessonStates[lesson.slug] === "current")
    ?? allLessons.find((lesson) => lessonStates[lesson.slug] === "next");
  const progress = allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100);

  if (isLoading) {
    return (
      <>
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>{courseCode}</>} />
        <div className="content">
          <div className="course-request-state" role="status">
            <span className="typing-dots"><i /><i /><i /></span>
            <strong>Loading course…</strong>
          </div>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>{courseCode}</>} />
        <div className="content">
          <div className="course-request-state is-error" role="alert">
            <strong>Course signal putus.</strong>
            <small>{error ?? "The backend returned no course."}</small>
            <button className="button" onClick={() => void loadCourse()}>coba lagi</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumb={<><Link href="/courses">Courses</Link><span className="sep">/</span><b>{course.title}</b></>} />
      <div className="content">
        <div className="page-hero">
          <span className="tag blue">Course · {courseCode} · Semester 1</span>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-context">{course.modules.length} {course.modules.length === 1 ? "module" : "modules"} · {allLessons.length} {allLessons.length === 1 ? "lesson" : "lessons"}</p>
          <p className="page-desc">{course.description} <em>slowly, precisely, and out loud.</em></p>
          <div className="course-progress">
            <div className="pxbar" aria-hidden="true">
              {allLessons.map((lesson, i) => (
                <i key={lesson.slug + i} className={lessonStates[lesson.slug] === "completed" ? "f" : ""} style={{ flex: 1 }} />
              ))}
            </div>
            <span className="course-progress-meta">{completedCount} of {allLessons.length} lessons · {progress}%</span>
            {currentLesson && (
              <Link className="btn-p" href={`/courses/${courseSlug}/${currentLesson.slug}`}>Continue: {currentLesson.title} →</Link>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="col">
            <section className="cmap" aria-label="Curriculum map">
              {course.modules.map((module) => {
                const completedInModule = module.lessons.filter((lesson) => lessonStates[lesson.slug] === "completed").length;
                const hasCurrent = module.lessons.some((lesson) => lessonStates[lesson.slug] === "current");
                const hasNext = module.lessons.some((lesson) => lessonStates[lesson.slug] === "next");
                const moduleState = completedInModule === module.lessons.length && !hasCurrent ? "done" : hasCurrent ? "open" : "dim";
                // Show the lesson list for every module that has implemented
                // content — never hide open lessons behind a collapsed row.
                const shouldShowLessons = module.lessons.some((lesson) => (lessonStates[lesson.slug] ?? "coming-soon") !== "coming-soon");
                return (
                  <section key={module.slug} className="cmap-module">
                    <div className="cmap-mrow">
                      <span className="node" style={moduleState === "done" ? { background: "var(--ok)", borderColor: "var(--ok)" } : hasCurrent ? { background: "var(--accent)", borderColor: "var(--accent)" } : undefined} />
                      <span className="cmap-mnum">{String(module.position).padStart(2, "0")}</span>
                      <span className="cmap-mtitle">{module.title}{module.description && <small>{module.description}</small>}</span>
                      <span className={`mtag ${hasCurrent ? "now" : completedInModule === module.lessons.length ? "master" : "lock"}`}>
                        {hasCurrent ? "in progress" : hasNext ? "up next" : completedInModule === module.lessons.length ? "mastered" : "open"}
                      </span>
                      <span className="mbar">
                        {module.lessons.map((lesson) => (
                          <i key={lesson.slug} className={lessonStates[lesson.slug] === "completed" ? "f" : ""} />
                        ))}
                      </span>
                      <span className="mcount">{completedInModule}/{module.lessons.length}</span>
                    </div>
                    {shouldShowLessons && (
                      <ul className="cmap-lessons">
                        {module.lessons.map((lesson) => {
                          const state: LessonPresentationState = lessonStates[lesson.slug] ?? "coming-soon";
                          const lessonNumber = `${module.position}.${lesson.position}`;
                          const isImplemented = implemented.includes(lesson.slug);
                          const nodeStyle = state === "completed"
                            ? { background: "var(--ok)", borderColor: "var(--ok)" }
                            : state === "current"
                            ? { background: "var(--accent)", borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--now-glow)" }
                            : undefined;
                          const content = (
                            <>
                              <span className="cmap-ltitle">
                                <span className="cmap-lnum">{lessonNumber}</span>{lesson.title}
                                {lesson.summary && <small>{lesson.summary}</small>}
                              </span>
                              <span className="cmap-ldur">{lesson.estimatedMinutes} min</span>
                              {state === "completed" ? (
                                <span className="cmap-lock" style={{ color: "var(--ok)" }}>done</span>
                              ) : state === "current" ? (
                                <span className="cmap-laction">Resume →</span>
                              ) : (
                                <span className="cmap-lock">{state === "coming-soon" ? "coming soon" : state === "available" ? "start" : "next"}</span>
                              )}
                            </>
                          );
                          return (
                            <li key={lesson.slug}>
                              {isImplemented ? (
                                <Link className={`cmap-lesson ${state}`} href={`/courses/${courseSlug}/${lesson.slug}`}>
                                  <span className="lnode" style={nodeStyle} />{content}
                                </Link>
                              ) : (
                                <div className={`cmap-lesson ${state}`}>
                                  <span className="lnode" style={nodeStyle} />{content}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })}
            </section>
          </div>

          <div className="col side-col">
            <section className="panel companion" aria-label="Robin">
              <p className="companion-note">
                Course ini pakai learning engine yang sama seperti Programming — tanpa Sandbox atau Python Practice.
                {currentLesson
                  ? <> Mulai dari <b>{currentLesson.title}</b>: baca pelan, isi interaksinya, cek pemahaman lu.</>
                  : ""}
              </p>
            </section>
          </div>
        </div>

        <footer className="foot">
          <div className="pxdiv" aria-hidden="true" />
          <div className="foot-row">
            <span>edubba — a place to learn computer science slowly, with robin.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
