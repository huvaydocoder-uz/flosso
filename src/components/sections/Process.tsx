"use client";

import { ArrowRight, Images } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { Lightbox } from "../Lightbox";
import { Frieze } from "../ornament/Frieze";
import { SectionHeading } from "../SectionHeading";

// six stages of the work, each with its own real photos (owner's iPhone RAW files, graded to the site palette)
const GROUPS = [
  { key: "raw", n: 3 },
  { key: "coat", n: 4 },
  { key: "column", n: 3 },
  { key: "store", n: 3 },
  { key: "pack", n: 2 },
  { key: "show", n: 3 },
] as const;
const src = (key: string, i: number) => `/images/process/${key}-${i + 1}.webp`;
const EVERY_MS = 3600;

/** one stage: its photos crossfade on their own; a tap opens them large */
function StageCard({ g, i, on, onOpen }: { g: (typeof GROUPS)[number]; i: number; on: boolean; onOpen: () => void }) {
  const t = useTranslations("process");
  const [shown, setShown] = useState(0);

  // neighbouring cards change at different moments; nothing runs while the section is off screen
  useEffect(() => {
    if (!on || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: number | undefined;
    const first = window.setTimeout(() => {
      setShown((s) => (s + 1) % g.n);
      id = window.setInterval(() => setShown((s) => (s + 1) % g.n), EVERY_MS);
    }, 700 + i * 550);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [on, g.n, i]);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`group flex h-full w-full flex-col overflow-hidden rounded-[12px] bg-surface sm:rounded-[16px] text-left shadow-relief-sm transition-transform duration-500 ease-[var(--ease-glide)] hover:-translate-y-1 ${frameClass("hover")}`}
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-plaster-deep">
          {Array.from({ length: g.n }, (_, k) => (
            <Image
              key={k}
              src={src(g.key, k)}
              alt={k === 0 ? t(`groups.${g.key}.t`) : ""}
              fill
              sizes="(min-width: 1024px) 30vw, 46vw"
              className={`object-cover transition-[opacity,transform] duration-1000 ease-[var(--ease-glide)] group-hover:scale-[1.04] ${k === shown ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <span className="absolute top-2 left-2 rounded-full bg-red px-2 py-0.5 text-[11px] sm:top-3 sm:left-3 sm:px-2.5 sm:text-[12px] font-bold text-white shadow-[0_4px_12px_rgb(198_40_40/0.4)] tabular">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="absolute right-2 bottom-2 rounded-full bg-night/65 px-2 py-0.5 text-[11px] sm:right-3 sm:bottom-3 sm:px-2.5 sm:py-1 sm:text-[12px] font-bold text-white backdrop-blur-sm tabular">
            {shown + 1} / {g.n}
          </span>
        </span>
        {/* phones: a small card with the title only; the description shows from a tablet up */}
        <span className="flex flex-1 flex-col p-3 sm:p-5">
          <span className="text-[14px] leading-snug font-semibold text-ink transition-colors group-hover:text-red sm:text-[18px]">{t(`groups.${g.key}.t`)}</span>
          <span className="mt-1.5 hidden text-[14px] leading-relaxed text-ink-soft sm:block">{t(`groups.${g.key}.d`)}</span>
          <span className="mt-auto hidden items-center gap-1.5 pt-4 text-[13px] font-bold tracking-[0.06em] text-red uppercase sm:inline-flex">
            <Images className="size-4" aria-hidden="true" />
            {t("open")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </span>
      </button>
    </li>
  );
}

/** "From workshop to facade": six stages, each a small card whose photos turn on their own */
export function Process() {
  const t = useTranslations("process");
  const section = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const g = open !== null ? GROUPS[open] : null;

  return (
    <section ref={section} aria-labelledby="process-title" id={SECTION_IDS.process} className="relative overflow-hidden bg-plaster pb-20 lg:pb-28">
      <Frieze code="FKR02-718" height={26} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,var(--glow),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1440px] px-[var(--gutter)] pt-20 lg:pt-24">
        <SectionHeading
          id="process-title"
          title={t("title")}
          align="center"
          lead={t("text")}
        />
        <ul className="mx-auto mt-10 grid max-w-[1200px] grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-3">
          {GROUPS.map((x, i) => (
            <StageCard key={x.key} g={x} i={i} on={visible && open === null} onOpen={() => setOpen(i)} />
          ))}
        </ul>
      </div>

      {g && (
        <Lightbox
          auto
          title={t(`groups.${g.key}.t`)}
          text={t(`groups.${g.key}.d`)}
          images={Array.from({ length: g.n }, (_, k) => ({ src: src(g.key, k), alt: `${t(`groups.${g.key}.t`)} ${k + 1}` }))}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
