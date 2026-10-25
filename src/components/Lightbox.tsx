"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxImage = { src: string; alt: string };

/**
 * A photo opened over the page: X / Esc / a tap outside closes it, arrows and a swipe change it,
 * thumbnails jump; with `auto` the photos keep turning on their own (every 4 s).
 */
export function Lightbox({
  images,
  start = 0,
  title,
  text,
  auto = false,
  onClose,
}: {
  images: LightboxImage[];
  start?: number;
  title?: string;
  text?: string;
  auto?: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("lightbox");
  const ref = useRef<HTMLDialogElement>(null);
  const [idx, setIdx] = useState(start);
  const [tick, setTick] = useState(0);
  const n = images.length;
  const go = useCallback((i: number) => {
    setIdx(((i % n) + n) % n);
    setTick((x) => x + 1);
  }, [n]);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    d.addEventListener("keydown", onKey);
    return () => d.removeEventListener("keydown", onKey);
  }, [go, idx]);

  // turns on its own; a manual step restarts the clock
  useEffect(() => {
    if (!auto || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % n), 4000);
    return () => window.clearTimeout(id);
  }, [auto, n, idx, tick]);

  const start0 = useRef<{ x: number; y: number } | null>(null);
  const arrow =
    "absolute top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_6px_18px_rgb(0_0_0/0.3)] transition-[background-color,color,transform] duration-300 hover:bg-red hover:text-white active:scale-90";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      aria-label={title ?? images[idx]?.alt}
      className="product-dialog m-auto max-h-none w-[min(1200px,calc(100vw-24px))] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 pb-3 text-white">
        <div className="min-w-0">
          {title && <p className="text-[18px] font-semibold sm:text-[20px]">{title}</p>}
          {text && <p className="mt-0.5 text-[14px] text-white/75">{text}</p>}
          <p className="mt-1 text-[13px] text-white/60 tabular">
            {idx + 1} / {n}
          </p>
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label={t("close")}
          autoFocus
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-[0_6px_18px_rgb(0_0_0/0.3)] transition-colors hover:bg-red hover:text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative h-[min(72svh,820px)] w-full touch-pan-y select-none"
        onPointerDown={(e) => (start0.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = start0.current;
          start0.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(e.clientY - s.y) < 60) go(idx + (dx < 0 ? 1 : -1));
        }}
      >
        {images.map((im, i) => (
          <Image
            key={im.src}
            src={im.src}
            alt={im.alt}
            fill
            sizes="(min-width: 1200px) 1200px, 100vw"
            loading={Math.abs(i - idx) <= 1 ? "eager" : "lazy"}
            draggable={false}
            className={`rounded-[12px] object-contain transition-opacity duration-500 ${i === idx ? "opacity-100" : "pointer-events-none opacity-0"}`}
          />
        ))}
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(idx - 1)} aria-label={t("prev")} className={`${arrow} left-2 sm:left-3`}>
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(idx + 1)} aria-label={t("next")} className={`${arrow} right-2 sm:right-3`}>
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1} / ${n}`}
              aria-current={i === idx}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-[8px] ring-2 transition-[opacity,box-shadow] sm:h-16 sm:w-24 ${i === idx ? "opacity-100 ring-red" : "opacity-55 ring-transparent hover:opacity-90"}`}
            >
              <Image src={im.src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
}
