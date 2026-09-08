import Link from "next/link";
import { BackendTest } from "@/components/backend-test";

const endpoints = [
  { route: "GET /api/hello", purpose: "Small connection test and JSON response" },
  { route: "GET /api/courses", purpose: "Reads course metadata from Supabase" },
  { route: "GET /api/courses/programming", purpose: "Returns one course with nested modules and lessons" },
  { route: "GET /api/db-test", purpose: "Checks the database connection and course count" },
] as const;

const databaseTables = [
  { name: "courses", relationship: "one course has many modules" },
  { name: "modules", relationship: "course_id → courses.id" },
  { name: "lessons", relationship: "module_id → modules.id" },
] as const;

export default function DevPage() {
  return (
    <main className="lab-page">
      <div className="lab-top"><Link href="/" className="lab-back">← ROBIN</Link><span className="lab-version">build 0.4.0 · database relations</span></div>
      <header className="lab-header"><span className="eyebrow">Internal workspace</span><h1>ROBIN LAB</h1><p>Tempat bongkar kap mesin. Course content sekarang punya hubungan courses → modules → lessons.</p></header>

      <BackendTest />

      <section className="lab-panel architecture lab-wide"><div className="lab-panel-head"><span>04</span><h2>Request lifecycle</h2></div><div className="architecture-flow"><div><span>01</span><strong>Browser</strong><small>fetch() starts here</small></div><b>→</b><div><span>02</span><strong>Next.js API</strong><small>Server route handles GET</small></div><b>→</b><div><span>03</span><strong>Supabase</strong><small>Client sends the query</small></div><b>→</b><div><span>04</span><strong>PostgreSQL</strong><small>related rows are selected</small></div><b>→</b><div><span>05</span><strong>JSON</strong><small>Nested result returns</small></div></div><p>React tidak pernah menerima credential Supabase. Browser tetap bicara ke Next.js; hanya backend yang bicara ke database.</p></section>

      <section className="lab-panel lab-wide"><div className="lab-panel-head"><span>05</span><h2>Relational model</h2></div><div className="relationship-map">{databaseTables.map((table, index) => <div className="relationship-table" key={table.name}><code>{table.name}</code><span>{table.relationship}</span>{index < databaseTables.length - 1 && <b aria-hidden="true">↓</b>}</div>)}</div><p className="lab-panel-note">Table names are shown without fake row counts. Run the Phase 4 SQL scripts before treating modules and lessons as live.</p></section>

      <div className="lab-grid lab-secondary-grid">
        <section className="lab-panel api-directory"><div className="lab-panel-head"><span>06</span><h2>Available endpoints</h2></div>{endpoints.map((endpoint) => <div className="endpoint-row" key={endpoint.route}><code>{endpoint.route}</code><span>{endpoint.purpose}</span></div>)}</section>
        <section className="lab-panel file-map"><div className="lab-panel-head"><span>07</span><h2>Quick file map</h2></div><div className="file-tree"><code>app/api/</code><span>backend route handlers</span><code>lib/supabase/</code><span>server-only database client</span><code>database/</code><span>manual schema, seed, and query SQL</span><code>data/</code><span>temporary progress and status presentation</span></div></section>
      </div>

      <footer className="lab-footer"><span>Relations masuk. Auth dan AI masih disuruh nunggu di luar.</span><Link href="/courses/programming">watch the relational course →</Link></footer>
    </main>
  );
}
