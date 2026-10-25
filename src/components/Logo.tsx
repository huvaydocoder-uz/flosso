import logo from "@data/generated/logo.json";

type Props = {
  /** "light" = red mark + ink letters (on white); "white" = all white (on red) */
  tone?: "light" | "white";
  className?: string;
  markOnly?: boolean;
  title?: string;
};

export const LOGO = logo;

export function Logo({ tone = "light", className, markOnly, title = "FLOSSO" }: Props) {
  const outer = tone === "white" ? "#fff" : "var(--red)";
  const inner = tone === "white" ? "#fff" : "var(--red-deep)";
  const word = tone === "white" ? "#fff" : "var(--ink)";
  const w = markOnly ? 40.5 : logo.w;
  return (
    <svg viewBox={`0 0 ${w} ${logo.h}`} className={className} role="img" aria-label={title}>
      {logo.outer.map((d, i) => (
        <path key={`o${i}`} d={d} fill={outer} />
      ))}
      {logo.inner.map((d, i) => (
        <path key={`i${i}`} d={d} fill={inner} />
      ))}
      {!markOnly && logo.word.map((d, i) => <path key={`w${i}`} d={d} fill={word} />)}
    </svg>
  );
}
