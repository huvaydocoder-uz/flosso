"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCode, slugOf, type CategoryId, type Unit } from "@data/products";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { isLimited, recordHit } from "@/lib/rate-limit";
import {
  addBrand,
  deleteBrand,
  patchBrand,
  deleteLead,
  deleteProduct,
  patchProduct,
  saveImage,
  saveProduct,
  setLeadStatus,
  setSetting,
  type LeadStatus,
} from "@/lib/repo";
import { findChats, sendTelegram, telegramConfig } from "@/lib/telegram";

const CATS: CategoryId[] = ["FKR", "FNL", "FPD", "FTK", "FIK", "FIN", "FTP"];
const refreshSite = () => revalidatePath("/[locale]", "page");

/* ---------- auth ---------- */

export type LoginState = { error?: "invalid" | "rate"; email?: string } | undefined;

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const email = String(form.get("email") ?? "").slice(0, 120);
  const key = `login:${ip}`;
  if (isLimited(key, 5, 15 * 60_000)) return { error: "rate", email };
  const ok = await checkCredentials(email, String(form.get("password") ?? ""));
  if (!ok) {
    recordHit(key);
    return { error: "invalid", email };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- products ---------- */

export async function quickUpdateAction(code: string, patch: { price?: number; discountPercent?: number; active?: boolean }) {
  await requireAdmin();
  const clean: { price?: number; discountPercent?: number; active?: boolean } = {};
  if (patch.price !== undefined) {
    if (!Number.isInteger(patch.price) || patch.price < 0 || patch.price > 100_000_000) return { error: "price" };
    clean.price = patch.price;
  }
  if (patch.discountPercent !== undefined) {
    if (!Number.isInteger(patch.discountPercent) || patch.discountPercent < 0 || patch.discountPercent > 90) return { error: "discount" };
    clean.discountPercent = patch.discountPercent;
  }
  if (patch.active !== undefined) clean.active = Boolean(patch.active);
  await patchProduct(code, clean);
  refreshSite();
  return { ok: true };
}

export async function deleteProductAction(code: string) {
  await requireAdmin();
  await deleteProduct(code);
  refreshSite();
  revalidatePath("/admin");
}

export type ProductFormState = { errors?: Record<string, string>; ok?: boolean } | undefined;

async function storeImage(file: File, code: string): Promise<string> {
  const ext = (file.type.split("/")[1] || "webp").replace("jpeg", "jpg");
  const name = code === "promo" ? `promotions/${Date.now()}.${ext}` : `products/${slugOf(code)}-${Date.now()}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  // no blob store configured: keep the photo in the database itself
  const id = await saveImage(file.type, await file.arrayBuffer());
  return `/api/images/${id}`;
}

export async function saveProductAction(_: ProductFormState, form: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const errors: Record<string, string> = {};
  const str = (k: string) => String(form.get(k) ?? "").trim();
  const int = (k: string) => {
    const v = Number(str(k).replace(/\s/g, ""));
    return Number.isFinite(v) ? Math.round(v) : NaN;
  };

  const code = str("code").toUpperCase().replace(/\s/g, "");
  const original = str("originalCode") || undefined;
  let parsed: ReturnType<typeof parseCode> | null = null;
  try {
    parsed = parseCode(code);
  } catch {
    errors.code = "Kod formati: FKR01-718 yoki FIK(T)04-717";
  }
  const category = str("category") as CategoryId;
  if (!CATS.includes(category)) errors.category = "Toifani tanlang";
  if (parsed && category && parsed.category !== category) errors.code = `Kod ${category} bilan boshlanishi kerak`;

  const unit = (str("unit") === "dona" ? "dona" : "metr") as Unit;
  const price = int("price");
  if (!(price >= 0)) errors.price = "Narxni raqamda yozing";
  const discountPercent = str("discountOn") ? int("discountPercent") : 0;
  if (!(discountPercent >= 0 && discountPercent <= 90)) errors.discountPercent = "0–90 oralig‘ida";
  const order = int("order");
  const variants = str("variants")
    .split(/[,;\s/]+/)
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v) && v > 0);

  let image = str("currentImage");
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) errors.image = "Faqat PNG, JPG, WEBP yoki AVIF";
    else if (file.size > 4 * 1024 * 1024) errors.image = "Rasm 4 MB dan oshmasin";
  }
  if (!image && !(file instanceof File && file.size > 0)) errors.image = "Rasm yuklang";

  if (Object.keys(errors).length || !parsed) return { errors };

  if (file instanceof File && file.size > 0) {
    try {
      image = await storeImage(file, code);
    } catch (e) {
      console.error("image upload failed", e);
      return { errors: { image: "Rasm yuklanmadi. Qayta urinib ko‘ring." } };
    }
  }

  await saveProduct(
    {
      code,
      category,
      model: parsed.model,
      heightCm: parsed.heightCm,
      widthCm: parsed.widthCm,
      position: parsed.position,
      unit,
      price,
      discountPercent,
      variants: variants.length ? variants : undefined,
      image,
      active: Boolean(str("active")),
      order: Number.isFinite(order) ? order : 0,
      names: { uz: str("nameUz"), ru: str("nameRu"), en: str("nameEn") },
    },
    original,
  );
  refreshSite();
  revalidatePath("/admin");
  redirect(`/admin?saved=${encodeURIComponent(code)}`);
}

/* ---------- leads ---------- */

export async function leadStatusAction(id: string, status: LeadStatus) {
  await requireAdmin();
  if (!["new", "contacted", "closed"].includes(status)) return;
  await setLeadStatus(id, status);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(id: string) {
  await requireAdmin();
  await deleteLead(id);
  revalidatePath("/admin/leads");
}

/* ---------- Telegram bot ---------- */

export type TgState = { ok?: string; error?: string; chats?: { id: string; name: string; username?: string }[] } | undefined;

export async function saveTelegramTokenAction(_: TgState, form: FormData): Promise<TgState> {
  await requireAdmin();
  const token = String(form.get("token") ?? "").trim();
  if (!/^\d{5,}:[\w-]{20,}$/.test(token)) return { error: "Token noto‘g‘ri ko‘rinishda. U shunday bo‘ladi: 123456789:AAH…" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(8000) });
    const data = (await r.json()) as { ok: boolean; result?: { username: string } };
    if (!data.ok) return { error: "Telegram bu tokenni qabul qilmadi. @BotFather'dan qayta nusxalang." };
    await setSetting("telegram_token", token);
    revalidatePath("/admin/telegram");
    return { ok: `Bot ulandi: @${data.result?.username}. Endi 2-qadamga o‘ting.` };
  } catch {
    return { error: "Telegram bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring." };
  }
}

export async function findTelegramChatsAction(): Promise<TgState> {
  await requireAdmin();
  const { token } = await telegramConfig();
  if (!token) return { error: "Avval bot tokenini saqlang." };
  try {
    const chats = await findChats(token);
    if (!chats.length) return { error: "Hech kim botga yozmagan. Egasi botni ochib /start bossin, so‘ng qayta tekshiring." };
    return { chats };
  } catch (e) {
    return { error: `Xato: ${(e as Error).message}` };
  }
}

export async function setTelegramChatAction(id: string): Promise<TgState> {
  await requireAdmin();
  if (!/^-?\d{3,20}$/.test(id)) return { error: "chat_id noto‘g‘ri" };
  await setSetting("telegram_chat_id", id);
  revalidatePath("/admin/telegram");
  const sent = await sendTelegram("✅ <b>FLOSSO sayti ulandi.</b>\nEndi saytdagi barcha arizalar shu yerga keladi.");
  return sent ? { ok: "Saqlandi. Telegram'ga sinov xabari yuborildi." } : { error: "Saqlandi, lekin sinov xabari bormadi. Egasi botga /start bosganini tekshiring." };
}

export async function testTelegramAction(): Promise<TgState> {
  await requireAdmin();
  const sent = await sendTelegram("🔔 Sinov xabari — FLOSSO sayti admin panelidan.");
  return sent ? { ok: "Sinov xabari yuborildi — Telegram'ni tekshiring." } : { error: "Xabar yuborilmadi. Token va chat_id ni tekshiring." };
}

export async function clearTelegramAction(): Promise<TgState> {
  await requireAdmin();
  await setSetting("telegram_token", null);
  await setSetting("telegram_chat_id", null);
  revalidatePath("/admin/telegram");
  return { ok: "Bot sozlamalari o‘chirildi." };
}

/* ---------- brands ---------- */

export type BrandFormState = { error?: string; ok?: boolean } | undefined;
const refreshBrands = () => {
  refreshSite();
  revalidatePath("/admin/brands");
};

export async function addBrandAction(_: BrandFormState, form: FormData): Promise<BrandFormState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  if (!name) return { error: "Brend nomini yozing" };
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Logotip rasmini tanlang" };
  if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) return { error: "Faqat PNG, JPG, WEBP yoki AVIF" };
  if (file.size > 2 * 1024 * 1024) return { error: "Logotip 2 MB dan oshmasin" };
  let logo: string;
  try {
    logo = await storeImage(file, "promo");
  } catch (e) {
    console.error("brand logo upload failed", e);
    return { error: "Rasm yuklanmadi. Qayta urinib ko‘ring." };
  }
  const order = Number(String(form.get("sortOrder") ?? "0")) || 0;
  await addBrand({ name, logo, sortOrder: Math.round(order) });
  refreshBrands();
  return { ok: true };
}

export async function toggleBrandAction(id: string, active: boolean) {
  await requireAdmin();
  await patchBrand(id, { active });
  refreshBrands();
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  await deleteBrand(id);
  refreshBrands();
}
