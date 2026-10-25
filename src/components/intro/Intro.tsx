"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { LOGO } from "../Logo";
import "./intro.css";

const PARTS = ["window", "column-l", "column-r", "sill", "casing-l", "casing-r", "cornice"] as const;
// logo and slogan hold long enough to read (~1.5s) before the fade
const TOTAL_MS = 5700;

// mark pieces arrive from the four corners, letters drop in left to right
const firstX = (d: string) => Number(d.match(/^M\s*(-?[\d.]+)/)?.[1] ?? 0);
const letters = [...LOGO.word].sort((a, b) => firstX(a) - firstX(b));
const fromCorner = (i: number): CSSProperties =>
  ({
    "--px": `${i % 2 ? 14 : -14}px`,
    "--py": `${i < 2 ? -14 : 14}px`,
    "--pr": `${i % 2 ? 45 : -45}deg`,
    "--pat": `${2.15 + i * 0.1}s`,
  }) as CSSProperties;

const SCROLL_KEY = "flosso-scroll";

/** a reload continues where the visitor was; a new browser session (empty sessionStorage) starts at the top */
function restoreScroll() {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const y = Number(sessionStorage.getItem(SCROLL_KEY));
    if (nav?.type === "reload" && y > 0 && !location.hash) window.scrollTo({ top: y, behavior: "instant" });
  } catch {}
}

export function Intro() {
  const t = useTranslations();
  const [done, setDone] = useState(false);

  const finish = useCallback(() => {
    document.documentElement.classList.remove("intro-on", "intro-go");
    setDone(true);
    restoreScroll();
  }, []);

  // remember where the visitor is, for a reload
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
      } catch {}
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  useEffect(() => {
    // only a hard page load plays it (the boot script sets intro-on); client navigations just unmount
    const playing = document.documentElement.classList.contains("intro-on");
    // safety net: the animation itself ends the intro, this only catches a stalled image
    const id = window.setTimeout(finish, playing ? TOTAL_MS + 4000 : 0);
    return () => window.clearTimeout(id);
  }, [finish]);


  if (done) return null;

  return (
    <div className="intro" onAnimationEnd={(e) => e.animationName === "intro-out" && finish()}>
      <div aria-hidden="true" className="contents">
      <div className="intro-light" />
      <div className="intro-scene">
        <div className="intro-stage">
          {PARTS.map((p) => (
            <div key={p} className="intro-layer" data-part={p} />
          ))}
        </div>
      </div>
      <div className="intro-veil" />
      <div className="intro-brand">
        <svg viewBox={`0 0 ${LOGO.w} ${LOGO.h}`} className="intro-logo">
          {LOGO.outer.map((d, i) => (
            <path key={`o${i}`} d={d} fill="var(--red)" style={fromCorner(i)} />
          ))}
          {LOGO.inner.map((d, i) => (
            <path key={`i${i}`} d={d} fill="var(--red-deep)" style={{ ...fromCorner(i), "--pat": `${2.45 + i * 0.09}s` } as CSSProperties} />
          ))}
          {letters.map((d, i) => (
            <path key={`w${i}`} d={d} fill="var(--ink)" style={{ "--py": "18px", "--pat": `${2.5 + i * 0.11}s` } as CSSProperties} />
          ))}
        </svg>
        <p className="intro-slogan">{t("slogan")}</p>
      </div>
      </div>
    </div>
  );
}
