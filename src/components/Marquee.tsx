"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A strip that runs on its own and can be pulled left or right — with the mouse
 * or a finger — then carries on from where it was let go. Hovering stops only this strip.
 * The children are rendered twice so the loop is seamless.
 */
export function Marquee({ children, speed = 40, reverse = false, className = "" }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const tr = track.current;
    if (!el || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let last = performance.now();
    let raf = 0;
    let hover = false;
    let visible = true;
    let drag: { id: number; x0: number; start: number; moved: boolean } | null = null;
    // speed in px/s; the strip runs right-to-left unless reversed
    const dir = reverse ? 1 : -1;

    const wrapX = () => {
      const half = tr.scrollWidth / 2;
      if (!half) return;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
    };
    const paint = () => {
      tr.style.transform = `translate3d(${x}px,0,0)`;
    };
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!drag && !hover && visible && !reduce) {
        x += (dir * speed * dt) / 1000;
        wrapX();
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, start: x, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "";
      }
      if (drag.moved) {
        x = drag.start + dx;
        wrapX();
        paint();
      }
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      delete el.dataset.dragging;
      last = performance.now();
    };
    const enter = (e: PointerEvent) => e.pointerType === "mouse" && (hover = true);
    const leave = () => (hover = false);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [speed, reverse]);

  return (
    <div ref={wrap} className={`cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
