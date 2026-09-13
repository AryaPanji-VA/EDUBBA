import { rng, wrap } from "./shared";
import type { EngineController, EngineFactory, EngineMode } from "./types";

// Ported from the Kimi mockup's cityEngine (After Dark pixel city).
// Faithful visual port — the archived mockup remains the source of truth.

interface Star { x: number; y: number; a: number; tw: boolean; ph: number; c: string; }
interface Cloud { x: number; y: number; w: number; }
interface Win { x: number; y: number; on: boolean; c: string; far?: boolean; warm?: boolean; }
interface Lamp { x: number; y: number; }
interface FarB { x: number; w: number; h: number; }
interface NearB { x: number; w: number; h: number; ant: number; box: boolean; tower: boolean; }

const WIN_WARM = ["#E9B262", "#E9B262", "#C98A3E", "#C98A3E", "#8A6A42"];

export const cityEngine: EngineFactory = (cv: HTMLCanvasElement, mode: EngineMode, reduced: boolean): EngineController => {
  const D = mode === "dark";
  const ctx = cv.getContext("2d")!;
  const PX = 4;
  let W = 0, H = 0, hCap = 50, tick = 0, timer: ReturnType<typeof setInterval> | null = null;
  let stars: Star[] = [], clouds: Cloud[] = [], windows: Win[] = [], lamps: Lamp[] = [], farB: FarB[] = [], nearB: NearB[] = [];
  let moon: { x: number; y: number; r: number } | null = null, sun: { x: number; y: number; r: number } | null = null, beacon: { x: number; y: number } | null = null;

  function pickWarm(r: () => number) { return r() < 0.12 ? "#9DB9E6" : WIN_WARM[(r() * WIN_WARM.length) | 0]; }

  function generate() {
    const rect = cv.getBoundingClientRect();
    W = Math.max(80, Math.round(rect.width / PX));
    H = Math.max(50, Math.round(rect.height / PX));
    cv.width = W; cv.height = H;
    hCap = Math.max(18, Math.min(50, Math.floor(H * 0.26)));
    const r = rng(20260910);
    stars = []; clouds = []; windows = []; lamps = []; farB = []; nearB = [];
    moon = null; sun = null; beacon = null;

    if (D) {
      const nStars = Math.min(22, Math.max(12, Math.floor(W / 22)));
      for (let i = 0; i < nStars; i++)
        stars.push({ x: (r() * W) | 0, y: (r() * H * 0.55) | 0, a: 0.22 + r() * 0.45, tw: r() < 0.4, ph: r() * 6.28, c: r() < 0.3 ? "#DCE5F5" : "#F0E4C6" });
      moon = { x: (W * 0.78) | 0, y: Math.max(8, (H * 0.13) | 0), r: 5 };
      for (let i = 0; i < 2; i++) clouds.push({ x: r() * W, y: 4 + r() * H * 0.2, w: 12 + r() * 14 });
    } else {
      sun = { x: (W * 0.72) | 0, y: (H * 0.18) | 0, r: 4 };
      for (let i = 0; i < 3; i++) clouds.push({ x: r() * W, y: 4 + r() * H * 0.2, w: 10 + r() * 12 });
    }

    let x = -3;
    while (x < W + 4) {
      const w = 6 + ((r() * 9) | 0), h = 8 + ((r() * (hCap * 0.55)) | 0);
      farB.push({ x, w, h });
      for (let wx = x + 1; wx < x + w - 1; wx += 2)
        for (let wy = H - h + 2; wy < H - 2; wy += 3) {
          if (D) { if (r() < 0.09) windows.push({ x: wx, y: wy, on: true, c: r() < 0.5 ? "#33456B" : "#6E5636", far: true }); }
          else { if (r() < 0.08) windows.push({ x: wx, y: wy, on: true, c: "#A8B7CC", far: true }); }
        }
      x += w + ((r() * 3) | 0);
    }

    x = -2;
    while (x < W + 4) {
      if (r() < 0.07) {
        const gap = 8 + ((r() * 8) | 0);
        if (D) {
          const nL = 1 + ((r() * 2) | 0);
          for (let i = 0; i < nL; i++) lamps.push({ x: x + 2 + ((r() * Math.max(1, gap - 4)) | 0), y: H - 1 });
        }
        x += gap; continue;
      }
      const w = 7 + ((r() * 8) | 0);
      const h = 12 + Math.floor(Math.pow(r(), 1.5) * (hCap - 12));
      const d = 0.06 + r() * 0.2; const dAdj = r() < 0.14 ? 0.3 + r() * 0.18 : d;
      const b: NearB = { x, w, h, ant: h > hCap * 0.55 && r() < 0.45 ? 1 + ((r() * (w - 2)) | 0) : -1, box: r() < 0.35, tower: false };
      nearB.push(b);
      for (let wx = x + 1; wx < x + w - 1; wx += 2)
        for (let wy = H - h + 2; wy < H - 2; wy += 2) {
          if (D) { if (r() < 0.55) windows.push({ x: wx, y: wy, on: r() < dAdj, c: pickWarm(r) }); }
          else { if (r() < 0.55) { const warm = r() < 0.10; windows.push({ x: wx, y: wy, on: true, c: warm ? "#E3B980" : "#93A4BA", warm }); } }
        }
      x += w + ((r() * 3) | 0);
    }

    if (D) {
      let tall: NearB | null = null;
      nearB.forEach((b) => { if (b.h > hCap * 0.7 && (!tall || b.h > tall!.h)) tall = b; });
      if (tall) {
        const t: NearB = tall;
        beacon = { x: t.x + (t.ant >= 0 ? t.ant : ((t.w / 2) | 0)), y: H - t.h - (t.ant >= 0 ? 5 : 2) };
      }
    }
    const cand = nearB.filter((b) => b.w >= 9 && b.h >= hCap * 0.5 && b.h < hCap * 0.85);
    if (cand.length) cand[0].tower = true;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    let i: number;
    if (D) {
      for (i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx.globalAlpha = s.a * (s.tw ? 0.45 + 0.55 * Math.abs(Math.sin((tick + s.ph) * 0.6)) : 1);
        ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (sun) {
      const g = ctx.createRadialGradient(sun.x, sun.y, 2, sun.x, sun.y, 14);
      g.addColorStop(0, "rgba(251,245,228,0.28)"); g.addColorStop(1, "rgba(251,245,228,0)");
      ctx.fillStyle = g; ctx.fillRect(sun.x - 14, sun.y - 14, 28, 28);
      ctx.fillStyle = "rgba(251,245,228,0.92)";
      for (let dy = -sun.r; dy <= sun.r; dy++)
        for (let dx = -sun.r; dx <= sun.r; dx++)
          if (dx * dx + dy * dy <= sun.r * sun.r) ctx.fillRect(sun.x + dx, sun.y + dy, 1, 1);
    }
    ctx.fillStyle = D ? "rgba(29,43,77,0.5)" : "rgba(246,249,252,0.85)";
    for (i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      ctx.fillRect(c.x | 0, c.y | 0, c.w, 2);
      ctx.fillRect((c.x + c.w * 0.25) | 0, (c.y - 1) | 0, (c.w * 0.45) | 0, 1);
    }
    if (D && moon) {
      const mg = ctx.createRadialGradient(moon.x, moon.y, 2, moon.x, moon.y, 14);
      mg.addColorStop(0, "rgba(240,228,198,0.09)"); mg.addColorStop(1, "rgba(240,228,198,0)");
      ctx.fillStyle = mg; ctx.fillRect(moon.x - 14, moon.y - 14, 28, 28);
      for (let my2 = -moon.r; my2 <= moon.r; my2++)
        for (let mx2 = -moon.r; mx2 <= moon.r; mx2++)
          if (mx2 * mx2 + my2 * my2 <= moon.r * moon.r) { ctx.fillStyle = "#F0E4C6"; ctx.fillRect(moon.x + mx2, moon.y + my2, 1, 1); }
      ctx.fillStyle = "#D8C8A4";
      ctx.fillRect(moon.x - 2, moon.y - 1, 1, 1); ctx.fillRect(moon.x + 1, moon.y + 2, 1, 1); ctx.fillRect(moon.x + 2, moon.y - 2, 1, 1);
    }
    ctx.fillStyle = D ? "#121B31" : "#C2CEDE";
    for (i = 0; i < farB.length; i++) ctx.fillRect(farB[i].x, H - farB[i].h, farB[i].w, farB[i].h);
    ctx.fillStyle = D ? "#0E1729" : "#A9B8CC";
    for (i = 0; i < nearB.length; i++) {
      const b = nearB[i], top = H - b.h;
      ctx.fillRect(b.x, top, b.w, b.h);
      if (b.box) ctx.fillRect(b.x + 1, top - 2, 3, 2);
      if (b.ant >= 0) ctx.fillRect(b.x + b.ant, top - 4, 1, 4);
      if (b.tower) {
        ctx.fillRect(b.x + 2, top - 3, 1, 3); ctx.fillRect(b.x + b.w - 3, top - 3, 1, 3);
        ctx.fillRect(b.x + 1, top - 6, b.w - 2, 3); ctx.fillRect(b.x + ((b.w / 2) | 0), top - 7, 1, 1);
      }
    }
    for (i = 0; i < windows.length; i++) {
      const win = windows[i];
      ctx.fillStyle = D ? (win.on ? win.c : (win.far ? "#121B31" : "#16203A")) : win.c;
      ctx.fillRect(win.x, win.y, 1, 1);
    }
    if (D) {
      ctx.fillStyle = "#8A6A42";
      for (i = 0; i < lamps.length; i++) ctx.fillRect(lamps[i].x, lamps[i].y, 1, 1);
      if (beacon && Math.floor(tick / 2) % 2 === 0) { ctx.fillStyle = "#D96A55"; ctx.fillRect(beacon.x, beacon.y, 1, 1); }
    } else {
      for (let yy = H - 9; yy < H; yy++) { ctx.fillStyle = `rgba(237,241,246,${(0.06 + ((yy - (H - 9)) / 9) * 0.3).toFixed(3)})`; ctx.fillRect(0, yy, W, 1); }
    }
  }

  function tickFn() {
    tick++;
    if (tick % 3 === 0) clouds.forEach((c) => { c.x += 0.5; if (c.x > W + 18) c.x = -22; });
    if (D) {
      if (windows.length && Math.random() < 0.35) { const win = windows[(Math.random() * windows.length) | 0]; if (!win.far) win.on = !win.on; }
    } else {
      if (Math.random() < 0.3) {
        const lit = windows.filter((w) => w.warm);
        if (lit.length > 4) { const wn = lit[(Math.random() * lit.length) | 0]; wn.warm = false; wn.c = "#93A4BA"; }
      }
    }
    draw();
  }

  return {
    start: () => { if (!reduced && !timer) timer = setInterval(tickFn, 650); },
    stop: () => { if (timer) { clearInterval(timer); timer = null; } },
    resize: generate,
    redraw: draw,
  };
};
