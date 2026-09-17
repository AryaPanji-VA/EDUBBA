"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { implementedDiscreteMathLessonSlugs, type LessonPresentationState } from "@/data/courses";

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
  progress?: { lesson_slug: string; completed_at: string | null } | null;
};

// Minimal, truthful Discrete Mathematics overview. Only real persisted lesson
// progress is shown — no presentation-fallback percentages.
export function DiscreteMathCourseClient() {
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
      // back to the first implemented lesson being simply "current".
      try {
        const persisted = await Promise.all(
          implementedDiscreteMathLessonSlugs.map((slug) =>
            fetch(`/api/learning/progress?lesson=${encodeURIComponent(slug)}`)
              .then((progressResponse) => progressResponse.ok ? progressResponse.json() as Promise<ProgressResponse> : null),
          ),
        );
        const nextStates: Record<string, LessonPresentationState> = {};
        for (const slug of implementedDiscreteMathLessonSlugs) nextStates[slug] = "current";
        implementedDiscreteMathLessonSlugs.forEach((slug, index) => {
          if (persisted[index]?.progress?.completed_at) nextStates[slug] = "completed";
        });
        setLessonStates(nextStates);
      } catch {
        const fallback: Record<string, LessonPresentationState> = {};
        for (const slug of implementedDiscreteMathLessonSlugs) fallback[slug] = "current";
        setLessonStates(fallback);
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
  const currentLesson = allLessons.find((lesson) => lessonStates[lesson.slug] === "current");
  const progress = allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100);

  if (isLoading) {
    return (
      <>
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>Discrete Mathematics</>} />
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
        <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>Discrete Mathematics</>} />
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
          <span className="tag blue">Course · MA-105 · Semester 1</span>
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
              <Link className="btn-p" href={`/courses/discrete-math/${currentLesson.slug}`}>Continue: {currentLesson.title} →</Link>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="col">
            <section className="cmap" aria-label="Curriculum map">
              {course.modules.map((module) => {
                const completedInModule = module.lessons.filter((lesson) => lessonStates[lesson.slug] === "completed").length;
                const hasCurrent = module.lessons.some((lesson) => lessonStates[lesson.slug] === "current");
                const moduleState = completedInModule === module.lessons.length && !hasCurrent ? "done" : hasCurrent ? "open" : "dim";
                return (
                  <section key={module.slug} className="cmap-module">
                    <div className="cmap-mrow">
                      <span className="node" style={moduleState === "done" ? { background: "var(--ok)", borderColor: "var(--ok)" } : hasCurrent ? { background: "var(--accent)", borderColor: "var(--accent)" } : undefined} />
                      <span className="cmap-mnum">{String(module.position).padStart(2, "0")}</span>
                      <span className="cmap-mtitle">{module.title}{module.description && <small>{module.description}</small>}</span>
                      <span className={`mtag ${completedInModule === module.lessons.length && !hasCurrent ? "master" : hasCurrent ? "now" : "lock"}`}>
                        {completedInModule === module.lessons.length && !hasCurrent ? "mastered" : hasCurrent ? "in progress" : "locked"}
                      </span>
                      <span className="mbar">
                        {module.lessons.map((lesson) => (
                          <i key={lesson.slug} className={lessonStates[lesson.slug] === "completed" ? "f" : ""} />
                        ))}
                      </span>
                      <span className="mcount">{completedInModule}/{module.lessons.length}</span>
                    </div>
                    <ul className="cmap-lessons">
                      {module.lessons.map((lesson) => {
                        const state: LessonPresentationState = lessonStates[lesson.slug] ?? "locked";
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
                            <span className="cmap-ldur">{lesson.estimatedMinutes} min</span>
                            {state === "completed" ? (
                              <span className="cmap-lock" style={{ color: "var(--ok)" }}>done</span>
                            ) : state === "current" ? (
                              <span className="cmap-laction">Resume →</span>
                            ) : (
                              <span className="cmap-lock">locked</span>
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
                  </section>
                );
              })}
            </section>
          </div>

          <div className="col side-col">
            <section className="panel companion" aria-label="Robin">
              <p className="companion-note">
                Discrete Mathematics pakai learning engine yang sama seperti Programming — tanpa Sandbox atau Python Practice.
                {currentLesson
                  ? <> Mulai dari <b>{currentLesson.title}</b>: baca pelan, isi prediksi, coba tabel kebenarannya.</>
                  : ""}
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
