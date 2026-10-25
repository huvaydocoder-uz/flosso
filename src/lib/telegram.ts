import "server-only";
import { formatPhone } from "./lead-validation";
import { getSetting } from "./repo";
import { SITE_HOST } from "./site";

/**
 * Requests go straight to the owner's Telegram through a bot.
 * TELEGRAM_BOT_TOKEN — from @BotFather; TELEGRAM_CHAT_ID — one or more ids, comma-separated.
 * Both can also be set in the admin panel (Telegram page); env values win when present.
 */
export async function telegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || (await getSetting("telegram_token")) || "";
  const chats = process.env.TELEGRAM_CHAT_ID?.trim() || (await getSetting("telegram_chat_id")) || "";
  const ids = chats
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { token, ids, fromEnv: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) };
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function sendTelegram(html: string, override?: { token: string; ids: string[] }): Promise<boolean> {
  const { token, ids } = override ?? (await telegramConfig());
  if (!token || !ids.length) return false;
  const results = await Promise.all(
    ids.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    ),
  );
  return results.some(Boolean);
}

/** chats that wrote to the bot recently (the owner presses /start, then this finds the id) */
export async function findChats(token: string) {
  const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`, { signal: AbortSignal.timeout(8000) });
  const data = (await r.json()) as {
    ok: boolean;
    description?: string;
    result?: { message?: { chat: { id: number; type: string; first_name?: string; last_name?: string; username?: string; title?: string } } }[];
  };
  if (!data.ok) throw new Error(data.description || "Telegram rejected the token");
  const seen = new Map<string, { id: string; name: string; username?: string }>();
  for (const u of data.result ?? []) {
    const c = u.message?.chat;
    if (!c) continue;
    const name = c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || String(c.id);
    seen.set(String(c.id), { id: String(c.id), name, username: c.username });
  }
  return [...seen.values()];
}

/** one line per ordered item, already priced on the server */
export type LeadLine = {
  name: string;
  code: string;
  amount?: number;
  unit?: string;
  price: number;
  basePrice: number;
  discountPercent: number;
  unitWord: string;
  sum?: number;
};

const LANG: Record<string, string> = { uz: "uz", ru: "ru", en: "en" };
const som = (n: number) => `${new Intl.NumberFormat("ru-RU").format(n).replace(/ /g, " ")} so‘m`;

export function leadMessage(l: {
  name: string;
  phone: string;
  comment: string;
  products: string[];
  lines: LeadLine[];
  total?: number;
  note: string;
  locale: string;
  topic?: string;
  createdAt?: Date;
}) {
  const when = (l.createdAt ?? new Date()).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" });
  const order = l.lines.length > 0;
  const out = [
    `🆕 <b>${order ? "Yangi buyurtma" : "Yangi ariza"} — ${esc(SITE_HOST)}</b>`,
    "",
    `👤 Ism: <b>${esc(l.name)}</b>`,
    `📞 Telefon: <a href="tel:+${l.phone}">${esc(formatPhone(l.phone))}</a>`,
  ];
  if (l.topic) out.push(`🏷 Mavzu: <b>${esc(l.topic)}</b>`);
  for (const it of l.lines) {
    out.push("", `📦 Mahsulot: ${esc(it.name)} (${esc(it.code)})`);
    if (it.amount) out.push(`📏 Miqdor: ${it.amount} ${esc(it.unit ?? "")}`.trim());
    const price = `${som(it.price)}/${esc(it.unitWord)}`;
    out.push(
      it.discountPercent > 0
        ? `💰 Narx: ${som(it.basePrice)}/${esc(it.unitWord)}  (chegirma: -${it.discountPercent}% → ${price})`
        : `💰 Narx: ${price}`,
    );
    if (it.sum && l.lines.length > 1) out.push(`➕ Summa: ${som(it.sum)}`);
  }
  if (l.total) out.push("", `🧮 Jami: <b>${som(l.total)}</b>`);
  // leftovers sent as plain codes (no price lookup possible) and free-text context
  const bare = (c: string) => c.split(" (")[0];
  const priced = new Set(l.lines.map((x) => bare(x.code)));
  const rest = l.products.filter((p) => !priced.has(bare(p)));
  if (rest.length) out.push("", `📦 ${esc(rest.join(", "))}`);
  if (l.note) out.push("", `📝 ${esc(l.note)}`);
  if (l.comment) out.push("", `💬 Izoh: ${esc(l.comment)}`);
  out.push("", `🌐 Til: ${LANG[l.locale] ?? esc(l.locale)} · 🕒 ${when}`);
  return out.join("\n");
}

const stamp = (locale: string, at?: Date) =>
  `🌐 Til: ${LANG[locale] ?? esc(locale)} · 🕒 ${(at ?? new Date()).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" })}`;

/** the floating "call me back" button */
export function callbackMessage(l: { phone: string; locale: string; createdAt?: Date }) {
  const num = esc(formatPhone(l.phone));
  return [
    `📞 <b>Yangi qayta qo‘ng‘iroq so‘rovi</b> — <a href="tel:+${l.phone}">${num}</a> raqami sizga raqamini qoldirdi (sayt, til: ${LANG[l.locale] ?? esc(l.locale)})`,
    "",
    stamp(l.locale, l.createdAt),
  ].join("\n");
}

/** a visitor who left their name and number in the chat */
export function chatMessage(l: { name: string; phone: string; summary: string; locale: string; createdAt?: Date }) {
  return [
    `💬 <b>Yangi chat murojaati — ${esc(SITE_HOST)}</b>`,
    "",
    `👤 Ism: <b>${esc(l.name)}</b>`,
    `📞 Telefon: <a href="tel:+${l.phone}">${esc(formatPhone(l.phone))}</a>`,
    ...(l.summary ? ["", `📝 Suhbat:`, esc(l.summary)] : []),
    "",
    stamp(l.locale, l.createdAt),
  ].join("\n");
}
