"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";

type MobileNavActive = "dashboard" | "courses" | "lesson" | "practice";

// Phase 16.1: mobile-only floating navigation (≤430px). One FAB expands a
// vertical stack upward. Tablet/desktop rendering is untouched: the wrapper
// is display:none outside the phone media query.
const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const CoursesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M8 4.5C6.5 3 4 3 2.5 3.5v9C4 12 6.5 12 8 13.5 9.5 12 12 12 13.5 12.5v-9C12 3 9.5 3 8 4.5z" /><path d="M8 4.5v9" />
  </svg>
);
const LessonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M5 7l2.5 2L5 11" /><path d="M9.5 11H12" />
  </svg>
);
const PracticeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5.5 8h5" /><rect x="2" y="5.5" width="2.5" height="5" rx="0.75" /><rect x="11.5" y="5.5" width="2.5" height="5" rx="0.75" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export function MobileNav({ active = "dashboard" }: { active?: MobileNavActive }) {
  const [open, setOpen] = useState(false);
  const current = useCurrentLesson();
  const rootRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Close on outside tap and Escape; return focus to the FAB on Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        fabRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const items: { key: MobileNavActive; href: string; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", href: "/", label: "Dashboard", icon: <DashboardIcon /> },
    { key: "courses", href: "/courses", label: "Courses", icon: <CoursesIcon /> },
    { key: "lesson", href: `/courses/${current.courseSlug}/${current.lessonSlug}`, label: "Lesson", icon: <LessonIcon /> },
    { key: "practice", href: "/practice", label: "Practice", icon: <PracticeIcon /> },
  ];

  return (
    <div className="mobile-nav" ref={rootRef}>
      <nav className="mobile-menu" id="mobile-nav-menu" aria-label="Navigasi utama" hidden={!open}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={active === item.key ? "on" : ""}
            aria-current={active === item.key ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.icon}<span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button
        ref={fabRef}
        type="button"
        className="mobile-fab"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
    </div>
  );
}
