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

        <section className="practice-mode-grid" aria-label="Practice modes">
          <Link className="panel practice-mode-card" href="/practice/python">
            <span className="tag acc">Live · {exerciseCount} exercises</span>
            <h2>Guided Practice</h2>
            <p>Latihan terstruktur dari lesson dengan feedback langsung yang jelas dan deterministic.</p>
            <span className="practice-mode-cta">Open Guided Practice →</span>
          </Link>
          <Link className="panel practice-mode-card" href="/practice/python/sandbox">
            <span className="tag acc">Available</span>
            <h2>Python Sandbox</h2>
            <p>Coba Python pemula dengan bebas, lalu lihat langsung apa yang dilakukan kode lu.</p>
            <span className="practice-mode-cta">Open Sandbox →</span>
          </Link>
          <Link className="panel practice-mode-card" href="/practice/thinking">
            <span className="tag acc">12 activities</span>
            <h2>Logic &amp; Thinking</h2>
            <p>Latih tracing, decomposition, pseudocode, dan cara menyusun algoritma tanpa tes IQ.</p>
            <span className="practice-mode-cta">Open Thinking Lab →</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
