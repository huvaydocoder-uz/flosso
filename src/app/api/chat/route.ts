import { NextResponse } from "next/server";
import { CATEGORIES, finalPrice, type CategoryId } from "@data/products";
import en from "../../../../messages/en.json";
import ru from "../../../../messages/ru.json";
import uz from "../../../../messages/uz.json";
import { CONTACT } from "@/lib/contact";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getProducts } from "@/lib/repo";

/**
 * The site's chat assistant, answered by Claude when ANTHROPIC_API_KEY is set.
 * The key stays on the server; without it this route answers 503 and the widget runs its scripted mode.
 * CHAT_MODEL can override the model.
 */
const MODEL = process.env.CHAT_MODEL?.trim() || "claude-haiku-5-5";
const MESSAGES = { uz, ru, en } as const;
const LANG_NAME = { uz: "Uzbek (Latin script)", ru: "Russian", en: "English" } as const;
const CAT_UZ: Record<CategoryId, string> = {
  FKR: "karniz (cornice)",
  FNL: "nalichnik (window casing)",
  FPD: "podokonnik (window sill)",
  FTK: "taroq-kolonna (column shaft)",
  FIK: "kolonna igrushkasi (column top/bottom ornament)",
  FIN: "nalichnik igrushkasi (casing ornament)",
  FTP: "termopanel (thermal facade panel)",
};

type Msg = { role: "user" | "assistant"; content: string };

async function systemPrompt(locale: keyof typeof MESSAGES) {
  const products = await getProducts();
  const som = (n: number) => new Intl.NumberFormat("ru-RU").format(n).replace(/ /g, " ");
  const catalog = CATEGORIES.map((c) => {
    const list = products.filter((p) => p.category === c.id);
    if (!list.length) return null;
    const from = Math.min(...list.map(finalPrice));
    return `- ${CAT_UZ[c.id]}: ${list.length} models, from ${som(from)} so‘m per ${c.unit === "metr" ? "metre" : "piece"}`;
  })
    .filter(Boolean)
    .join("\n");
  const faq = MESSAGES[locale].faq.items.map((it) => `Q: ${it.q}\nA: ${it.a}`).join("\n\n");

  return `You are the online assistant on the website of FLOSSO, a manufacturer of polystyrene (penoplast) facade decor in Bukhara, Uzbekistan, working since 1 November 2018 in its own workshop.

Catalogue (live prices from the site):
${catalog}
There are also 4 ready-made sets (a window with cornice, casing, sill and two columns) and a calculator on the site.

Frequently asked questions (official answers):
${faq}

Contacts: phones ${CONTACT.phoneDisplay} and ${CONTACT.phone2Display}; Telegram ${CONTACT.telegramHref}; Instagram @${CONTACT.instagramHandle}; address: Bukhara, Namozgoh street (workshop, pickup possible — call before coming).

Rules:
- Reply in ${LANG_NAME[locale]} unless the visitor clearly writes in another language; then use theirs.
- Be warm, short and concrete: 2–4 sentences, plain text, no markdown, no lists unless asked.
- Use only the facts above. Never invent prices, discounts, delivery costs, deadlines or guarantees; when something is not listed, say a FLOSSO specialist will confirm it by phone.
- After answering, invite the visitor to leave their name and phone number in the form under the chat so a specialist can call them.
- Stay on FLOSSO topics (products, prices, ordering, delivery, installation, painting, the workshop). Politely decline anything else.`;
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return NextResponse.json({ error: "off" }, { status: 503 });

  if (!rateLimit(`chat:${clientKey(req)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const locale = (["uz", "ru", "en"] as const).find((l) => l === body.locale) ?? "uz";
  const raw = Array.isArray(body.messages) ? body.messages : [];
  // the last 16 turns, each clipped; the conversation must open and close with the visitor
  const messages: Msg[] = raw
    .filter((m): m is Msg => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 800) }))
    .filter((m) => m.content);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: await systemPrompt(locale), messages }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) {
      console.error("chat: Claude API error", r.status, await r.text().catch(() => ""));
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const data = (await r.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("")
      .trim();
    if (!text) return NextResponse.json({ error: "upstream" }, { status: 502 });
    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error("chat: request failed", e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
