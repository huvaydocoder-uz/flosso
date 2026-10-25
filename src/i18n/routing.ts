import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  // "/" is always Uzbek; /ru and /en are explicit choices
  localePrefix: "as-needed",
  // never guess from the browser: every visit starts in Uzbek (routing is done by next.config rewrites)
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
