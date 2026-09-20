"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";

export function CurrentLessonLink({ className, children, ariaCurrent }: { className?: string; children: ReactNode; ariaCurrent?: "page" }) {
  const current = useCurrentLesson();
  return <Link href={`/courses/${current.courseSlug}/${current.lessonSlug}`} className={className} aria-current={ariaCurrent}>{children}</Link>;
}
