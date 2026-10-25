"use client";

import { ArrowUp, CheckCircle2, Loader2, PhoneCall, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { maskUzLocal, normalizePhone } from "@/lib/lead-validation";

type State = "idle" | "sending" | "done" | "error" | "invalid";

/**
 * Bottom-left on every page (the chat takes the right): "back to top" (once the page has been scrolled) and
 * "call me back" — a small card asking for a number that lands in Telegram and the admin "Arizalar".
 * On phones both sit above the bottom action bar.
 */
export function FloatingActions() {
  const t = useTranslations("callback");
  const locale = useLocale();
  const uid = useId();
  const [up, setUp] = useState(false);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState("");
  const [state, setState] = useState<State>("idle");
  const box = useRef<HTMLDivElement>(null);
  const callBtn = useRef<HTMLButtonElement>(null);
  const [onRed, setOnRed] = useState(false);

  // what lies under the call button: a red section (data-tone="red") or a light one
  useEffect(() => {
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = callBtn.current?.getBoundingClientRect();
        if (!b) return;
        // the first page element under it (skipping the intro overlay, the header, the bottom bar and the other floating buttons)
        const under = document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2).find((el) => el.closest("main, footer"));
        setOnRed(Boolean(under?.closest('[data-tone="red"]')));
      });
    };
    check();
    // once the intro has gone (it covers the page for a few seconds on load)
    const late = window.setTimeout(check, 7000);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const on = () => setUp(window.scrollY > window.innerHeight * 0.8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 120);
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const phone = `+998 ${local}`;
    if (!normalizePhone(phone) || local.replace(/\D/g, "").length !== 9) {
      setState("invalid");
      input.current?.focus();
      return;
    }
    setState("sending");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "callback", phone, locale }),
      });
      setState(r.ok ? "done" : "error");
      if (r.ok) setLocal("");
    } catch {
      setState("error");
    }
  };

  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  // the buttons take the opposite of what is behind them: red over light sections, white over red ones
  const base =
    "inline-flex size-12 items-center justify-center rounded-full transition-[transform,background-color,color,box-shadow] duration-300 ease-[var(--ease-glide)] hover:-translate-y-1 active:scale-90 lg:size-[60px]";
  const fab = onRed
    ? `${base} bg-white text-red shadow-[0_10px_26px_rgb(40_5_5/0.35)] ring-1 ring-white hover:bg-red-deep hover:text-white`
    : `${base} bg-red text-white shadow-[0_10px_26px_rgb(198_40_40/0.4)] ring-1 ring-red hover:bg-white hover:text-red`;

  return (
    <div
      ref={box}
      className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] left-4 z-40 flex flex-col items-start gap-3 lg:bottom-6 lg:left-[calc(50%-var(--half-bay)+20px)]"
    >
      {/* the call-back card unfolds above the buttons */}
      <div
        id={`${uid}-card`}
        role="dialog"
        aria-label={t("title")}
        aria-hidden={!open}
        inert={!open}
        className={`w-[min(320px,calc(100vw-32px))] origin-bottom-left rounded-[18px] bg-surface p-5 text-ink shadow-[0_24px_60px_rgb(20_10_10/0.3)] ring-1 ring-line transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-glide)] ${
          open ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[17px] leading-snug font-semibold">{t("title")}</p>
          <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="-m-1.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-foam hover:text-ink">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {state === "done" ? (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#e8f5ec] px-3 py-3 text-[15px] font-medium text-[#1f6b36]">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            {t("done")}
          </p>
        ) : (
          <form onSubmit={send} noValidate className="mt-4">
            <label htmlFor={`${uid}-phone`} className="text-[13px] font-semibold text-ink-soft">
              {t("phone")}
            </label>
            <div className="relative mt-1.5">
              <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[16px] font-semibold tabular">
                +998
              </span>
              <input
                ref={input}
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="90 123 45 67"
                value={local}
                onChange={(e) => {
                  setLocal(maskUzLocal(e.target.value));
                  if (state === "invalid" || state === "error") setState("idle");
                }}
                aria-invalid={state === "invalid"}
                className={`block min-h-13 w-full rounded-[10px] border bg-foam pr-4 pl-[66px] text-[16px] tabular outline-none transition-[border-color,box-shadow] focus:border-red focus:bg-surface focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)] ${state === "invalid" ? "border-red" : "border-line"}`}
              />
            </div>
            {(state === "invalid" || state === "error") && (
              <p role="alert" className="mt-1.5 text-[13px] font-medium text-red">
                {state === "invalid" ? t("invalid") : t("error")}
              </p>
            )}
            <button
              type="submit"
              disabled={state === "sending"}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-red px-5 text-[16px] font-semibold text-white transition-colors hover:bg-red-deep disabled:opacity-80"
            >
              {state === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {state === "sending" ? t("sending") : t("send")}
            </button>
          </form>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-2.5 lg:gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (state === "done") setState("idle");
          }}
          aria-expanded={open}
          aria-controls={`${uid}-card`}
          aria-label={t("button")}
          title={t("button")}
          ref={callBtn}
          className={`group ${fab} relative`}
        >
          {!open && <span aria-hidden="true" className={`absolute inset-0 animate-ping rounded-full ${onRed ? "bg-white/40" : "bg-red/30"} [animation-duration:2.4s] motion-reduce:hidden`} />}
          {open ? <X className="relative size-5 lg:size-6" aria-hidden="true" /> : <PhoneCall className="phone-ring relative size-5 lg:size-6" aria-hidden="true" />}
        </button>
      </div>

      {/* "back to top" on the right, above the chat */}
      {up && (
        <button
          type="button"
          onClick={toTop}
          aria-label={t("toTop")}
          title={t("toTop")}
          className={`float-in ${fab} pointer-events-auto fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+148px)] lg:right-[calc(50%-var(--half-bay)+20px)] lg:bottom-[96px]`}
        >
          <ArrowUp className="size-5 lg:size-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
