import { AppShell } from "@/components/app-shell";
import { CoursesClient } from "@/components/courses-client";

export default function CoursesPage() {
  return (
    <AppShell active="courses">
      <header className="page-header">
        <div><span className="eyebrow">Semester 01 · 7 courses</span><h1>Your course shelf.</h1><p>Nggak semuanya harus ditaklukkan malam ini. Pilih satu, terus beneran masuk.</p></div>
        <div className="semester-stamp"><span>SEM / 01</span><strong>38%</strong><small>overall</small></div>
      </header>

      <CoursesClient />
    </AppShell>
  );
}
