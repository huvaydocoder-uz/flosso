/**
 * Ready-made window + two-column compositions (catalog pages 20–23).
 * Spot positions are % of the wall-less image (scripts/key_compositions.py output).
 */

export type SolutionRole = "column" | "capital" | "base" | "cornice" | "casing" | "casingTop" | "casingBottom" | "sill";

export type SolutionItem = {
  role: SolutionRole;
  code: string;
  /** chosen size option (column / casing width), cm */
  variant?: number;
  x: number;
  y: number;
};

export type Solution = {
  id: number;
  image: string;
  w: number;
  h: number;
  items: SolutionItem[];
};

// all four compositions share one elevation, so pins share coordinates
const P: Record<SolutionRole, { x: number; y: number }> = {
  capital: { x: 6.3, y: 5 },
  column: { x: 6.3, y: 50 },
  base: { x: 6.3, y: 95 },
  cornice: { x: 50, y: 12 },
  casing: { x: 29.6, y: 50 },
  casingTop: { x: 70.2, y: 22 },
  casingBottom: { x: 70.2, y: 74 },
  sill: { x: 50, y: 81 },
};

const item = (role: SolutionRole, code: string, variant?: number): SolutionItem => ({ role, code, variant, ...P[role] });

export const SOLUTIONS: Solution[] = [
  {
    id: 1,
    image: "/images/compositions/composition-1-cut.webp",
    w: 1318,
    h: 1083,
    items: [
      item("column", "FTK02-330"),
      item("capital", "FIK(T)07-818", 30),
      item("base", "FIK(P)02-818", 30),
      item("cornice", "FKR04-817"),
      item("casing", "FNL02-415"),
      item("casingTop", "FIN05-612", 15),
      item("casingBottom", "FIN02-614", 15),
      item("sill", "FPD01-615"),
    ],
  },
  {
    id: 2,
    image: "/images/compositions/composition-2-cut.webp",
    w: 1324,
    h: 1085,
    items: [
      item("column", "FTK02-325"),
      item("capital", "FIK(T)05-716", 30),
      item("base", "FIK(P)03-612", 30),
      item("cornice", "FKR02-718"),
      item("casing", "FNL02-415"),
      item("casingTop", "FIN01-612", 15),
      item("casingBottom", "FIN03-514", 15),
      item("sill", "FPD04-615"),
    ],
  },
  {
    id: 3,
    image: "/images/compositions/composition-3-cut.webp",
    w: 1326,
    h: 1092,
    items: [
      item("column", "FTK01-420"),
      item("capital", "FIK(T)04-717", 20),
      item("base", "FIK(P)03-612", 20),
      item("cornice", "FKR01-718"),
      item("casing", "FNL01-415"),
      // the composition page prints "Fin02-612" — a typo: FIN02 exists only as 614
      item("casingTop", "FIN02-614", 15),
      item("casingBottom", "FIN06-514", 15),
      // the composition page prints "FPD05-615" — a typo: FPD05 exists as 413 and 515 (15 cm)
      item("sill", "FPD05-515"),
    ],
  },
  {
    id: 4,
    image: "/images/compositions/composition-4-cut.webp",
    w: 1322,
    h: 1084,
    items: [
      item("column", "FTK01-440"),
      item("capital", "FIK(T)06-818", 40),
      item("base", "FIK(P)01-818", 40),
      item("cornice", "FKR03-715"),
      item("casing", "FNL04-315"),
      item("casingTop", "FIN04-613", 15),
      item("casingBottom", "FIN03-514", 15),
      item("sill", "FPD02-615"),
    ],
  },
];
