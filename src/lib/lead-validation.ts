/** Shared by the form (client) and the API (server). */

export type LeadItem = { code: string; variant?: number; amount?: number };

export type LeadInput = {
  name: string;
  phone: string;
  comment?: string;
  products?: string[];
  note?: string;
  locale?: string;
  /** what was ordered: priced again on the server from live prices */
  items?: LeadItem[];
  /** "Murojaat mavzusi" picked in the form (a key of LEAD_TOPICS) */
  topic?: string;
  /** honeypot: real visitors never fill it */
  website?: string;
};

/** subjects offered in the contact form; the owner reads them in Uzbek */
export const LEAD_TOPICS = {
  karniz: "Karniz",
  nalichnik: "Nalichnik",
  podokonnik: "Podokonnik",
  kolonna: "Kolonna",
  termopanel: "Termopanel",
  solution: "Tayyor yechim",
  price: "Narx so‘rash",
  montaj: "Montaj bo‘yicha",
  wholesale: "Optom xarid",
  other: "Boshqa",
} as const;
export type LeadTopic = keyof typeof LEAD_TOPICS;
export const isLeadTopic = (v: unknown): v is LeadTopic => typeof v === "string" && Object.hasOwn(LEAD_TOPICS, v);

/** where a request came from: the contact form, the "call me back" button or the chat */
export type LeadKind = "lead" | "callback" | "chat";

/** keep digits; Uzbek numbers are stored as 998XXXXXXXXX */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 9) d = `998${d}`;
  if (d.length === 12 && d.startsWith("998")) return d;
  // foreign numbers: accept 10–15 digits as typed
  if (!raw.trim().startsWith("+998") && d.length >= 10 && d.length <= 15) return d;
  return null;
}

/** "998998993515" → "+998 99 899 35 15" */
export function formatPhone(digits: string): string {
  const m = digits.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}

/**
 * Mask for the 9 local digits after a fixed "+998" prefix: "99 899 35 15".
 * A pasted full number (+998…, 998…) drops its country code.
 */
export function maskUzLocal(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

export type LeadErrors = Partial<Record<"name" | "phone", true>>;

export function validateLead(input: LeadInput): { ok: true; phone: string } | { ok: false; errors: LeadErrors } {
  const errors: LeadErrors = {};
  const name = input.name?.trim() ?? "";
  if (name.length < 2 || name.length > 80) errors.name = true;
  const phone = normalizePhone(input.phone ?? "");
  if (!phone) errors.phone = true;
  return phone && !errors.name ? { ok: true, phone } : { ok: false, errors };
}
