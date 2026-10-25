import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Link href="/admin" aria-label="FLOSSO admin" className="shrink-0">
            <Logo className="hidden h-7 w-auto sm:block" />
            <Logo markOnly className="h-8 w-auto sm:hidden" />
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" className="inline-flex min-h-10 items-center gap-1.5 rounded-[8px] px-3 text-[14px] font-medium text-ink-soft hover:bg-foam hover:text-ink">
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sayt</span>
            </a>
            <form action={logoutAction}>
              <button type="submit" className="inline-flex min-h-10 items-center gap-1.5 rounded-[8px] px-3 text-[14px] font-medium text-ink-soft hover:bg-foam hover:text-ink">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
