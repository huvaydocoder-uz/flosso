import { parseCode, PROFILES } from "@data/products";

type Props = {
  code: string;
  cm: string;
  /** emphasise one dimension (code explainer) */
  highlight?: "height" | "width" | null;
  /** compact: thinner chrome for catalog cards */
  compact?: boolean;
  className?: string;
  title?: string;
};

/**
 * The catalog's profile cross-section with pencil dimension lines.
 * Products without an extracted section get a neutral rectangle of the right proportion.
 */
export function ProfileDrawing({
  code,
  cm,
  highlight = null,
  compact,
  className = "",
  title,
}: Props) {
  const { heightCm, widthCm } = parseCode(code);
  const p = PROFILES[code];
  // fallback keeps the real aspect: width × height in catalog units (~3.6 pt per cm)
  const w = p?.w ?? widthCm * 3.6;
  const h = p?.h ?? heightCm * 3.6;
  const pad = compact ? 3 : 5;
  const left = compact ? 9 : 14;
  const bottom = compact ? 9 : 14;
  const fs = compact ? 4.6 : 3.8;
  const hi = (k: "height" | "width") =>
    highlight === k
      ? "var(--red)"
      : highlight
        ? "var(--plaster-deep)"
        : "var(--red)";

  return (
    <svg
      viewBox={`0 0 ${w + left + pad * 2} ${h + bottom + pad * 2}`}
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label={title ?? `${code}: ${heightCm} × ${widthCm} ${cm}`}
    >
      <g transform={`translate(${left + pad} ${pad})`}>
        {p ? (
          <path
            d={p.d}
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth={compact ? 0.6 : 0.45}
            strokeLinejoin="round"
          />
        ) : (
          <rect
            width={w}
            height={h}
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="0.45"
            strokeDasharray="1.5 1"
          />
        )}
        <g fill="none" strokeWidth={highlight ? 0.55 : 0.35}>
          <path
            stroke={hi("width")}
            d={`M0 ${h + 5}H${w}M0 ${h + 2.5}v5M${w} ${h + 2.5}v5`}
          />
          <path stroke={hi("height")} d={`M-5 0V${h}M-7.5 0h5M-7.5 ${h}h5`} />
        </g>
        {!compact && (
          <>
            <text
              x={w / 2}
              y={h + 5 + fs + 1.5}
              textAnchor="middle"
              fontSize={fs}
              fill={hi("width")}
              fontFamily="var(--font-sans-stack)"
              fontWeight={highlight === "width" ? 700 : 500}
            >
              {widthCm} {cm}
            </text>
            <text
              x={-7.5 - fs * 0.5}
              y={h / 2}
              textAnchor="middle"
              fontSize={fs}
              fill={hi("height")}
              fontFamily="var(--font-sans-stack)"
              fontWeight={highlight === "height" ? 700 : 500}
              transform={`rotate(-90 ${-7.5 - fs * 0.5} ${h / 2})`}
            >
              {heightCm} {cm}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
