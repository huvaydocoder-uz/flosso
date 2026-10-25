"use client";

import { useId, type ReactNode } from "react";

/** chip group for small exclusive choices (reserve %, variants, modes) */
export function Chips<T extends string | number>({
  label,
  value,
  options,
  onChange,
  render = (v) => String(v),
  size = "md",
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render?: (v: T) => ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={`inline-flex items-center justify-center rounded-full border px-4 font-semibold transition-colors tabular ${size === "lg" ? "min-h-12 text-[15px]" : "min-h-11 text-[14px]"} ${
              on ? "border-red bg-red text-white" : "border-line bg-surface text-ink hover:border-ink/40"
            }`}
          >
            {render(o)}
          </button>
        );
      })}
    </div>
  );
}

/** parse "2,5" or "2.5"; empty → NaN */
export const parseNum = (s: string) => Number(s.replace(",", ".").trim() || "NaN");

export function NumberField({
  label,
  value,
  onChange,
  decimal,
  suffix,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
  suffix?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[14px] font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          inputMode={decimal ? "decimal" : "numeric"}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(decimal ? /[^\d.,]/g : /\D/g, "").slice(0, 7))}
          className="block min-h-13 w-full rounded-[10px] border border-line bg-foam px-4 text-[17px] font-semibold text-ink tabular transition-[border-color,box-shadow,background-color] outline-none focus:border-red focus:bg-surface focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]"
        />
        {suffix && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[14px] text-pencil">{suffix}</span>}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[14px] font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block min-h-13 w-full appearance-none rounded-[10px] border border-line bg-foam select-chevron pr-10 pl-4 text-[16px] text-ink tabular transition-[border-color,box-shadow] outline-none focus:border-red focus:bg-surface focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]"
      >
        {children}
      </select>
    </div>
  );
}
