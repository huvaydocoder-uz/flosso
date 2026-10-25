"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CATEGORIES, CATEGORY_COVER, finalPrice, slugOf, type CategoryId, type Product } from "@data/products";
import { SECTION_IDS } from "@/lib/contact";
import { openCategory } from "@/lib/events";
import { formatNumber } from "@/lib/format";
import { ProfileDrawing } from "../ProfileDrawing";
import { useProducts } from "../ProductsProvider";
import { SectionHeading } from "../SectionHeading";

const stats = (products: Product[], cat: CategoryId) => {
  const list = products.filter((p) => p.category === cat && p.active);
  if (!list.length) return { count: 0, from: 0 };
  return { count: list.length, from: Math.min(...list.map(finalPrice)) };
};

type Part = "brand" | "cat" | "model" | "height" | "width";
const CODE: { part: Part; text: string }[] = [
  { part: "brand", text: "F" },
  { part: "cat", text: "KR" },
  { part: "model", text: "01" },
  { part: "height", text: "7" },
  { part: "width", text: "18" },
];

const LEGEND = ["KR", "NL", "PD", "TK", "IK", "IN", "TP"] as const;

export function Choose() {
  const t = useTranslations();
  const [part, setPart] = useState<Part>("brand");
  const { products } = useProducts();

  return (
    <section aria-labelledby="choose-title" id={SECTION_IDS.choose} className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <SectionHeading id="choose-title" title={t("choose.title")} lead={t("choose.lead")} align="center" />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {CATEGORIES.map((c, i) => {
            const s = stats(products, c.id);
            const unit = c.unit === "metr" ? t("units.perMetr") : t("units.perDona");
            const cover = CATEGORY_COVER[c.id];
            return (
              <li key={c.id} className={`win-frame ${i === 0 ? "col-span-2" : ""}`}>
                <button
                  type="button"
                  onClick={() => openCategory(c.id)}
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-[3px] bg-foam text-left transition-colors duration-300 hover:bg-surface focus-visible:bg-surface"
                >
                  <div className={`relative w-full ${i === 0 ? "aspect-[2/1] sm:aspect-[16/7]" : "aspect-[4/3]"}`}>
                    <Image
                      src={`/images/products/${slugOf(cover)}.webp`}
                      alt=""
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                      className="object-contain p-[8%] drop-shadow-[4px_8px_6px_rgb(60_40_30/0.18)] transition-transform duration-500 ease-[var(--ease-glide)] group-hover:-translate-y-1"
                    />
                    {/* hanging code tag */}
                    <span className="absolute top-3 right-3 rounded-r-[5px] bg-red py-1 pr-2.5 pl-4 text-[12px] font-bold tracking-[0.06em] text-white shadow-[1px_3px_6px_rgb(60_20_20/0.3)] [clip-path:polygon(8px_0,100%_0,100%_100%,8px_100%,0_50%)]">
                      {c.id}
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2 px-3 pb-3 sm:gap-3 sm:px-5 sm:pb-5">
                    <div>
                      <h3 className="text-[16px] leading-snug font-semibold text-ink sm:text-[18px]">{t(`categoryPlural.${c.id}`)}</h3>
                      <p className="mt-1 text-[13px] text-ink-soft tabular">{t("choose.models", { count: s.count })}</p>
                      {/* the price stays on one line; on a phone the unit drops under it */}
                      <p className="text-[13px] font-semibold text-ink tabular">
                        <span className="whitespace-nowrap">{t("choose.from", { price: formatNumber(s.from) })}</span>{" "}
                        <span className="block font-normal whitespace-nowrap text-ink-soft sm:inline">/ {unit}</span>
                      </p>
                    </div>
                    <ArrowRight className="mb-1 size-5 shrink-0 text-red transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* how to read a code */}
        <div className="mt-20 grid items-center gap-10 rounded-[18px] border-2 border-red/30 bg-foam p-6 shadow-[0_0_0_6px_var(--surface),0_0_0_7px_var(--plaster-deep),0_18px_40px_-18px_rgb(60_40_30/0.3)] sm:p-10 lg:mt-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:p-14">
          <div>
            <h3 className="display text-[clamp(26px,3vw,40px)] text-ink">{t("choose.codeTitle")}</h3>
            <p className="mt-3 text-[16px] text-ink-soft">{t("choose.codeLead")}</p>

            <div role="tablist" aria-label={t("choose.codeTitle")} className="mt-8 flex flex-nowrap items-end font-bold tracking-[0.02em] text-[clamp(34px,10vw,96px)] leading-none tabular sm:gap-x-1">
              {CODE.map((c, i) => {
                const on = part === c.part;
                return (
                  <span key={c.part} className="flex items-end">
                    {i === 3 && <span aria-hidden="true" className="px-1 text-plaster-deep">-</span>}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-controls="code-explain"
                      onClick={() => setPart(c.part)}
                      className={`relative rounded-[6px] px-0.5 pb-3 transition-colors sm:px-1 duration-300 ${on ? "text-red" : "text-ink/35 hover:text-ink/70"}`}
                    >
                      {c.text}
                      <span aria-hidden="true" className={`absolute inset-x-1 bottom-0 h-[3px] rounded-full transition-colors ${on ? "bg-red" : "bg-transparent"}`} />
                    </button>
                  </span>
                );
              })}
            </div>

            <div id="code-explain" role="tabpanel" aria-live="polite" className="mt-6 min-h-[84px] max-w-[52ch]">
              <p className="text-[13px] font-semibold tracking-[0.1em] text-red uppercase">{t(`choose.parts.${part}.label`)}</p>
              <p className="mt-2 text-[17px] leading-relaxed text-ink">{t(`choose.parts.${part}.text`)}</p>
            </div>
            <p className="mt-4 max-w-[52ch] rounded-[10px] bg-surface px-4 py-3 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)]">{t("choose.summary")}</p>

            <h4 className="mt-8 text-[13px] font-semibold tracking-[0.1em] text-ink-soft uppercase">{t("choose.legendTitle")}</h4>
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
              {LEGEND.map((k) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 font-bold text-red tabular">F{k}</dt>
                  <dd className="text-ink">{t(`choose.legend.${k}`)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 max-w-[60ch] text-[14px] leading-relaxed text-ink-soft">{t("choose.position")}</p>
          </div>

          <div className="rounded-[14px] bg-surface p-6 shadow-relief-md sm:p-8">
            <ProfileDrawing code="FKR01-718" cm={t("units.cm")} highlight={part === "height" || part === "width" ? part : null} />
          </div>
        </div>
      </div>
    </section>
  );
}
