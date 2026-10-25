import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  lead?: ReactNode;
  tone?: "ink" | "white";
  align?: "start" | "center";
  className?: string;
};

/** Art-deco display heading with the pencil dimension rule under it. */
export function SectionHeading({ id, title, lead, tone = "ink", align = "start", className = "" }: Props) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[760px] ${className}`}>
      <h2 id={id} className={`display text-[clamp(32px,4.4vw,60px)] ${tone === "white" ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      <svg aria-hidden="true" viewBox="0 0 96 10" className={`mt-5 h-2.5 w-24 ${center ? "mx-auto" : ""} ${tone === "white" ? "text-white/70" : "text-red"}`}>
        <path d="M0.5 0v10M95.5 0v10M0.5 5h95" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      {lead && (
        <p className={`mt-5 max-w-[60ch] text-[17px] leading-relaxed ${center ? "mx-auto" : ""} ${tone === "white" ? "text-white/85" : "text-ink-soft"}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
