import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProgressBar } from "@/components/progress-bar";
import { courses } from "@/data/courses";

export default function DashboardPage() {
  const activeCourses = courses.slice(0, 3);
  return (
    <AppShell active="dashboard">
      <div className="topbar"><span className="date">SUN · 07 SEP · 23:48</span><span className="avatar">AR</span></div>
      <div className="cockpit-grid">
        <section className="cockpit-main">
          <section className="greeting"><span className="eyebrow">Good evening, Arya</span><h1>akhirnya dateng juga.</h1></section>
          <article className="recommendation">
            <div className="focus-label"><span>TONIGHT&apos;S MOVE</span><i>05</i></div>
            <h2>Variables <span>&amp; Data Types</span></h2>
            <p>Kasih nama ke sesuatu biar otak program nggak ngos-ngosan.</p>
            <div className="focus-meta"><span>18 MIN</span><span>CS-101</span><span>MODULE 05</span></div>
            <Link className="button button-primary" href="/courses/programming/variables">gas. <span aria-hidden="true">→</span></Link>
          </article>
          <div className="dashboard-progress">
            <div><span className="card-kicker">Semester signal</span><strong>38%</strong></div>
            <div className="progress-track"><span style={{ width: "38%" }} /></div>
            <p>27 / 71 lessons · pelan nggak apa. yang penting gerak.</p>
          </div>
        </section>
        <aside className="dashboard-robin">
          <div className="system-presence"><span className="presence-orb"><i /></span><div><strong>ROBIN</strong><small><i /> ONLINE</small></div><span className="frequency-label">24.7 kHz</span></div>
          <div className="presence-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <blockquote>“hari ini kita belajar beneran apa cuma buka dashboard terus merasa produktif?”</blockquote>
          <p>Current context: Foundations of Programming</p>
        </aside>
      </div>

      <div className="section-head"><h2>Courses in motion</h2><Link href="/courses">view all 7 →</Link></div>
      <section className="course-strip">
        {activeCourses.map((course) => (
          <Link href={course.slug === "programming" ? "/courses/programming" : "/courses"} className="card course-mini" key={course.slug}>
            <span className="course-code">{course.code}</span><h3>{course.title}</h3>
            <ProgressBar value={course.progress} /><div className="bar-meta"><span>{course.progress}% complete</span><span>{course.lessons} lessons</span></div>
          </Link>
        ))}
      </section>

      <div className="lower-grid">
        <article className="activity-panel">
          <span className="card-kicker">Recent activity</span>
          <ul className="activity-list">
            <li className="activity-item"><span className="activity-dot" /><span><strong>Compiler vs Interpreter</strong><span>lesson completed · 2 days ago</span></span><span>+1</span></li>
            <li className="activity-item"><span className="activity-dot" /><span><strong>Logic propositions</strong><span>quick check passed · 4 days ago</span></span><span>4/5</span></li>
            <li className="activity-item"><span className="activity-dot" /><span><strong>Problem framing</strong><span>notes updated · 6 days ago</span></span><span>↗</span></li>
          </ul>
        </article>
        <article className="tonight">
          <span className="card-kicker">Tonight&apos;s Move</span>
          <blockquote>“Selesaikan Variables, terus tulis satu contoh dari hidup lu sendiri.”</blockquote>
          <div className="tonight-note"><span>◷</span><span>target: 25 focused minutes</span></div>
        </article>
      </div>
    </AppShell>
  );
}
