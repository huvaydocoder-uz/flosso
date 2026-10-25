import "server-only";

/**
 * Public address of the site. Netlify sets URL to the production domain at build time;
 * SITE_URL overrides it once a custom domain (e.g. flosso.uz) is attached.
 */
export const SITE_URL = (process.env.SITE_URL || process.env.URL || "https://flosso.uz").replace(/\/$/, "");
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
