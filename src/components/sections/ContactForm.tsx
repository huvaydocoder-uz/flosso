"use client";

import { CheckCircle2, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { EVT_ATTACH, type LeadAttachment } from "@/lib/events";
import { LEAD_TOPICS, maskUzLocal, validateLead, type LeadErrors } from "@/lib/lead-validation";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; reason: "rate" | "server" };

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const uid = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  // local part only; "+998" is a fixed prefix outside the input
  const [local, setLocal] = useState("");
  const phone = `+998 ${local}`;
  const [comment, setComment] = useState("");
  const [topic, setTopic] = useState("");
  const tt = useTranslations("contact.topics");
  const [attached, setAttached] = useState<LeadAttachment | null>(null);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const onAttach = (e: Event) => {
      const d = (e as CustomEvent<LeadAttachment>).detail;
      setAttached((prev) => ({
        products: [...new Set([...(prev?.products ?? []), ...(d.products ?? [])])],
        note: d.note ?? prev?.note,
        // a new calculation replaces the old one; single products add up
        items: d.note ? (d.items ?? []) : [...(prev?.items ?? []), ...(d.items ?? [])],
      }));
      setStatus({ kind: "idle" });
      window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 650);
    };
    window.addEventListener(EVT_ATTACH, onAttach);
    return () => window.removeEventListener(EVT_ATTACH, onAttach);
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    const v = validateLead({ name, phone });
    if (!v.ok) {
      setErrors(v.errors);
      (v.errors.name ? nameRef.current : document.getElementById(`${uid}-phone`))?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, comment, topic: topic || undefined, products: attached?.products, note: attached?.note, items: attached?.items, locale, website }),
      });
      if (res.ok) {
        setStatus({ kind: "done" });
        setName("");
        setLocal("");
        setComment("");
        setTopic("");
        setAttached(null);
      } else setStatus({ kind: "error", reason: res.status === 429 ? "rate" : "server" });
    } catch {
      setStatus({ kind: "error", reason: "server" });
    }
  };

  if (status.kind === "done") {
    return (
      <div role="status" className="flex min-h-[420px] flex-col items-start justify-center">
        <CheckCircle2 className="size-12 text-red" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-5 text-[24px] font-semibold text-ink">{t("successTitle")}</p>
        <p className="mt-2 max-w-[40ch] text-[16px] text-ink-soft">{t("successText")}</p>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-6 min-h-11 text-[15px] font-semibold text-red underline underline-offset-4 hover:text-red-deep">
          {t("again")}
        </button>
      </div>
    );
  }

  const field =
    "mt-2 block w-full min-h-13 rounded-[10px] border bg-foam px-4 text-[16px] text-ink placeholder:text-pencil transition-[border-color,box-shadow,background-color] outline-none focus:bg-surface focus:border-red focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";
  const sending = status.kind === "sending";

  return (
    <form id="lead-form" onSubmit={submit} noValidate className="space-y-5">
      {attached && ((attached.products?.length ?? 0) > 0 || attached.note) && (
        <div className="rounded-[10px] bg-red/[0.06] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-semibold text-red">{t("attached")}</p>
            <button type="button" onClick={() => setAttached(null)} className="-m-2 inline-flex size-9 items-center justify-center rounded-full text-ink-soft hover:text-ink" aria-label={t("remove")}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          {attached.note && <p className="mt-1 text-[14px] whitespace-pre-line text-ink">{attached.note}</p>}
          {!!attached.products?.length && <p className="mt-1 text-[13px] text-ink-soft tabular">{attached.products.join(" · ")}</p>}
        </div>
      )}

      <div>
        <label htmlFor={`${uid}-name`} className="text-[14px] font-semibold text-ink">
          {t("name")}
        </label>
        <input
          ref={nameRef}
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          className={`${field} ${errors.name ? "border-red" : "border-line"}`}
        />
        {errors.name && (
          <p id={`${uid}-name-err`} className="mt-1.5 text-[13px] font-medium text-red">
            {t("errors.name")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-phone`} className="text-[14px] font-semibold text-ink">
          {t("phone")}
        </label>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 mt-1 -translate-y-1/2 text-[16px] font-semibold text-ink tabular">
            +998
          </span>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="90 123 45 67"
            value={local}
            onChange={(e) => setLocal(maskUzLocal(e.target.value))}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
            className={`${field} pl-[66px] tabular ${errors.phone ? "border-red" : "border-line"}`}
          />
        </div>
        {errors.phone && (
          <p id={`${uid}-phone-err`} className="mt-1.5 text-[13px] font-medium text-red">
            {t("errors.phone")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-topic`} className="text-[14px] font-semibold text-ink">
          {t("topic")} <span className="font-normal text-pencil">({t("optional")})</span>
        </label>
        <select
          id={`${uid}-topic`}
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`${field} select-chevron appearance-none border-line pr-10 ${topic ? "" : "text-pencil"}`}
        >
          <option value="">{t("topicPick")}</option>
          {(Object.keys(LEAD_TOPICS) as (keyof typeof LEAD_TOPICS)[]).map((k) => (
            <option key={k} value={k} className="text-ink">
              {tt(k)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${uid}-comment`} className="text-[14px] font-semibold text-ink">
          {t("comment")} <span className="font-normal text-pencil">({t("optional")})</span>
        </label>
        <textarea
          id={`${uid}-comment`}
          name="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("commentHint")}
          className={`${field} min-h-24 resize-y border-line py-3`}
        />
      </div>

      {/* honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {status.kind === "error" && (
        <p role="alert" className="rounded-[10px] bg-red/[0.07] px-4 py-3 text-[14px] font-medium text-red-deep">
          {t(`errors.${status.reason}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[10px] bg-red px-6 text-[16px] font-semibold text-white shadow-relief-sm transition-colors hover:bg-red-deep disabled:cursor-wait disabled:opacity-80"
      >
        {sending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {sending ? t("sending") : t("submit")}
      </button>
      <p className="text-[13px] text-pencil">{t("privacy")}</p>
    </form>
  );
}
