import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Lattice } from "@/components/ornament/Lattice";
import { authConfigured, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const devHint = !authConfigured() && process.env.NODE_ENV !== "production";

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-red px-4 py-10">
      <Lattice tone="onRed" />
      <div className="relative w-full max-w-[400px] rounded-[18px] bg-white p-6 shadow-[0_30px_80px_rgb(60_10_10/0.35)] sm:p-8">
        <Logo className="h-8 w-auto" />
        <h1 className="mt-6 text-[22px] font-bold text-ink">Boshqaruv paneli</h1>
        <p className="mt-1 text-[14px] text-ink-soft">Mahsulotlar, narxlar va arizalar</p>
        <LoginForm />
        {devHint && (
          <p className="mt-5 rounded-[10px] bg-foam p-3 text-[12px] leading-relaxed text-ink-soft">
            Lokal rejim: <b>admin@flosso.uz</b> / <b>flosso2026</b>. Saytni joylashdan oldin <code>.env</code> da o‘z login va parolingizni o‘rnating.
          </p>
        )}
      </div>
    </main>
  );
}
