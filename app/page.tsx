"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { LearningSearch } from "@/components/learning-search";
import { implementedLessonSlugsByCourse, implementedProgrammingLessonSlugs, defaultCurrentLesson } from "@/data/courses";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";
import type { CurrentLesson } from "@/lib/progress/types";
import { useLanguage, useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate, type UiCopyKey } from "@/lib/i18n/ui-copy";
import { toRobinProfileContext, type RobinProfileContext } from "@/lib/profile/local-profile";
import { useLocalProfile } from "@/lib/profile/use-local-profile";

type Copy = Record<UiCopyKey, string>;

const DAYS = {
  id: ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"],
  en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
};
const MONTHS = {
  id: ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"],
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
};

function useGreeting(preferredName: string) {
  const { language } = useLanguage();
  const copy = useUiCopy();
  const [greeting, setGreeting] = useState(fillTemplate(copy["dash.greeting.evening"], { name: preferredName }));
  const [date, setDate] = useState("");
  useEffect(() => {
    const hr = new Date().getHours();
    const key: UiCopyKey = hr >= 23 || hr < 5
      ? "dash.greeting.night"
      : hr < 12
      ? "dash.greeting.morning"
      : hr < 18
      ? "dash.greeting.afternoon"
      : "dash.greeting.evening";
    setGreeting(fillTemplate(copy[key], { name: preferredName }));
    const d = new Date();
    const h12 = (hr % 12 || 12).toString();
    const ampm = hr < 12 ? "AM" : "PM";
    const min = d.getMinutes().toString().padStart(2, "0");
    setDate(`${DAYS[language][d.getDay()]} · ${MONTHS[language][d.getMonth()]} ${d.getDate()} · ${h12}:${min} ${ampm}`);
  }, [preferredName, language, copy]);
  return { greeting, date };
}

// Pixel avatar SVG (shared with course page)
const AssistantAvatar = () => (
  <span className="a-ava" aria-hidden="true">
    <svg width="12" height="12" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <g className="ava-pane"><rect x="1" y="1" width="3" height="3" /><rect x="6" y="1" width="3" height="3" /><rect x="1" y="6" width="3" height="3" /></g>
      <rect className="ava-dim" x="6" y="6" width="3" height="3" />
    </svg>
  </span>
);

type MiniMessage = { role: "user" | "assistant"; content: string };

function RobinMiniChat({ currentLesson, profileContext, copy }: { currentLesson: CurrentLesson; profileContext: RobinProfileContext; copy: Copy }) {
  const [messages, setMessages] = useState<MiniMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function send() {
    const text = draft.trim();
    if (busy || !text) return;
    const requestController = new AbortController();
    controller.current = requestController;
    setBusy(true);
    setError("");
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    const timeout = window.setTimeout(() => requestController.abort(), 35_000);
    try {
      const response = await fetch("/api/robin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: requestController.signal,
        body: JSON.stringify({
          lessonSlug: currentLesson.lessonSlug,
          message: text,
          history: messages.slice(-4),
          profileContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : copy["robin.errorOffline"]);
      if (controller.current !== requestController) return;
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      if (controller.current === requestController) {
        setError(requestController.signal.aborted ? copy["robin.errorTimeout"] : copy["robin.errorOffline"]);
      }
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) { controller.current = null; setBusy(false); }
    }
  }

  const lastRobin = messages.filter((m) => m.role === "assistant").at(-1);

  return (
    <section className="panel assist" aria-label={copy["dash.robinAria"]}>
      <div className="a-head">
        <AssistantAvatar />
        <div>
          <div className="a-name">Robin</div>
          <div className="a-sub">study companion</div>
        </div>
        <span className="a-status"><i />{busy ? copy["robin.thinking"] : copy["robin.online"]}</span>
      </div>
      <div className="chat">
        {messages.length === 0 && (
          <div className="msg-l">
            <AssistantAvatar />
            <div>
              <p>{copy["robin.miniIntro"]}</p>
              <span className="mmeta">{copy["robin.miniMeta"]}</span>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "msg-u" : "msg-l"}>
            {message.role === "assistant" && <AssistantAvatar />}
            <div>
              {message.role === "user" ? <p>{message.content}</p> : <p>{message.content}</p>}
              <span className="mmeta">{message.role === "user" ? copy["robin.you"] : "Robin"}</span>
            </div>
          </div>
        ))}
        {busy && (
          <div className="msg-l">
            <AssistantAvatar />
            <div><p className="typing-dots"><i /><i /><i /></p></div>
          </div>
        )}
      </div>
      {error && <p className="robin-error" role="alert">{error}</p>}
      <div className="a-input">
        <input
          type="text"
          value={draft}
          maxLength={500}
          placeholder={copy["robin.miniPlaceholder"]}
          aria-label={copy["companion.ask"]}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
        />
        <button className="a-send" type="button" aria-label={copy["companion.send"]} disabled={busy || !draft.trim()} onClick={() => void send()}>↑</button>
      </div>
      {lastRobin && (
        <div className="companion-actions companion-actions-flush">
          <Link href={`/courses/${currentLesson.courseSlug}/${currentLesson.lessonSlug}`}>{copy["robin.continueLesson"]} →</Link>
          <Link href={`/courses/${currentLesson.courseSlug}`}>{copy["robin.openCourseMap"]} →</Link>
        </div>
      )}
      <p className="a-note">{copy["robin.miniNote"]}</p>
    </section>
  );
}

