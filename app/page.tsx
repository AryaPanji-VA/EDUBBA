"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { RecentLearning } from "@/components/recent-learning";
import { useCurrentLesson } from "@/lib/progress/use-current-lesson";
import type { CurrentLesson } from "@/lib/progress/types";

function useGreeting() {
  const [greeting, setGreeting] = useState("Good evening, Arya.");
  const [date, setDate] = useState("");
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 23 || hr < 5) setGreeting("The night is yours, Arya.");
    else if (hr < 12) setGreeting("Good morning, Arya.");
    else if (hr < 18) setGreeting("Good afternoon, Arya.");
    const d = new Date();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const h12 = (hr % 12 || 12).toString();
    const ampm = hr < 12 ? "AM" : "PM";
    const min = d.getMinutes().toString().padStart(2, "0");
    setDate(`${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()} · ${h12}:${min} ${ampm}`);
  }, []);
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

function RobinMiniChat({ currentLesson }: { currentLesson: CurrentLesson }) {
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
        body: JSON.stringify({ lessonSlug: currentLesson.lessonSlug, message: text, history: messages.slice(-4) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Robin belum bisa jawab.");
      if (controller.current !== requestController) return;
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      if (controller.current === requestController) {
        setError(requestController.signal.aborted ? "Robin kelamaan mikir. Coba lagi." : "Robin lagi nggak bisa nyambung. Materi tetap aman.");
      }
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) { controller.current = null; setBusy(false); }
    }
  }

  const lastRobin = messages.filter((m) => m.role === "assistant").at(-1);

  return (
    <section className="panel assist" aria-label="Robin mini-chat">
      <div className="a-head">
        <AssistantAvatar />
        <div>
          <div className="a-name">Robin</div>
          <div className="a-sub">study companion</div>
        </div>
        <span className="a-status"><i />{busy ? "thinking…" : "online"}</span>
      </div>
      <div className="chat">
        {messages.length === 0 && (
          <div className="msg-l">
            <AssistantAvatar />
            <div>
              <p>oi, bagian mana yang bikin nyangkut? gas, tanya aja.</p>
              <span className="mmeta">Robin · answers, never grades</span>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "msg-u" : "msg-l"}>
            {message.role === "assistant" && <AssistantAvatar />}
            <div>
              {message.role === "user" ? <p>{message.content}</p> : <p>{message.content}</p>}
              <span className="mmeta">{message.role === "user" ? "you" : "Robin"}</span>
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
          placeholder="tanya Robin…"
          aria-label="Ask Robin"
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }}
        />
        <button className="a-send" type="button" aria-label="Send to Robin" disabled={busy || !draft.trim()} onClick={() => void send()}>↑</button>
      </div>
      {lastRobin && (
        <div className="companion-actions companion-actions-flush">
          <Link href={`/courses/${currentLesson.courseSlug}/${currentLesson.lessonSlug}`}>Continue lesson →</Link>
          <Link href={`/courses/${currentLesson.courseSlug}`}>Open course map →</Link>
        </div>
      )}
      <p className="a-note">session only · full companion ada di dalam lesson</p>
    </section>
  );
}

