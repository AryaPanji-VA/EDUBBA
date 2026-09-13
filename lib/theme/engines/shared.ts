// Shared math helpers for the environment engines.
// Ported from the Kimi mockup's theme-controller.js.

// Seeded PRNG (mulberry32). Same seed = same geometry across reloads.
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function wrap(v: number, m: number): number {
  return ((v % m) + m) % m;
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

// smoothstep: 0→0, 0.5→0.5, 1→1 with easing
export function smooth01(v: number): number {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
}
