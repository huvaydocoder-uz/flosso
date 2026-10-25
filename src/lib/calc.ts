import { parseCode, unitPrice, type Product, type Unit } from "@data/products";

/** round metres up to 10 cm: you can't buy 3.27 m */
export const ceilTenth = (n: number) => Math.ceil(n * 10 - 1e-9) / 10;

type Lookup = (code: string) => Product | undefined;

export type CalcRow = {
  role: WindowRole;
  code: string;
  unit: Unit;
  amount: number;
  price: number;
  sum: number;
};

/** amount × current unit price (a discount, if the product has one, is already in the price) */
export function simpleCalc(p: Product | undefined, amount: number, variant?: number) {
  if (!p || !(amount > 0)) return { amount: 0, price: p ? unitPrice(p, variant) : 0, sum: 0 };
  const price = unitPrice(p, variant);
  const need = p.unit === "metr" ? ceilTenth(amount) : Math.ceil(amount);
  return { amount: need, price, sum: Math.round(need * price) };
}

export type WindowRole = "cornice" | "casing" | "sill" | "casingTop" | "casingBottom" | "column" | "capital" | "base";
export const WINDOW_ROLES: WindowRole[] = ["cornice", "casing", "sill", "casingTop", "casingBottom", "column", "capital", "base"];
export type WindowPick = Partial<Record<WindowRole, { code: string; variant?: number } | null>>;

export type WindowInput = {
  widthCm: number;
  heightCm: number;
  count: number;
  pick: WindowPick;
  /** columns beside the windows (a set has 2 per window wall) */
  colCount?: number;
  colHeightCm?: number;
};

/**
 * cornice & sill = window width + 2 × casing width + 10 cm overhang;
 * casing = 2 × window height; casing ornaments = 2 tops + 2 bottoms per window;
 * column shaft = columns × column height; one top and one bottom per column.
 */
export function windowCalc({ widthCm, heightCm, count, pick, colCount = 0, colHeightCm = 0 }: WindowInput, get: Lookup) {
  const rows: CalcRow[] = [];
  if (!(widthCm > 0) || !(heightCm > 0) || !(count > 0)) return { rows, total: 0, spanCm: 0 };
  const casingW = pick.casing ? parseCode(pick.casing.code).widthCm : 0;
  const spanM = (widthCm + 2 * casingW + 10) / 100;

  const need: Record<WindowRole, number> = {
    cornice: ceilTenth(spanM * count),
    sill: ceilTenth(spanM * count),
    casing: ceilTenth(((2 * heightCm) / 100) * count),
    casingTop: 2 * count,
    casingBottom: 2 * count,
    column: colCount > 0 && colHeightCm > 0 ? ceilTenth((colHeightCm / 100) * colCount) : 0,
    capital: colCount > 0 ? Math.ceil(colCount) : 0,
    base: colCount > 0 ? Math.ceil(colCount) : 0,
  };

  for (const role of WINDOW_ROLES) {
    const sel = pick[role];
    const p = sel && get(sel.code);
    if (!sel || !p) continue;
    const price = unitPrice(p, sel.variant);
    const amount = need[role];
    if (!(amount > 0)) continue;
    rows.push({ role, code: p.code, unit: p.unit, amount, price, sum: Math.round(amount * price) });
  }
  return { rows, total: rows.reduce((s, r) => s + r.sum, 0), spanCm: Math.round(widthCm + 2 * casingW + 10) };
}