export default function DashboardPage() {
  const { greeting, date } = useGreeting();
  const currentLesson = useCurrentLesson();
  const lessonName = currentLesson.lessonSlug.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  const activityName = currentLesson.currentActivityId
    ? currentLesson.currentActivityId.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ")
    : "Start the learning flow";
  const step = currentLesson.completedAt
    ? currentLesson.totalActivities
    : Math.min(currentLesson.completedActivityIds.length + 1, currentLesson.totalActivities || 1);
  const progressPercent = currentLesson.totalActivities ? Math.round((currentLesson.completedActivityIds.length / currentLesson.totalActivities) * 100) : 0;

  return (
    <AppShell active="dashboard">
      <TopBar breadcrumb={<><b>Dashboard</b><span className="sep">/</span>Foundations of Programming</>} />
      <div className="content">
        <div className="hero">
          <p className="hero-date">{date}</p>
          <h1>{greeting}</h1>
          <p>Everything is where you left it — <span className="hl">{lessonName}</span>{currentLesson.totalActivities ? `, step ${step} of ${currentLesson.totalActivities}.` : "."}</p>
        </div>

        <div className="grid">
          {/* left column */}
          <div className="col">
            <section className="panel cut continue" aria-label="Continue learning">
              <div className="continue-in">
                <div>
                  <span className="tag acc">{currentLesson.completedAt ? "Completed" : "Continue"} · {lessonName}</span>
                  <h2 className="lesson-title">{activityName}</h2>
                  <p className="lesson-meta">CS-101 · step {step} of {currentLesson.totalActivities || "—"}</p>
                  <p className="lesson-x">Your last meaningful lesson position is saved. <em>tinggal lanjut, nggak perlu mulai ulang.</em></p>
                </div>
                <div className="continue-actions">
                  <Link className="btn-p" href={`/courses/${currentLesson.courseSlug}/${currentLesson.lessonSlug}`}>Resume lesson →</Link>
                  <Link className="btn-g" href={`/courses/${currentLesson.courseSlug}`}>Course map →</Link>
                </div>
              </div>
              <div className="cbar" aria-hidden="true"><i style={{ width: `${currentLesson.completedAt ? 100 : progressPercent}%` }} /></div>
            </section>

            <section className="path" aria-label="Learning path">
              <header className="shead">
                <span className="tag blue">Your path — Foundations of Programming</span>
                <span className="shead-meta">11 lessons · 3 modules</span>
              </header>
              <ol className="mods">
                <li className="mod done">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">01</span>
                    <span className="mname">Programming Fundamentals</span>
                    <span className="mtag master">mastered</span>
                    <span className="mbar"><i className="f" /><i className="f" /><i className="f" /><i className="f" /><i /></span>
                    <span className="mcount">4/4</span>
                  </div>
                </li>
                <li className="mod done">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">02</span>
                    <span className="mname">How Programs Run</span>
                    <span className="mtag master">mastered</span>
                    <span className="mbar"><i className="f" /><i className="f" /><i /></span>
                    <span className="mcount">2/2</span>
                  </div>
                </li>
                <li className="mod open">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">03</span>
                    <span className="mname">Programming Building Blocks</span>
                    <span className="mtag now">in progress</span>
                    <span className="mbar"><i className="f" /><i className="f" /><i /><i /><i /><i /></span>
                    <span className="mcount">2/6</span>
                  </div>
                  <ul className="cmap-lessons">
                    <li className="cmap-lesson done">
                      <span className="lnode" />
                      <span className="cmap-ltitle"><span className="cmap-lnum">3.1</span>Variables</span>
                      <span className="cmap-ldur">18 min · current</span>
                      <span className="cmap-lock" style={{ color: "var(--ok)" }}>done</span>
                    </li>
                    <li className="cmap-lesson now">
                      <span className="lnode" />
                      <span className="cmap-ltitle"><span className="cmap-lnum">3.2</span>Data Types</span>
                      <span className="cmap-ldur">14 min</span>
                    </li>
                    <li className="cmap-lesson">
                      <span className="lnode" />
                      <span className="cmap-ltitle"><span className="cmap-lnum">3.3</span>Operators</span>
                      <span className="cmap-ldur">locked</span>
                    </li>
                  </ul>
                </li>
                <li className="mod dim">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">04</span>
                    <span className="mname">Conditionals</span>
                    <span className="mtag lock">locked</span>
                    <span className="mbar"><i /><i /><i /><i /></span>
                    <span className="mcount">0/1</span>
                  </div>
                </li>
                <li className="mod dim">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">05</span>
                    <span className="mname">Loops</span>
                    <span className="mtag lock">locked</span>
                    <span className="mbar"><i /><i /><i /><i /></span>
                    <span className="mcount">0/1</span>
                  </div>
                </li>
                <li className="mod dim">
                  <div className="mod-row">
                    <span className="node" /><span className="mnum">06</span>
                    <span className="mname">Functions</span>
                    <span className="mtag lock">locked</span>
                    <span className="mbar"><i /><i /><i /><i /></span>
                    <span className="mcount">0/1</span>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* right column — mastery + mini-chat */}
          <div className="col side-col">
            <section className="panel mastery" aria-label="Mastery">
              <header className="shead" style={{ marginBottom: "6px" }}>
                <span className="tag blue">Mastery</span>
                <span className="shead-meta">grows as you practice</span>
              </header>
              <ul className="mast-list">
                <li className="mast-item hot">
                  <div className="mast-top"><span className="mast-name">Variables</span><span className="mast-pct">in progress</span></div>
                  <div className="mbar2"><i className="f" /><i /><i /><i /><i /><i /></div>
                </li>
                <li className="mast-item">
                  <div className="mast-top"><span className="mast-name">Data Types</span><span className="mast-pct">next</span></div>
                  <div className="mbar2"><i /><i /><i /><i /></div>
                </li>
                <li className="mast-item">
                  <div className="mast-top"><span className="mast-name">Operators</span><span className="mast-pct">locked</span></div>
                  <div className="mbar2"><i /><i /><i /><i /></div>
                </li>
              </ul>
              <div className="pxdiv" aria-hidden="true" />
              <div className="mast-foot">
                <span>2 of 11 lessons · <b>18%</b></span>
                <span className="up">keep going</span>
              </div>
            </section>

            <RecentLearning />

            <RobinMiniChat currentLesson={currentLesson} />
          </div>
        </div>

        <footer className="foot">
          <div className="pxdiv" aria-hidden="true" />
          <div className="foot-row">
            <span>robin — a place to learn computer science slowly.</span>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
