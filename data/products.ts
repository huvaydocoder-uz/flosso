/**
 * FLOSSO catalog (from flosso-katalog.pdf).
 * Prices are ESTIMATES (Tashkent market, 2026) until the owner sets real ones in the admin panel.
 * Stage 4 seeds this file into the database; keep the shape flat and serialisable.
 */
import profiles from "./generated/profiles.json";

export type CategoryId = "FKR" | "FNL" | "FPD" | "FTK" | "FIK" | "FIN" | "FTP";
export type Unit = "metr" | "dona";

export type Product = {
  code: string;
  category: CategoryId;
  model: string;
  /** cross-section height (cm) */
  heightCm: number;
  /** cross-section depth / width (cm) */
  widthCm: number;
  unit: Unit;
  /** current base price in so'm, per metre or per piece */
  price: number;
  /** active discount in %, 0 = none */
  discountPercent: number;
  /** size options in cm (column / casing width) */
  variants?: number[];
  /** FIK only: bottom (P) or top (T) piece */
  position?: "P" | "T";
  image: string;
  active: boolean;
  order: number;
  /** optional owner-written names; empty → generated from category + model */
  names?: { uz?: string | null; ru?: string | null; en?: string | null };
};

export type Category = {
  id: CategoryId;
  unit: Unit;
  /** anchor id in the catalog section */
  slug: string;
};

export const CATEGORIES: Category[] = [
  { id: "FKR", unit: "metr", slug: "karniz" },
  { id: "FNL", unit: "metr", slug: "nalichnik" },
  { id: "FPD", unit: "metr", slug: "podokonnik" },
  { id: "FTK", unit: "metr", slug: "taroq-kolonna" },
  { id: "FIK", unit: "dona", slug: "kolonna-igrushka" },
  { id: "FIN", unit: "dona", slug: "nalichnik-igrushka" },
  { id: "FTP", unit: "metr", slug: "termopanel" },
];

const CODES: Record<CategoryId, string[]> = {
  FKR: ["FKR01-718", "FKR01-615", "FKR01-512", "FKR02-718", "FKR02-615", "FKR02-512", "FKR03-715", "FKR03-818", "FKR04-817"],
  FNL: [
    "FNL01-310", "FNL01-312", "FNL01-415", "FNL02-310", "FNL02-312", "FNL02-415",
    "FNL03-310", "FNL03-312", "FNL03-315", "FNL04-310", "FNL04-312", "FNL04-315",
  ],
  FPD: [
    "FPD01-513", "FPD01-615", "FPD02-513", "FPD02-615", "FPD03-513", "FPD03-615",
    "FPD04-513", "FPD04-615", "FPD05-413", "FPD05-515", "FPD06-413",
  ],
  FTK: ["FTK01-325", "FTK01-420", "FTK01-430", "FTK01-440", "FTK02-325", "FTK02-330", "FTK02-440"],
  FIK: ["FIK(P)01-818", "FIK(P)02-818", "FIK(P)03-612", "FIK(T)04-717", "FIK(T)05-716", "FIK(T)06-818", "FIK(T)07-818"],
  FIN: ["FIN01-612", "FIN02-614", "FIN03-514", "FIN04-613", "FIN05-612", "FIN06-514"],
  FTP: ["FTP01-330", "FTP01-440", "FTP02-330", "FTP02-440"],
};

/** sample discounts so the struck-through price can be checked; owner edits in admin */
const SAMPLE_DISCOUNTS: Record<string, number> = {
  "FKR01-718": 15,
  "FNL01-310": 10,
  "FPD01-615": 12,
  "FTK01-420": 20,
};

const roundTo = (n: number, step = 500) => Math.round(n / step) * step;

/** estimate: price grows with the profile's cross-section (h × w) */
function estimatePrice(cat: CategoryId, h: number, w: number): number {
  const area = h * w;
  switch (cat) {
    case "FNL":
    case "FKR":
    case "FPD":
      return roundTo(8000 + 430 * area);
    case "FTK":
    case "FTP":
      return roundTo((8000 + 430 * area) * 1.25);
    case "FIK":
      return roundTo(30000 + 120 * area, 1000);
    case "FIN":
      return roundTo(15000 + 150 * area, 1000);
  }
}

export const slugOf = (code: string) => code.toLowerCase().replace(/[()]/g, "");

/** FKR01-718 → { model: "01", h: 7, w: 18 }; FIK(T)04-717 → position T */
export function parseCode(code: string) {
  const m = code.match(/^(F[A-Z]{2})(?:\(([PT])\))?(\d{2})-(\d)(\d{2})$/);
  if (!m) throw new Error(`Bad product code: ${code}`);
  return {
    category: m[1] as CategoryId,
    position: m[2] as "P" | "T" | undefined,
    model: m[3],
    heightCm: Number(m[4]),
    widthCm: Number(m[5]),
  };
}

export const PRODUCTS: Product[] = (Object.keys(CODES) as CategoryId[]).flatMap((cat) =>
  CODES[cat].map((code, i) => {
    const p = parseCode(code);
    const unit = CATEGORIES.find((c) => c.id === cat)!.unit;
    return {
      code,
      category: cat,
      model: p.model,
      heightCm: p.heightCm,
      widthCm: p.widthCm,
      unit,
      price: estimatePrice(cat, p.heightCm, p.widthCm),
      discountPercent: SAMPLE_DISCOUNTS[code] ?? 0,
      variants: cat === "FIK" ? [20, 30, 40] : cat === "FIN" ? [10, 12, 15] : undefined,
      position: p.position,
      image: `/images/products/${slugOf(code)}.webp`,
      active: true,
      order: i,
    } satisfies Product;
  }),
);

export const finalPrice = (p: Pick<Product, "price" | "discountPercent">) =>
  p.discountPercent > 0 ? roundTo(p.price * (1 - p.discountPercent / 100), 100) : p.price;

export const getProduct = (code: string) => PRODUCTS.find((p) => p.code === code);

type ProfilePath = { w: number; h: number; d: string };
export const PROFILES = profiles as Record<string, ProfilePath>;

/** size options cost more as they grow (estimate until the owner sets real prices) */
const VARIANT_STEP = [1, 1.2, 1.4];
export function unitPrice(p: Product, variant?: number): number {
  const base = finalPrice(p);
  const i = variant && p.variants ? p.variants.indexOf(variant) : 0;
  return i > 0 ? roundTo(base * (VARIANT_STEP[i] ?? 1), 500) : base;
}
export function unitBasePrice(p: Product, variant?: number): number {
  const i = variant && p.variants ? p.variants.indexOf(variant) : 0;
  return i > 0 ? roundTo(p.price * (VARIANT_STEP[i] ?? 1), 500) : p.price;
}

/** the photo that best shows each category */
export const CATEGORY_COVER: Record<CategoryId, string> = {
  FKR: "FKR01-718",
  FNL: "FNL01-415",
  FPD: "FPD03-615",
  FTK: "FTK01-430",
  FIK: "FIK(P)01-818",
  FIN: "FIN01-612",
  FTP: "FTP01-440",
};
