import "server-only";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/**
 * One admin, credentials in env:
 *   ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt; `npm run admin:hash -- "password"`), SESSION_SECRET (32+ chars).
 * In local development without env, a default login is allowed (printed in the console) — never in production.
 */
const COOKIE = "flosso_admin";
const MAX_AGE = 7 * 24 * 60 * 60;
const isProd = process.env.NODE_ENV === "production";

const DEV_EMAIL = "admin@flosso.uz";
const DEV_PASSWORD = "flosso2026";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (isProd) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return new TextEncoder().encode("dev-only-flosso-session-secret-not-for-production");
}

export function authConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (authConfigured()) {
    const okEmail = e === process.env.ADMIN_EMAIL!.trim().toLowerCase();
    // always run bcrypt so a wrong email takes as long as a wrong password
    // a hash copied from a .env file may still carry its "\$" escapes
    const hash = process.env.ADMIN_PASSWORD_HASH!.trim().replaceAll("\\$", "$");
    const okPass = await bcrypt.compare(password, hash);
    return okEmail && okPass;
  }
  if (isProd) return false;
  console.warn(`[admin] ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set — dev login: ${DEV_EMAIL} / ${DEV_PASSWORD}`);
  return e === DEV_EMAIL && password === DEV_PASSWORD;
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export const isAdmin = cache(async (): Promise<boolean> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
});

/** guard for admin pages and every admin server action */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
