import Link from "next/link";
import { BackendTest } from "@/components/backend-test";

const endpoints = [
  { route: "GET /api/hello", purpose: "Small connection test and JSON response" },
  { route: "GET /api/courses", purpose: "Reads course metadata from Supabase" },
  { route: "GET /api/db-test", purpose: "Checks the database connection and course count" },
] as const;

export default function DevPage() {
  return (
    <main className="lab-page">
      <div className="lab-top"><Link href="/" className="lab-back">← ROBIN</Link><span className="lab-version">build 0.3.0 · database basics</span></div>
      <header className="lab-header"><span className="eyebrow">Internal workspace</span><h1>ROBIN LAB</h1><p>Tempat bongkar kap mesin. Backend sekarang siap baca course metadata dari PostgreSQL lewat Supabase.</p></header>

      <BackendTest />

      <section className="lab-panel architecture lab-wide"><div className="lab-panel-head"><span>04</span><h2>Request lifecycle</h2></div><div className="architecture-flow"><div><span>01</span><strong>Browser</strong><small>fetch() starts here</small></div><b>→</b><div><span>02</span><strong>Next.js API</strong><small>Server route handles GET</small></div><b>→</b><div><span>03</span><strong>Supabase</strong><small>Client sends the query</small></div><b>→</b><div><span>04</span><strong>PostgreSQL</strong><small>courses rows are selected</small></div><b>→</b><div><span>05</span><strong>JSON</strong><small>Result returns to browser</small></div></div><p>React tidak pernah menerima credential Supabase. Browser tetap bicara ke Next.js; hanya backend yang bicara ke database.</p></section>

      <div className="lab-grid lab-secondary-grid">
        <section className="lab-panel api-directory"><div className="lab-panel-head"><span>05</span><h2>Available endpoints</h2></div>{endpoints.map((endpoint) => <div className="endpoint-row" key={endpoint.route}><code>{endpoint.route}</code><span>{endpoint.purpose}</span></div>)}</section>
        <section className="lab-panel file-map"><div className="lab-panel-head"><span>06</span><h2>Quick file map</h2></div><div className="file-tree"><code>app/api/</code><span>backend route handlers</span><code>lib/supabase/</code><span>server-only database client</span><code>database/</code><span>manual schema, seed, and query SQL</span><code>data/</code><span>temporary progress and status presentation</span></div></section>
      </div>

      <footer className="lab-footer"><span>Database masuk. Auth dan AI masih disuruh nunggu di luar.</span><Link href="/courses">watch database-backed courses →</Link></footer>
    </main>
  );
}
