"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { ProgressBar } from "@/components/progress-bar";
import { courseOverviewRouteBySlug, type Course } from "@/data/courses";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";
import { useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate, type UiCopyKey } from "@/lib/i18n/ui-copy";

type SemesterGroup = {
  number: number;
  title: string;
  courses: Course[];
};

type CoursesResponse = {
  courses: Course[];
  count: number;
  semesters: SemesterGroup[];
  unassignedCourses: Course[];
};

// Default semester context. No academic-calendar inference in this phase.
const defaultSemesterNumber = 1;

function padSemester(number: number): string {
  return String(number).padStart(2, "0");
}

export function CoursesClient() {
  const copy = useUiCopy();
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemesterNumber);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const current = useCurrentLesson();

  async function loadCourses() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/courses");

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data: CoursesResponse = await response.json();
      setData(data);
      setSelectedSemester(defaultSemesterNumber);
    } catch {
      setError(copy["courses.error"]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  const semester = data?.semesters.find((item) => item.number === selectedSemester) ?? null;
  const courses = semester?.courses ?? [];
  const courseCount = courses.length;
  const overallProgress = courseCount > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courseCount)
    : null;

  return (
    <>
      <TopBar breadcrumb={<><b>{copy["nav.courses"]}</b><span className="sep">/</span>Semester {selectedSemester}</>} />
      <div className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">{fillTemplate(copy["courses.eyebrow"], { sem: padSemester(selectedSemester), count: courseCount })}</span>
            <h1>{copy["courses.title"]}</h1>
            <p>{copy["courses.sub"]}</p>
          </div>
          <div className="semester-stamp"><span>SEM / {padSemester(selectedSemester)}</span><strong>{overallProgress === null ? "—" : `${overallProgress}%`}</strong><small>{copy["courses.overall"]}</small></div>
        </header>

        {data && (
          <div className="switcher semester-nav" role="group" aria-label="Semester">
            {data.semesters.map((item) => (
              <button
                key={item.number}
                type="button"
                className={item.number === selectedSemester ? "on" : ""}
                aria-pressed={item.number === selectedSemester}
                onClick={() => setSelectedSemester(item.number)}
              >
                SEM {padSemester(item.number)}
              </button>
            ))}
          </div>
        )}

        {data && data.unassignedCourses.length > 0 && (
          <p className="data-notice" role="alert">
            Ada {data.unassignedCourses.length} course yang belum terhubung ke semester (data lama).
            Jalankan ulang database/phase13-semesters.sql di Supabase.
          </p>
        )}

        {isLoading ? (
          <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>{copy["courses.loading"]}</strong><small>{copy["courses.loadingNote"]}</small></div>
        ) : error || !data ? (
          <div className="course-request-state is-error" role="alert"><strong>{error ?? copy["courses.error"]}</strong><small>{copy["courses.errorNote"]}</small><button className="button" onClick={() => void loadCourses()}>{copy["action.retry"]}</button></div>
        ) : courseCount === 0 ? (
          <section className="semester-empty" aria-label={`Semester ${selectedSemester}`} role="status">
            <strong>{copy["courses.empty"]}</strong>
            <small>{copy["courses.emptyNote"]}</small>
          </section>
        ) : (
          <>
            <section className="courses-list" aria-label={`Semester ${selectedSemester} courses`}>
        {courses.map((course, index) => {
          const isProgramming = course.slug === "programming";
          const isCurrent = course.slug === current.courseSlug;
          // Status language comes from the persisted state, with the existing
          // progress value deciding completion. No invented states.
          // Status label follows the product language; the CSS class keeps the
          // canonical English state so styling never depends on localization.
          const canonicalStatus = course.progress >= 100 ? "Completed" : course.status;
          const statusKey: UiCopyKey = canonicalStatus === "Completed" ? "status.completed"
            : canonicalStatus === "In progress" ? "status.inProgress"
            : canonicalStatus === "Up next" ? "status.upNext"
            : "status.notStarted";
          const statusLabel = copy[statusKey];
          const ctaLabel = isCurrent || course.progress > 0 ? copy["action.continue"] : copy["action.start"];
          const overviewHref = courseOverviewRouteBySlug[course.slug] ?? "/courses";

          return (
            <Link
              className={`course-row ${isProgramming ? "featured" : ""} ${isCurrent ? "current" : ""}`}
              href={overviewHref}
              key={course.slug}
              aria-label={fillTemplate(copy["courses.ariaProgress"], { title: course.title, pct: course.progress })}
              aria-current={isCurrent ? "true" : undefined}
            >
                    <span className="course-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="course-main"><span className="course-code">{course.code}</span><strong>{course.title}</strong><small>{course.description}</small></span>
                    <span className="course-stats"><span>{course.lessons} {copy["status.lessons"]}</span><span className={`status status-${canonicalStatus.toLowerCase().replaceAll(" ", "-")}`}>{statusLabel}</span></span>
                    <span className="course-progress"><strong>{course.progress}%</strong><ProgressBar value={course.progress} /><span className="course-cta">{ctaLabel} →</span></span>
                    <span className="row-arrow">→</span>
                  </Link>
                );
              })}
            </section>
            <p className="quiet-note">{fillTemplate(copy["courses.loadedNote"], { count: data.count, semesters: data.semesters.length })}</p>
          </>
        )}
      </div>
    </>
  );
}
