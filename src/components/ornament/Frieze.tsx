import friezes from "@data/generated/friezes.json";

type Code = keyof typeof friezes;

const gradient = (code: Code, dir: string) =>
  `linear-gradient(${dir}, ${(friezes[code] as [number, string][]).map(([p, c]) => `${c} ${p}%`).join(", ")})`;

/**
 * A real catalog profile rendered as a lit moulding running across the page —
 * the cornice line between two "floors" of the facade.
 */
export function Frieze({
  code = "FKR04-817",
  height = 28,
  className = "",
  shadow = true,
}: {
  code?: Code;
  height?: number;
  className?: string;
  shadow?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative z-[1] w-full ${className}`}
      style={{
        height,
        backgroundImage: gradient(code, "to bottom"),
        filter: "var(--frieze-filter)",
        boxShadow: shadow ? "0 8px 14px -6px rgb(70 50 40 / 0.35), 0 -1px 0 rgb(70 50 40 / 0.12)" : undefined,
      }}
    />
  );
}

/** the same profile running vertically: a fluted pilaster */
export function pilasterGradient(code: Code = "FTK01-430") {
  return gradient(code, "to right");
}
