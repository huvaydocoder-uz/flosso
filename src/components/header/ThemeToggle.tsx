"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY, themePeriod } from "@/lib/boot";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const read = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** day ↔ night switch */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("header");
  const theme = useSyncExternalStore(subscribe, read, () => "light" as const);
  const dark = theme === "dark";

  const toggle = () => {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
    };
    // the choice holds for this day or night only; at the next 07:00 / 19:00 the clock takes over again
    try {
      localStorage.setItem(KEY, `${next}|${themePeriod().key}`);
    } catch {}
    // one cheap crossfade where supported; elsewhere (or with reduced motion) an instant switch
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still && typeof document.startViewTransition === "function") document.startViewTransition(apply);
    else apply();
  };

  const sun = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
  const moon = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5" fill="currentColor">
      <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" />
    </svg>
  );

  // a day/night slider: the knob carries the current light across the track
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      aria-label={dark ? t("themeLight") : t("themeDark")}
      title={dark ? t("themeLight") : t("themeDark")}
      className={`relative inline-flex h-10 w-[62px] shrink-0 items-center rounded-[12px] bg-foam px-1 ring-1 ring-line transition-[box-shadow] hover:ring-ink/25 ${className}`}
    >
      <span aria-hidden="true" className="flex w-full justify-between px-1.5 text-pencil">
        {sun}
        {moon}
      </span>
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 inline-flex size-8 items-center justify-center rounded-[9px] shadow-relief-sm transition-[transform,background-color,color] duration-400 ease-[var(--ease-glide)] ${
          dark ? "translate-x-[22px] bg-ink text-foam" : "translate-x-0 bg-red text-white"
        }`}
      >
        <span className={`transition-transform duration-500 ${dark ? "rotate-0" : "rotate-180"}`}>{dark ? moon : sun}</span>
      </span>
    </button>
  );
}
