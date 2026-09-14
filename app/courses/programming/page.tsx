import { AppShell } from "@/components/app-shell";
import { ProgrammingCourseClient } from "@/components/programming-course-client";

export default function ProgrammingCoursePage() {
  return (
    <AppShell active="courses">
      <ProgrammingCourseClient />
    </AppShell>
  );
}
