"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { DeliveredLesson } from "@/content/lessons/types";

const robinResponses = {
  "jelasin lebih goblok": "Variable itu nama tempelan. Lu punya angka 17, lu kasih nama umur. Nanti program bisa memakai nama umur setiap kali butuh value itu.",
  "kasih analogi": "Bayangin label di loker. Labelnya adalah identifier, barang yang sedang ditunjuk adalah value. Analogi ini membantu, walau cara Python bekerja sebenarnya lebih dekat ke nama yang terikat ke object.",
  "contoh kode": "Di Python, score = 10 mengikat nama score ke value 10. score = 15 kemudian mengikat nama yang sama ke value baru.",
  "gue ngerti setengah": "Pegang ini dulu: assignment menghubungkan nama di sebelah kiri dengan hasil di sebelah kanan. Detail object dan memory kita cicil setelah fondasinya aman.",
  "quiz gue": "Tanpa ngintip: kalau cups = 2 lalu cups = cups + 1, sekarang value yang ditunjuk cups berapa? Tiga. Kalau alasannya kebayang, aman.",
} as const;

type RobinAction = keyof typeof robinResponses;

type LessonResponse = {
  lesson?: DeliveredLesson;
  error?: string;
};

type WebMcpContext = {
  registerTool: (tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: object;
    annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    execute: (input: unknown) => object;
  }, options: { signal: AbortSignal }) => void | Promise<void>;
};

declare global {
  interface Document {
    readonly modelContext?: WebMcpContext;
  }
}

