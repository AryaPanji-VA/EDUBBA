"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import {
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

export function ProgrammingCourseClient() {
  const [course, setCourse] = useState<ProgrammingCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/courses/programming");
      const data = await response.json() as ProgrammingCourseResponse;

      if (!response.ok) {
        throw new Error(data.error ?? `Backend returned ${response.status}`);
      }

      setCourse(data.course);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Course request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCourse();
  }, []);

  if (isLoading) {
    return (
      <div className="course-request-state" role="status">
        <span className="typing-dots"><i /><i /><i /></span>
        <strong>requesting /api/courses/programming</strong>
        <small>Browser lagi minta modules dan lessons dari backend.</small>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-request-state is-error" role="alert">
        <strong>Relational course signal putus.</strong>
        <small>{error ?? "The backend returned no course."}</small>
        <button className="button" onClick={() => void loadCourse()}>coba lagi</button>
      </div>
    );
  }

  const lessons = course.modules.flatMap((module) => module.lessons);
  const completedLessons = lessons.filter(
    (lesson) => programmingLessonStateBySlug[lesson.slug] === "completed",
  ).length;
  const progress = lessons.length === 0 ? 0 : Math.round((completedLessons / lessons.length) * 100);
  const currentLesson = lessons.find(
    (lesson) => programmingLessonStateBySlug[lesson.slug] === "current",
  );

  return (
    <>
      <header className="course-hero">
        <div className="course-hero-copy">
          <span className="eyebrow">CS-101 · Foundations</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
        <div className="course-progress-card">
          <span className="card-kicker">Course progress</span>
          <strong>{completedLessons} / {lessons.length}</strong>
          <ProgressBar value={progress} />
          <small>{currentLesson ? `Next up: ${currentLesson.title} · ${currentLesson.estimatedMinutes} min` : "No current lesson"}</small>
        </div>
      </header>

      <div className="learning-layout">
        <section>
          <div className="section-head lesson-head">
            <div><span className="eyebrow">Learning path</span><h2>{course.modules.length} modules. {lessons.length} useful steps.</h2></div>
            <span className="path-legend"><i className="legend-complete" /> done <i className="legend-current" /> current</span>
          </div>

          <div className="course-module-groups">
            {course.modules.map((module, moduleIndex) => {
              const lessonsBeforeThisModule = course.modules
                .slice(0, moduleIndex)
                .reduce((total, item) => total + item.lessons.length, 0);

              return (
                <section className="course-module-group" key={module.slug}>
                  <header className="course-module-header">
                    <span>Module {String(module.position).padStart(2, "0")}</span>
                    <div><h3>{module.title}</h3>{module.description && <p>{module.description}</p>}</div>
                  </header>
                  <ol className="module-list">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const state: LessonPresentationState = programmingLessonStateBySlug[lesson.slug] ?? "locked";
                      const lessonNumber = lessonsBeforeThisModule + lessonIndex + 1;
                      const content = (
                        <>
                          <span className={`module-number ${state}`}>{state === "completed" ? "✓" : String(lessonNumber).padStart(2, "0")}</span>
                          <span className="module-copy"><small>Lesson {String(lesson.position).padStart(2, "0")} · {lesson.estimatedMinutes} min</small><strong>{lesson.title}</strong></span>
                          <span className={`module-state ${state}`}>{state === "completed" ? "completed" : state === "current" ? "continue →" : "locked"}</span>
                        </>
                      );

                      return (
                        <li key={lesson.slug}>
                          {state === "current" && (lesson.slug === "variables" || lesson.slug === "data-types")
                            ? <Link className="module-row current" href={`/courses/programming/${lesson.slug}`}>{content}</Link>
                            : <div className={`module-row ${state}`}>{content}</div>}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
          <p className="quiet-note">Course structure from PostgreSQL · progress state stays local for now.</p>
        </section>

        <aside className="course-note card">
          <span className="card-kicker">Margin note · Robin</span>
          <p>Empat lesson pertama udah aman. Struktur belajarnya sekarang datang dari database; progress lu belum gue titipin ke sana.</p>
          <span>Next checkpoint</span>
          <strong>Variables → Data Types</strong>
        </aside>
      </div>
    </>
  );
}
