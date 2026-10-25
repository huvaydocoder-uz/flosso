"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { frameClass } from "../FlossoFrame";

type QA = { q: string; a: string };

/** one answer open at a time; it unfolds by height (~350 ms) and its card gets the running frame */
export function FaqList({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="grid gap-3">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div
            key={i}
            className={`rounded-[16px] bg-surface/90 shadow-relief-sm transition-[background-color] duration-300 ${on ? "faq-open bg-surface" : ""} ${frameClass(on ? "spin" : "hover", { glow: false })}`}
          >
            <h3>
              <button
                type="button"
                id={`${uid}-q${i}`}
                aria-expanded={on}
                aria-controls={`${uid}-a${i}`}
                onClick={() => setOpen(on ? null : i)}
                className={`flex min-h-16 w-full items-center justify-between gap-6 px-5 py-4 text-left text-[17px] font-semibold transition-colors duration-300 hover:text-red sm:px-6 sm:text-[19px] ${on ? "text-red" : "text-ink"}`}
              >
                {it.q}
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full shadow-relief-sm transition-[transform,background-color,color] duration-350 ease-[var(--ease-glide)] ${on ? "rotate-45 bg-red text-white" : "bg-foam text-red"}`}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="faq-body" inert={!on}>
              <div>
                <p className="max-w-[62ch] px-5 pb-6 text-[16px] leading-relaxed text-ink-soft sm:px-6 sm:pr-16">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
