"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { ProgressBar } from "@/components/progress-bar";
import { courseOverviewRouteBySlug, type Course } from "@/data/courses";

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
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemesterNumber);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError("Course signal putus. Backend-nya belum jawab.");
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
      <TopBar breadcrumb={<><b>Courses</b><span className="sep">/</span>Semester {selectedSemester}</>} />
      <div className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">Semester {padSemester(selectedSemester)} · {courseCount} {courseCount === 1 ? "course" : "courses"}</span>
            <h1>Your course shelf.</h1>
            <p>Nggak semuanya harus ditaklukkan malam ini. Pilih satu, terus beneran masuk.</p>
          </div>
          <div className="semester-stamp"><span>SEM / {padSemester(selectedSemester)}</span><strong>{overallProgress === null ? "—" : `${overallProgress}%`}</strong><small>overall</small></div>
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
          <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>requesting /api/courses</strong><small>Browser lagi nunggu JSON dari backend.</small></div>
        ) : error || !data ? (
          <div className="course-request-state is-error" role="alert"><strong>{error ?? "Course signal putus."}</strong><small>Request gagal sebelum data course sampai ke browser.</small><button className="button" onClick={() => void loadCourses()}>coba lagi</button></div>
        ) : courseCount === 0 ? (
          <section className="semester-empty" aria-label={`Semester ${selectedSemester} kosong`} role="status">
            <strong>Belum ada course yang dimasukin ke semester ini.</strong>
            <small>Materi kurikulumnya belum ditambahkan. Begitu resmi masuk, course-nya muncul di sini — nggak ada yang difabricate.</small>
          </section>
        ) : (
          <>
            <section className="courses-list" aria-label={`Semester ${selectedSemester} courses`}>
        {courses.map((course, index) => {
          const isProgramming = course.slug === "programming";
          const learningState = course.progress > 0 ? "LEARNING" : "NOT STARTED";
          const overviewHref = courseOverviewRouteBySlug[course.slug] ?? "/courses";

          return (
            <Link className={`course-row ${isProgramming ? "featured" : ""}`} href={overviewHref} key={course.slug} aria-label={`${course.title}, ${course.progress}% complete`}>
                    <span className="course-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="course-main"><span className="course-code">{course.code}</span><strong>{course.title}</strong><small>{course.description}</small></span>
                    <span className="course-stats"><span>{course.lessons} lessons</span><span className={`status status-${course.status.toLowerCase().replaceAll(" ", "-")}`}>{learningState}</span></span>
                    <span className="course-progress"><strong>{course.progress}%</strong><ProgressBar value={course.progress} /></span>
                    <span className="row-arrow">→</span>
                  </Link>
                );
              })}
            </section>
            <p className="quiet-note">Loaded from GET /api/courses · {data.count} records received as JSON · {data.semesters.length} semesters</p>
          </>
        )}
      </div>
    </>
  );
}
