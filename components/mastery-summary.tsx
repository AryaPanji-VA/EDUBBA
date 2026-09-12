"use client";

import { useCallback, useEffect, useState } from "react";
import { type LessonLanguage } from "@/content/lessons/shared-copy";

type MasteryEntry = { concept: string; state: "unseen" | "shaky" | "developing" | "strong"; evidenceCount: number };
type MasteryResponse = { lesson?: string; concepts?: MasteryEntry[] };

type Props = {
  lessonSlug: string;
  language: LessonLanguage;
  copy: Record<string, string>;
  conceptLabels: Record<string, string>;
};

export function MasterySummary({ lessonSlug, language, copy, conceptLabels }: Props) {
  const stateLabels: Record<string, string> = {
    unseen: copy.masteryUnseen, shaky: copy.masteryShaky, developing: copy.masteryDeveloping, strong: copy.masteryStrong,
  };
  const [entries, setEntries] = useState<MasteryEntry[] | null>(null);

  const load = useCallback(async (controller: AbortController) => {
    try {
      const response = await fetch(`/api/learning/mastery?lesson=${encodeURIComponent(lessonSlug)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json() as MasteryResponse;
      if (Array.isArray(data.concepts)) setEntries(data.concepts);
    } catch { /* Mastery is optional; leave previous state. */ }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller);
    return () => controller.abort();
  }, [load]);

  return <details className="references mastery-summary" id="mastery-summary">
    <summary>{copy.masteryTitle}</summary>
    <span className="card-kicker">{copy.masteryTitle}</span>
    <div className="status-list">
      {(entries ?? []).map((entry) => (
        <div key={entry.concept}>
          <dt>{conceptLabels[entry.concept] ?? entry.concept}</dt>
          <dd className={`status-value ${entry.state === "strong" ? "ok" : entry.state === "shaky" ? "error" : entry.state === "developing" ? "dev" : "off"}`}>
            {stateLabels[entry.state] ?? entry.state}
          </dd>
        </div>
      ))}
      {entries === null && <div><dt>{copy.masteryTitle}</dt><dd>…</dd></div>}
    </div>
    <button className="button" type="button" onClick={() => { const controller = new AbortController(); void load(controller); }}>{copy.masteryRefresh}</button>
    <p className="lab-panel-note">{copy.masteryNote}</p>
  </details>;
}
