/** The FLOSSO mark repeated as an art-deco lattice, pressed into a surface. */
export function Lattice({ tone = "onLight", size = 88, className = "" }: { tone?: "onRed" | "onRedStrong" | "onLight" | "onLightStrong" | "onInk"; size?: number; className?: string }) {
  const file = tone === "onRed" ? "lattice-on-red" : tone === "onRedStrong" ? "lattice-on-red-strong" : tone === "onInk" ? "lattice-on-ink" : tone === "onLightStrong" ? "lattice-on-light-strong" : "lattice-on-light";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: `url(/patterns/${file}.svg)`, backgroundSize: `${size}px ${size}px` }}
    />
  );
}
