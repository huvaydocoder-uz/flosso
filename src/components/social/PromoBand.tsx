"use client";

import { ArrowRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { CategoryId } from "@data/products";
import { openCategory, openProduct } from "@/lib/events";

export type PublicPromo = {
  id: string;
  title: string;
  text: string;
  image: string;
  discountPercent: number;
  targetType: string;
  target: string;
  startsAt: string | null;
  endsAt: string | null;
};

const LAST = "flosso-promo-last";
const EVERY_MS = 3500;

const read = (s: Storage, k: string) => {
  try {
    return s.getItem(k);
  } catch {
    return null;
  }
};
const write = (s: Storage, k: string, v: string) => {
  try {
    s.setItem(k, v);
  } catch {}
};

/**
 * The offer band: sits in the page between sections, never over the screen.
 * Several offers take turns like an ad, non-stop. It shows on every visit, and each visit
 * starts on the next offer; × folds it away for this page view only.
 */
export function PromoBand({ promos }: { promos: PublicPromo[] }) {
  const t = useTranslations("promo");
  const [list, setList] = useState<PublicPromo[]>([]);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const now = Date.now();
    // the page may be cached for a few minutes: check the dates again here
    const live = promos.filter((p) => (!p.startsAt || Date.parse(p.startsAt) <= now) && (!p.endsAt || Date.parse(p.endsAt) >= now));
    if (!live.length) return;

    // every visit opens on the offer after the one shown last time; a first visit starts at random
    const last = live.findIndex((p) => p.id === read(localStorage, LAST));
    const start = last >= 0 ? (last + 1) % live.length : Math.floor(Math.random() * live.length);
    write(localStorage, LAST, live[start].id);
    // mount closed, then open a frame later so the height eases in from zero
    let id = requestAnimationFrame(() => {
      setList(live);
      setI(start);
      id = requestAnimationFrame(() => setOpen(true));
    });
    return () => cancelAnimationFrame(id);
  }, [promos]);

  // rises in when scrolled to; rotates only while on screen
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [list.length]);

  useEffect(() => {
    // keeps turning whatever the pointer does; only rests while scrolled off screen
    if (list.length < 2 || !open || !inView) return;
    const id = window.setTimeout(() => setI((n) => (n + 1) % list.length), EVERY_MS);
    return () => window.clearTimeout(id);
  }, [i, list.length, open, inView]);

  const close = () => setOpen(false);

  const view = (p: PublicPromo) => {
    if (p.targetType === "product" && p.target) openProduct(p.target);
    else if (p.targetType === "category" && p.target) openCategory(p.target as CategoryId);
  };

  if (!list.length) return null;
  const running = list.length > 1 && open && inView;

  return (
    <aside
      data-tone="red"
      ref={ref}
      aria-label={t("label")}
      aria-hidden={!open}
      aria-roledescription="carousel"
      // grid 0fr ↔ 1fr animates the real height, so neighbours slide instead of jumping
      className={`grid bg-surface transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-glide)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      onTransitionEnd={(e) => e.target === e.currentTarget && e.propertyName === "grid-template-rows" && !open && setList([])}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-[var(--gutter)] py-8 lg:py-10">
          <div
            className={`relative overflow-hidden rounded-[20px] bg-red text-white shadow-[0_18px_44px_rgb(140_25_25/0.3)] transition-[opacity,transform] duration-700 ease-[var(--ease-glide)] ${seen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <span aria-hidden="true" className="absolute inset-0 bg-[url(/patterns/lattice-on-red.svg)] bg-[length:96px] opacity-60" />
            <button
              type="button"
              onClick={close}
              tabIndex={open ? 0 : -1}
              aria-label={t("close")}
              className="absolute top-2.5 right-2.5 z-20 flex size-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_4px_12px_rgb(40_5_5/0.3)] transition-transform duration-300 hover:scale-105 hover:rotate-90"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            {/* every offer sits in the same cell; the current one fades and slides in */}
            <div className="grid">
              {list.map((p, n) => {
                const on = n === i;
                const cutout = p.image.startsWith("/images/products/");
                const hasTarget = p.targetType !== "none" && Boolean(p.target);
                return (
                  <div
                    key={p.id}
                    aria-hidden={!on}
                    aria-roledescription="slide"
                    className={`relative col-start-1 row-start-1 grid transition-[opacity,transform] duration-700 ease-[var(--ease-glide)] sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${
                      on ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
                    }`}
                  >
                    <div className="relative flex min-h-[170px] items-center justify-center sm:min-h-[230px]">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt=""
                          loading="lazy"
                          // catalog cut-outs sit whole on the red; uploaded photos fill the frame
                          className={`absolute inset-0 size-full ${cutout ? "object-contain p-5 drop-shadow-[0_10px_14px_rgb(40_5_5/0.45)]" : "object-cover"}`}
                        />
                      )}
                      {p.discountPercent > 0 && (
                        <span
                          className={`flex flex-col items-center justify-center rounded-full bg-white text-red shadow-[0_14px_34px_rgb(60_10_10/0.35)] transition-transform duration-700 ease-[var(--ease-settle)] ${
                            p.image ? "absolute bottom-3 left-3 size-20 sm:size-24" : "relative size-28"
                          } ${on ? "scale-100 rotate-0" : "scale-75 -rotate-12"}`}
                        >
                          <span className="text-[11px] font-bold tracking-[0.12em] uppercase">{t("upTo")}</span>
                          <span className="text-[26px] leading-none font-extrabold tabular sm:text-[30px]">−{p.discountPercent}%</span>
                        </span>
                      )}
                    </div>

                    <div className="relative flex flex-col justify-center gap-3 px-5 pt-1 pb-14 sm:py-9 sm:pr-16 sm:pl-2">
                      <p className="text-[12px] font-bold tracking-[0.14em] text-white/80 uppercase">{t("label")}</p>
                      <h2 className="text-[clamp(22px,2.6vw,34px)] leading-tight font-bold">{p.title}</h2>
                      {p.text && <p className="max-w-[52ch] text-[15px] leading-relaxed text-white/90">{p.text}</p>}
                      {hasTarget && (
                        <button
                          type="button"
                          onClick={() => view(p)}
                          tabIndex={open && on ? 0 : -1}
                          className="btn-shine group relative mt-1 inline-flex min-h-12 items-center justify-center gap-2 self-start overflow-hidden rounded-[12px] bg-white px-6 text-[16px] font-semibold text-red shadow-[0_8px_20px_rgb(40_5_5/0.3)] transition-transform duration-300 hover:-translate-y-0.5"
                        >
                          {t("view")}
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* dots: the current one fills up until the next offer */}
            {list.length > 1 && (
              <div className="absolute right-0 bottom-4 left-0 z-10 flex justify-center gap-1 sm:right-6 sm:left-auto">
                {list.map((p, n) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setI(n)}
                    tabIndex={open ? 0 : -1}
                    aria-label={`${n + 1} / ${list.length}`}
                    aria-current={n === i}
                    className="flex h-11 items-center px-1"
                  >
                    <span className={`relative block h-1.5 overflow-hidden rounded-full bg-white/35 transition-[width] duration-300 ${n === i ? "w-9" : "w-3"}`}>
                      {n === i && (
                        <span
                          key={`${i}-${running}`}
                          className="promo-progress absolute inset-y-0 left-0 rounded-full bg-white"
                          style={{ animationDuration: `${EVERY_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
