"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowRight, Truck } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { Frieze } from "../ornament/Frieze";
import { useWallCycle, WallControls, WallLayers } from "../WallCycle";
import { FacadeTag, type TagSpot } from "./FacadeTag";

/** composition 1 from the catalog, wall removed (scripts/key_compositions.py) */
export const FACADE = { src: "/images/compositions/composition-1-cut.webp", w: 1318, h: 1083 };

const TAGS: TagSpot[] = [
  { code: "FKR04-817", x: 40, y: 9.5, delay: 0 },
  { code: "FIN05-612", x: 70.5, y: 21.5, wideOnly: true, delay: 1.7 },
  { code: "FNL02-415", x: 30, y: 44, delay: 3.1 },
  { code: "FPD01-615", x: 44, y: 81, narrowY: 66, delay: 2.2 },
  { code: "FTK02-330", x: 93, y: 46, side: "left", wideOnly: true, delay: 0.9 },
];

export function Hero() {
  const t = useTranslations();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState("FKR04-817");
  const [open, setOpen] = useState<string | null>(null);
  const walls = useWallCycle(ref);


  // pointer: a few pixels of depth between wall and decor
  const px = useSpring(0, { stiffness: 60, damping: 18 });
  const py = useSpring(0, { stiffness: 60, damping: 18 });
  const decorX = useTransform(px, (v) => v * 10);
  const decorY = useTransform(py, (v) => v * 6);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !(e.target as HTMLElement).closest("[data-tag-layer]")) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  // the card stays while the facade is on screen; scrolling well past the hero closes it
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const io = new IntersectionObserver(([e]) => e.intersectionRatio < 0.2 && setOpen(null), { threshold: [0, 0.2, 0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, [open]);

  const select = (code: string) => {
    setActive(code);
    setOpen((o) => (o === code ? null : code));
  };

  return (
    <section
      ref={ref}
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-plaster pt-[var(--header-top)]"
      {...walls.swipe}
    >
      {/* the wall behind the decor: sand plaster, brick, grey stone, white plaster */}
      <WallLayers idx={walls.idx} />
      {/* raking daylight from the upper left */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,var(--glow),transparent_60%)]" />

      {/* computer: plaque | facade side by side in a grid, so they never overlap at any window size;
          the facade stands on the plinth at the very bottom */}
      <div
        className="@container relative mx-auto flex max-w-[1440px] flex-col lg:grid lg:min-h-[min(calc(100svh-var(--header-top)),900px)] lg:grid-cols-[var(--plaque)_minmax(0,1fr)] lg:items-center lg:gap-x-[var(--gutter)] lg:px-[var(--gutter)] lg:pb-[26px]"
        style={{ "--plaque": "clamp(320px, 28vw, 430px)" } as CSSProperties}
      >
        {/* the facade */}
        <motion.figure
          className={`relative mt-20 mb-12 flex h-[min(clamp(250px,40svh,440px),calc((100vw-28px)/1.217))] justify-center ${open ? "z-30" : "z-[25]"} lg:col-start-2 lg:row-start-1 lg:mt-0 lg:mb-0 lg:justify-end lg:self-center lg:h-[min(calc((100svh-var(--header-top))*0.84),calc((100cqw-var(--plaque)-3*var(--gutter))/1.217),820px)]`}
          aria-label={t("hero.wallLabel")}
        >
          <motion.div
            data-tag-layer
            style={{ x: decorX, y: decorY, aspectRatio: `${FACADE.w} / ${FACADE.h}` }}
            className="relative h-full shrink-0"
          >
            <Image
              src={FACADE.src}
              alt={t("hero.wallLabel")}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 58vw, 130vw"
              className="object-contain drop-shadow-[6px_12px_10px_rgb(70_50_40/0.28)]"
            />
            {TAGS.map((s) => (
              <FacadeTag key={s.code} {...s} active={active === s.code} open={open === s.code} onSelect={select} />
            ))}
          </motion.div>
        </motion.figure>

        {/* phones: the plinth sits right under the facade */}
        <div data-plinth className="relative lg:hidden">
          <Frieze code="FPD04-615" height={18} />
        </div>

        <div className="absolute top-2 left-[var(--gutter)] z-20 lg:hidden">
          <WallControls idx={walls.idx} go={walls.go} />
        </div>


        {/* mounted plaque */}
        <div className="relative z-20 bg-foam px-[var(--gutter)] pt-6 pb-10 lg:col-start-1 lg:bg-transparent lg:row-start-1 lg:self-center lg:px-0 lg:py-4">
          <div className="mb-4 hidden lg:block">
            <WallControls idx={walls.idx} go={walls.go} />
          </div>
          <div className={`hero-plaque rounded-[14px] bg-surface p-6 shadow-relief-lg sm:p-8 ${frameClass("spin")} lg:mt-0 lg:p-[clamp(22px,3.4svh,32px)]`}>
            <h1 id="hero-title" className="display text-[clamp(34px,min(4.1cqw,7svh),62px)] text-ink">
              <span className="sr-only">FLOSSO — </span>
              {t("slogan")}
            </h1>
            <svg aria-hidden="true" viewBox="0 0 120 10" className="mt-5 h-2.5 w-[120px] text-red">
              <path d="M0.5 0v10M119.5 0v10M0.5 5h119" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
            <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">{t("hero.lead")}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-red/[0.08] py-1.5 pr-3.5 pl-1.5 text-[14px] font-semibold text-red">
              <span className="flex size-7 items-center justify-center rounded-full bg-red text-white">
                <Truck className="size-4" aria-hidden="true" />
              </span>
              {t("hero.delivery")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={`#${SECTION_IDS.catalog}`}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-red px-5 text-[16px] font-semibold whitespace-nowrap text-white shadow-relief-sm transition-colors hover:bg-red-deep"
              >
                {t("hero.primary")}
                <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-glide)] group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <a
                href={`#${SECTION_IDS.contact}`}
                className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-ink/20 px-6 text-[16px] font-semibold text-ink transition-colors hover:border-ink hover:bg-foam"
              >
                {t("hero.secondary")}
              </a>
            </div>
            {/* where the tags are depends on the layout: above on phones, to the right on wide screens */}
            <p className={`mt-5 flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-ink-soft ${frameClass("spin", { glow: false })}`}>
              <span aria-hidden="true" className="tag-sway inline-block h-3 w-5 shrink-0 origin-left rounded-r-[3px] bg-red [clip-path:polygon(5px_0,100%_0,100%_100%,5px_100%,0_50%)]" />
              <span className="lg:hidden">{t("hero.tagHintNarrow")}</span>
              <span className="hidden lg:inline">{t("hero.tagHintWide")}</span>
            </p>
          </div>
        </div>
      </div>
      {/* plinth the columns stand on: across the whole bay, from pilaster to pilaster */}
      <div className="absolute inset-x-0 bottom-0 hidden lg:block">
        <Frieze code="FPD04-615" height={20} />
      </div>
    </section>
  );
}
