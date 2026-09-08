import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProgrammingCourseClient } from "@/components/programming-course-client";

export default function ProgrammingCoursePage() {
  return (
    <AppShell active="courses">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/courses">Courses</Link><span>/</span><span>CS-101</span></nav>
      <ProgrammingCourseClient />
    </AppShell>
  );
}
