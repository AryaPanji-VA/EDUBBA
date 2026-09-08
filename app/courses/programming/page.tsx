import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProgressBar } from "@/components/progress-bar";
import { programmingModules } from "@/data/courses";

export default function ProgrammingCoursePage() {
  return (
    <AppShell active="courses">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/courses">Courses</Link><span>/</span><span>CS-101</span></nav>
      <header className="course-hero">
        <div className="course-hero-copy"><span className="eyebrow">CS-101 · Foundations</span><h1>Foundations of Programming Language</h1><p>Belajar bukan cuma nulis syntax. Kita bangun cara mikir yang bikin syntax-nya masuk akal.</p></div>
        <div className="course-progress-card"><span className="card-kicker">Course progress</span><strong>4 / 10</strong><ProgressBar value={40} /><small>Next up: Variables · 18 min</small></div>
      </header>

      <div className="learning-layout">
        <section>
          <div className="section-head lesson-head"><div><span className="eyebrow">Learning path</span><h2>10 small steps. One useful brain.</h2></div><span className="path-legend"><i className="legend-complete" /> done <i className="legend-current" /> current</span></div>
          <ol className="module-list">
            {programmingModules.map((module) => {
              const content = (
                <><span className={`module-number ${module.state}`}>{module.state === "completed" ? "✓" : String(module.number).padStart(2, "0")}</span><span className="module-copy"><small>Module {String(module.number).padStart(2, "0")}</small><strong>{module.title}</strong></span><span className={`module-state ${module.state}`}>{module.state === "completed" ? "completed" : module.state === "current" ? "continue →" : "locked"}</span></>
              );
              return <li key={module.number}>{module.state === "current" ? <Link className="module-row current" href="/courses/programming/variables">{content}</Link> : <div className={`module-row ${module.state}`}>{content}</div>}</li>;
            })}
          </ol>
        </section>
        <aside className="course-note card"><span className="card-kicker">Margin note · Robin</span><p>Empat modul pertama udah aman. Sekarang kita mulai nyentuh benda yang bakal muncul di hampir semua program yang lu tulis.</p><span>Next checkpoint</span><strong>Variables → Data Types</strong></aside>
      </div>
    </AppShell>
  );
}
