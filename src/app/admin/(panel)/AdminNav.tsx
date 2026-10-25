"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Mahsulotlar" },
  { href: "/admin/leads", label: "Arizalar" },
  { href: "/admin/brands", label: "Brendlar" },
  { href: "/admin/telegram", label: "Telegram" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto [scrollbar-width:none] sm:ml-6">
      {ITEMS.map((it) => {
        const on = it.href === "/admin" ? path === "/admin" || path.startsWith("/admin/products") : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center rounded-[8px] px-3 text-[14px] font-semibold transition-colors ${on ? "bg-ink text-white" : "text-ink-soft hover:bg-foam hover:text-ink"}`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
