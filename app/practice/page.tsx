"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { getPracticeTrack } from "@/lib/practice/registry";
import { useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate } from "@/lib/i18n/ui-copy";

export default function PracticePage() {
  const copy = useUiCopy();
  const track = getPracticeTrack("python");
  const exerciseCount = track?.topics.reduce((total, topic) => total + topic.exercises.length, 0) ?? 0;
  return (
    <AppShell active="practice">
      <TopBar breadcrumb={<b>{copy["nav.practice"]}</b>} />
      <div className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">{copy["practice.eyebrow"]}</span>
            <h1>{copy["practice.title"]}</h1>
            <p>{copy["practice.sub"]}</p>
          </div>
        </header>

        <section className="practice-mode-grid" aria-label={copy["practice.modes"]}>
          <Link className="panel practice-mode-card" href="/practice/python">
            <span className="tag acc">{fillTemplate(copy["practice.live"], { count: exerciseCount })}</span>
            <h2>{copy["practice.guided"]}</h2>
            <p>{copy["practice.guidedDesc"]}</p>
            <span className="practice-mode-cta">{copy["practice.openGuided"]} →</span>
          </Link>
          <Link className="panel practice-mode-card" href="/practice/python/sandbox">
            <span className="tag acc">{copy["practice.available"]}</span>
            <h2>Python Sandbox</h2>
            <p>{copy["practice.sandboxDesc"]}</p>
            <span className="practice-mode-cta">{copy["practice.openSandbox"]} →</span>
          </Link>
          <Link className="panel practice-mode-card" href="/practice/thinking">
            <span className="tag acc">{copy["practice.activities"]}</span>
            <h2>Logic &amp; Thinking</h2>
            <p>{copy["practice.thinkingDesc"]}</p>
            <span className="practice-mode-cta">{copy["practice.openThinking"]} →</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
