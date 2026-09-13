import { rng, smooth01, clamp01 } from "./shared";
import type { EngineController, EngineFactory, EngineMode } from "./types";

// Ported from the Kimi mockup's signalEngine (Signal field).
// Faithful visual port — the archived mockup remains the source of truth.

const SIGP = {
  dark: { waves: ["rgba(96,138,196,0.34)", "rgba(110,178,214,0.27)", "rgba(84,116,174,0.30)"], grid: "#31497A", gridA: [0.15, 0.12, 0.09], tickC: "#3A5480", tickA: 0.16, nodeS: "#7FC6DD", nodeF: "#7FC6DD", nodeBase: 0.28, nodeFillA: 0.5, ring: "#8FD4EA", ringA: 0.16, pulse: "#9ADCF5", pulseA0: 0.8, pulseStep: 0.13, pulseGlow: "rgba(154,220,245,0.14)" },
  light: { waves: ["rgba(70,100,150,0.30)", "rgba(50,140,175,0.26)", "rgba(90,110,170,0.25)"], grid: "#A9BED6", gridA: [0.5, 0.4, 0.3], tickC: "#9DB2CC", tickA: 0.5, nodeS: "#4E87AE", nodeF: "#3E8FB0", nodeBase: 0.4, nodeFillA: 0.6, ring: "#5FA3C4", ringA: 0.15, pulse: "#2F88A8", pulseA0: 0.75, pulseStep: 0.12, pulseGlow: "rgba(47,136,168,0.10)" },
};

interface Wave { yb: number; a1: number; f1: number; a2: number; f2: number; sp: number; par: number; env: [number, number]; }
interface Blip { x: number; amp: number; w: number; ph: number; }
interface Node { wave: number; x: number; }
interface GridSpot { x: number; y: number; cols: number; rows: number; a: number; }
interface Tick { x: number; }
interface Ring { n: number; t0: number; }

