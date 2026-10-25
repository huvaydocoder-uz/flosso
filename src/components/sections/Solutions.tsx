"use client";

import { Calculator, FileText, Info, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { unitPrice } from "@data/products";
import { SOLUTIONS, type SolutionItem } from "@data/solutions";
import { SECTION_IDS } from "@/lib/contact";
import { EVT_SOLUTION, openCalcWithSet, openProduct, requestQuote } from "@/lib/events";
import { useTg } from "@/lib/use-tg";
import { formatNumber } from "@/lib/format";
import { useProducts } from "../ProductsProvider";
import { Frieze } from "../ornament/Frieze";
import { SectionHeading } from "../SectionHeading";
import { useWallCycle, WallControls, WallLayers } from "../WallCycle";
import "./solutions.css";

const PARTS = ["window", "column-l", "column-r", "sill", "casing-l", "casing-r", "cornice"] as const;

const label = (it: SolutionItem) => `${it.code}${it.variant ? ` (${it.variant})` : ""}`;

export function Solutions() {
  const t = useTranslations();
  const { get: getProduct } = useProducts();
  const [sid, setSid] = useState(1);
  const tg = useTg();
  const [role, setRole] = useState<SolutionItem["role"]>("cornice");
  useEffect(() => {
    const on = (e: Event) => setSid((e as CustomEvent<number>).detail);
    window.addEventListener(EVT_SOLUTION, on);
    return () => window.removeEventListener(EVT_SOLUTION, on);
  }, []);

  // the facade assembles once it is on screen and its image is ready, and again on every switch
  const stageRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLElement>(null);
  const walls = useWallCycle(wallRef);
  const [seen, setSeen] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const s = SOLUTIONS.find((x) => x.id === sid)!;

  // a pin press makes its row in the list lift and settle, so the price change is seen;
  // on a phone the list sits below the picture, so bring the row on screen first
  const rows = useRef<Partial<Record<SolutionItem["role"], HTMLElement | null>>>({});
  const pinPick = (r: SolutionItem["role"]) => {
    setRole(r);
    const el = rows.current[r];
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80;
    const off = box.top < top || box.bottom > window.innerHeight;
    if (off) el.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(
      () =>
        el.animate(
          [
            { transform: "none", boxShadow: "0 0 0 0 transparent" },
            { transform: "translateY(-10px) scale(1.025)", boxShadow: "0 14px 28px rgb(40 25 20 / 0.18)", offset: 0.35 },
            { transform: "translateY(2px)", offset: 0.7 },
            { transform: "none", boxShadow: "0 0 0 0 transparent" },
          ],
          { duration: 750, easing: "cubic-bezier(0.3, 1.18, 0.6, 1)" },
        ),
      off ? 420 : 0,
    );
  };
  useEffect(() => {
    let live = true;
    const img = new window.Image();
    img.src = s.image;
    img.decode().catch(() => {}).finally(() => live && setLoaded(s.image));
    return () => {
      live = false;
    };
  }, [s.image]);
  // warm the other sets so a switch never waits on the network
  useEffect(() => {
    if (!seen) return;
    for (const x of SOLUTIONS) new window.Image().src = x.image;
  }, [seen]);
  const go = seen && loaded === s.image;

  const active = s.items.find((i) => i.role === role) ?? s.items[0];
  const activeP = getProduct(active.code);

  return (
    <section aria-labelledby="sol-title" id={SECTION_IDS.solutions} className="relative overflow-hidden bg-plaster pb-20 lg:pb-28">
      <Frieze code="FKR03-818" height={30} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,var(--glow),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1440px] px-[var(--gutter)] pt-20 lg:pt-24">
        <SectionHeading id="sol-title" title={t("solutions.title")} lead={t("solutions.lead")} align="center" />

        <div role="tablist" aria-label={t("solutions.title")} className="mt-10 flex flex-wrap justify-center gap-2">
          {SOLUTIONS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={x.id === sid}
              aria-controls="sol-panel"
              onClick={() => setSid(x.id)}
              className={`min-h-12 rounded-full px-5 text-[15px] font-semibold transition-colors ${
                x.id === sid ? "bg-ink text-foam" : "bg-surface/70 text-ink hover:bg-surface"
              }`}
            >
              {t("solutions.tab", { n: x.id })}
            </button>
          ))}
        </div>

        <div id="sol-panel" role="tabpanel" className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          {/* the elevation with its pins */}
          <figure ref={wallRef} {...walls.swipe} className="relative self-start overflow-hidden rounded-[18px] px-3 pt-4 pb-16 shadow-relief-md sm:px-6 sm:pt-6 lg:flex lg:flex-col lg:justify-center lg:self-stretch">
            {/* the set on four different walls, changing on its own or by hand */}
            <WallLayers idx={walls.idx} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,rgb(255_255_255/0.3),transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
              <WallControls idx={walls.idx} go={walls.go} />
            </div>
            <div ref={stageRef} className="sol-scene relative mx-auto w-full max-w-[760px]">
            <div
              key={s.id}
              data-go={go ? "" : undefined}
              role="img"
              aria-label={`${t("solutions.tab", { n: s.id })} — ${t("solutions.perWindow")}`}
              className="sol-stage relative w-full"
              style={{ aspectRatio: `${s.w} / ${s.h}`, "--img": `url(${s.image})` } as CSSProperties}
            >
              {PARTS.map((part) => (
                <div key={part} aria-hidden="true" className="sol-layer" data-part={part} />
              ))}
              {s.items.map((it, i) => {
                const on = it.role === active.role;
                return (
                  <button
                    key={it.role}
                    type="button"
                    onClick={() => pinPick(it.role)}
                    aria-pressed={on}
                    aria-label={`${t(`solutions.roles.${it.role}`)}: ${label(it)}`}
                    className="sol-pin group absolute -translate-x-1/2 -translate-y-1/2 p-2"
                    style={{ left: `${it.x}%`, top: `${it.y}%`, "--i": i } as CSSProperties}
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full shadow-[1px_3px_6px_rgb(40_25_20/0.35)] ring-2 transition-[transform,background-color] duration-300 ease-[var(--ease-settle)] sm:size-8 ${
                        on ? "scale-110 bg-red ring-white" : "bg-surface ring-white/70 group-hover:scale-110"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${on ? "bg-surface" : "bg-red"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
            </div>
          </figure>

          {/* what's in the set */}
          <div className="rounded-[18px] bg-surface p-5 shadow-relief-md sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[18px] font-semibold text-ink">{t("solutions.list")}</h3>
              <p className="text-[13px] text-pencil">{t("solutions.perWindow")}</p>
            </div>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {s.items.map((it) => {
                const p = getProduct(it.code);
                const on = it.role === active.role;
                return (
                  <li key={it.role} ref={(el) => void (rows.current[it.role] = el)} className="relative rounded-[8px] bg-surface">
                    <button
                      type="button"
                      onClick={() => setRole(it.role)}
                      aria-pressed={on}
                      className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-4 rounded-[8px] px-2 py-2.5 text-left transition-colors ${on ? "bg-red/[0.06]" : "hover:bg-foam"}`}
                    >
                      <span>
                        <span className={`block text-[15px] font-semibold ${on ? "text-red" : "text-ink"}`}>{t(`solutions.roles.${it.role}`)}</span>
                        <span className="block text-[12px] text-ink-soft tabular">
                          {p ? `${t("product.width")} ${it.variant ?? p.widthCm} ${t("units.cm")} · ` : ""}
                          {label(it)}
                        </span>
                      </span>
                      {p && (
                        <span className="text-right text-[14px] text-ink tabular">
                          {formatNumber(unitPrice(p, it.variant))}
                          <span className="block text-[12px] text-ink-soft">
                            {t("units.sum")} / {p.unit === "metr" ? t("units.perMetr") : t("units.perDona")}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {activeP && (
              <button
                type="button"
                onClick={() => openProduct(active.code)}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-red hover:text-red-deep"
              >
                <Info className="size-4" aria-hidden="true" />
                {active.code} — {t("catalog.details")}
              </button>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                {...tg.set(
                  t("solutions.tab", { n: s.id }),
                  s.items.map((it) => `${t(`solutions.roles.${it.role}`)} — ${label(it)}`),
                )}
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-[10px] bg-red px-5 text-[15px] font-semibold text-white shadow-relief-sm hover:bg-red-deep"
              >
                <Send className="size-4" aria-hidden="true" />
                {t("solutions.ask")}
              </a>
              <button
                type="button"
                onClick={() => openCalcWithSet(s.id)}
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-[10px] border border-ink/20 px-5 text-[15px] font-semibold text-ink hover:border-ink"
              >
                <Calculator className="size-4" aria-hidden="true" />
                {t("solutions.calc")}
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                requestQuote({
                  products: s.items.map(label),
                  note: `${t("solutions.tab", { n: s.id })} — ${t("solutions.perWindow")}`,
                  items: s.items.map((it) => ({ code: it.code, variant: it.variant })),
                })
              }
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-foam px-5 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-plaster"
            >
              <FileText className="size-4 text-red" aria-hidden="true" />
              {t("solutions.form")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
