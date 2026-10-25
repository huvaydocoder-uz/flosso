"use client";

import { useTranslations } from "next-intl";
import { unitBasePrice, unitPrice, type Product } from "@data/products";
import { formatNumber } from "@/lib/format";

type Props = { product: Product; variant?: number; size?: "sm" | "lg"; className?: string };

/** current price per unit; with a discount the old price is struck through */
export function Price({ product, variant, size = "sm", className = "" }: Props) {
  const t = useTranslations("units");
  const now = unitPrice(product, variant);
  const was = unitBasePrice(product, variant);
  const sale = product.discountPercent > 0;
  const unit = product.unit === "metr" ? t("perMetr") : t("perDona");

  return (
    <div className={`tabular ${className}`}>
      {sale && (
        <p className={`text-pencil line-through ${size === "lg" ? "text-[15px]" : "text-[12px]"}`}>
          <span className="sr-only">−{product.discountPercent}%: </span>
          {formatNumber(was)} {t("sum")}
        </p>
      )}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={`font-bold ${sale ? "text-red" : "text-ink"} ${size === "lg" ? "text-[30px] leading-none" : "text-[18px]"}`}>
          {formatNumber(now)}
        </span>
        <span className={`text-ink-soft ${size === "lg" ? "text-[15px]" : "text-[12px]"}`}>
          {t("sum")} / {unit}
        </span>
      </p>
    </div>
  );
}

export function DiscountBadge({ percent, className = "" }: { percent: number; className?: string }) {
  if (!percent) return null;
  return (
    <span className={`inline-flex items-center rounded-full bg-red px-2.5 py-1 text-[12px] font-bold text-white tabular shadow-[0_2px_6px_rgb(120_20_20/0.3)] ${className}`}>
      −{percent}%
    </span>
  );
}
