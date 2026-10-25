"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CATEGORIES, parseCode, type CategoryId, type Product } from "@data/products";
import { SOLUTIONS } from "@data/solutions";
import { simpleCalc, WINDOW_ROLES as ROLES, windowCalc, type CalcRow, type WindowPick, type WindowRole } from "@/lib/calc";
import { SECTION_IDS } from "@/lib/contact";
import { EVT_CALC, requestQuote } from "@/lib/events";
import { formatNumber } from "@/lib/format";
import { useTg } from "@/lib/use-tg";
import { useProductNaming, useProducts } from "../ProductsProvider";
import { frameClass } from "../FlossoFrame";
import { SectionHeading } from "../SectionHeading";
import { Chips, NumberField, parseNum, SelectField } from "../ui";

const ROLE_CAT: Record<WindowRole, CategoryId> = {
  cornice: "FKR",
  casing: "FNL",
  sill: "FPD",
  casingTop: "FIN",
  casingBottom: "FIN",
  column: "FTK",
  capital: "FIK",
  base: "FIK",
};
// column ornaments are split by position: (T) tops, (P) bottoms
const ROLE_POS: Partial<Record<WindowRole, "T" | "P">> = { capital: "T", base: "P" };
const COLUMN_ROLES: WindowRole[] = ["column", "capital", "base"];

/** ornaments come in casing widths; pick the option matching the chosen casing */
function finVariant(p: Product | undefined, casingCode?: string) {
  if (!p?.variants) return undefined;
  const w = casingCode ? parseCode(casingCode).widthCm : p.variants[p.variants.length - 1];
  return p.variants.reduce((best, v) => (Math.abs(v - w) < Math.abs(best - w) ? v : best), p.variants[0]);
}

/** numbered step heading: 1) product → 2) size → 3) result */
function Step({ n, title }: { n: number; title: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-3 text-[18px] font-semibold text-ink sm:text-[19px]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red text-[16px] font-bold text-white shadow-[0_4px_12px_rgb(198_40_40/0.35)] tabular">{n}</span>
      {title}
    </h3>
  );
}

function pickFromSet(id: number): WindowPick {
  const s = SOLUTIONS.find((x) => x.id === id)!;
  const pick: WindowPick = {};
  for (const r of ROLES) {
    const it = s.items.find((i) => i.role === r);
    if (it) pick[r] = { code: it.code, variant: it.variant };
  }
  return pick;
}

