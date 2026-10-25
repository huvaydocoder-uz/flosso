import "server-only";
import { sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { PRODUCTS } from "@data/products";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

/**
 * Production: Postgres from DATABASE_URL (Neon over HTTP, anything else over pg). Without a URL: an embedded
 * PGlite database in .data/pglite, so the admin works out of the box.
 */
async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  // Neon speaks HTTP (best on serverless); any other Postgres goes through a small pg pool
  if (url && /neon\.tech/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema });
  }
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000, ssl: !/sslmode=disable/.test(url) });
    return drizzle(pool, { schema }) as unknown as Db;
  }
  if (process.env.VERCEL) throw new Error("DATABASE_URL is not set");
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const path = await import("node:path");
  const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  // the PGlite flavour exposes the same query API as neon-http
  return drizzle(client, { schema }) as unknown as Db;
}

async function prepare(db: Db) {
  for (const stmt of schema.SCHEMA_SQL) await db.execute(sql.raw(stmt));
  const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(schema.products)) as { n: number }[];
  if (n === 0) await seedProducts(db);
  return db;
}

export async function seedProducts(db: Db) {
  await db
    .insert(schema.products)
    .values(
      PRODUCTS.map((p) => ({
        code: p.code,
        category: p.category,
        model: p.model,
        heightCm: p.heightCm,
        widthCm: p.widthCm,
        unit: p.unit,
        price: p.price,
        discountPercent: p.discountPercent,
        variants: p.variants ?? null,
        position: p.position ?? null,
        image: p.image,
        active: p.active,
        sortOrder: p.order,
      })),
    )
    .onConflictDoNothing();
}

const g = globalThis as unknown as { __flossoDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!g.__flossoDb) {
    g.__flossoDb = connect().then(prepare);
    // a failed connection must not poison every later request
    g.__flossoDb.catch(() => (g.__flossoDb = undefined));
  }
  return g.__flossoDb;
}

export { schema };
