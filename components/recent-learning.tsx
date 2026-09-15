"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";

type LogEntry = {
  id: string;
  lesson_slug: string;
  summary: string;
  concepts_learned: string[];
  weak_concepts: string[];
  next_step: string | null;
  created_at: string;
};

const lessonLabels: Record<string, string> = {
  variables: "Variables",
  "data-types": "Data Types",
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function RecentLearning() {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const current = useCurrentLesson();
  const currentLabel = current.lessonSlug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  const currentHref = `/courses/${current.courseSlug}/${current.lessonSlug}`;

  const load = useCallback(async (controller: AbortController) => {
    try {
      const response = await fetch("/api/learning/logs", { signal: controller.signal });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      if (Array.isArray(data.logs)) setLogs(data.logs);
    } catch { /* best-effort */ }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller);
    return () => controller.abort();
  }, [load]);

  return (
    <section className="panel recent-learning" aria-label="Recent learning">
      <header className="shead" style={{ marginBottom: "4px" }}>
        <span className="tag blue">Recent learning</span>
        <span className="shead-meta">session logs</span>
      </header>
      {logs === null ? (
        <div className="mast-item"><div className="mast-top"><span className="mast-name">Loading…</span></div></div>
      ) : logs.length === 0 ? (
        <p className="a-note">Belum ada sesi belajar yang gue simpan. Mau lanjut dari <Link href={currentHref}>{currentLabel}</Link>?</p>
      ) : (
        <ul className="mast-list">
          {logs.map((log) => (
            <li key={log.id} className="mast-item">
              <div className="mast-top">
                <span className="mast-name">{lessonLabels[log.lesson_slug] ?? log.lesson_slug}</span>
                <span className="mast-pct">{relativeTime(log.created_at)}</span>
              </div>
              <p className="recent-learning-summary">{log.summary.substring(0, 120)}{log.summary.length > 120 ? "…" : ""}</p>
              {log.concepts_learned.length > 0 && (
                <div className="recent-learning-chips">
                  {log.concepts_learned.slice(0, 4).map((c) => (
                    <span key={c} className="recent-learning-chip learned">{c}</span>
                  ))}
                </div>
              )}
              {log.weak_concepts.length > 0 && (
                <div className="recent-learning-chips weak">
                  {log.weak_concepts.slice(0, 3).map((c) => (
                    <span key={c} className="recent-learning-chip needs-work">{c}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="pxdiv" aria-hidden="true" />
      <div className="mast-foot">
        <Link className="recent-learning-action" href={currentHref}>Continue learning →</Link>
      </div>
    </section>
  );
}