export function Calculator() {
  const t = useTranslations();
  const [mode, setMode] = useState<"simple" | "window">("simple");

  // simple
  const [code, setCode] = useState("FKR01-718");
  const [variant, setVariant] = useState<number | undefined>();
  const [amount, setAmount] = useState("10");

  // window
  const [w, setW] = useState("120");
  const [h, setH] = useState("150");
  const [count, setCount] = useState("4");
  const [set, setSet] = useState<string>("1");
  const [custom, setCustom] = useState<WindowPick>(() => pickFromSet(1));
  const [colCount, setColCount] = useState("2");
  const [colH, setColH] = useState("280");

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      setMode("window");
      setSet(String(id));
    };
    window.addEventListener(EVT_CALC, on);
    return () => window.removeEventListener(EVT_CALC, on);
  }, []);

  const { products, get: getProduct } = useProducts();
  const { name, size } = useProductNaming();
  const product = getProduct(code) ?? products[0];
  const unitWord = product.unit === "metr" ? t("units.m") : t("units.dona");
  const simple = simpleCalc(product, parseNum(amount), variant);
  const tg = useTg();

  const pick = set === "custom" ? custom : pickFromSet(Number(set));
  const win = windowCalc(
    { widthCm: parseNum(w), heightCm: parseNum(h), count: parseNum(count), pick, colCount: parseNum(colCount), colHeightCm: parseNum(colH) },
    getProduct,
  );
  const hasColumns = COLUMN_ROLES.some((r) => pick[r]);

  // how each line was counted, in plain numbers, so the result can be checked by hand
  const how = (r: CalcRow) => {
    const cm = t("units.cm");
    switch (r.role) {
      case "cornice":
      case "sill":
        return `${count} × ${win.spanCm} ${cm}`;
      case "casing":
        return `${count} × 2 × ${h} ${cm}`;
      case "casingTop":
      case "casingBottom":
        return `${count} × 2`;
      case "column":
        return `${colCount} × ${colH} ${cm}`;
      default:
        return `${colCount} × 1`;
    }
  };

  const byCat = (cat: CategoryId, pos?: "T" | "P") => products.filter((p) => p.active && p.category === cat && (!pos || p.position === pos));
  const opt = (c: string) => {
    const p = getProduct(c)!;
    const sz = size(p);
    return `${name(p)}${sz ? ` (${sz})` : ""} — ${c}`;
  };

  const setCustomRole = (role: WindowRole, c: string) => {
    setCustom((prev) => {
      const next = { ...prev, [role]: c ? { code: c } : null };
      // keep ornaments in step with the casing / column width
      for (const r of ["casingTop", "casingBottom"] as const) {
        const sel = next[r];
        if (sel) next[r] = { code: sel.code, variant: finVariant(getProduct(sel.code), next.casing?.code) };
      }
      for (const r of ["capital", "base"] as const) {
        const sel = next[r];
        if (sel) next[r] = { code: sel.code, variant: finVariant(getProduct(sel.code), next.column?.code) };
      }
      return next;
    });
  };

  const full = `${code}${variant ? ` (${variant})` : ""}`;
  const tgHref =
    mode === "simple"
      ? tg.product(product, name(product), { variant, price: simple.price, amount: simple.amount, total: simple.sum })
      : tg.window(win.rows, win.total, w, h, count, (r) => t(`calc.${r.role}`));

  // the same calculation, attached to the request form instead of Telegram
  const toForm = () =>
    mode === "simple"
      ? requestQuote({
          products: [full],
          note: `${name(product)} — ${full}: ${simple.amount} ${unitWord} → ${formatNumber(simple.sum)} ${t("units.sum")}`,
          items: [{ code, variant, amount: simple.amount }],
        })
      : requestQuote({
          products: win.rows.map((r) => r.code),
          items: win.rows.map((r) => ({ code: r.code, variant: pick[r.role]?.variant, amount: r.amount })),
          note: [
            t("tg.window", { count, w, h }),
            ...win.rows.map((r) => `${t(`calc.${r.role}`)}: ${r.code} — ${r.amount} ${r.unit === "metr" ? t("units.m") : t("units.dona")}`),
            `${t("tg.total")}: ${formatNumber(win.total)} ${t("units.sum")}`,
          ].join("\n"),
        });
  const total = mode === "simple" ? simple.sum : win.total;

  return (
    <section aria-labelledby="calc-title" id={SECTION_IDS.calculator} className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <SectionHeading id="calc-title" title={t("calc.title")} lead={t("calc.lead")} align="center" />

        <div className="mt-10 flex justify-center">
          <Chips
            label={t("calc.title")}
            value={mode}
            options={["simple", "window"] as const}
            onChange={setMode}
            render={(m) => (m === "simple" ? t("calc.simple") : t("calc.window"))}
            size="lg"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          {/* inputs */}
          <div className="rounded-[18px] bg-foam p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-8">
            {mode === "simple" ? (
              <div className="grid gap-8">
                <div>
                  <Step n={1} title={t("calc.steps.product")} />
                  <SelectField
                    label={t("calc.product")}
                    value={code}
                    onChange={(c) => {
                      setCode(c);
                      setVariant(getProduct(c)?.variants?.[0]);
                      setAmount(getProduct(c)?.unit === "metr" ? amount : "4");
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <optgroup key={c.id} label={t(`categoryPlural.${c.id}`)}>
                        {byCat(c.id).map((p) => (
                          <option key={p.code} value={p.code}>
                            {opt(p.code)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </SelectField>
                </div>
                <div className="grid gap-5 border-t border-line pt-7">
                  <Step n={2} title={t("calc.steps.size")} />
                  {product.variants && (
                    <div>
                      <p className="mb-2 text-[14px] font-semibold text-ink">{t("product.variant")}</p>
                      <Chips label={t("product.variant")} value={variant ?? product.variants[0]} options={product.variants} onChange={setVariant} render={(v) => `${v} ${t("units.cm")}`} />
                    </div>
                  )}
                  <NumberField label={product.unit === "metr" ? t("calc.length") : t("calc.qty")} value={amount} onChange={setAmount} decimal={product.unit === "metr"} className="sm:max-w-[280px]" />
                </div>
              </div>
            ) : (
              <div className="grid gap-8">
                <div className="grid gap-5">
                  <Step n={1} title={t("calc.steps.set")} />
                  <SelectField
                    label={t("calc.set")}
                    value={set}
                    onChange={(v) => {
                      // a custom pick starts from the set on screen, not from scratch
                      if (v === "custom" && set !== "custom") setCustom(pickFromSet(Number(set)));
                      setSet(v);
                    }}
                  >
                    {SOLUTIONS.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {t("solutions.tab", { n: s.id })}
                      </option>
                    ))}
                    <option value="custom">{t("calc.custom")}</option>
                  </SelectField>
                  {set === "custom" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {ROLES.map((r) => (
                        <SelectField key={r} label={t(`calc.${r}`)} value={custom[r]?.code ?? ""} onChange={(c) => setCustomRole(r, c)}>
                          <option value="">{t("calc.none")}</option>
                          {byCat(ROLE_CAT[r], ROLE_POS[r]).map((p) => (
                            <option key={p.code} value={p.code}>
                              {opt(p.code)}
                            </option>
                          ))}
                        </SelectField>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-5 border-t border-line pt-7">
                  <Step n={2} title={t("calc.steps.size")} />
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <NumberField label={t("calc.winWidth")} value={w} onChange={setW} />
                    <NumberField label={t("calc.winHeight")} value={h} onChange={setH} />
                    <NumberField label={t("calc.winCount")} value={count} onChange={setCount} />
                </div>
                {hasColumns && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <NumberField label={t("calc.colCount")} value={colCount} onChange={setColCount} />
                    <NumberField label={t("calc.colHeight")} value={colH} onChange={setColH} />
                  </div>
                )}
                <p className="text-[13px] leading-relaxed text-ink-soft">{t("calc.formula")}</p>
                </div>
              </div>
            )}
          </div>

          {/* result: a printed estimate slip */}
          <div className={`self-start rounded-[18px] bg-surface p-5 shadow-relief-lg sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+24px)] ${frameClass("spin")}`} aria-live="polite">
            <Step n={3} title={t("calc.steps.result")} />
            {mode === "simple" ? (
              <dl className="space-y-3 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{t("calc.product")}</dt>
                  <dd className="font-semibold text-ink tabular">
                    {code}
                    {variant ? ` (${variant})` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{t("calc.amount")}</dt>
                  <dd className="text-ink tabular">
                    {simple.amount > 0 ? `${simple.amount} ${unitWord} × ${formatNumber(simple.price)} ${t("units.sum")}` : "—"}
                  </dd>
                </div>
                {product.discountPercent > 0 && <p className="text-right text-[13px] font-semibold text-red">{t("calc.discountApplied", { p: product.discountPercent })}</p>}
              </dl>
            ) : (
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="text-[12px] text-ink-soft">
                    <th scope="col" className="pb-2 font-medium">{t("calc.element")}</th>
                    <th scope="col" className="pb-2 text-right font-medium">{t("calc.amount")}</th>
                    <th scope="col" className="pb-2 text-right font-medium">{t("calc.sum")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-y border-line">
                  {win.rows.map((r) => (
                    <tr key={r.role}>
                      <td className="py-2.5 pr-2">
                        <span className="block text-ink">{t(`calc.${r.role}`)}</span>
                        <span className="block text-[12px] text-ink-soft tabular">{r.code}</span>
                        <span className="block text-[12px] text-pencil tabular">
                          {how(r)} · {formatNumber(r.price)} {t("units.sum")}
                        </span>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap text-ink tabular">
                        {r.amount} {r.unit === "metr" ? t("units.m") : t("units.dona")}
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap text-ink tabular">{formatNumber(r.sum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-6 flex items-end justify-between gap-4 border-t-2 border-ink pt-4">
              <span className="text-[17px] font-semibold text-ink">{t("calc.total")}:</span>
              <span className="text-right text-[clamp(28px,3vw,40px)] leading-none font-bold text-ink tabular">
                {formatNumber(mode === "simple" ? simple.sum : win.total)}
                <span className="ml-1.5 text-[15px] font-medium text-ink-soft">{t("units.sum")}</span>
              </span>
            </div>

            <a
              {...tgHref}
              href={total > 0 ? tgHref.href : undefined}
              aria-disabled={total <= 0}
              className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[10px] bg-red px-6 text-[16px] font-semibold text-white shadow-relief-sm transition-colors hover:bg-red-deep aria-disabled:pointer-events-none aria-disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden="true" />
              {t("calc.send")}
            </a>
            <button
              type="button"
              onClick={toForm}
              disabled={total <= 0}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-[14px] font-semibold text-ink-soft underline underline-offset-4 hover:text-ink disabled:opacity-50"
            >
              {t("calc.orForm")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
