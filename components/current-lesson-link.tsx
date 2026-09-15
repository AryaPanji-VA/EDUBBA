"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";

export function CurrentLessonLink({ className, children }: { className?: string; children: ReactNode }) {
  const current = useCurrentLesson();
  return <Link href={`/courses/${current.courseSlug}/${current.lessonSlug}`} className={className}>{children}</Link>;
}
