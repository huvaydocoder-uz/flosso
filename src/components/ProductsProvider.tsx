"use client";

import { useLocale, useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@data/products";

type Ctx = { products: Product[]; get: (code: string) => Product | undefined };
const ProductsContext = createContext<Ctx | null>(null);

/** the live catalog (from the database) for every client block on the page */
export function ProductsProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const value = useMemo(() => {
    const map = new Map(products.map((p) => [p.code, p]));
    return { products, get: (c: string) => map.get(c) };
  }, [products]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts outside ProductsProvider");
  return ctx;
}

export type SizeWord = "small" | "medium" | "large" | null;

/**
 * Plain names for people who don't read codes:
 * "Karniz, 1-model" + "katta" (its rank among the same model's sizes).
 */
export function useProductNaming() {
  const t = useTranslations();
  const locale = useLocale() as "uz" | "ru" | "en";
  const { products } = useProducts();

  const sizeOf = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const p of products) {
      const k = `${p.category}${p.position ?? ""}${p.model}`;
      groups.set(k, [...(groups.get(k) ?? []), p]);
    }
    const out = new Map<string, SizeWord>();
    for (const list of groups.values()) {
      const sorted = [...list].sort((a, b) => a.widthCm * 10 + a.heightCm - (b.widthCm * 10 + b.heightCm));
      sorted.forEach((p, i) => {
        const n = sorted.length;
        out.set(p.code, n === 1 ? null : i === 0 ? "small" : i === n - 1 ? "large" : "medium");
      });
    }
    return out;
  }, [products]);

  const name = useCallback(
    (p: Product) => {
      const custom = p.names?.[locale];
      if (custom) return custom;
      const kind = p.category === "FIK" ? t(`categoryPos.${p.position === "T" ? "T" : "P"}`) : t(`category.${p.category}`);
      return t("naming.title", { kind, model: Number(p.model) });
    },
    [t, locale],
  );

  const size = useCallback((p: Product) => {
    const w = sizeOf.get(p.code);
    return w ? t(`naming.${w}`) : null;
  }, [sizeOf, t]);

  return { name, size };
}
