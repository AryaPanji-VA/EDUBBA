"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import { useReducedMotion } from "@/lib/theme/use-reduced-motion";
import { smooth01 } from "@/lib/theme/engines/shared";
import { cityEngine } from "@/lib/theme/engines/city-engine";
import { signalEngine } from "@/lib/theme/engines/signal-engine";
import { spaceEngine } from "@/lib/theme/engines/space-engine";
import type { EngineController, EngineFactory } from "@/lib/theme/engines/types";

const ENGINES: Record<string, EngineFactory> = {
  "after-dark": cityEngine,
  "signal": signalEngine,
  "deep-space": spaceEngine,
};

// Presentational ambient background: two crossfading canvases + a scroll veil.
// Owns no application state. Never remounts lesson content (sits in layout).
export function EnvironmentLayer() {
  const { theme, mode } = useTheme();
  const reduced = useReducedMotion();
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const controllerRef = useRef<EngineController | null>(null);
  const crossfadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spawn/crossfade the environment when theme or mode changes.
  useEffect(() => {
    const envEls = [canvasARef.current, canvasBRef.current];
    if (!envEls[0] || !envEls[1]) return;
    const factory = ENGINES[theme];
    if (!factory) return;

    const next = 1 - activeRef.current;
    const cv = envEls[next]!;
    const prev = envEls[activeRef.current]!;
    cv.style.imageRendering = theme === "after-dark" ? "pixelated" : "auto";

    const ctl = factory(cv, mode, reduced);
    ctl.resize();
    ctl.start();

    if (crossfadeTimeoutRef.current) clearTimeout(crossfadeTimeoutRef.current);

    if (!reduced) {
      cv.classList.add("xfade");
      prev.classList.add("xfade");
      cv.style.opacity = "0";
      void cv.offsetWidth; // force reflow so the transition runs
      cv.style.opacity = "1";
      prev.style.opacity = "0";
      const prevCtl = controllerRef.current;
      crossfadeTimeoutRef.current = setTimeout(() => {
        if (prevCtl) prevCtl.stop();
      }, 680);
    } else {
      cv.classList.remove("xfade");
      prev.classList.remove("xfade");
      cv.style.opacity = "1";
      prev.style.opacity = "0";
      if (controllerRef.current) controllerRef.current.stop();
    }

    activeRef.current = next;
    controllerRef.current = ctl;

    return () => {
      if (crossfadeTimeoutRef.current) clearTimeout(crossfadeTimeoutRef.current);
      ctl.stop();
    };
  }, [theme, mode, reduced]);

  // Scroll veil: smoothstep opacity driven by scroll depth. rAF-throttled.
  useEffect(() => {
    let queued = false;

    function updateVeil() {
      if (!veilRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      veilRef.current.style.opacity = smooth01(t).toFixed(3);
    }

    function onScroll() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          updateVeil();
          if (reduced && controllerRef.current) controllerRef.current.redraw();
        });
      }
    }

    updateVeil();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  // Resize: debounced regenerate + veil update.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function onResize() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (controllerRef.current) controllerRef.current.resize();
        if (veilRef.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          veilRef.current.style.opacity = smooth01(t).toFixed(3);
        }
      }, 200);
    }

    window.addEventListener("resize", onResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas className="env" ref={canvasARef} aria-hidden="true" />
      <canvas className="env" ref={canvasBRef} aria-hidden="true" />
      <div className="veil" ref={veilRef} aria-hidden="true" />
    </>
  );
}
