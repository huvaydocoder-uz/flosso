"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Product } from "@data/products";
import { useProductNaming } from "../ProductsProvider";
import { ProfileDrawing } from "../ProfileDrawing";
import { DiscountBadge, Price } from "./Price";

export function ProductCard({ product: p, onOpen }: { product: Product; onOpen: (code: string) => void }) {
  const t = useTranslations();
  const { name, size } = useProductNaming();
  const sz = size(p);
  // each product sits in a foam moulding, like a window in its casing
  return (
    <div className="win-frame h-full">
      <button
        type="button"
        onClick={() => onOpen(p.code)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-[3px] bg-surface text-left"
        aria-label={`${name(p)}, ${p.code}, ${t("product.width")} ${p.widthCm} ${t("units.cm")}`}
      >
        <div className="relative aspect-[4/3] bg-foam">
          <Image
            src={p.image}
            alt={`${name(p)} — ${p.code}`}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className="object-contain p-[7%] drop-shadow-[3px_6px_5px_rgb(60_40_30/0.16)] transition-transform duration-500 ease-[var(--ease-glide)] group-hover:-translate-y-1"
          />
          <DiscountBadge percent={p.discountPercent} className="absolute top-2.5 left-2.5" />
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] leading-snug font-semibold text-ink sm:text-[16px]">{name(p)}</p>
              {sz && <p className="mt-0.5 text-[12px] text-ink-soft sm:text-[13px]">{sz}</p>}
            </div>
            <div className="hidden w-16 shrink-0 sm:block" aria-hidden="true">
              <ProfileDrawing code={p.code} cm={t("units.cm")} compact />
            </div>
          </div>
          <p className="mt-2 text-[12px] text-ink-soft tabular sm:text-[13px]">
            {t("product.width")} {p.widthCm} · {t("product.height").toLowerCase()} {p.heightCm} {t("units.cm")}
          </p>
          <p className="mt-1.5">
            <span className="inline-block rounded-[5px] bg-foam px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-ink-soft tabular">{p.code}</span>
          </p>
          <Price product={p} className="mt-auto pt-3" />
        </div>
      </button>
    </div>
  );
}