export const signalEngine: EngineFactory = (cv: HTMLCanvasElement, mode: EngineMode, reduced: boolean): EngineController => {
  const P = SIGP[mode];
  const ctx = cv.getContext("2d")!;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, raf: number | null = null;
  let waves: Wave[] = [], nodes: Node[] = [], grids: GridSpot[] = [], ticks: Tick[] = [], blips: Blip[] = [];
  let ring: Ring | null = null, activeNode = -1, lastSwitch = 2;

  function generate() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const r = rng(20260910);
    waves = [
      { yb: 0.30, a1: 13, f1: 1 / 620, a2: 6, f2: 1 / 293, sp: 0.016, par: 0.012, env: [0.30, 0.93] },
      { yb: 0.58, a1: 9, f1: 1 / 760, a2: 5, f2: 1 / 341, sp: -0.011, par: 0.020, env: [0.42, 0.99] },
      { yb: 0.80, a1: 3, f1: 1 / 900, a2: 2, f2: 1 / 413, sp: 0.008, par: 0.030, env: [0.04, 1.02] },
    ];
    blips = [];
    for (let i = 0; i < 4; i++) blips.push({ x: 0.12 + r() * 0.83, amp: 9 + r() * 11, w: 24 + r() * 30, ph: r() * 6.2832 });
    nodes = [];
    for (let i = 0; i < 3; i++) nodes.push({ wave: 0, x: (0.44 + r() * 0.5) * W });
    for (let i = 0; i < 2; i++) nodes.push({ wave: 1, x: (0.34 + r() * 0.58) * W });
    grids = [
      { x: 0.70, y: 0.14, cols: 5, rows: 3, a: P.gridA[0] },
      { x: 0.885, y: 0.52, cols: 4, rows: 4, a: P.gridA[1] },
      { x: 0.085, y: 0.68, cols: 3, rows: 3, a: P.gridA[2] },
    ];
    ticks = [];
    for (let i = 0; i < 14; i++) ticks.push({ x: (i + 0.5) / 14 * W + (r() - 0.5) * 40 });
  }

  function waveY(w: Wave, x: number, t: number, sy: number): number {
    const env = smooth01((x / W - w.env[0]) / (w.env[1] - w.env[0]));
    return w.yb * H - sy * w.par
      + Math.sin(x * w.f1 * 6.2832 + t * w.sp * 6.2832) * w.a1 * env
      + Math.sin(x * w.f2 * 6.2832 - t * w.sp * 4.9) * w.a2 * env;
  }
  function blipY(x: number, t: number): number {
    let y = 0;
    for (let i = 0; i < blips.length; i++) {
      const b = blips[i], dx = x - b.x * W;
      y -= Math.exp(-(dx * dx) / (2 * b.w * b.w)) * b.amp * (0.55 + 0.45 * Math.sin(t * 0.35 + b.ph));
    }
    return y;
  }

  function draw(t: number) {
    ctx.clearRect(0, 0, W, H);
    const sy = window.scrollY || 0;
    let i: number, x: number, y: number;
    for (i = 0; i < grids.length; i++) {
      const g = grids[i];
      ctx.globalAlpha = g.a; ctx.fillStyle = P.grid;
      for (let cx = 0; cx < g.cols; cx++) for (let cy = 0; cy < g.rows; cy++) ctx.fillRect(g.x * W + cx * 15, g.y * H + cy * 15, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
    ctx.globalAlpha = P.tickA; ctx.fillStyle = P.tickC;
    const tickY = waves[2].yb * H - sy * waves[2].par;
    for (i = 0; i < ticks.length; i++) ctx.fillRect(ticks[i].x, tickY - 2, 1, 4);
    ctx.globalAlpha = 1;
    for (i = 0; i < waves.length; i++) {
      const w = waves[i];
      ctx.beginPath();
      for (x = -6; x <= W + 6; x += 3) {
        y = waveY(w, x, t, sy);
        if (i === 2) y += blipY(x, t);
        if (x === -6) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = P.waves[i]; ctx.lineWidth = 1; ctx.stroke();
    }
    if (t - lastSwitch > 7) {
      lastSwitch = t;
      activeNode = (activeNode + 1) % nodes.length;
      if (!ring && Math.random() < 0.4) ring = { n: activeNode, t0: t };
    }
    const act = clamp01((t - lastSwitch) / 0.6) * clamp01((6.5 - (t - lastSwitch)) / 1.4);
    for (i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      y = waveY(waves[n.wave], n.x, t, sy);
      const a = i === activeNode ? act : 0;
      ctx.globalAlpha = P.nodeBase + a * 0.55; ctx.strokeStyle = P.nodeS; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(n.x, y, 2, 0, 6.2832); ctx.stroke();
      if (a > 0.03) { ctx.globalAlpha = a * P.nodeFillA; ctx.fillStyle = P.nodeF; ctx.beginPath(); ctx.arc(n.x, y, 1.4, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (ring) {
      const rn = nodes[ring.n], age = t - ring.t0;
      if (age > 4.5) ring = null;
      else {
        const ry = waveY(waves[rn.wave], rn.x, t, sy);
        ctx.globalAlpha = P.ringA * (1 - age / 4.5); ctx.strokeStyle = P.ring; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(rn.x, ry, 5 + age * 11, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    const px = ((t % 26) / 26) * (W + 120) - 60;
    for (i = 5; i >= 0; i--) {
      const tx = px - i * 7;
      if (tx < -8 || tx > W + 8) continue;
      const ty = waveY(waves[0], tx, t, sy);
      ctx.globalAlpha = P.pulseA0 - i * P.pulseStep; ctx.fillStyle = P.pulse;
      ctx.beginPath(); ctx.arc(tx, ty, i === 0 ? 1.7 : 1.1, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (px > -20 && px < W + 20) {
      const py = waveY(waves[0], px, t, sy);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 9);
      grad.addColorStop(0, P.pulseGlow); grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad; ctx.fillRect(px - 9, py - 9, 18, 18);
    }
  }

  function loop(ms: number) { draw(ms / 1000); raf = requestAnimationFrame(loop); }
  return {
    start: () => { if (!reduced && !raf) raf = requestAnimationFrame(loop); else draw(0); },
    stop: () => { if (raf) { cancelAnimationFrame(raf); raf = null; } },
    resize: () => { generate(); if (reduced) draw(0); },
    redraw: () => { draw(0); },
  };
};
