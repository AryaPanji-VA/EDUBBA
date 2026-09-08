"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import type { Course } from "@/data/courses";

type CoursesResponse = {
  courses: Course[];
  count: number;
};

export function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([]);
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
      setCourses(data.courses);
    } catch {
      setError("Course signal putus. Backend-nya belum jawab.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  if (isLoading) {
    return <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>requesting /api/courses</strong><small>Browser lagi nunggu JSON dari backend.</small></div>;
  }

  if (error) {
    return <div className="course-request-state is-error" role="alert"><strong>{error}</strong><small>Request gagal sebelum data course sampai ke browser.</small><button className="button" onClick={() => void loadCourses()}>coba lagi</button></div>;
  }

  return (
    <>
      <section className="courses-list" aria-label="Semester 1 courses">
        {courses.map((course, index) => {
          const isProgramming = course.slug === "programming";
          const learningState = course.progress > 0 ? "LEARNING" : "NOT STARTED";

          return (
            <Link className={`course-row ${isProgramming ? "featured" : ""}`} href={isProgramming ? "/courses/programming" : "/courses"} key={course.slug} aria-label={`${course.title}, ${course.progress}% complete`}>
              <span className="course-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="course-main"><span className="course-code">{course.code}</span><strong>{course.title}</strong><small>{course.description}</small></span>
              <span className="course-stats"><span>{course.lessons} lessons</span><span className={`status status-${course.status.toLowerCase().replaceAll(" ", "-")}`}>{learningState}</span></span>
              <span className="course-progress"><strong>{course.progress}%</strong><ProgressBar value={course.progress} /></span>
              <span className="row-arrow">→</span>
            </Link>
          );
        })}
      </section>
      <p className="quiet-note">Loaded from GET /api/courses · {courses.length} records received as JSON.</p>
    </>
  );
}
