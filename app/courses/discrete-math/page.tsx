import { AppShell } from "@/components/app-shell";
import { DiscreteMathCourseClient } from "@/components/discrete-math-course-client";

export default function DiscreteMathCoursePage() {
  return (
    <AppShell active="courses">
      <DiscreteMathCourseClient />
    </AppShell>
  );
}
