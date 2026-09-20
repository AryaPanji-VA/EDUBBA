import Link from "next/link";
import { CurrentLessonLink } from "@/components/current-lesson-link";
import { EdubbaBrand } from "@/components/edubba-brand";
import { EnvironmentLayer } from "@/components/environment-layer";
import { MobileNav } from "@/components/mobile-nav";
import { LocalProfileSummary } from "@/components/local-profile-summary";
import { BrandTagline } from "@/components/theme-switcher";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  active?: "dashboard" | "courses" | "lesson" | "practice" | "settings" | "profile";
  signalMode?: "calm" | "active" | "quiet" | "error";
  signalPulse?: boolean;
};

// Mockup sidebar SVG icons (exact from the Kimi mockup)
const DashboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const CoursesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M8 4.5C6.5 3 4 3 2.5 3.5v9C4 12 6.5 12 8 13.5 9.5 12 12 12 13.5 12.5v-9C12 3 9.5 3 8 4.5z" /><path d="M8 4.5v9" />
  </svg>
);
const LessonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M5 7l2.5 2L5 11" /><path d="M9.5 11H12" />
  </svg>
);
const PracticeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M5.5 8h5" /><rect x="2" y="5.5" width="2.5" height="5" rx="0.75" /><rect x="11.5" y="5.5" width="2.5" height="5" rx="0.75" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="8" cy="8" r="2.2" />
    <path d="M8 1.8v1.7M8 12.5v1.7M1.8 8h1.7M12.5 8h1.7M3.6 3.6l1.2 1.2M11.2 11.2l1.2 1.2M12.4 3.6l-1.2 1.2M4.8 11.2l-1.2 1.2" />
  </svg>
);

function ShellInner({ children, active = "dashboard", signalMode = "calm" }: AppShellProps) {
  return (
    <div className={`app mode-${signalMode}`}>
      <aside className="side">
        {/* EDUBBA is the platform brand; Robin is the companion inside it. */}
        <div className="brand">
          <EdubbaBrand>
            <BrandTagline />
          </EdubbaBrand>
        </div>

        <nav className="nav">
          <Link href="/" className={active === "dashboard" ? "on" : ""} aria-current={active === "dashboard" ? "page" : undefined}>
            <DashboardIcon /> <span>Dashboard</span>
          </Link>
          <Link href="/courses" className={active === "courses" ? "on" : ""} aria-current={active === "courses" ? "page" : undefined}>
            <CoursesIcon /> <span>Courses</span>
          </Link>
          <Link href="/practice" className={active === "practice" ? "on" : ""} aria-current={active === "practice" ? "page" : undefined}>
            <PracticeIcon /> <span>Practice</span>
          </Link>
          <CurrentLessonLink className={active === "lesson" ? "on" : ""} ariaCurrent={active === "lesson" ? "page" : undefined}>
            <LessonIcon /> <span>Current lesson</span>
          </CurrentLessonLink>

          {/* Flexible space pushes Settings toward the account area below. */}
          <div className="nav-spacer" aria-hidden="true" />
          <Link href="/settings" className={active === "settings" ? "on" : ""} aria-current={active === "settings" ? "page" : undefined}>
            <SettingsIcon /> <span>Settings</span>
          </Link>
        </nav>

        <div className="side-foot">
          <LocalProfileSummary />
        </div>
      </aside>

      <main className="main">
        {children}
      </main>

      {/* Mobile-only floating navigation (≤430px); display:none elsewhere. */}
      <MobileNav active={active} />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <>
      <EnvironmentLayer />
      <ShellInner {...props} />
    </>
  );
}
