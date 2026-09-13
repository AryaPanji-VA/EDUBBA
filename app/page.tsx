"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";

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

export default function DashboardPage() {
  const { greeting, date } = useGreeting();

  return (
    <AppShell active="dashboard">
      <TopBar breadcrumb={<><b>Dashboard</b><span className="sep">/</span>Foundations of Programming</>} />
      <div className="content">
        <div className="hero">
          <p className="hero-date">{date}</p>
          <h1>{greeting}</h1>
          <p>Everything is where you left it — <span className="hl">Variables</span>, step 1 of 9. Data Types is next.</p>
        </div>

        <div className="grid">
          {/* left column */}
          <div className="col">
            <section className="panel cut continue" aria-label="Continue learning">
              <div className="continue-in">
                <div>
                  <span className="tag acc">Continue · Variables</span>
                  <h2 className="lesson-title">Why give a value a name?</h2>
                  <p className="lesson-meta">CS-101 · module 1 · step 1 of 9 · <b>~18 min</b></p>
                  <p className="lesson-x">A program needs to work with values that mean something. Names let it reuse those values without repeating them everywhere. <em>Kasih nama ke sesuatu biar otak program nggak ngos-ngosan.</em></p>
                </div>
                <div className="continue-actions">
                  <Link className="btn-p" href="/courses/programming/variables">Resume lesson →</Link>
                  <Link className="btn-g" href="/courses/programming/data-types">Data Types →</Link>
                </div>
              </div>
              <div className="cbar" aria-hidden="true"><i style={{ width: "11%" }} /></div>
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
                  <ul className="lessons">
                    <li className="lrow done">
                      <span className="lnode" />
                      <span className="lname"><span className="lnum">3.1</span>Variables</span>
                      <span className="lmeta">18 min · current</span>
                    </li>
                    <li className="lrow now">
                      <span className="lnode" />
                      <span className="lname"><span className="lnum">3.2</span>Data Types</span>
                      <span className="lmeta">14 min</span>
                    </li>
                    <li className="lrow">
                      <span className="lnode" />
                      <span className="lname"><span className="lnum">3.3</span>Operators</span>
                      <span className="lmeta">locked</span>
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

          {/* right column */}
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
              <div className="mast-foot"><span>2 of 11 lessons · <b>18%</b></span><span className="up">keep going</span></div>
            </section>

            <section className="panel assist" aria-label="Robin">
              <div className="a-head">
                <span className="a-ava" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
                    <g className="ava-pane"><rect x="1" y="1" width="3" height="3" /><rect x="6" y="1" width="3" height="3" /><rect x="1" y="6" width="3" height="3" /></g>
                    <rect className="ava-dim" x="6" y="6" width="3" height="3" />
                  </svg>
                </span>
                <div>
                  <div className="a-name">Robin</div>
                  <div className="a-sub">study companion</div>
                </div>
                <span className="a-status"><i />online</span>
              </div>
              <div className="chat">
                <div className="msg-l">
                  <span className="a-ava" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
                      <g className="ava-pane"><rect x="1" y="1" width="3" height="3" /><rect x="6" y="1" width="3" height="3" /><rect x="1" y="6" width="3" height="3" /></g>
                      <rect className="ava-dim" x="6" y="6" width="3" height="3" />
                    </svg>
                  </span>
                  <div>
                    <p>oi, bagian mana yang bikin nyangkut? gas, tanya aja. Open <Link href="/courses/programming/variables"><b>Variables</b></Link> or <Link href="/courses/programming/data-types"><b>Data Types</b></Link> to start.</p>
                    <span className="mmeta">Robin · answers, never grades</span>
                  </div>
                </div>
              </div>
              <div className="a-input">
                <Link href="/courses/programming/variables" style={{ flex: 1, display: "block", background: "var(--input-bg)", border: "1px solid var(--linesoft)", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "var(--dim)" }}>
                  Ask about tonight's lesson…
                </Link>
                <Link href="/courses/programming/variables" className="a-send" aria-label="Start learning" style={{ textDecoration: "none" }}>↑</Link>
              </div>
              <p className="a-note">tuned to your lessons · won't spoil the knowledge check</p>
            </section>
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
