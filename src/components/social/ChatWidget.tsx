"use client";

import { Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { maskUzLocal, validateLead } from "@/lib/lead-validation";
import { Logo } from "../Logo";

type Msg = { role: "user" | "assistant"; text: string };
type Quick = "price" | "delivery" | "montaj" | "other";
const QUICK: Quick[] = ["price", "delivery", "montaj", "other"];

/**
 * "Online chat": a small chat in the bottom-right corner.
 * With an API key on the server (ai) the questions go to Claude; without one it runs on ready answers.
 * Either way it ends by asking for a name and number, which land in the admin "Arizalar" (Chat) and Telegram.
 */
export function ChatWidget({ ai }: { ai: boolean }) {
  const t = useTranslations("chat");
  const locale = useLocale();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [local, setLocal] = useState("");
  const [lead, setLead] = useState<"idle" | "sending" | "done" | "error" | "invalid">("idle");
  const list = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const asked = msgs.some((m) => m.role === "user");
  // scripted mode only takes typed text after "Something else"
  const canType = ai || msgs.some((m) => m.role === "user");

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, lead, asked]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const say = (role: Msg["role"], s: string) => setMsgs((m) => [...m, { role, text: s }]);

  const ask = async (question: string, quick?: Quick) => {
    const q = question.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: q }];
    setMsgs(next);
    setText("");
    // ready answers (always for "Something else", which only opens the conversation), with a short "typing" pause
    if (!ai || quick === "other") {
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        say("assistant", quick ? t(`answers.${quick}`) : t("askContact"));
      }, 650);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, messages: next.map((m) => ({ role: m.role, content: m.text })) }),
      });
      const data = (await r.json().catch(() => ({}))) as { reply?: string };
      say("assistant", r.ok && data.reply ? data.reply : quick ? t(`answers.${quick}`) : t("offline"));
    } catch {
      say("assistant", quick ? t(`answers.${quick}`) : t("offline"));
    } finally {
      setBusy(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const submitLead = async (e: FormEvent) => {
    e.preventDefault();
    const phone = `+998 ${local}`;
    if (!validateLead({ name, phone }).ok) {
      setLead("invalid");
      return;
    }
    setLead("sending");
    // the gist for the owner: the visitor's questions and the last answers
    const summary = msgs
      .slice(-12)
      .map((m) => `${m.role === "user" ? "Mijoz" : "Yordamchi"}: ${m.text}`)
      .join("\n")
      .slice(0, 2400);
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "chat", name, phone, summary, locale }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setLead("done");
      say("assistant", t("done", { name: name.trim() }));
    } catch {
      setLead("error");
    }
  };

  const restart = () => {
    setMsgs([]);
    setLead("idle");
    setText("");
  };

  const field =
    "block min-h-11 w-full rounded-[10px] border bg-foam px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-red focus:bg-surface focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";

  return (
    <div className="pointer-events-none fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40 flex flex-col items-end gap-3 lg:right-[calc(50%-var(--half-bay)+20px)] lg:bottom-6">
      <div
        ref={panel}
        id={`${uid}-panel`}
        role="dialog"
        aria-label={t("title")}
        aria-hidden={!open}
        inert={!open}
        className={`flex h-[min(560px,calc(100svh-200px))] w-[min(380px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-[20px] bg-surface text-ink shadow-[0_30px_70px_rgb(20_10_10/0.32)] ring-1 ring-line transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-glide)] lg:h-[min(580px,calc(100svh-140px))] ${
          open ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-3 scale-95 opacity-0"
        }`}
      >
        {/* header */}
        <div className="flex items-center gap-3 bg-red px-4 py-3 text-white">
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <Logo markOnly className="h-5 w-auto" title="" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold">{t("title")}</p>
            <p className="flex items-center gap-1.5 text-[12px] text-white/85">
              <span className="live-dot size-2 rounded-full bg-[#4ade80]" />
              {t("status")}
            </p>
          </div>
          {asked && (
            <button type="button" onClick={restart} aria-label={t("restart")} title={t("restart")} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15">
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* conversation */}
        <div ref={list} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-foam px-3 py-4">
          <Bubble role="assistant" text={t("greet")} />
          {!asked && (
            <div className="flex flex-wrap gap-2 pl-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(t(`quick.${q}`), q)}
                  className="min-h-10 rounded-full border border-red/30 bg-surface px-3.5 text-[14px] font-semibold text-red transition-colors hover:bg-red hover:text-white"
                >
                  {t(`quick.${q}`)}
                </button>
              ))}
            </div>
          )}
          {msgs.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 pl-1 text-[13px] text-ink-soft">
              <span className="typing-dots flex gap-1">
                <span className="size-1.5 rounded-full bg-ink-soft" />
                <span className="size-1.5 rounded-full bg-ink-soft" />
                <span className="size-1.5 rounded-full bg-ink-soft" />
              </span>
              {t("typing")}
            </div>
          )}

          {/* name + number, once a question has been answered */}
          {asked && !busy && lead !== "done" && msgs[msgs.length - 1]?.role === "assistant" && (
            <form onSubmit={submitLead} noValidate className="space-y-2 rounded-[14px] bg-surface p-3 shadow-relief-sm ring-1 ring-line">
              <p className="text-[13px] font-semibold text-ink">{t("askContact")}</p>
              <label className="sr-only" htmlFor={`${uid}-name`}>
                {t("name")}
              </label>
              <input id={`${uid}-name`} autoComplete="name" placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} className={`${field} border-line`} />
              <label className="sr-only" htmlFor={`${uid}-phone`}>
                {t("phone")}
              </label>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] font-semibold tabular">
                  +998
                </span>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="90 123 45 67"
                  value={local}
                  onChange={(e) => setLocal(maskUzLocal(e.target.value))}
                  className={`${field} pl-[58px] tabular ${lead === "invalid" ? "border-red" : "border-line"}`}
                />
              </div>
              {(lead === "invalid" || lead === "error") && <p className="text-[12px] font-medium text-red">{lead === "invalid" ? t("askContact") : t("error")}</p>}
              <button
                type="submit"
                disabled={lead === "sending"}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-red text-[15px] font-semibold text-white hover:bg-red-deep disabled:opacity-80"
              >
                {lead === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("submit")}
              </button>
            </form>
          )}
        </div>

        {/* typing line */}
        {canType && lead !== "done" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(text);
            }}
            className="flex items-center gap-2 border-t border-line bg-surface p-2.5"
          >
            <label className="sr-only" htmlFor={`${uid}-text`}>
              {t("placeholder")}
            </label>
            <input
              ref={inputRef}
              id={`${uid}-text`}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 600))}
              placeholder={t("placeholder")}
              autoComplete="off"
              className="min-h-11 flex-1 rounded-full bg-foam px-4 text-[15px] text-ink outline-none focus:shadow-[0_0_0_2px_rgb(198_40_40/0.3)]"
            />
            <button
              type="submit"
              disabled={!text.trim() || busy}
              aria-label={t("send")}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-red text-white transition-[background-color,opacity] hover:bg-red-deep disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>

      {/* the bubble: a green "live" dot on the left, then the label */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        aria-label={t("bubble")}
        className="pointer-events-auto group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-surface py-1.5 pr-1.5 pl-4 text-[15px] font-semibold text-ink shadow-[0_10px_26px_rgb(40_25_20/0.26)] ring-1 ring-red/25 transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-glide)] hover:-translate-y-1 hover:bg-red hover:text-white hover:shadow-[0_16px_34px_rgb(198_40_40/0.4)] lg:min-h-[60px] lg:text-[16px]"
      >
        <span className="live-dot size-2.5 shrink-0 rounded-full bg-[#22c55e] ring-2 ring-[#22c55e]/25" />
        <span>{t("bubble")}</span>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-red text-white transition-[transform,background-color,color] duration-500 ease-[var(--ease-settle)] group-hover:-rotate-[10deg] group-hover:bg-white group-hover:text-red lg:size-11">
          {open ? <X className="size-4" aria-hidden="true" /> : <MessageCircle className="size-[18px] lg:size-5" aria-hidden="true" />}
        </span>
      </button>
    </div>
  );
}

function Bubble({ role, text }: Msg) {
  const me = role === "user";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] rounded-[16px] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-line shadow-[0_1px_2px_rgb(40_25_20/0.08)] ${
          me ? "rounded-br-[6px] bg-red text-white" : "rounded-bl-[6px] bg-surface text-ink"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
