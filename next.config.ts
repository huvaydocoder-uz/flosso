import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Anonymous (claimable) Netlify deploys have no dashboard for runtime env vars yet,
// so server-only secrets are inlined at build time when BAKE_SERVER_ENV=1.
const SERVER_KEYS = ["DATABASE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "SESSION_SECRET"];
const baked =
  process.env.BAKE_SERVER_ENV === "1"
    ? Object.fromEntries(SERVER_KEYS.filter((k) => process.env[k]).map((k) => [k, process.env[k] as string]))
    : undefined;

const nextConfig: NextConfig = {
  env: baked,
  // locale routing without middleware: "/" is Uzbek, /ru and /en are explicit
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/uz" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [{ source: "/uz", destination: "/", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // product photos uploaded from the admin panel
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // embedded local database (development without DATABASE_URL)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // product photo uploads from the admin panel (validated to 4 MB there)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
