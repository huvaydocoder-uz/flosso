"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** round flags, drawn so they stay crisp at small sizes */
function Flag({ code }: { code: Locale }) {
  if (code === "uz")
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true" className="size-full">
        <rect width="28" height="9.6" fill="#1eb3e6" />
        <rect y="9.6" width="28" height="0.8" fill="#ce1126" />
        <rect y="10.4" width="28" height="7.2" fill="#fff" />
        <rect y="17.6" width="28" height="0.8" fill="#ce1126" />
        <rect y="18.4" width="28" height="9.6" fill="#1eb53a" />
        <circle cx="8.2" cy="4.9" r="2.6" fill="#fff" />
        <circle cx="9.2" cy="4.9" r="2.2" fill="#1eb3e6" />
        <g fill="#fff">
          <circle cx="12.2" cy="6.6" r=".45" />
          <circle cx="14" cy="6.6" r=".45" />
          <circle cx="15.8" cy="6.6" r=".45" />
          <circle cx="14" cy="4.8" r=".45" />
          <circle cx="15.8" cy="4.8" r=".45" />
          <circle cx="15.8" cy="3" r=".45" />
        </g>
      </svg>
    );
  if (code === "ru")
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true" className="size-full">
        <rect width="28" height="9.4" fill="#fff" />
        <rect y="9.3" width="28" height="9.4" fill="#0039a6" />
        <rect y="18.6" width="28" height="9.4" fill="#d52b1e" />
      </svg>
    );
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="size-full">
      <rect width="28" height="28" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * 2.154} width="28" height="2.154" fill="#b22234" />
      ))}
      <rect width="13" height="15.1" fill="#3c3b6e" />
      <g fill="#fff">
        {[2.2, 5.2, 8.2, 11.2].flatMap((x) => [2.6, 6.2, 9.8, 13].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r=".55" />))}
      </g>
    </svg>
  );
}

const NAMES: Record<Locale, string> = { uz: "O‘zbekcha", ru: "Русский", en: "English" };

/**
 * All three languages side by side in one capsule (the khalidmetall.uz pattern):
 * round flag + code, the current one sits on a red pill that slides to the next choice.
 * On phones only the flags show.
 */
export function LangFlags({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [shown, setShown] = useState<Locale>(locale);
  const idx = routing.locales.indexOf(shown);

  const change = (next: Locale) => {
    if (next === locale) return;
    setShown(next);
    const hash = window.location.hash;
    start(() => router.replace(`${pathname}${hash}`, { locale: next, scroll: false }));
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("language")}
      className={`relative flex h-10 items-center rounded-[13px] bg-foam p-1 ring-1 ring-line ${pending ? "opacity-70" : ""} ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 w-8 rounded-[10px] bg-red shadow-[0_4px_10px_rgb(198_40_40/0.35)] transition-transform duration-400 ease-[var(--ease-glide)] 2xl:w-[58px]"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {routing.locales.map((l) => {
        const on = l === shown;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={NAMES[l]}
            title={NAMES[l]}
            lang={l}
            onClick={() => change(l)}
            className={`relative z-[1] inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-[10px] text-[12px] font-bold tracking-[0.06em] uppercase transition-colors duration-300 2xl:w-[58px] ${
              on ? "text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            <span className={`block size-[22px] shrink-0 overflow-hidden rounded-full ring-1 transition-transform duration-300 ${on ? "ring-white/80" : "ring-black/10 hover:scale-110"}`}>
              <Flag code={l} />
            </span>
            <span className="hidden 2xl:inline">{l}</span>
          </button>
        );
      })}
    </div>
  );
}
