import { rng, wrap } from "./shared";
import type { EngineController, EngineFactory, EngineMode } from "./types";

// Ported from the Kimi mockup's spaceEngine (Deep Space galaxy).
// Faithful visual port — the archived mockup remains the source of truth.

const SPACEP = {
  dark: {
    nebCols: [["108,96,180", 0.065, "84,110,170", 0.050], ["96,110,190", 0.075, "120,100,190", 0.050], ["140,120,190", 0.045, "90,120,180", 0.040]],
    dustC: "150,165,210", dustA: 0.030,
    glows: [{ x: 0.6, y: 0.3, r: 0.62, c: "120,140,190", a: 0.026 }],
    planetStops: ["rgba(122,150,205,0.30)", "rgba(62,82,132,0.18)", "rgba(22,32,58,0.10)"],
    planetGlow: "rgba(130,155,210,0.05)", rim: "#B9D2EE", rimA: 0.16, rimA0: 0.35, rimA1: 1.45,
    moonletC: "#C6D2E8", moonletA: 0.07, arcC: "#93A9D2", arcA: [0.06, 0.045],
    tints: ["#E8EDF6", "#E8EDF6", "#CBD8EE", "#AFC4E6", "#D9CEEE"],
    loHi: [[0.10, 0.38], [0.20, 0.55], [0.35, 0.85]], density: 7000,
    hubs: [[0.80, 0.30], [0.20, 0.08], [0.90, 0.68]], hubA: [0.25, 0.45],
    glintN: 3, glintC: "#E8EDF6", glintLen: 3.5, glintA: 0.45,
  },
  light: {
    nebCols: [["150,162,212", 0.075, "168,152,200", 0.055], ["145,155,205", 0.080, "170,152,198", 0.050], ["160,170,215", 0.050, "150,160,200", 0.045]],
    dustC: "165,162,205", dustA: 0.05,
    glows: [{ x: 0.30, y: 0.22, r: 0.5, c: "255,255,255", a: 0.16 }, { x: 0.88, y: 0.78, r: 0.45, c: "255,255,255", a: 0.12 }],
    planetStops: ["rgba(190,198,226,0.55)", "rgba(165,175,210,0.18)", "rgba(150,160,200,0.08)"],
    planetGlow: "rgba(255,255,255,0.20)", rim: "#7D8AB0", rimA: 0.30, rimA0: 1.55, rimA1: 0.35,
    moonletC: "#98A4C6", moonletA: 0.10, arcC: "#93A3CC", arcA: [0.08, 0.06],
    tints: ["#7C89B0", "#93A0C2", "#6F7EA8", "#8E8AB4"],
    loHi: [[0.10, 0.28], [0.18, 0.40], [0.28, 0.55]], density: 14000,
    hubs: [[0.80, 0.30], [0.18, 0.10]], hubA: [0.22, 0.30],
    glintN: 2, glintC: "#7C89B0", glintLen: 3, glintA: 0.35,
  },
};

interface Nebula { x: number; y: number; r: number; sx: number; sy: number; ox: number; oy: number; sp: number; par: number; c0: string; a0: number; c1: string; a1: number; ph: number; }
interface Star { x: number; y: number; a: number; tw: boolean; twSp: number; ph: number; c: string; rad: number; }
interface Layer { par: number; drift: number; big: boolean; lo: number; hi: number; stars: Star[]; }
interface Arc { cx: number; cy: number; rr: number; a0: number; a1: number; alpha: number; }
interface Planet { x: number; y: number; r: number; sp: number; ph: number; par: number; }
interface Moonlet { x: number; y: number; r: number; par: number; }
interface Dust { x0: number; y0: number; x1: number; y1: number; w: number; }

