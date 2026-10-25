import type { CSSProperties } from "react";

/** the four facade walls the decor is shown on (gallery, hero, ready-made sets) */
export const WALLS: { key: "sand" | "brick" | "stone" | "light"; style: CSSProperties }[] = [
  { key: "sand", style: { background: "linear-gradient(160deg,#e3d2bb,#d2bd9f)" } },
  { key: "brick", style: { backgroundImage: "url(/patterns/brick.svg)", backgroundSize: "72px auto" } },
  { key: "stone", style: { backgroundImage: "url(/patterns/ashlar.svg)", backgroundSize: "180px auto" } },
  { key: "light", style: { background: "linear-gradient(160deg,#f6f2ee,#e9e2dc)" } },
];
