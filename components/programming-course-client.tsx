"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import {
  implementedProgrammingLessonSlugs,
  programmingLessonStateBySlug,
  type LessonPresentationState,
} from "@/data/courses";

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

type ProgrammingCourse = {
  slug: string;
  title: string;
  description: string;
  modules: CourseModule[];
};

type ProgrammingCourseResponse = {
  course: ProgrammingCourse;
  error?: string;
};

type ProgressResponse = {
  current?: { lessonSlug?: string; completedAt?: string | null };
  progress?: { lesson_slug: string; completed_at: string | null } | null;
};

// Pixel avatar SVG (from Kimi mockup)
const AssistantAvatar = () => (
  <span className="a-ava" aria-hidden="true">
    <svg width="12" height="12" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <g className="ava-pane"><rect x="1" y="1" width="3" height="3" /><rect x="6" y="1" width="3" height="3" /><rect x="1" y="6" width="3" height="3" /></g>
      <rect className="ava-dim" x="6" y="6" width="3" height="3" />
    </svg>
  </span>
);

export function ProgrammingCourseClient() {
  const [course, setCourse] = useState<ProgrammingCourse | null>(null);
  const [lessonStates, setLessonStates] = useState<Record<string, LessonPresentationState>>(
    programmingLessonStateBySlug,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/courses/programming");
      const data = await response.json() as ProgrammingCourseResponse;
      if (!response.ok) throw new Error(data.error ?? `Backend returned ${response.status}`);
      setCourse(data.course);

      // Persisted lesson progress is authoritative when it is available. The
      // static curriculum map remains the safe fallback for an offline backend.
      try {
        const [currentResponse, ...progressResponses] = await Promise.all([
          fetch("/api/learning/progress"),
          ...implementedProgrammingLessonSlugs.map((slug) =>
            fetch(`/api/learning/progress?lesson=${encodeURIComponent(slug)}`),
          ),
        ]);
        const currentData = currentResponse.ok
          ? await currentResponse.json() as ProgressResponse
          : null;
        const persisted = await Promise.all(progressResponses.map(async (progressResponse) =>
          progressResponse.ok ? await progressResponse.json() as ProgressResponse : null,
        ));
        const nextStates = { ...programmingLessonStateBySlug };
        const currentSlug = currentData?.current?.lessonSlug;
        implementedProgrammingLessonSlugs.forEach((slug, index) => {
          const progress = persisted[index]?.progress;
          if (progress?.completed_at) nextStates[slug] = "completed";
          else if (slug === currentSlug) nextStates[slug] = "current";
          else if (nextStates[slug] === "current" && currentSlug) nextStates[slug] = "locked";
        });
        setLessonStates(nextStates);
      } catch {
        // Keep the static curriculum fallback when progress is unavailable.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Course request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadCourse(); }, []);

  // Build progress bar segments from lesson states
  function buildPxbarSegments(totalLessons: number, completedCount: number) {
    const segments = [];
    for (let i = 0; i < totalLessons; i++) segments.push(i < completedCount);
    return segments;
  }

  // Build mbar segments for a module
  function buildMbarSegments(lessons: Lesson[]) {
    const segments = [];
    for (let i = 0; i < lessons.length; i++) {
      const slug = lessons[i].slug;
      const state = lessonStates[slug] ?? "locked";
      segments.push(state === "completed");
    }
    return segments;
  }

  const courseData = course;
  const allLessons = courseData?.modules.flatMap(m => m.lessons) ?? [];
  const completedCount = allLessons.filter(l => lessonStates[l.slug] === "completed").length;
  const progress = allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100);
  const currentLesson = allLessons.find(l => lessonStates[l.slug] === "current");
  const totalLessons = allLessons.length;
  const masteryRows = [
    { slug: "variables", label: "Variables", segments: 6 },
    { slug: "data-types", label: "Data Types", segments: 4 },
    { slug: "conditionals", label: "Conditionals", segments: 4 },
    { slug: "loops", label: "Loops", segments: 4 },
    { slug: "functions", label: "Functions", segments: 4 },
  ];

  if (isLoading) {
    return (
      <>
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>Foundations of Programming</>} />
        <div className="content">
          <div className="course-request-state" role="status">
            <span className="typing-dots"><i /><i /><i /></span>
            <strong>Loading course…</strong>
          </div>
        </div>
      </>
    );
  }

  if (error || !courseData) {
    return (
      <>
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>Foundations of Programming</>} />
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
      <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>{courseData.title}</>} />
      <div className="content">
        {/* Course hero */}
        <div className="page-hero">
          <span className="tag blue">Course · CS-101 · Semester 1</span>
          <h1 className="page-title">{courseData.title}</h1>
          <p className="page-context">{courseData.modules.length} modules · {totalLessons} lessons · taught in ID &amp; EN</p>
          <p className="page-desc">Build the mental model behind code, from values and variables to functions. <em>slowly, precisely, and out loud.</em></p>
          <div className="course-progress">
            <div className="pxbar" aria-hidden="true">
              {buildPxbarSegments(totalLessons, completedCount).map((filled, i) => (
                <i key={i} className={filled ? "f" : ""} style={{ flex: 1 }} />
              ))}
            </div>
            <span className="course-progress-meta">{completedCount} of {totalLessons} lessons · {progress}%</span>
            {currentLesson && (
              <Link className="btn-p" href={`/courses/programming/${currentLesson.slug}`}>Continue: {currentLesson.title} →</Link>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid">
          {/* Left column — curriculum signal map */}
          <div className="col">
            <section className="cmap" aria-label="Curriculum map">
              {courseData.modules.map((module) => {
                const lessonsInModule = module.lessons;
                const completedInModule = lessonsInModule.filter(l => lessonStates[l.slug] === "completed").length;
                const hasCurrent = lessonsInModule.some(l => lessonStates[l.slug] === "current");
                const shouldShowLessons = hasCurrent || (completedInModule > 0 && completedInModule < lessonsInModule.length);
                const isCollapsed = !hasCurrent && completedInModule === lessonsInModule.length;
                const moduleState = hasCurrent ? "open" : completedInModule === lessonsInModule.length ? "done" : completedInModule > 0 ? "open" : "dim";

                return (
                  <section key={module.slug} className={`cmap-module ${isCollapsed && !hasCurrent ? "collapsed" : ""}`}>
                    <div className="cmap-mrow">
                      <span className="node" style={moduleState === "done" ? { background: "var(--ok)", borderColor: "var(--ok)" } : hasCurrent ? { background: "var(--accent)", borderColor: "var(--accent)" } : undefined} />
                      <span className="cmap-mnum">{String(module.position).padStart(2, "0")}</span>
                      <span className="cmap-mtitle">{module.title}{module.description && <small>{module.description}</small>}</span>
                      <span className={`mtag ${hasCurrent ? "now" : completedInModule === lessonsInModule.length ? "master" : "lock"}`}>
                        {hasCurrent ? "in progress" : completedInModule === lessonsInModule.length ? "mastered" : "locked"}
                      </span>
                      <span className="mbar">
                        {buildMbarSegments(lessonsInModule).map((filled, i) => (
                          <i key={i} className={filled ? "f" : ""} />
                        ))}
                      </span>
                      <span className="mcount">{completedInModule}/{lessonsInModule.length}</span>
                    </div>

                    {/* Lessons (only show for current/active modules) */}
                    {shouldShowLessons && (
                      <ul className="cmap-lessons">
                        {lessonsInModule.map((lesson, lessonIndex) => {
                          const state: LessonPresentationState = lessonStates[lesson.slug] ?? "locked";
                          const lessonNumber = `${module.position}.${lesson.position}`;
                          const isLinkable = state !== "locked" && implementedProgrammingLessonSlugs.some((slug) => slug === lesson.slug);
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
                                <span className="cmap-lock">{state === "locked" ? "locked" : "next"}</span>
                              )}
                            </>
                          );

                          return (
                            <li key={lesson.slug}>
                              {isLinkable ? (
                                <Link className={`cmap-lesson ${state}`} href={`/courses/programming/${lesson.slug}`}>
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

          {/* Right column — mastery + companion */}
          <div className="col side-col">
            <section className="panel mastery" aria-label="Mastery">
              <header className="shead" style={{ marginBottom: "6px" }}>
                <span className="tag blue">Mastery</span>
                <span className="shead-meta">by concept</span>
              </header>
              <ul className="mast-list">
                {masteryRows.map((row) => {
                  const state = lessonStates[row.slug] ?? "locked";
                  return (
                    <li key={row.slug} className={`mast-item ${state === "current" ? "hot" : ""}`}>
                      <div className="mast-top">
                        <span className="mast-name">{row.label}</span>
                        <span className="mast-pct">{state === "current" ? "in progress" : state}</span>
                      </div>
                      <div className="mbar2">
                        {Array.from({ length: row.segments }, (_, index) => (
                          <i key={index} className={state === "completed" || (state === "current" && index === 0) ? "f" : ""} />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="pxdiv" aria-hidden="true" />
              <div className="mast-foot">
                <span>{completedCount} of {totalLessons} lessons · <b>{progress}%</b></span>
                <span className="up">keep going</span>
              </div>
            </section>

            <section className="panel companion" aria-label="Robin">
              <div className="companion-head">
                <AssistantAvatar />
                <div>
                  <div className="companion-name">Robin</div>
                  <div className="companion-sub">study companion</div>
                </div>
                <span className="companion-tag"><i />awake</span>
              </div>
              <p className="companion-note">
                You're {completedCount} lesson{completedCount !== 1 ? "s" : ""} into <b>Foundations of Programming</b>.
                {currentLesson
                  ? <> <b>{currentLesson.title}</b> is next — trace by hand before you run anything.</>
                  : " Keep going."}
              </p>
            </section>
          </div>
        </div>

        <footer className="foot">
          <div className="pxdiv" aria-hidden="true" />
          <div className="foot-row">
            <span>robin — a place to learn computer science slowly.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