export const spaceEngine: EngineFactory = (cv: HTMLCanvasElement, mode: EngineMode, reduced: boolean): EngineController => {
  const P = SPACEP[mode];
  const ctx = cv.getContext("2d")!;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0, raf: number | null = null;
  let layers: Layer[] = [], nebulae: Nebula[] = [], arcs: Arc[] = [], glints: Star[] = [];
  let planet: Planet | null = null, moonlet: Moonlet | null = null, dust: Dust | null = null;

  function generate() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const r = rng(20260912);
    const geom = [
      { x: 0.16, y: -0.06, r: 0.52, sx: 1.35, sy: 0.85, ox: 0.05, oy: 0.06, sp: 0.00040, par: 0.008 },
      { x: 0.96, y: 0.40, r: 0.46, sx: 0.90, sy: 1.45, ox: -0.06, oy: 0.04, sp: 0.00030, par: 0.008 },
      { x: 0.04, y: 0.97, r: 0.42, sx: 1.25, sy: 0.90, ox: 0.04, oy: -0.05, sp: 0.00050, par: 0.012 },
    ];
    nebulae = geom.map((g, i) => ({ ...g, c0: String(P.nebCols[i][0]), a0: Number(P.nebCols[i][1]), c1: String(P.nebCols[i][2]), a1: Number(P.nebCols[i][3]), ph: r() * 6.2832 }));
    dust = { x0: 0.52, y0: -0.05, x1: 1.05, y1: 0.45, w: 0.16 };
    planet = { x: 0.825, y: 0.170, r: Math.max(20, Math.min(30, H * 0.032)), sp: 0.00035, ph: r() * 6.2832, par: 0.005 };
    moonlet = { x: 0.12, y: 0.72, r: 6, par: 0.009 };
    arcs = [
      { cx: 0.88, cy: 1.30, rr: 0.85, a0: -2.35, a1: -1.15, alpha: P.arcA[0] },
      { cx: -0.18, cy: -0.45, rr: 0.95, a0: 0.85, a1: 1.75, alpha: P.arcA[1] },
    ];

    function acceptance(nx: number, ny: number): number {
      let p = 0.42;
      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        const dx = (nx * W - n.x * W) / (n.sx * n.r * H);
        const dy = (ny * H - n.y * H) / (n.sy * n.r * H);
        p += 0.5 * Math.exp(-(dx * dx + dy * dy) * 2.0);
      }
      if (nx > 0.18 && nx < 0.58 && ny > 0.06 && ny < 0.60) p *= 0.35;
      return Math.min(p, 0.95);
    }
    function placeStars(count: number, layer: Layer) {
      let placed = 0, guard = 0;
      while (placed < count && guard < count * 30) {
        guard++;
        const nx = r(), ny = r();
        if (r() > acceptance(nx, ny)) continue;
        layer.stars.push({ x: nx * (W + 40) - 20, y: ny * (H + 40) - 20, a: layer.lo + r() * (layer.hi - layer.lo), tw: r() < 0.25, twSp: 0.08 + r() * 0.22, ph: r() * 6.2832, c: P.tints[(r() * P.tints.length) | 0], rad: 0.8 + r() * 0.6 });
        placed++;
      }
    }

    layers = [
      { par: 0.006, drift: 0.45, big: false, lo: P.loHi[0][0], hi: P.loHi[0][1], stars: [] },
      { par: 0.013, drift: 0.80, big: false, lo: P.loHi[1][0], hi: P.loHi[1][1], stars: [] },
      { par: 0.024, drift: 1.25, big: true, lo: P.loHi[2][0], hi: P.loHi[2][1], stars: [] },
    ];
    const total = Math.round((W * H) / P.density);
    placeStars(Math.round(total * 0.55), layers[0]);
    placeStars(Math.round(total * 0.30), layers[1]);
    placeStars(Math.round(total * 0.15), layers[2]);

    P.hubs.forEach((hub) => {
      const k = 5 + ((r() * 4) | 0);
      for (let i = 0; i < k; i++) {
        const lay = r() < 0.6 ? layers[1] : layers[2];
        lay.stars.push({ x: hub[0] * W + (r() - 0.5) * 70, y: hub[1] * H + (r() - 0.5) * 70, a: P.hubA[0] + r() * P.hubA[1], tw: r() < 0.35, twSp: 0.08 + r() * 0.2, ph: r() * 6.2832, c: P.tints[(r() * P.tints.length) | 0], rad: 0.8 + r() * 0.5 });
      }
    });
    glints = [];
    const bright = layers[2].stars.slice().sort((a, b) => b.a - a.a);
    for (let i = 0; i < Math.min(P.glintN, bright.length); i++) glints.push(bright[i]);
  }

  function draw(t: number) {
    ctx.clearRect(0, 0, W, H);
    const sy = window.scrollY || 0;
    let i: number;
    for (i = 0; i < P.glows.length; i++) {
      const gl = P.glows[i];
      const hz = ctx.createRadialGradient(W * gl.x, H * gl.y, 0, W * gl.x, H * gl.y, H * gl.r);
      hz.addColorStop(0, `rgba(${gl.c},${gl.a})`); hz.addColorStop(1, `rgba(${gl.c},0)`);
      ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
    }
    if (dust) {
      const mx = (dust.x0 + dust.x1) / 2 * W, my = (dust.y0 + dust.y1) / 2 * H - sy * 0.006;
      const ang = Math.atan2((dust.y1 - dust.y0) * H, (dust.x1 - dust.x0) * W);
      const len = Math.hypot((dust.x1 - dust.x0) * W, (dust.y1 - dust.y0) * H) / 2;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); ctx.scale(len, dust.w * H);
      const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      dg.addColorStop(0, `rgba(${P.dustC},${P.dustA})`); dg.addColorStop(1, `rgba(${P.dustC},0)`);
      ctx.fillStyle = dg; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    for (i = 0; i < nebulae.length; i++) {
      const n = nebulae[i];
      const nx0 = n.x * W + Math.sin(t * n.sp * 6.2832 + n.ph) * 10;
      const ny0 = n.y * H - sy * n.par + Math.cos(t * n.sp * 5.1 + n.ph) * 7;
      const R = n.r * H;
      const breathe = 0.9 + 0.1 * Math.sin(t * 0.03 + n.ph);
      ctx.save(); ctx.translate(nx0, ny0); ctx.scale(n.sx, n.sy);
      const g0 = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      g0.addColorStop(0, `rgba(${n.c0},${(n.a0 * breathe).toFixed(4)})`); g0.addColorStop(1, `rgba(${n.c0},0)`);
      ctx.fillStyle = g0; ctx.fillRect(-R, -R, R * 2, R * 2);
      const g1 = ctx.createRadialGradient(n.ox * R, n.oy * R, 0, n.ox * R, n.oy * R, R * 0.55);
      g1.addColorStop(0, `rgba(${n.c1},${(n.a1 * breathe).toFixed(4)})`); g1.addColorStop(1, `rgba(${n.c1},0)`);
      ctx.fillStyle = g1; ctx.fillRect(-R, -R, R * 2, R * 2); ctx.restore();
    }
    ctx.strokeStyle = P.arcC; ctx.lineWidth = 1;
    for (i = 0; i < arcs.length; i++) {
      const a = arcs[i]; ctx.globalAlpha = a.alpha;
      ctx.beginPath(); ctx.arc(a.cx * W, a.cy * H - sy * 0.004, a.rr * H, a.a0, a.a1); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (planet) {
      const px = planet.x * W + Math.sin(t * planet.sp * 6.2832 + planet.ph) * 5;
      const py = planet.y * H - sy * planet.par + Math.cos(t * planet.sp * 5.4 + planet.ph) * 3;
      const pr = planet.r;
      const pglow = ctx.createRadialGradient(px, py, pr * 0.5, px, py, pr * 2.5);
      pglow.addColorStop(0, P.planetGlow); pglow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pglow; ctx.fillRect(px - pr * 2.5, py - pr * 2.5, pr * 5, pr * 5);
      const body = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.3, pr * 0.1, px, py, pr);
      body.addColorStop(0, P.planetStops[0]); body.addColorStop(0.7, P.planetStops[1]); body.addColorStop(1, P.planetStops[2]);
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = P.rimA; ctx.strokeStyle = P.rim; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(px, py, pr - 0.6, P.rimA0 * Math.PI, P.rimA1 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (moonlet) {
      ctx.globalAlpha = P.moonletA; ctx.fillStyle = P.moonletC;
      ctx.beginPath(); ctx.arc(moonlet.x * W, moonlet.y * H - sy * moonlet.par, moonlet.r, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
    for (let L = 0; L < 3; L++) {
      const lay = layers[L];
      for (i = 0; i < lay.stars.length; i++) {
        const s = lay.stars[i];
        const x = wrap(s.x + t * lay.drift, W + 40) - 20;
        const y = wrap(s.y - sy * lay.par, H + 40) - 20;
        const al = s.a * (s.tw ? 0.6 + 0.4 * Math.sin(t * s.twSp + s.ph) : 1);
        ctx.globalAlpha = al; ctx.fillStyle = s.c;
        if (lay.big) { ctx.beginPath(); ctx.arc(x, y, s.rad, 0, 6.2832); ctx.fill(); } else ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = P.glintC; ctx.lineWidth = 1;
    for (i = 0; i < glints.length; i++) {
      const s = glints[i];
      const gx = wrap(s.x + t * layers[2].drift, W + 40) - 20;
      const gy = wrap(s.y - sy * layers[2].par, H + 40) - 20;
      ctx.globalAlpha = s.a * (s.tw ? 0.6 + 0.4 * Math.sin(t * s.twSp + s.ph) : 1) * P.glintA;
      ctx.beginPath();
      ctx.moveTo(gx - P.glintLen, gy); ctx.lineTo(gx + P.glintLen, gy);
      ctx.moveTo(gx, gy - P.glintLen); ctx.lineTo(gx, gy + P.glintLen);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function loop(ms: number) { draw(ms / 1000); raf = requestAnimationFrame(loop); }
  return {
    start: () => { if (!reduced && !raf) raf = requestAnimationFrame(loop); else draw(0); },
    stop: () => { if (raf) { cancelAnimationFrame(raf); raf = null; } },
    resize: () => { generate(); if (reduced) draw(0); },
    redraw: () => { draw(0); },
  };
};
