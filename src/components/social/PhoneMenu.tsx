"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { CONTACT } from "@/lib/contact";

const NUMBERS = [
  { href: CONTACT.phoneHref, label: CONTACT.phoneDisplay },
  { href: CONTACT.phone2Href, label: CONTACT.phone2Display },
] as const;

/**
 * "Call" button that unfolds a small panel with both numbers right under itself,
 * the way the menu opens — nothing covers the screen. Outside tap or Esc folds it.
 */
export function PhoneMenu({
  className = "",
  panelClass = "",
  align = "right",
  showIcon = true,
  labelClass = "",
}: {
  className?: string;
  panelClass?: string;
  align?: "left" | "right" | "stretch";
  showIcon?: boolean;
  /** e.g. "hidden xl:inline" to keep only the icon on a narrow bar */
  labelClass?: string;
}) {
  const t = useTranslations("call");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const place = align === "stretch" ? "inset-x-0 origin-top" : align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={id} aria-label={t("button")} className={`group ${className}`}>
        {showIcon && (
          <span className="phone-ring inline-flex">
            <Phone className="size-4" aria-hidden="true" />
          </span>
        )}
        <span className={labelClass}>{t("button")}</span>
      </button>

      <div
        id={id}
        aria-hidden={!open}
        className={`absolute top-[calc(100%+10px)] z-50 w-[min(300px,calc(100vw-32px))] ${place} transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-glide)] ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible -translate-y-2 scale-[0.97] opacity-0"
        } ${align === "stretch" ? "w-auto" : ""} ${panelClass}`}
      >
        <ul className="grid gap-1 rounded-[18px] bg-surface p-2 text-ink shadow-[0_24px_60px_rgb(20_10_10/0.28)] ring-1 ring-line">
          {NUMBERS.map((n, i) => (
            <li key={n.href}>
              <a
                href={n.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={`group/n flex min-h-14 items-center gap-3 rounded-[14px] px-3 text-[clamp(15px,4.4vw,17px)] font-bold whitespace-nowrap tabular transition-[background-color,opacity,transform] duration-300 hover:bg-foam ${
                  open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
              >
                <span className="phone-ring flex size-10 shrink-0 items-center justify-center rounded-full bg-red text-white shadow-relief-sm">
                  <Phone className="size-[18px]" aria-hidden="true" />
                </span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