export function VariablesLesson() {
  const [lesson, setLesson] = useState<DeliveredLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [activeResponse, setActiveResponse] = useState<RobinAction>("kasih analogi");
  const [binAnswer, setBinAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [signalPulse, setSignalPulse] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedChecks, setSubmittedChecks] = useState<Record<number, boolean>>({});
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadLesson() {
    setIsLoading(true);
    setRequestError(null);

    try {
      const response = await fetch("/api/lessons/variables");
      const data = await response.json() as LessonResponse;

      if (!response.ok) {
        throw new Error(data.error ?? `Backend returned ${response.status}`);
      }

      if (!data.lesson) {
        throw new Error("Backend returned no lesson data.");
      }

      setLesson(data.lesson);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Lesson request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLesson();
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "explain_variable_with_robin",
      title: "Ask Robin about variables",
      description: "Show one of the predefined Robin explanations in the visible companion panel.",
      inputSchema: {
        type: "object",
        properties: { style: { type: "string", enum: Object.keys(robinResponses) } },
        required: ["style"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const style = (input as { style?: string }).style;
        if (!style || !(style in robinResponses)) {
          throw new Error("Unknown explanation style");
        }
        setSourceMode(false);
        setActiveResponse(style as RobinAction);
        return { shown: style, response: robinResponses[style as RobinAction] };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  useEffect(() => () => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
  }, []);

  function pulseSignal() {
    setSignalPulse(false);
    requestAnimationFrame(() => setSignalPulse(true));
    window.setTimeout(() => setSignalPulse(false), 700);
  }

  function chooseRobinResponse(action: RobinAction) {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    setIsTyping(true);
    pulseSignal();
    responseTimer.current = setTimeout(() => {
      setActiveResponse(action);
      setIsTyping(false);
    }, 420);
  }

  async function copyCode(title: string, code: string) {
    await navigator.clipboard?.writeText(code);
    setCopiedExample(title);
    window.setTimeout(() => setCopiedExample(null), 1200);
  }

  function chooseAnswer(checkIndex: number, answer: string) {
    setSelectedAnswers((current) => ({ ...current, [checkIndex]: answer }));
    setSubmittedChecks((current) => ({ ...current, [checkIndex]: false }));
  }

  function submitQuickCheck(checkIndex: number) {
    if (!selectedAnswers[checkIndex]) return;
    setSubmittedChecks((current) => ({ ...current, [checkIndex]: true }));
    pulseSignal();
  }

  function submitBinCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsChecking(true);
    pulseSignal();
    window.setTimeout(() => {
      setIsChecking(false);
      if (binAnswer.trim().length < 12) {
        setFeedback("Masih pendek banget. Coba sebutin: variable punya nama, menunjuk ke apa, dan kenapa itu berguna.");
        return;
      }
      setFeedback("Aman, gue simpen. Jawaban ini belum dinilai AI—coba cek apakah penjelasan lu sudah menyebut nama, value, dan assignment.");
    }, 620);
  }

  return (
    <AppShell active="lesson" signalMode={sourceMode ? "quiet" : "active"} signalPulse={signalPulse}>
      <div className="lesson-topbar">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/courses">Courses</Link><span>/</span><Link href="/courses/programming">CS-101</Link><span>/</span><span>Variables</span></nav>
        <div className="mode-control" role="group" aria-label="Lesson mode">
          <button className={!sourceMode ? "selected" : ""} onClick={() => setSourceMode(false)}>Robin ON</button>
          <button className={sourceMode ? "selected" : ""} onClick={() => setSourceMode(true)}>Source Mode</button>
        </div>
      </div>

      {isLoading && <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>requesting /api/lessons/variables</strong><small>Metadata, sources, dan lesson body lagi dirakit backend.</small></div>}

      {!isLoading && requestError && <div className="course-request-state is-error" role="alert"><strong>Lesson signal putus.</strong><small>{requestError}</small><button className="button" onClick={() => void loadLesson()}>coba lagi</button></div>}

      {lesson && <div className={`lesson-grid ${sourceMode ? "source-mode" : ""}`}>
        <article className="lesson-article">
          <header className="lesson-title">
            <span className="eyebrow">Module {String(lesson.module.position).padStart(2, "0")} · {lesson.module.title}</span><h1>{lesson.title}</h1>
            <div className="lesson-meta"><span>◷ {lesson.estimatedMinutes} min</span><span>beginner</span><span>structured content</span><span>{lesson.sources.length} verified sources</span></div>
          </header>

          {!sourceMode && <aside className="robin-inline"><span className="bin-face">B</span><p>Ini konsep kecil yang bakal nongol di mana-mana. Kita bikin kebayang dulu, habis itu baru pakai bahasa kampusnya.</p></aside>}

          {!sourceMode && <section className="lesson-section"><span className="section-number">01</span><div><h2>Versi yang kebayang dulu</h2>{lesson.content.intuitiveExplanation.map((paragraph, index) => <p className={index === 0 ? "lead" : undefined} key={paragraph}>{paragraph}</p>)}</div></section>}

          <section className="lesson-section academic"><span className="section-number">02</span><div><span className="academic-label">Academic explanation</span><h2>Definisi formalnya</h2>{lesson.content.academicExplanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>

          <section className="lesson-section"><span className="section-number">03</span><div className="wide-content"><h2>Lihat assignment bekerja</h2>{lesson.content.codeExamples.map((example) => <div className="lesson-code-example" key={example.title}><div className="code-block"><div className="code-head"><span>{example.language} / {example.title}</span><button type="button" onClick={() => void copyCode(example.title, example.code)}>{copiedExample === example.title ? "COPIED ✓" : "COPY"}</button></div><pre><code>{example.code}</code></pre></div>{example.explanation && <p>{example.explanation}</p>}</div>)}</div></section>

          <section className="two-column-section">
            <div className="lesson-box"><span className="card-kicker">Key terms</span><dl>{lesson.content.keyTerms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></div>
            <div className="lesson-box mistakes"><span className="card-kicker">Common mistakes</span>
              <ul>{lesson.content.commonMistakes.map((mistake, index) => <li key={mistake.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{mistake.title}</strong><p>{mistake.explanation}</p></div></li>)}</ul>
            </div>
          </section>

          <div className="quick-check-list">{lesson.content.quickChecks.map((check, checkIndex) => {
            const selectedAnswer = selectedAnswers[checkIndex];
            const isSubmitted = submittedChecks[checkIndex];
            const isCorrect = selectedAnswer === check.answer;

            return <section className="quick-check" key={check.question}><span className="eyebrow">Quick check · {checkIndex + 1} of {lesson.content.quickChecks.length}</span><h2>{check.question}</h2>{check.code && <div className="inline-code"><code>{check.code}</code></div>}<div className="answer-options">{check.options.map((option) => {
              const showCorrect = isSubmitted && option === check.answer;
              const showIncorrect = isSubmitted && option === selectedAnswer && !isCorrect;
              const className = [option === selectedAnswer ? "selected" : "", showCorrect ? "correct" : "", showIncorrect ? "incorrect" : ""].filter(Boolean).join(" ");
              return <button className={className} type="button" onClick={() => chooseAnswer(checkIndex, option)} key={option}>{option}{showCorrect && <span>✓</span>}{showIncorrect && <span>×</span>}</button>;
            })}</div><div className="quick-check-actions"><button className="button" type="button" disabled={!selectedAnswer} onClick={() => submitQuickCheck(checkIndex)}>check answer</button>{isSubmitted && <p className={`answer-note ${isCorrect ? "is-correct" : "is-incorrect"}`}><strong>{isCorrect ? "Correct." : "Belum tepat."}</strong> {check.explanation}</p>}</div></section>;
          })}</div>

          <section className="references"><span className="card-kicker">Sources supporting this lesson</span><p className="source-intro">These references support the lesson’s original synthesis; the lesson is not copied from them.</p><ol>{lesson.sources.map((source, index) => <li className="source-item" key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><div><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong> ↗</a><div className="source-meta"><span>{source.publisher ?? "Unknown publisher"}</span><span>{source.sourceType}</span></div>{source.relevanceNote && <p>{source.relevanceNote}</p>}</div></li>)}</ol></section>

          <section className="bin-check">
            <div className="bin-check-title"><span className="bin-face large">B</span><div><span className="eyebrow">BIN CHECK</span><h2>tanpa baca atas, coba jelasin variable ke gue pake bahasa lu sendiri.</h2></div></div>
            <form className={isChecking ? "is-checking" : ""} onSubmit={submitBinCheck}><label htmlFor="bin-answer">Your explanation</label><textarea id="bin-answer" value={binAnswer} onChange={(event) => setBinAnswer(event.target.value)} placeholder="variable itu..." rows={5} /><div className="form-footer"><span>{binAnswer.length} characters · kept on this page for now</span><button className="button button-primary" type="submit" disabled={isChecking}>{isChecking ? <><span className="typing-dots"><i /><i /><i /></span> otaknya compile</> : "submit ke Bin"}</button></div></form>
            {feedback && <p className="mock-feedback" role="status"><strong>BIN:</strong> {feedback}</p>}
          </section>
        </article>

        {!sourceMode && <aside className="robin-panel">
          <div className="robin-panel-head"><div className="robin-identity"><span className="bin-face">B</span><span><strong>Robin</strong><small><i /> mock companion</small></span></div><span className="mock-badge">LOCAL</span></div>
          <div className={`robin-message ${isTyping ? "is-typing" : ""}`}><span className="message-label">Bin says</span>{isTyping ? <div className="typing-state" aria-label="Robin is preparing a response"><span className="typing-dots"><i /><i /><i /></span><small>processing signal</small></div> : <p key={activeResponse}>{robinResponses[activeResponse]}</p>}</div>
          <div className="companion-actions">{(Object.keys(robinResponses) as RobinAction[]).map((action) => <button className={activeResponse === action && !isTyping ? "active" : ""} onClick={() => chooseRobinResponse(action)} key={action}>{action}</button>)}</div>
          <p className="panel-footnote">Predefined responses only. Belum pakai AI—Robin lagi latihan dulu.</p>
        </aside>}
      </div>}
    </AppShell>
  );
}
