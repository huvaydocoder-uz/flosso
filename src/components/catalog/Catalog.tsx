"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useState } from "react";
import { CATEGORIES, type CategoryId } from "@data/products";
import { SECTION_IDS } from "@/lib/contact";
import { EVT_CATEGORY, EVT_PRODUCT } from "@/lib/events";
import { useProductNaming, useProducts } from "../ProductsProvider";
import { Frieze } from "../ornament/Frieze";
import { Lattice } from "../ornament/Lattice";
import { SectionHeading } from "../SectionHeading";
import { ProductCard } from "./ProductCard";
import { ProductDialog } from "./ProductDialog";

const PREVIEW = 12;
const norm = (s: string) => s.toUpperCase().replace(/[()\s‘’'ʻ`-]/g, "");
const catRank = (c: CategoryId) => CATEGORIES.findIndex((x) => x.id === c);

export function Catalog() {
  const t = useTranslations();
  const searchId = useId();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  // other blocks steer the catalog through window events
  useEffect(() => {
    const onCat = (e: Event) => {
      setCat((e as CustomEvent<CategoryId>).detail);
      setQ("");
    };
    const onProduct = (e: Event) => setOpen((e as CustomEvent<string>).detail);
    window.addEventListener(EVT_CATEGORY, onCat);
    window.addEventListener(EVT_PRODUCT, onProduct);
    return () => {
      window.removeEventListener(EVT_CATEGORY, onCat);
      window.removeEventListener(EVT_PRODUCT, onProduct);
    };
  }, []);

  const { products } = useProducts();
  const { name } = useProductNaming();
  const active = useMemo(() => products.filter((p) => p.active), [products]);
  const list = useMemo(() => {
    const nq = norm(q);
    return active
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !nq || norm(p.code).includes(nq) || norm(name(p)).includes(nq))
      .sort((a, b) => catRank(a.category) - catRank(b.category) || a.order - b.order);
  }, [active, cat, q, name]);

  const limited = cat === "all" && !q && !expanded;
  const shown = limited ? list.slice(0, PREVIEW) : list;

  const tabs: (CategoryId | "all")[] = ["all", ...CATEGORIES.map((c) => c.id)];

  return (
    <section aria-labelledby="catalog-title" id={SECTION_IDS.catalog} className="relative bg-foam pb-20 lg:pb-28">
      <Frieze code="FKR01-718" height={26} />
      <Lattice tone="onLight" size={104} className="opacity-60" />
      <div className="relative mx-auto max-w-[1440px] px-[var(--gutter)] pt-20 lg:pt-24">
        <SectionHeading id="catalog-title" title={t("catalog.title")} lead={t("catalog.lead", { count: active.length })} align="center" />

        <div className="sticky top-[calc(var(--bar-h)+32px)] z-20 -mx-[var(--gutter)] mt-10 bg-foam/92 px-[var(--gutter)] py-3 backdrop-blur-md">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div role="tablist" aria-label={t("catalog.title")} className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
              {tabs.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={cat === c}
                  onClick={() => {
                    setCat(c);
                    setExpanded(false);
                  }}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                    cat === c ? "bg-ink text-foam" : "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--pencil)]"
                  }`}
                >
                  {c === "all" ? t("catalog.all") : t(`categoryPlural.${c}`)}
                </button>
              ))}
            </div>

            <div className="relative lg:w-[300px]">
              <label htmlFor={searchId} className="sr-only">
                {t("catalog.search")}
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-pencil" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  // a code search always looks through the whole catalog
                  if (e.target.value) setCat("all");
                }}
                placeholder={t("catalog.searchHint")}
                autoComplete="off"
                spellCheck={false}
                className="block min-h-12 w-full rounded-full border border-line bg-surface pr-11 pl-11 text-[15px] text-ink tabular placeholder:text-pencil outline-none focus:border-red focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)] [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label={t("catalog.reset")} className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:text-ink">
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-ink-soft" aria-live="polite">
          {t("catalog.found", { count: list.length })} · {t("catalog.priceNote")}
        </p>

        {list.length === 0 ? (
          <div className="mt-8 rounded-[14px] bg-surface p-10 text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="text-[16px] text-ink">{t("catalog.empty", { q })}</p>
            <button type="button" onClick={() => setQ("")} className="mt-4 min-h-11 text-[15px] font-semibold text-red underline underline-offset-4">
              {t("catalog.reset")}
            </button>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {shown.map((p) => (
              <li key={p.code}>
                <ProductCard product={p} onOpen={setOpen} />
              </li>
            ))}
          </ul>
        )}

        {limited && list.length > PREVIEW && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex min-h-13 items-center justify-center rounded-[10px] border border-ink/20 bg-surface px-8 text-[16px] font-semibold text-ink hover:border-ink"
            >
              {t("catalog.more", { count: list.length - PREVIEW })}
            </button>
          </div>
        )}
      </div>

      <ProductDialog code={open} onClose={() => setOpen(null)} />
    </section>
  );
}
