import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  code: text("code").primaryKey(),
  category: text("category").notNull(),
  model: text("model").notNull(),
  heightCm: integer("height_cm").notNull(),
  widthCm: integer("width_cm").notNull(),
  unit: text("unit").notNull(),
  price: integer("price").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  variants: jsonb("variants").$type<number[] | null>(),
  position: text("position"),
  image: text("image").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  nameUz: text("name_uz"),
  nameRu: text("name_ru"),
  nameEn: text("name_en"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  comment: text("comment").notNull().default(""),
  products: jsonb("products").$type<string[]>().notNull().default([]),
  note: text("note").notNull().default(""),
  locale: text("locale").notNull().default("uz"),
  status: text("status").notNull().default("new"),
  telegramSent: boolean("telegram_sent").notNull().default(false),
  /** "lead" (contact form) | "callback" (call-me-back button) | "chat" (the chat assistant) */
  kind: text("kind").notNull().default("lead"),
  /** subject picked in the form, in Uzbek */
  topic: text("topic").notNull().default(""),
});

/** admin-uploaded photos (base64), served from /api/images/<id> */
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** small key/value store for admin-editable settings (Telegram bot, …) */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** pop-up offers managed in the admin panel */
export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleUz: text("title_uz").notNull().default(""),
  titleRu: text("title_ru").notNull().default(""),
  titleEn: text("title_en").notNull().default(""),
  textUz: text("text_uz").notNull().default(""),
  textRu: text("text_ru").notNull().default(""),
  textEn: text("text_en").notNull().default(""),
  image: text("image").notNull().default(""),
  discountPercent: integer("discount_percent").notNull().default(0),
  /** "product" | "category" | "none" */
  targetType: text("target_type").notNull().default("none"),
  target: text("target").notNull().default(""),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** "Brands that trusted us": real clients only, added by the owner in the admin panel */
export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** idempotent DDL: lets a fresh Neon or local database start without a migration step */
export const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS products (
    code text PRIMARY KEY,
    category text NOT NULL,
    model text NOT NULL,
    height_cm integer NOT NULL,
    width_cm integer NOT NULL,
    unit text NOT NULL,
    price integer NOT NULL,
    discount_percent integer NOT NULL DEFAULT 0,
    variants jsonb,
    position text,
    image text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    name_uz text,
    name_ru text,
    name_en text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    phone text NOT NULL,
    comment text NOT NULL DEFAULT '',
    products jsonb NOT NULL DEFAULT '[]'::jsonb,
    note text NOT NULL DEFAULT '',
    locale text NOT NULL DEFAULT 'uz',
    status text NOT NULL DEFAULT 'new',
    telegram_sent boolean NOT NULL DEFAULT false
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'lead'`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS topic text NOT NULL DEFAULT ''`,
  `CREATE TABLE IF NOT EXISTS images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mime text NOT NULL,
    data text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title_uz text NOT NULL DEFAULT '',
    title_ru text NOT NULL DEFAULT '',
    title_en text NOT NULL DEFAULT '',
    text_uz text NOT NULL DEFAULT '',
    text_ru text NOT NULL DEFAULT '',
    text_en text NOT NULL DEFAULT '',
    image text NOT NULL DEFAULT '',
    discount_percent integer NOT NULL DEFAULT 0,
    target_type text NOT NULL DEFAULT 'none',
    target text NOT NULL DEFAULT '',
    starts_at timestamptz,
    ends_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];
