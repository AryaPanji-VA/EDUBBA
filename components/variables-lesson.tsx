"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const robinResponses = {
  "jelasin lebih goblok": "Variable itu nama tempelan. Lu punya angka 17, lu tempelin nama `umur`. Nanti daripada program nyari-nyari angka 17, dia tinggal panggil `umur`.",
  "kasih analogi": "Bayangin loker kampus. Nomor lokernya adalah nama variable, barang di dalamnya adalah value. Barangnya bisa diganti, tapi lu tetap nyari lewat nomor loker yang sama.",
  "contoh kode": "`let score = 10` bikin variable bernama score. `score = 15` mengganti value-nya. `console.log(score)` menampilkan 15.",
  "gue ngerti setengah": "Bagian setengah mana yang nyangkut? Pegang ini dulu: variable = nama yang menunjuk ke value. Soal tipe dan memory kita cicil setelah ini.",
  "quiz gue": "Tanpa ngintip: kalau `let cups = 2`, lalu `cups = cups + 1`, sekarang value `cups` berapa? Jawabannya 3. Kalau kepikiran alasannya, aman.",
} as const;

type RobinAction = keyof typeof robinResponses;

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
  const [sourceMode, setSourceMode] = useState(false);
  const [activeResponse, setActiveResponse] = useState<RobinAction>("kasih analogi");
  const [binAnswer, setBinAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [signalPulse, setSignalPulse] = useState(false);
  const [copied, setCopied] = useState(false);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (!style || !(style in robinResponses)) throw new Error("Unknown explanation style");
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

  async function copyCode() {
    await navigator.clipboard?.writeText('let cupsOfCoffee = 2;\nconst studyTopic = "variables";\n\ncupsOfCoffee = cupsOfCoffee + 1;\n\nconsole.log(cupsOfCoffee);\nconsole.log(studyTopic);');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function submitBinCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsChecking(true);
    pulseSignal();
    window.setTimeout(() => {
      setIsChecking(false);
      if (binAnswer.trim().length < 12) {
        setFeedback("Masih pendek banget. Coba sebutin: variable punya nama, nyimpen atau menunjuk ke apa, dan kenapa itu berguna.");
        return;
      }
      setFeedback("Aman, gue simpen. Buat prototype ini jawabannya belum dinilai AI—tapi kalau penjelasan lu punya ‘nama’ dan ‘value’, fondasinya udah kena.");
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

      <div className={`lesson-grid ${sourceMode ? "source-mode" : ""}`}>
        <article className="lesson-article">
          <header className="lesson-title">
            <span className="eyebrow">Module 05 · Core concept</span><h1>Variables</h1>
            <div className="lesson-meta"><span>◷ 18 min</span><span>40% course signal</span><span>beginner</span><span>last edited Sep 07</span></div>
          </header>

          {!sourceMode && <aside className="robin-inline"><span className="bin-face">B</span><p>Ini salah satu konsep kecil yang bakal nongol di mana-mana. Jadi kita bikin dia bener-bener nempel, ya.</p></aside>}

          <section className="lesson-section"><span className="section-number">01</span><div><h2>Versi yang kebayang dulu</h2><p className="lead">Anggap variable kayak kotak yang lu kasih nama. Lu bisa naro value di dalamnya, terus manggil nama kotaknya kapan pun program butuh datanya.</p><p>Misalnya lu mau nyimpen jumlah kopi malam ini. Daripada nulis angka <code>2</code> di banyak tempat, kasih dia nama <code>cupsOfCoffee</code>. Kalau jumlahnya berubah, program tinggal memperbarui isi yang dirujuk nama itu.</p></div></section>

          <section className="lesson-section academic"><span className="section-number">02</span><div><span className="academic-label">Academic explanation</span><h2>Definisi formalnya</h2><p>A variable is a named identifier associated with a value. It allows a program to store, retrieve, and—depending on the declaration—modify data during execution.</p><p>Secara konseptual, variable membantu programmer merujuk data lewat nama yang bermakna, bukan lewat value mentah atau detail lokasi memory.</p></div></section>

          <section className="lesson-section"><span className="section-number">03</span><div className="wide-content"><h2>Lihat dia kerja</h2><div className="code-block"><div className="code-head"><span>JS / variables.js</span><button type="button" onClick={copyCode}>{copied ? "COPIED ✓" : "COPY"}</button></div><pre><code><span className="code-purple">let</span> cupsOfCoffee = <span className="code-amber">2</span>;{`\n`}<span className="code-purple">const</span> studyTopic = <span className="code-green">&quot;variables&quot;</span>;{`\n\n`}cupsOfCoffee = cupsOfCoffee + <span className="code-amber">1</span>;{`\n\n`}console.log(cupsOfCoffee); <span className="code-comment">// 3</span>{`\n`}console.log(studyTopic);   <span className="code-comment">// &quot;variables&quot;</span></code></pre></div><p><code>let</code> dipakai saat value boleh berubah. <code>const</code> dipakai saat binding-nya tidak akan diberi value baru. Nama yang jelas bikin maksud kode lebih gampang dibaca.</p></div></section>

          <section className="two-column-section">
            <div className="lesson-box"><span className="card-kicker">Key terms</span><dl><div><dt>Variable</dt><dd>Nama yang merujuk ke sebuah value.</dd></div><div><dt>Identifier</dt><dd>Nama sah yang dipilih programmer.</dd></div><div><dt>Value</dt><dd>Data yang dirujuk, misalnya 42 atau “Arya”.</dd></div><div><dt>Declaration</dt><dd>Langkah memperkenalkan variable ke program.</dd></div></dl></div>
            <div className="lesson-box mistakes"><span className="card-kicker">Common mistakes</span><ul><li><span>01</span>Memakai nama samar seperti <code>x</code> padahal konteksnya nggak jelas.</li><li><span>02</span>Mengubah <code>const</code> seolah-olah dia dibuat pakai <code>let</code>.</li><li><span>03</span>Mengira tanda <code>=</code> berarti “sama dengan” secara matematika. Di sini artinya assignment.</li></ul></div>
          </section>

          <section className="quick-check"><span className="eyebrow">Quick check · 1 of 1</span><h2>Apa output dari kode ini?</h2><div className="inline-code"><code>let level = 1; level = level + 2; console.log(level);</code></div><div className="answer-options"><button>A. 1</button><button>B. 2</button><button className="correct">C. 3 <span>✓</span></button><button>D. error</button></div><p className="answer-note">Benar. Value lama (1) ditambah 2, lalu hasilnya di-assign kembali ke <code>level</code>.</p></section>

          <section className="references"><span className="card-kicker">References</span><ol><li><span>01</span><a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables" target="_blank" rel="noreferrer">MDN Web Docs — Storing the information you need: Variables ↗</a></li><li><span>02</span><a href="https://eloquentjavascript.net/02_program_structure.html" target="_blank" rel="noreferrer">Eloquent JavaScript — Program Structure ↗</a></li></ol></section>

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
      </div>
    </AppShell>
  );
}
