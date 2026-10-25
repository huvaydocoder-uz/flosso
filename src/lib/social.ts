"use client";

import type { MouseEvent } from "react";
import { CONTACT } from "./contact";

/* ---------- toast ---------- */

export const EVT_TOAST = "flosso:toast";
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(EVT_TOAST, { detail: message }));
}

/* ---------- clipboard ---------- */

/** async API where allowed, a hidden textarea where not (older Safari, http) */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ---------- Telegram ---------- */

/**
 * t.me/<username>?text= pre-fills the chat's input bar (core.telegram.org/api/links).
 * The same text is also copied, so it can be pasted if an older app ignores the draft.
 */
export function telegramAction(text: string | undefined, copied: string) {
  return {
    href: text ? `${CONTACT.telegramHref}?text=${encodeURIComponent(text.slice(0, 3000))}` : CONTACT.telegramHref,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: () => {
      if (!text) return;
      // start the copy inside the tap itself; the chat opens through the link's own navigation
      void copyText(text).then((ok) => ok && toast(copied));
    },
  } as const;
}

/* ---------- Instagram ---------- */

/** phone: the Instagram app (web page if it isn't installed); computer: the web page */
export function openInstagram(e: MouseEvent<HTMLAnchorElement>) {
  const ua = navigator.userAgent;
  const web = `https://www.instagram.com/${CONTACT.instagramHandle}/`;
  if (/Android/i.test(ua)) {
    e.preventDefault();
    // Android resolves the intent itself and falls back to the browser URL
    window.location.href = `intent://instagram.com/_u/${CONTACT.instagramHandle}/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(web)};end`;
    return;
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    e.preventDefault();
    const started = Date.now();
    window.location.href = CONTACT.instagramApp;
    // the app took over if the page went to the background; otherwise open the web page
    window.setTimeout(() => {
      if (!document.hidden && Date.now() - started < 2500) window.location.href = web;
    }, 1200);
  }
}

export const instagramProps = {
  href: CONTACT.instagramHref,
  target: "_blank",
  rel: "noopener noreferrer",
  onClick: openInstagram,
} as const;
