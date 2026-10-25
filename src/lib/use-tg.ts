"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { Product } from "@data/products";
import type { CalcRow } from "./calc";
import { formatNumber } from "./format";
import { telegramAction } from "./social";

/**
 * Telegram buttons: the order text (what the visitor picked) is copied to the clipboard,
 * a toast says to paste it, and the chat opens. Each builder returns the <a> props.
 */
export function useTg() {
  const t = useTranslations();
  const telegramLink = useCallback((text?: string) => telegramAction(text, t("tg.copied")), [t]);

  const unit = useCallback((u: Product["unit"]) => (u === "metr" ? t("units.m") : t("units.dona")), [t]);
  const sum = useCallback((n: number) => `${formatNumber(n)} ${t("units.sum")}`, [t]);

  const product = useCallback(
    (p: Product, name: string, opts: { variant?: number; price: number; amount?: number; total?: number }) => {
      const code = `${p.code}${opts.variant ? ` (${opts.variant} ${t("units.cm")})` : ""}`;
      const lines = [t("tg.hello"), "", t("tg.product"), `• ${name} — ${code}`, `• ${t("tg.price")}: ${sum(opts.price)} / ${p.unit === "metr" ? t("units.perMetr") : t("units.perDona")}`];
      if (opts.amount && opts.total) lines.push("", t("tg.calc"), `• ${opts.amount} ${unit(p.unit)} → ${sum(opts.total)}`);
      lines.push("", t("tg.question"));
      return telegramLink(lines.join("\n"));
    },
    [t, sum, unit, telegramLink],
  );

  const window = useCallback(
    (rows: CalcRow[], total: number, w: string, h: string, count: string, label: (r: CalcRow) => string) => {
      const lines = [
        t("tg.hello"),
        "",
        `${t("tg.calc")} ${t("tg.window", { count, w, h })}`,
        ...rows.map((r) => `• ${label(r)} — ${r.code}: ${r.amount} ${unit(r.unit)} → ${sum(r.sum)}`),
        `${t("tg.total")}: ${sum(total)}`,
        "",
        t("tg.question"),
      ];
      return telegramLink(lines.join("\n"));
    },
    [t, sum, unit, telegramLink],
  );

  const set = useCallback(
    (title: string, items: string[]) => telegramLink([t("tg.hello"), "", `${t("tg.set")} ${title}`, ...items.map((i) => `• ${i}`), "", t("tg.question")].join("\n")),
    [t, telegramLink],
  );

  const wholesale = useCallback(() => telegramLink([t("tg.hello"), "", t("tg.wholesale")].join("\n")), [t, telegramLink]);
  const hello = useCallback(() => telegramLink(t("tg.hello")), [t, telegramLink]);

  return { product, window, set, wholesale, hello };
}