const allImplementedSlugs = Object.values(implementedLessonSlugsByCourse).flat();

export default function DashboardPage() {
  const copy = useUiCopy();
  const { profile } = useLocalProfile();
  const { greeting, date } = useGreeting(profile.preferredName);
  const currentLesson = useCurrentLesson();
  const lessonName = currentLesson.lessonSlug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  const activityName = currentLesson.currentActivityId
    ? currentLesson.currentActivityId.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ")
    : copy["dash.startFlow"];
  const step = currentLesson.completedAt
    ? currentLesson.totalActivities
    : Math.min(currentLesson.completedActivityIds.length + 1, currentLesson.totalActivities || 1);
  const progressPercent = currentLesson.totalActivities ? Math.round((currentLesson.completedActivityIds.length / currentLesson.totalActivities) * 100) : 0;

  // Honest path states + first-run derivation: both come from persisted
  // progress records. A first-run user has NO meaningful learning history —
  // not merely "completedLessons === 0" (a started lesson counts as history).
  const [pathStates, setPathStates] = useState<Record<string, "completed" | "current" | "pending">>({});
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const states: Record<string, "completed" | "current" | "pending"> = {};
      try {
        const responses = await Promise.all(
          allImplementedSlugs.map((slug) =>
            fetch(`/api/learning/progress?lesson=${encodeURIComponent(slug)}`, { signal: controller.signal })
              .then((response) => response.ok ? response.json() as Promise<{ progress?: { completed_at: string | null } | null }> : null)
              .catch(() => null),
          ),
        );
        // Any non-null progress row means the learner has started or finished
        // something — that is meaningful history, regardless of completion.
        const started = responses.some((response) => response?.progress);
        implementedProgrammingLessonSlugs.forEach((slug, index) => {
          const position = allImplementedSlugs.indexOf(slug);
          states[slug] = responses[position]?.progress?.completed_at ? "completed" : "pending";
        });
        if (!controller.signal.aborted) { setPathStates(states); setHasHistory(started); }
      } catch {
        // Unknown (e.g. progress API unavailable): stay neutral, never fake history.
        if (!controller.signal.aborted) setHasHistory(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const stateFor = (slug: string): "completed" | "current" | "pending" => {
    if (pathStates[slug] === "completed") return "completed";
    if (currentLesson.lessonSlug === slug && !currentLesson.completedAt) return "current";
    return "pending";
  };
  const completedImplemented = implementedProgrammingLessonSlugs.filter((slug) => stateFor(slug) === "completed").length;
  const implementedTotal = implementedProgrammingLessonSlugs.length;
  const pathPercent = implementedTotal > 0 ? Math.round((completedImplemented / implementedTotal) * 100) : 0;
  const currentHasProgress = Boolean(currentLesson.completedAt || currentLesson.currentActivityId || currentLesson.completedActivityIds.length > 0);
  const isFirstRun = hasHistory === false && !currentHasProgress;
  const isUndetermined = hasHistory === null && !currentHasProgress;

  if (isFirstRun) {
    return (
      <AppShell active="dashboard">
        <TopBar breadcrumb={<><b>{copy["nav.dashboard"]}</b><span className="sep">/</span>Foundations of Programming</>} />
        <div className="content first-run">
          <div className="hero first-hero">
            <p className="hero-date">{date}</p>
            <h1>{copy["dash.firstTitle"]}</h1>
            <p className="first-sub">{copy["dash.firstSub"]}</p>
            <div className="first-actions">
              <Link className="btn-p first-start" href={`/courses/${defaultCurrentLesson.courseSlug}/${defaultCurrentLesson.lessonSlug}`}>{copy["dash.firstStart"]} →</Link>
              <Link className="first-browse" href="/courses">{copy["dash.firstCta"]}</Link>
            </div>
            <LearningSearch />
          </div>

          <section className="path path-quiet" aria-label={copy["dash.pathAria"]}>
            <header className="shead">
              <span className="tag blue">{fillTemplate(copy["dash.pathTag"], { course: "Foundations of Programming" })}</span>
            </header>
            <p className="path-empty">{copy["dash.firstPathEmpty"]}</p>
          </section>

          <footer className="foot">
            <div className="pxdiv" aria-hidden="true" />
            <div className="foot-row">
              <span>{copy["dash.footer"]}</span>
            </div>
          </footer>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="dashboard">
      <TopBar
        breadcrumb={<><b>{copy["nav.dashboard"]}</b><span className="sep">/</span>Foundations of Programming</>}
        contextual={<LearningSearch presentation="trigger" />}
      />
      <div className="content">
        <div className="hero">
          <p className="hero-date">{date}</p>
          <h1>{greeting}</h1>
          <p>{copy["dash.heroLeft"]} — <span className="hl">{lessonName}</span>{currentLesson.totalActivities ? fillTemplate(copy["dash.heroStep"], { step, total: currentLesson.totalActivities }) : "."}</p>
        </div>

        {isUndetermined ? null : (

        <div className="grid">
          {/* left column */}
          <div className="col">
            <section className="panel cut continue" aria-label={copy["dash.continueAria"]}>
              <div className="continue-in">
                <div>
                  <span className="tag acc">{currentLesson.completedAt ? copy["dash.continueTag.completed"] : copy["dash.continueTag.continue"]} · {lessonName}</span>
                  <h2 className="lesson-title-card">{activityName}</h2>
                  <p className="lesson-meta">{fillTemplate(copy["dash.stepOf"], { course: "CS-101", step, total: currentLesson.totalActivities || "—" })}</p>
                  <p className="lesson-x">{copy["dash.continueNote"]} <em>{copy["dash.continueNoteEm"]}</em></p>
                </div>
                <div className="continue-actions">
                  <Link className="btn-p" href={`/courses/${currentLesson.courseSlug}/${currentLesson.lessonSlug}`}>{copy["dash.resumeLesson"]} →</Link>
                  <Link className="btn-g" href={`/courses/${currentLesson.courseSlug}`}>{copy["dash.courseMap"]} →</Link>
                </div>
              </div>
              <div className="cbar" aria-hidden="true"><i style={{ width: `${currentLesson.completedAt ? 100 : progressPercent}%` }} /></div>
            </section>

            <section className="path" aria-label={copy["dash.pathAria"]}>
              <header className="shead">
                <span className="tag blue">{fillTemplate(copy["dash.pathTag"], { course: "Foundations of Programming" })}</span>
                <span className="shead-meta">{fillTemplate(copy["dash.pathCount"], { done: completedImplemented, total: implementedTotal, pct: pathPercent })}</span>
              </header>
              <ol className="mods">
                <li className={`mod ${completedImplemented > 0 ? (completedImplemented === implementedTotal ? "done" : "open") : "dim"}`}>
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">CS101</span>
                    <span className="mname">Foundations of Programming</span>
                    <span className={`mtag ${completedImplemented === implementedTotal && implementedTotal > 0 ? "master" : completedImplemented > 0 ? "now" : "lock"}`}>
                      {completedImplemented === implementedTotal && implementedTotal > 0 ? copy["status.completed"] : completedImplemented > 0 ? copy["status.inProgress"] : copy["status.notStarted"]}
                    </span>
                    <span className="mbar">{implementedProgrammingLessonSlugs.map((slug) => <i key={slug} className={stateFor(slug) === "completed" ? "f" : ""} />)}</span>
                    <span className="mcount">{completedImplemented}/{implementedTotal}</span>
                  </div>
                  <ul className="cmap-lessons">
                    {implementedProgrammingLessonSlugs.map((slug, index) => {
                      const state = stateFor(slug);
                      const label = slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
                      const nodeStyle = state === "completed"
                        ? { background: "var(--ok)", borderColor: "var(--ok)" }
                        : state === "current"
                        ? { background: "var(--accent)", borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--now-glow)" }
                        : undefined;
                      return (
                        <li key={slug}>
                          <Link
                            className={`cmap-lesson ${state === "completed" ? "done" : state === "current" ? "current" : ""}`}
                            href={`/courses/programming/${slug}`}
                          >
                            <span className="lnode" style={nodeStyle} />
                            <span className="cmap-ltitle"><span className="cmap-lnum">{String(index + 1).padStart(2, "0")}</span>{label}</span>
                            {state === "completed" && <span className="cmap-lock" style={{ color: "var(--ok)" }}>{copy["status.done"]}</span>}
                            {state === "current" && <span className="cmap-laction">{copy["action.resume"]} →</span>}
                            {state === "pending" && <span className="cmap-lock">{copy["status.start"]}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ol>
              <p className="panel-footnote" style={{ border: 0, padding: "10px 4px 0" }}>
                {copy["dash.pathFoot"]} <Link href="/courses/programming" style={{ color: "var(--accent-text)" }}>{copy["dash.pathFootLink"]}</Link>.
              </p>
            </section>
          </div>

          {/* right column — mastery + mini-chat */}
          <div className="col side-col">
            <section className="panel mastery" aria-label={copy["dash.masteryAria"]}>
              <header className="shead" style={{ marginBottom: "6px" }}>
                <span className="tag blue">{copy["dash.mastery"]}</span>
                <span className="shead-meta">{copy["dash.masteryNote"]}</span>
              </header>
              <ul className="mast-list">
                {implementedProgrammingLessonSlugs.slice(0, 4).map((slug) => {
                  const state = stateFor(slug);
                  const label = slug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
                  return (
                    <li key={slug} className={`mast-item ${state === "current" ? "hot" : ""}`}>
                      <div className="mast-top"><span className="mast-name">{label}</span><span className="mast-pct">{state === "completed" ? copy["status.done"] : state === "current" ? copy["status.inProgress"] : copy["status.notStarted"]}</span></div>
                      <div className="mbar2">{implementedProgrammingLessonSlugs.slice(0, 6).map((_, bar) => <i key={bar} className={state === "completed" || (state === "current" && bar === 0) ? "f" : ""} />)}</div>
                    </li>
                  );
                })}
              </ul>
              <div className="pxdiv" aria-hidden="true" />
              <div className="mast-foot">
                <span>{fillTemplate(copy["dash.pathCount"], { done: completedImplemented, total: implementedTotal, pct: pathPercent })}</span>
                <span className="up">{copy["action.keepGoing"]}</span>
              </div>
            </section>

            <RobinMiniChat currentLesson={currentLesson} profileContext={toRobinProfileContext(profile)} copy={copy} />
          </div>
        </div>
        )}

        <footer className="foot">
          <div className="pxdiv" aria-hidden="true" />
          <div className="foot-row">
            <span>{copy["dash.footer"]}</span>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
