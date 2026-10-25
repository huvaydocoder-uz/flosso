import "server-only";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { PRODUCTS, type CategoryId, type Product, type Unit } from "@data/products";
import { getDb, schema } from "@/db";

type ProductRow = typeof schema.products.$inferSelect;
export type LeadRow = typeof schema.leads.$inferSelect;
export type LeadStatus = "new" | "contacted" | "closed";

const toProduct = (r: ProductRow): Product => ({
  code: r.code,
  category: r.category as CategoryId,
  model: r.model,
  heightCm: r.heightCm,
  widthCm: r.widthCm,
  unit: r.unit as Unit,
  price: r.price,
  discountPercent: r.discountPercent,
  variants: r.variants ?? undefined,
  position: (r.position as "P" | "T" | null) ?? undefined,
  image: r.image,
  active: r.active,
  order: r.sortOrder,
  names: r.nameUz || r.nameRu || r.nameEn ? { uz: r.nameUz, ru: r.nameRu, en: r.nameEn } : undefined,
});

/** never lets the public site go down: falls back to the catalog file */
export async function getProducts({ includeInactive = false } = {}): Promise<Product[]> {
  // at build time pages are prerendered from the catalog file; live data arrives with revalidation
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return includeInactive ? PRODUCTS : PRODUCTS.filter((p) => p.active);
  }
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.products).orderBy(asc(schema.products.category), asc(schema.products.sortOrder));
    const list = rows.map(toProduct);
    return includeInactive ? list : list.filter((p) => p.active);
  } catch (e) {
    console.error("products: database unavailable, serving catalog file", e);
    return includeInactive ? PRODUCTS : PRODUCTS.filter((p) => p.active);
  }
}

export async function getProductRow(code: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.products).where(eq(schema.products.code, code));
  return row ? toProduct(row) : null;
}

export type ProductInput = Omit<Product, "names"> & { names: { uz: string; ru: string; en: string } };

const toRow = (p: ProductInput) => ({
  code: p.code,
  category: p.category,
  model: p.model,
  heightCm: p.heightCm,
  widthCm: p.widthCm,
  unit: p.unit,
  price: p.price,
  discountPercent: p.discountPercent,
  variants: p.variants?.length ? p.variants : null,
  position: p.position ?? null,
  image: p.image,
  active: p.active,
  sortOrder: p.order,
  nameUz: p.names.uz || null,
  nameRu: p.names.ru || null,
  nameEn: p.names.en || null,
  updatedAt: new Date(),
});

export async function saveProduct(p: ProductInput, originalCode?: string) {
  const db = await getDb();
  if (originalCode && originalCode !== p.code) {
    await db.delete(schema.products).where(eq(schema.products.code, originalCode));
  }
  const row = toRow(p);
  await db.insert(schema.products).values(row).onConflictDoUpdate({ target: schema.products.code, set: row });
}

export async function patchProduct(code: string, patch: Partial<Pick<ProductRow, "price" | "discountPercent" | "active" | "sortOrder">>) {
  const db = await getDb();
  await db
    .update(schema.products)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(schema.products.code, code));
}

export async function deleteProduct(code: string) {
  const db = await getDb();
  await db.delete(schema.products).where(eq(schema.products.code, code));
}

/* ---------- images ---------- */

export async function saveImage(mime: string, bytes: ArrayBuffer) {
  const db = await getDb();
  const [row] = await db.insert(schema.images).values({ mime, data: Buffer.from(bytes).toString("base64") }).returning({ id: schema.images.id });
  return row.id;
}

export async function getImage(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.images).where(eq(schema.images.id, id));
  return row ? { mime: row.mime, bytes: Buffer.from(row.data, "base64") } : null;
}

/* ---------- leads ---------- */

export async function createLead(input: Omit<LeadRow, "id" | "createdAt" | "status" | "telegramSent">) {
  const db = await getDb();
  const [row] = await db.insert(schema.leads).values(input).returning();
  return row;
}

export async function markLeadTelegram(id: string) {
  const db = await getDb();
  await db.update(schema.leads).set({ telegramSent: true }).where(eq(schema.leads.id, id));
}

export async function listLeads() {
  const db = await getDb();
  return db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(500);
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const db = await getDb();
  await db.update(schema.leads).set({ status }).where(eq(schema.leads.id, id));
}

export async function deleteLead(id: string) {
  const db = await getDb();
  await db.delete(schema.leads).where(eq(schema.leads.id, id));
}

/* ---------- settings ---------- */

export async function getSetting(key: string): Promise<string | null> {
  try {
    const db = await getDb();
    const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
    return row?.value ?? null;
  } catch (e) {
    console.error("settings: read failed", e);
    return null;
  }
}

export async function setSetting(key: string, value: string | null) {
  const db = await getDb();
  if (value === null || value === "") {
    await db.delete(schema.settings).where(eq(schema.settings.key, key));
    return;
  }
  await db
    .insert(schema.settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}

/* ---------- promotions ---------- */

export type PromotionRow = typeof schema.promotions.$inferSelect;
export type PromotionInput = Omit<PromotionRow, "id" | "createdAt">;

export async function listPromotions() {
  const db = await getDb();
  return db.select().from(schema.promotions).orderBy(desc(schema.promotions.createdAt));
}

export async function getPromotion(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id));
  return row ?? null;
}

export async function savePromotion(input: PromotionInput, id?: string) {
  const db = await getDb();
  if (id) await db.update(schema.promotions).set(input).where(eq(schema.promotions.id, id));
  else await db.insert(schema.promotions).values(input);
}

export async function setPromotionActive(id: string, active: boolean) {
  const db = await getDb();
  await db.update(schema.promotions).set({ active }).where(eq(schema.promotions.id, id));
}

export async function deletePromotion(id: string) {
  const db = await getDb();
  await db.delete(schema.promotions).where(eq(schema.promotions.id, id));
}

/** offers that are switched on and inside their dates; the public site never fails on them */
export async function getLivePromotions(): Promise<PromotionRow[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const db = await getDb();
    const now = new Date();
    return await db
      .select()
      .from(schema.promotions)
      .where(
        and(
          eq(schema.promotions.active, true),
          or(isNull(schema.promotions.startsAt), lte(schema.promotions.startsAt, now)),
          or(isNull(schema.promotions.endsAt), gte(schema.promotions.endsAt, now)),
        ),
      );
  } catch (e) {
    console.error("promotions: database unavailable", e);
    return [];
  }
}

/* ---------- brands ---------- */

export type BrandRow = typeof schema.brands.$inferSelect;

export async function listBrands({ onlyActive = false } = {}): Promise<BrandRow[]> {
  if (onlyActive && process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.brands).orderBy(asc(schema.brands.sortOrder), asc(schema.brands.createdAt));
    return onlyActive ? rows.filter((b) => b.active) : rows;
  } catch (e) {
    if (!onlyActive) throw e;
    console.error("brands: database unavailable", e);
    return [];
  }
}

export async function addBrand(input: { name: string; logo: string; sortOrder: number }) {
  const db = await getDb();
  await db.insert(schema.brands).values(input);
}

export async function patchBrand(id: string, patch: Partial<Pick<BrandRow, "name" | "sortOrder" | "active">>) {
  const db = await getDb();
  await db.update(schema.brands).set(patch).where(eq(schema.brands.id, id));
}

export async function deleteBrand(id: string) {
  const db = await getDb();
  await db.delete(schema.brands).where(eq(schema.brands.id, id));
}
