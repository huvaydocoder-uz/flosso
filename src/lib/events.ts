"use client";

import type { CategoryId } from "@data/products";
import { SECTION_IDS } from "./contact";
import type { LeadItem } from "./lead-validation";

/**
 * Cross-section hand-offs without a global store:
 * any block can attach a product / calculation to the contact form, or open a catalog category.
 */
export type LeadAttachment = {
  /** product codes the request is about */
  products?: string[];
  /** human-readable summary (calculation, set, wholesale…) */
  note?: string;
  /** priced lines for the owner's Telegram (the server looks the prices up again) */
  items?: LeadItem[];
};

export const EVT_ATTACH = "flosso:attach";
export const EVT_CATEGORY = "flosso:category";
export const EVT_PRODUCT = "flosso:product";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** attach context to the contact form and take the visitor there */
export function requestQuote(detail: LeadAttachment) {
  window.dispatchEvent(new CustomEvent<LeadAttachment>(EVT_ATTACH, { detail }));
  scrollToId(SECTION_IDS.contact);
}

/** open a catalog category */
export function openCategory(category: CategoryId) {
  window.dispatchEvent(new CustomEvent<CategoryId>(EVT_CATEGORY, { detail: category }));
  scrollToId(SECTION_IDS.catalog);
}

/** open one product's detail in the catalog */
export function openProduct(code: string) {
  window.dispatchEvent(new CustomEvent<string>(EVT_PRODUCT, { detail: code }));
  scrollToId(SECTION_IDS.catalog);
}

export const EVT_CALC = "flosso:calc";
/** open the calculator in window mode with a ready-made set */
export function openCalcWithSet(solutionId: number) {
  window.dispatchEvent(new CustomEvent<number>(EVT_CALC, { detail: solutionId }));
  scrollToId(SECTION_IDS.calculator);
}

export const EVT_SOLUTION = "flosso:solution";
/** show one ready-made set */
export function openSolution(id: number) {
  window.dispatchEvent(new CustomEvent<number>(EVT_SOLUTION, { detail: id }));
  scrollToId(SECTION_IDS.solutions);
}
