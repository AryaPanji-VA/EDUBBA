import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { getPracticeTrack } from "@/lib/practice/registry";

export default function PracticePage() {
  const track = getPracticeTrack("python");
  const exerciseCount = track?.topics.reduce((total, topic) => total + topic.exercises.length, 0) ?? 0;
  return (
    <AppShell active="practice">
      <TopBar breadcrumb={<b>Practice</b>} />
      <div className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">Practice Lab · v1</span>
            <h1>Latihan kecil, tanpa drama.</h1>
            <p>Pelankan konsep dari lesson lewat latihan pendek — predict, fix, write. Check-nya deterministic; Robin duduk di samping kalau perlu dijelaskan ulang.</p>
          </div>
        </header>

        <div className="grid">
          <div className="col">
            <section className="panel cut continue" aria-label="Python practice track">
              <div className="continue-in">
                <div>
                  <span className="tag acc">{track?.title ?? "Python"} · {exerciseCount} exercises</span>
                  <h2 className="lesson-title">Python coding gym</h2>
                  <p className="lesson-meta">{track?.topics.map((topic) => topic.title).join(" · ")}</p>
                  <p className="lesson-x">Predict output, perbaiki kode, tulis kode. <em>check-nya deterministic, Robin nemenin.</em></p>
                </div>
                <div className="continue-actions">
                  <Link className="btn-p" href="/practice/python">Open the gym →</Link>
                  <Link className="btn-g" href="/courses/programming">Back to course →</Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
