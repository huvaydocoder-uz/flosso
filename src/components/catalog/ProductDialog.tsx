"use client";

import { FileText, Phone, Send, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { simpleCalc } from "@/lib/calc";
import { CONTACT } from "@/lib/contact";
import { requestQuote } from "@/lib/events";
import { formatNumber } from "@/lib/format";
import { useTg } from "@/lib/use-tg";
import { useProductNaming, useProducts } from "../ProductsProvider";
import { ProfileDrawing } from "../ProfileDrawing";
import { Chips, NumberField, parseNum } from "../ui";
import { DiscountBadge, Price } from "./Price";

/** Native <dialog>: focus trap, Esc and the backdrop come from the browser. */
export function ProductDialog({ code, onClose }: { code: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (code && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (!code && d.open) d.close();
  }, [code]);

  return (
    <dialog
      ref={ref}
      onClose={() => {
        document.documentElement.style.overflow = "";
        onClose();
      }}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="product-title"
      className="product-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-night/55 backdrop:backdrop-blur-[2px] sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-[min(1040px,94vw)]"
    >
      {code && <DialogBody key={code} code={code} onClose={() => ref.current?.close()} />}
    </dialog>
  );
}

function DialogBody({ code, onClose }: { code: string; onClose: () => void }) {
  const t = useTranslations();
  const p = useProducts().get(code)!;
  const { name, size } = useProductNaming();
  const sz = size(p);
  const [variant, setVariant] = useState<number | undefined>(p.variants?.[0]);
  const [amount, setAmount] = useState(p.unit === "metr" ? "10" : "4");
  const calc = simpleCalc(p, parseNum(amount), variant);
  const unitWord = p.unit === "metr" ? t("units.m") : t("units.dona");
  const tg = useTg();
  const tgHref = tg.product(p, name(p), { variant, price: calc.price, amount: calc.amount, total: calc.sum });

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-surface sm:rounded-[18px] sm:shadow-[0_30px_80px_rgb(30_10_10/0.35)]">
      <button
        type="button"
        onClick={onClose}
        aria-label={t("product.close")}
        className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-surface/90 text-ink shadow-relief-sm hover:bg-surface"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="grid flex-1 overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* object + its section */}
        <div className="bg-foam p-5 pt-14 sm:p-8 md:sticky md:top-0 md:self-start">
          <div className="relative aspect-[4/3]">
            <Image src={p.image} alt={`${name(p)} (${code})`} fill sizes="(min-width: 768px) 480px, 100vw" className="object-contain drop-shadow-[4px_10px_8px_rgb(60_40_30/0.2)]" />
            <DiscountBadge percent={p.discountPercent} className="absolute top-0 left-0" />
          </div>
          <div className="mx-auto mt-6 max-w-[300px] rounded-[12px] bg-surface p-4 shadow-relief-sm">
            <ProfileDrawing code={code} cm={t("units.cm")} />
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <h3 id="product-title" className="pr-12 text-[28px] leading-tight font-bold text-ink sm:text-[32px]">
            {name(p)}
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-ink-soft">
            {sz && <span>{sz}</span>}
            <span className="rounded-[6px] bg-foam px-2 py-0.5 text-[13px] font-semibold tracking-[0.04em] text-ink tabular">
              {t("naming.code")}: {code}
            </span>
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
            <div className="rounded-[10px] bg-foam px-4 py-3">
              <dt className="text-ink-soft">{t("product.width")}</dt>
              <dd className="mt-0.5 text-[18px] font-semibold text-ink tabular">
                {p.widthCm} {t("units.cm")}
              </dd>
              <dd className="text-[12px] text-pencil">{t("product.widthHint")}</dd>
            </div>
            <div className="rounded-[10px] bg-foam px-4 py-3">
              <dt className="text-ink-soft">{t("product.height")}</dt>
              <dd className="mt-0.5 text-[18px] font-semibold text-ink tabular">
                {p.heightCm} {t("units.cm")}
              </dd>
              <dd className="text-[12px] text-pencil">{t("product.heightHint")}</dd>
            </div>
          </dl>

          {p.variants && (
            <div className="mt-6">
              <p className="mb-2 text-[14px] font-semibold text-ink">{t("product.variant")}</p>
              <Chips label={t("product.variant")} value={variant!} options={p.variants} onChange={setVariant} render={(v) => `${v} ${t("units.cm")}`} />
            </div>
          )}

          <Price product={p} variant={variant} size="lg" className="mt-6" />

          {/* inline calculator */}
          <div className="mt-6 rounded-[14px] border border-line p-4 sm:p-5">
            <p className="text-[13px] text-ink-soft">{p.unit === "metr" ? t("product.priceMetr") : t("product.priceDona")}</p>
            <div className="mt-4">
              <NumberField label={p.unit === "metr" ? t("calc.length") : t("calc.qty")} value={amount} onChange={setAmount} decimal={p.unit === "metr"} />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4" aria-live="polite">
              <span className="text-[14px] text-ink-soft tabular">
                {calc.amount > 0 ? `${calc.amount} ${unitWord} × ${formatNumber(calc.price)}` : "—"}
                {p.discountPercent > 0 && <span className="mt-1 block text-[12px] font-semibold text-red">{t("calc.discountApplied", { p: p.discountPercent })}</span>}
              </span>
              <span className="text-right">
                <span className="block text-[12px] text-ink-soft">
                  {t("calc.total")}, {t("calc.approx")}
                </span>
                <span className="text-[24px] font-bold text-ink tabular">
                  {formatNumber(calc.sum)} <span className="text-[14px] font-medium text-ink-soft">{t("units.sum")}</span>
                </span>
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              {...tgHref}
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-[10px] bg-red px-6 text-[16px] font-semibold text-white shadow-relief-sm hover:bg-red-deep"
            >
              <Send className="size-4" aria-hidden="true" />
              {t("product.order")}
            </a>
            <a href={CONTACT.phoneHref} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[10px] border border-ink/20 px-6 text-[16px] font-semibold text-ink hover:border-ink">
              <Phone className="size-4 text-red" aria-hidden="true" />
              {t("product.call")}
            </a>
          </div>
          <button
            type="button"
            onClick={() => {
              const full = `${p.code}${variant ? ` (${variant})` : ""}`;
              onClose();
              requestQuote({
                products: [full],
                items: [{ code: p.code, variant, amount: calc.amount || undefined }],
              });
            }}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-foam px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-plaster"
          >
            <FileText className="size-4 text-red" aria-hidden="true" />
            {t("product.form")}
          </button>

          <div className="mt-8 space-y-5 border-t border-line pt-6">
            <div>
              <h4 className="text-[15px] font-semibold text-ink">{t("product.use")}</h4>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{t(`categoryInfo.${p.category}.use`)}</p>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-ink">{t("product.tip")}</h4>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{t(`categoryInfo.${p.category}.tip`)}</p>
            </div>
            <p className="text-[13px] text-pencil">{t("catalog.priceNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
