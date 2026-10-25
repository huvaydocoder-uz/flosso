"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EVT_TOAST } from "@/lib/social";

/** one small message at the bottom of the screen ("text copied…") */
export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // a popover sits in the browser's top layer, so the toast shows above an open dialog too
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== "function") return;
    try {
      if (msg) {
        if (el.matches(":popover-open")) el.hidePopover();
        el.showPopover();
      } else if (el.matches(":popover-open")) el.hidePopover();
    } catch {}
  }, [msg]);

  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => {
      window.clearTimeout(timer);
      setMsg((m) => ({ text: (e as CustomEvent<string>).detail, n: (m?.n ?? 0) + 1 }));
      timer = window.setTimeout(() => setMsg(null), 5000);
    };
    window.addEventListener(EVT_TOAST, on);
    return () => {
      window.removeEventListener(EVT_TOAST, on);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-auto bottom-[calc(env(safe-area-inset-bottom)+84px)] z-[70] m-0 flex w-full max-w-none justify-center overflow-visible border-0 bg-transparent p-0 px-4 lg:bottom-8 [&:not(:popover-open)]:hidden"
    >
      {msg && (
        <p key={msg.n} className="toast-in flex max-w-[420px] items-center gap-2.5 rounded-[14px] bg-ink px-4 py-3 text-[14px] leading-snug font-semibold text-foam shadow-[0_14px_34px_rgb(20_10_10/0.35)]">
          <CheckCircle2 className="size-5 shrink-0 text-[#7ddc8f]" aria-hidden="true" />
          {msg.text}
        </p>
      )}
    </div>
  );
}
