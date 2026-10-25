"use client";

import { MessageCircle, Phone, PhoneIncoming, Send, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { formatPhone } from "@/lib/lead-validation";
import { deleteLeadAction, leadStatusAction } from "../../actions";

type Status = "new" | "contacted" | "closed";
type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  comment: string;
  products: string[];
  note: string;
  locale: string;
  status: string;
  telegramSent: boolean;
  kind: string;
  topic: string;
};

type Kind = "lead" | "callback" | "chat";
const KINDS: { id: Kind | "all"; label: string }[] = [
  { id: "all", label: "Hammasi" },
  { id: "lead", label: "Arizalar" },
  { id: "callback", label: "Qayta qo‘ng‘iroq" },
  { id: "chat", label: "Chat" },
];

const STATUS: { id: Status; label: string; cls: string }[] = [
  { id: "new", label: "Yangi", cls: "bg-red text-white" },
  { id: "contacted", label: "Bog‘lanildi", cls: "bg-[#f3b632] text-ink" },
  { id: "closed", label: "Yopildi", cls: "bg-[#2f8a4b] text-white" },
];

export function LeadList({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [kind, setKind] = useState<Kind | "all">("all");
  const ofKind = leads.filter((l) => kind === "all" || (l.kind || "lead") === kind);
  const list = ofKind.filter((l) => filter === "all" || l.status === filter);

  return (
    <div className="mt-6">
      {/* where it came from: the form, the call-back button, or the chat */}
      <div role="tablist" aria-label="Turi" className="mb-3 flex flex-wrap gap-1 rounded-[12px] bg-white p-1 shadow-[inset_0_0_0_1px_var(--line)] sm:inline-flex">
        {KINDS.map((k) => {
          const n = k.id === "all" ? leads.length : leads.filter((l) => (l.kind || "lead") === k.id).length;
          const fresh = (k.id === "all" ? leads : leads.filter((l) => (l.kind || "lead") === k.id)).filter((l) => l.status === "new").length;
          return (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={kind === k.id}
              onClick={() => setKind(k.id)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-[9px] px-4 text-[14px] font-semibold ${kind === k.id ? "bg-red text-white" : "text-ink hover:bg-foam"}`}
            >
              {k.label} <span className="opacity-70">{n}</span>
              {fresh > 0 && <span className={`rounded-full px-1.5 text-[11px] ${kind === k.id ? "bg-white text-red" : "bg-red text-white"}`}>+{fresh}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {([{ id: "all", label: "Hammasi" }, ...STATUS] as { id: Status | "all"; label: string }[]).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`min-h-10 rounded-full px-4 text-[13px] font-semibold ${filter === s.id ? "bg-ink text-white" : "bg-white text-ink shadow-[inset_0_0_0_1px_var(--line)]"}`}
          >
            {s.label} <span className="opacity-70">{s.id === "all" ? ofKind.length : ofKind.filter((l) => l.status === s.id).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 rounded-[14px] bg-white p-10 text-center text-[15px] text-ink-soft shadow-[inset_0_0_0_1px_var(--line)]">Hozircha ariza yo‘q.</p>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {list.map((l) => (
            <LeadCard key={l.id} lead={l} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({ lead: l }: { lead: Lead }) {
  const [status, setStatus] = useState(l.status as Status);
  const [pending, start] = useTransition();
  const when = new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" });

  return (
    <li className={`flex flex-col rounded-[14px] bg-white p-4 shadow-[inset_0_0_0_1px_var(--line)] sm:p-5 ${pending ? "opacity-60" : ""} ${status === "new" ? "ring-2 ring-red/30" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex flex-wrap items-center gap-1.5">
            {l.kind === "callback" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1d6] px-2 py-0.5 text-[11px] font-bold text-[#8a5a00]">
                <PhoneIncoming className="size-3" aria-hidden="true" />
                Qayta qo‘ng‘iroq
              </span>
            )}
            {l.kind === "chat" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f2ff] px-2 py-0.5 text-[11px] font-bold text-[#1f5fa8]">
                <MessageCircle className="size-3" aria-hidden="true" />
                Chat
              </span>
            )}
            {l.topic && <span className="rounded-full bg-red/10 px-2 py-0.5 text-[11px] font-bold text-red">🏷 {l.topic}</span>}
          </p>
          <p className="text-[17px] font-bold text-ink">{l.name}</p>
          <a href={`tel:+${l.phone}`} className="mt-0.5 inline-flex min-h-10 items-center gap-2 text-[17px] font-semibold text-red tabular hover:text-red-deep">
            <Phone className="size-4" aria-hidden="true" />
            {formatPhone(l.phone)}
          </a>
        </div>
        <div className="text-right text-[12px] text-ink-soft">
          <p className="tabular">{when}</p>
          <p className="uppercase">{l.locale}</p>
          {l.telegramSent && (
            <p className="mt-1 inline-flex items-center gap-1 text-[#2a8bc8]">
              <Send className="size-3" aria-hidden="true" />
              Telegram
            </p>
          )}
        </div>
      </div>

      {l.note && <p className="mt-3 rounded-[10px] bg-foam p-3 text-[14px] whitespace-pre-line text-ink">{l.note}</p>}
      {l.products.length > 0 && <p className="mt-2 text-[13px] text-ink-soft tabular">📦 {l.products.join(", ")}</p>}
      {l.comment && <p className="mt-2 text-[14px] text-ink">💬 {l.comment}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {STATUS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={status === s.id}
            onClick={() => {
              setStatus(s.id);
              start(() => leadStatusAction(l.id, s.id));
            }}
            className={`min-h-9 rounded-full px-3 text-[12px] font-semibold transition-colors ${status === s.id ? s.cls : "bg-foam text-ink-soft hover:text-ink"}`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => window.confirm("Ariza o‘chirilsinmi?") && start(() => deleteLeadAction(l.id))}
          aria-label="Arizani o‘chirish"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-red/10 hover:text-red"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
