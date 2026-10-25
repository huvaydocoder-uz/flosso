"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { WALLS } from "@/lib/walls";

/**
 * Walls behind the decor change on their own every few seconds (paused off screen,
 * off under reduced motion) and by hand: arrows and dots, or a swipe on a phone.
 */
export function useWallCycle(area: RefObject<HTMLElement | null>, every = 4500) {
  const [idx, setIdx] = useState(0);
  const [hold, setHold] = useState(0);
  const go = useCallback((n: number) => {
    setIdx(((n % WALLS.length) + WALLS.length) % WALLS.length);
    // a manual pick restarts the clock
    setHold((h) => h + 1);
  }, []);

  useEffect(() => {
    const el = area.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setIdx((i) => (i + 1) % WALLS.length), every);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [area, every, hold]);

  // horizontal swipe with a finger; taps and vertical scrolls pass through untouched
  const start = useRef<{ x: number; y: number } | null>(null);
  const swipe = {
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.pointerType === "touch") start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: ReactPointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      if (Math.abs(dx) > 50 && Math.abs(e.clientY - s.y) < 40) go(idx + (dx < 0 ? 1 : -1));
    },
    onPointerCancel: () => void (start.current = null),
  };

  return { idx, go, swipe };
}

/** the stacked wall layers; the visible one fades in over the others */
export function WallLayers({ idx, className = "" }: { idx: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {WALLS.map((w, i) => (
        <div key={w.key} className="wall-layer absolute inset-0" style={{ ...w.style, opacity: i === idx ? 1 : 0 }} />
      ))}
    </div>
  );
}

/** ‹ • • • • ›  with the wall's name */
export function WallControls({ idx, go, className = "", showName = true }: { idx: number; go: (n: number) => void; className?: string; showName?: boolean }) {
  const t = useTranslations("walls");
  const btn =
    "inline-flex size-9 items-center justify-center rounded-full text-ink transition-[background-color,color,transform] duration-300 hover:bg-red hover:text-white active:scale-90";
  return (
    <div role="group" aria-label={t("label")} className={`inline-flex items-center gap-1 rounded-full bg-surface/85 p-1 shadow-relief-sm ring-1 ring-line backdrop-blur-md ${className}`}>
      <button type="button" onClick={() => go(idx - 1)} aria-label={t("prev")} className={btn}>
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <span className="flex items-center gap-1.5 px-1">
        {WALLS.map((w, i) => (
          <button
            key={w.key}
            type="button"
            onClick={() => go(i)}
            aria-label={t(w.key)}
            aria-pressed={i === idx}
            className="group flex h-6 items-center"
          >
            <span className={`block h-2 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-glide)] ${i === idx ? "w-6 bg-red" : "w-2 bg-ink/25 group-hover:bg-ink/50"}`} />
          </button>
        ))}
      </span>
      {showName && (
        <span aria-live="polite" className="hidden min-w-[9.5em] px-1 text-[13px] font-semibold text-ink sm:inline">
          {t(WALLS[idx].key)}
        </span>
      )}
      <button type="button" onClick={() => go(idx + 1)} aria-label={t("next")} className={btn}>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
