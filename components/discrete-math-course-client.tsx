"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { implementedDiscreteMathLessonSlugs, type LessonPresentationState } from "@/data/courses";
import { deriveLessonStates } from "@/lib/courses/lesson-access";
import { useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate } from "@/lib/i18n/ui-copy";

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

type DiscreteMathCourse = {
  slug: string;
  title: string;
  description: string;
  modules: CourseModule[];
};

type CourseResponse = {
  course: DiscreteMathCourse;
  error?: string;
};

type ProgressResponse = {
  current?: { lessonSlug?: string; completedAt?: string | null };
  progress?: { lesson_slug: string; completed_at: string | null } | null;
};

// Minimal, truthful Discrete Mathematics overview. Only real persisted lesson
// progress is shown — no presentation-fallback percentages. Presentation
// states derive through the same lesson-access rules as Programming: every
// implemented lesson stays open (no locks), one resume point, one
// recommended next step.
export function DiscreteMathCourseClient() {
  const copy = useUiCopy();
  const [course, setCourse] = useState<DiscreteMathCourse | null>(null);
  const [lessonStates, setLessonStates] = useState<Record<string, LessonPresentationState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/courses/discrete-math");
      const data = await response.json() as CourseResponse;
      if (!response.ok) throw new Error(data.error ?? `Backend returned ${response.status}`);
      setCourse(data.course);

      // Persisted lesson progress is authoritative; unavailable progress falls
      // back to the shared derivation with no completions (first lesson is the
      // recommended next step).
      try {
        const [currentResponse, ...persisted] = await Promise.all([
          fetch("/api/learning/progress"),
          ...implementedDiscreteMathLessonSlugs.map((slug) =>
            fetch(`/api/learning/progress?lesson=${encodeURIComponent(slug)}`)
              .then((progressResponse) => progressResponse.ok ? progressResponse.json() as Promise<ProgressResponse> : null),
          ),
        ]);
        const currentData = currentResponse.ok
          ? await currentResponse.json() as ProgressResponse
          : null;
        const completedSlugs = implementedDiscreteMathLessonSlugs.filter(
          (slug, index) => persisted[index]?.progress?.completed_at,
        );
        const derived = deriveLessonStates({
          fallbackStates: {},
          implementedSlugs: implementedDiscreteMathLessonSlugs,
          completedSlugs,
          resumeSlug: currentData?.current?.lessonSlug ?? null,
        });
        setLessonStates(derived.states);
      } catch {
        setLessonStates(
          deriveLessonStates({
            fallbackStates: {},
            implementedSlugs: implementedDiscreteMathLessonSlugs,
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

  useEffect(() => { void loadCourse(); }, []);

  const allLessons = course?.modules.flatMap((module) => module.lessons) ?? [];
  const completedCount = allLessons.filter((lesson) => lessonStates[lesson.slug] === "completed").length;
  // Resume point first; otherwise the recommended next step drives "Continue".
  const currentLesson = allLessons.find((lesson) => lessonStates[lesson.slug] === "current")
    ?? allLessons.find((lesson) => lessonStates[lesson.slug] === "next");
  const progress = allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100);

  if (isLoading) {
    return (
      <>
        <TopBar breadcrumb={<><b>{copy["nav.courses"]}</b><span className="sep">/</span>Discrete Mathematics</>} />
        <div className="content">
          <div className="course-request-state" role="status">
            <span className="typing-dots"><i /><i /><i /></span>
            <strong>{copy["course.loading"]}</strong>
          </div>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <TopBar breadcrumb={<><b>{copy["nav.courses"]}</b><span className="sep">/</span>Discrete Mathematics</>} />
        <div className="content">
          <div className="course-request-state is-error" role="alert">
            <strong>{copy["course.error"]}</strong>
            <small>{error ?? copy["course.errorFallback"]}</small>
            <button className="button" onClick={() => void loadCourse()}>{copy["action.retry"]}</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar breadcrumb={<><Link href="/courses">{copy["nav.courses"]}</Link><span className="sep">/</span><b>{course.title}</b></>} />
      <div className="content">
        <div className="page-hero">
          <span className="tag blue">{fillTemplate(copy["course.tag"], { code: "MA-105" })}</span>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-context">{fillTemplate(copy["course.context"], { modules: course.modules.length, lessons: allLessons.length })}</p>
          <p className="page-desc">{course.description} <em>slowly, precisely, and out loud.</em></p>
          <div className="course-progress">
            <div className="pxbar" aria-hidden="true">
              {allLessons.map((lesson, i) => (
                <i key={lesson.slug + i} className={lessonStates[lesson.slug] === "completed" ? "f" : ""} style={{ flex: 1 }} />
              ))}
            </div>
            <span className="course-progress-meta">{fillTemplate(copy["course.progressMeta"], { done: completedCount, total: allLessons.length, pct: progress })}</span>
            {currentLesson && (
              <Link className="btn-p" href={`/courses/discrete-math/${currentLesson.slug}`}>{fillTemplate(copy["course.continue"], { title: currentLesson.title })} →</Link>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="col">
            <section className="cmap" aria-label={copy["course.curriculumMap"]}>
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
                        {hasCurrent ? copy["status.inProgress"] : hasNext ? copy["status.upNext"] : completedInModule === module.lessons.length ? copy["status.mastered"] : copy["status.open"]}
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
                        const isImplemented = (implementedDiscreteMathLessonSlugs as readonly string[]).includes(lesson.slug);
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
                            <span className="cmap-ldur">{lesson.estimatedMinutes} {copy["course.min"]}</span>
                            {state === "completed" ? (
                              <span className="cmap-lock" style={{ color: "var(--ok)" }}>{copy["status.done"]}</span>
                            ) : state === "current" ? (
                              <span className="cmap-laction">{copy["action.resume"]} →</span>
                            ) : (
                              <span className="cmap-lock">{state === "coming-soon" ? copy["status.comingSoon"] : state === "available" ? copy["status.start"] : copy["status.next"]}</span>
                            )}
                          </>
                        );
                        return (
                          <li key={lesson.slug}>
                            {isImplemented ? (
                              <Link className={`cmap-lesson ${state}`} href={`/courses/discrete-math/${lesson.slug}`}>
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
                {copy["course.companionGeneric"]}
                {currentLesson ? fillTemplate(copy["course.companionNextTruth"], { title: currentLesson.title }) : ""}
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
