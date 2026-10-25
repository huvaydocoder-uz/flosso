import { after, NextResponse } from "next/server";
import { unitBasePrice, unitPrice, type CategoryId, type Product } from "@data/products";
import { ceilTenth } from "@/lib/calc";
import { isLeadTopic, LEAD_TOPICS, normalizePhone, validateLead, type LeadInput } from "@/lib/lead-validation";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { createLead, getProducts, markLeadTelegram } from "@/lib/repo";
import { callbackMessage, chatMessage, leadMessage, sendTelegram, type LeadLine } from "@/lib/telegram";

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

// the owner reads orders in Uzbek, whatever language the visitor used
const CAT_UZ: Record<CategoryId, string> = {
  FKR: "Karniz",
  FNL: "Nalichnik",
  FPD: "Podokonnik",
  FTK: "Taroq-kolonna",
  FIK: "Kolonna igrushkasi",
  FIN: "Nalichnik igrushkasi",
  FTP: "Termopanel",
};
const POS_UZ = { T: "tepasi", P: "pasti" } as const;
const nameUz = (p: Product) =>
  p.names?.uz || `${CAT_UZ[p.category]}${p.position ? ` ${POS_UZ[p.position]}` : ""}, ${Number(p.model)}-model`;

/** prices come from the live catalog, never from the browser */
async function priceItems(raw: unknown): Promise<{ lines: LeadLine[]; total: number }> {
  if (!Array.isArray(raw) || !raw.length) return { lines: [], total: 0 };
  const products = await getProducts({ includeInactive: true });
  const byCode = new Map(products.map((p) => [p.code, p]));
  const lines: LeadLine[] = [];
  for (const it of raw.slice(0, 20)) {
    if (!it || typeof it !== "object") continue;
    const code = clip((it as { code?: unknown }).code, 32);
    const p = byCode.get(code);
    if (!p) continue;
    const v = Number((it as { variant?: unknown }).variant);
    const variant = Number.isInteger(v) && p.variants?.includes(v) ? v : undefined;
    const a = Number((it as { amount?: unknown }).amount);
    const amount = Number.isFinite(a) && a > 0 && a < 100_000 ? (p.unit === "metr" ? ceilTenth(a) : Math.ceil(a)) : undefined;
    const price = unitPrice(p, variant);
    lines.push({
      name: `${nameUz(p)}${variant ? `, ${variant} sm` : ""}`,
      code: `${p.code}${variant ? ` (${variant})` : ""}`,
      amount,
      unit: p.unit === "metr" ? "metr" : "dona",
      unitWord: p.unit === "metr" ? "metr" : "dona",
      price,
      basePrice: unitBasePrice(p, variant),
      discountPercent: p.discountPercent,
      sum: amount ? Math.round(amount * price) : undefined,
    });
  }
  const total = lines.every((l) => l.sum) ? lines.reduce((s, l) => s + (l.sum ?? 0), 0) : 0;
  return { lines, total };
}

type Body = LeadInput & { kind?: unknown; summary?: unknown };

/** save first (the admin "Arizalar" page), then tell the owner on Telegram; either one is a success */
async function store(row: Parameters<typeof createLead>[0], message: string) {
  let id: string | null = null;
  try {
    id = (await createLead(row)).id;
  } catch (e) {
    console.error("lead: database save failed", e);
  }
  const sent = await sendTelegram(message).catch(() => false);
  if (sent && id) after(() => markLeadTelegram(id!).catch(() => {}));
  if (!id && !sent) return NextResponse.json({ error: "server" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // honeypot: pretend success so bots learn nothing
  if (body.website) return NextResponse.json({ ok: true });

  if (!rateLimit(`lead:${clientKey(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  const locale = clip(body.locale, 5) || "uz";
  const empty = { comment: "", products: [] as string[], note: "", topic: "", locale };

  // "call me back": only a number
  if (body.kind === "callback") {
    const phone = normalizePhone(typeof body.phone === "string" ? body.phone : "");
    if (!phone) return NextResponse.json({ error: "invalid", fields: { phone: true } }, { status: 422 });
    return store({ ...empty, kind: "callback", name: "Qayta qo‘ng‘iroq", phone }, callbackMessage({ phone, locale }));
  }

  const v = validateLead(body);
  if (!v.ok) return NextResponse.json({ error: "invalid", fields: v.errors }, { status: 422 });

  // the chat assistant: name, number and the gist of the conversation
  if (body.kind === "chat") {
    const name = clip(body.name, 80);
    const summary = clip(body.summary, 2500);
    return store({ ...empty, kind: "chat", name, phone: v.phone, note: summary }, chatMessage({ name, phone: v.phone, summary, locale }));
  }

  const { lines, total } = await priceItems(body.items).catch(() => ({ lines: [] as LeadLine[], total: 0 }));
  const lead = {
    name: clip(body.name, 80),
    phone: v.phone,
    comment: clip(body.comment, 1000),
    products: Array.isArray(body.products)
      ? body.products.filter((p): p is string => typeof p === "string").map((p) => p.slice(0, 32)).slice(0, 20)
      : [],
    note: clip(body.note, 1500),
    locale,
    topic: isLeadTopic(body.topic) ? LEAD_TOPICS[body.topic] : "",
  };

  // the admin copy keeps the priced lines too
  const summary = lines.map((l) => `${l.name} (${l.code})${l.amount ? `: ${l.amount} ${l.unit}` : ""} — ${l.price} so‘m/${l.unitWord}${l.sum ? ` = ${l.sum} so‘m` : ""}`);
  if (total) summary.push(`Jami: ${total} so‘m`);
  const stored = { ...lead, kind: "lead", note: [lead.note, ...summary].filter(Boolean).join("\n").slice(0, 4000) };

  return store(stored, leadMessage({ ...lead, lines, total }));
}
