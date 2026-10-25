"use client";

import type { CSSProperties } from "react";
import { ArrowRight, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { finalPrice } from "@data/products";
import { openProduct } from "@/lib/events";
import { formatNumber } from "@/lib/format";
import { useTg } from "@/lib/use-tg";
import { useProductNaming, useProducts } from "../ProductsProvider";

export type TagSpot = {
  code: string;
  /** pin position in % of the facade image */
  x: number;
  y: number;
  /** which way the tag hangs from its pin */
  side?: "right" | "left";
  /** hidden on narrow screens */
  wideOnly?: boolean;
  /** pin height below a laptop width, where a tag hanging off the bottom would sit on the plinth */
  narrowY?: number;
  /** sway phase offset in seconds */
  delay?: number;
};

type Props = TagSpot & {
  active: boolean;
  open: boolean;
  onSelect: (code: string) => void;
};

/** A paper price tag on a string, pinned to a piece of the facade. */
export function FacadeTag({ code, x, y, side = "right", wideOnly, narrowY, delay = 0, active, open, onSelect }: Props) {
  const t = useTranslations();
  const p = useProducts().get(code);
  if (!p) return null;
  // only the lowest pieces open upward; everything else hangs below its tag
  const up = y > 70;
  const kind = p.category === "FIK" ? t(`categoryPos.${p.position === "T" ? "T" : "P"}`) : t(`category.${p.category}`);
  const left = side === "left";

  return (
    <div
      className={`absolute top-[var(--ty-n)] lg:top-[var(--ty)] ${open ? "z-30" : "z-10"} ${wideOnly ? "hidden sm:block lg:hidden xl:block" : ""}`}
      style={{ left: `${x}%`, "--ty": `${y}%`, "--ty-n": `${narrowY ?? y}%` } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute -top-[4px] -left-[4px] size-2 rounded-full bg-surface shadow-[1px_2px_3px_rgb(40_25_20/0.45)] ring-1 ring-black/10"
      />

      <div className={`tag-sway absolute top-0 ${left ? "right-0 origin-top-right" : "left-0 origin-top-left"}`} style={{ animationDelay: `${-delay}s` }}>
        <svg aria-hidden="true" width="28" height="24" className={`absolute top-0 overflow-visible ${left ? "right-0 -scale-x-100" : "left-0"}`}>
          <path d="M0 0 C 8 9, 16 15, 24 20" fill="none" stroke="var(--pencil)" strokeWidth="1" />
        </svg>

        <button
          type="button"
          onClick={() => onSelect(code)}
          aria-expanded={open}
          aria-label={`${t(`category.${p.category}`)} ${code}, ${p.heightCm}×${p.widthCm} ${t("units.cm")}`}
          className={`absolute top-[14px] block transition-transform duration-300 ease-[var(--ease-settle)] ${
            left ? "right-[18px] origin-top-right rotate-[6deg] hover:rotate-[2deg]" : "left-[18px] origin-top-left -rotate-[6deg] hover:-rotate-[2deg]"
          }`}
        >
          <span
            className={`relative flex min-h-11 items-center py-2 shadow-[2px_5px_10px_rgb(40_25_20/0.28)] transition-colors duration-300 ${
              left
                ? "rounded-l-[6px] pr-6 pl-3 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,0_100%)]"
                : "rounded-r-[6px] pr-3 pl-6 [clip-path:polygon(12px_0,100%_0,100%_100%,12px_100%,0_50%)]"
            } ${active ? "bg-red text-white" : "bg-surface text-ink"}`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1/2 size-[7px] -translate-y-1/2 rounded-full ${left ? "right-[9px]" : "left-[9px]"} ${active ? "bg-red-deep" : "bg-plaster-deep"}`}
            />
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold whitespace-nowrap">{kind}</span>
              <span className={`text-[11px] whitespace-nowrap tabular ${active ? "text-white/85" : "text-ink-soft"}`}>
                {t("product.width")} {p.widthCm} {t("units.cm")}
              </span>
            </span>
          </span>
        </button>

        {/* desktop: popover beside the tag; lower tags open upward so the next section never covers it */}
        {open && (
          <TagPopover up={up} left={left} onClose={() => onSelect(code)}>
            {(close) => <TagCard code={code} onClose={close} />}
          </TagPopover>
        )}
      </div>
    </div>
  );
}

/** name, size, price and the two next steps for one tagged piece */
export function TagCard({ code, onClose }: { code: string; onClose?: () => void }) {
  const t = useTranslations();
  const p = useProducts().get(code);
  const { name } = useProductNaming();
  const tg = useTg();
  if (!p) return null;
  const price = finalPrice(p);
  const unit = p.unit === "metr" ? t("units.perMetr") : t("units.perDona");

  return (
    <div data-tag-layer className="relative rounded-[14px] bg-surface p-4 text-left shadow-relief-lg ring-1 ring-line">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t("nav.close")}
          title={t("nav.close")}
          className="absolute top-1.5 right-1.5 inline-flex size-11 items-center justify-center rounded-full bg-foam text-ink ring-1 ring-line transition-[background-color,transform] hover:bg-plaster active:scale-90"
        >
          <X className="size-5" aria-hidden="true" strokeWidth={2.2} />
        </button>
      )}
      <p className="pr-11 text-[15px] leading-snug font-semibold text-ink">{name(p)}</p>
      <p className="mt-1 text-[12px] text-ink-soft tabular">
        {t("product.width")} {p.widthCm} · {t("product.height").toLowerCase()} {p.heightCm} {t("units.cm")} · {t("naming.code")}: {code}
      </p>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 tabular">
        <span className={`text-xl font-bold ${p.discountPercent > 0 ? "text-red" : "text-ink"}`}>{formatNumber(price)}</span>
        <span className="text-[12px] text-ink-soft">
          {t("units.sum")} / {unit}
        </span>
        {p.discountPercent > 0 && <span className="text-[12px] text-pencil line-through">{formatNumber(p.price)}</span>}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <a
          {...tg.product(p, name(p), { price })}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-red px-3 text-[14px] font-semibold whitespace-nowrap text-white hover:bg-red-deep"
        >
          <Send className="size-4" aria-hidden="true" />
          {t("hero.ask")}
        </a>
        <button
          type="button"
          onClick={() => {
            onClose?.();
            openProduct(code);
          }}
          aria-label={t("nav.catalog")}
          title={t("nav.catalog")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] text-red ring-1 ring-line hover:bg-red/[0.06]"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** the card hangs from its tag; on narrow screens it slides sideways to stay fully on screen */
function TagPopover({ up, left, onClose, children }: { up: boolean; left: boolean; onClose: () => void; children: (close: () => void) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const pad = 12;
    setDx(r.left < pad ? pad - r.left : r.right > vw - pad ? vw - pad - r.right : 0);
  }, []);
  // fold away first, then unmount
  const close = () => {
    setLeaving(true);
    window.setTimeout(onClose, 200);
  };
  return (
    <div
      ref={ref}
      className={`absolute w-[min(272px,calc(100vw-24px))] ${leaving ? "tag-pop-out" : "tag-pop"} ${up ? "bottom-[40px]" : "top-[68px]"} ${left ? "right-[12px]" : "left-[12px]"}`}
      style={{ translate: `${dx}px 0` }}
    >
      {children(close)}
    </div>
  );
}
