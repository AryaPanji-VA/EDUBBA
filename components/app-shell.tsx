import Link from "next/link";
import { SignalBackground } from "@/components/signal-background";

type AppShellProps = {
  children: React.ReactNode;
  active?: "dashboard" | "courses" | "lesson";
  signalMode?: "calm" | "active" | "quiet" | "error";
  signalPulse?: boolean;
};

export function AppShell({ children, active = "dashboard", signalMode = "calm", signalPulse = false }: AppShellProps) {
  return (
    <div className={`workspace mode-${signalMode}`}>
      <SignalBackground intensity={signalMode} pulse={signalPulse} />
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="ROBIN dashboard">
          <span className="brand-signal"><i /><i /><i /></span>
          <span><span className="brand-name">ROBIN</span><span className="brand-note">// LEARNING SYSTEM</span></span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <Link className={`nav-link ${active === "dashboard" ? "active" : ""}`} href="/"><span className="nav-icon">⌂</span><span className="nav-label">Dashboard</span></Link>
          <Link className={`nav-link ${active === "courses" ? "active" : ""}`} href="/courses"><span className="nav-icon">□</span><span className="nav-label">Courses</span></Link>
          <Link className={`nav-link ${active === "lesson" ? "active" : ""}`} href="/courses/programming/variables"><span className="nav-icon">↗</span><span className="nav-label">Current lesson</span></Link>
        </nav>
        <div className="sidebar-footer"><div><span className="online-dot" />SIGNAL ONLINE</div><div>SEM 01 · WEEK 06</div></div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
