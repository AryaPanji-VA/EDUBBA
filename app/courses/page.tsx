import { AppShell } from "@/components/app-shell";
import { CoursesClient } from "@/components/courses-client";

export default function CoursesPage() {
  return (
    <AppShell active="courses">
      <CoursesClient />
    </AppShell>
  );
}
