import { CheckCircle2, CircleAlert } from "lucide-react";
import { telegramConfig } from "@/lib/telegram";
import { TelegramSetup } from "./TelegramSetup";

export const dynamic = "force-dynamic";

const mask = (t: string) => (t ? `${t.slice(0, 6)}…${t.slice(-4)}` : "");

export default async function TelegramPage() {
  const { token, ids, fromEnv } = await telegramConfig();
  const ready = Boolean(token && ids.length);

  return (
    <div className="max-w-[760px]">
      <h1 className="text-[26px] font-bold text-ink">Telegram — arizalar uchun bot</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Saytdagi har bir ariza va buyurtma darhol egasining Telegram’iga keladi. Telegram ishlamay qolsa ham ariza yo‘qolmaydi — «Arizalar» bo‘limida saqlanadi.
      </p>

      <div className={`mt-6 flex items-start gap-3 rounded-[14px] p-4 ${ready ? "bg-[#e8f5ec] text-[#1f6b36]" : "bg-[#fff4e5] text-[#8a5300]"}`}>
        {ready ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />}
        <div className="text-[15px]">
          {ready ? <b>Ulangan — arizalar Telegram’ga boradi.</b> : <b>Hali ulanmagan — arizalar hozircha faqat admin panelda.</b>}
          <div className="mt-1 text-[13px] tabular">
            Token: {token ? mask(token) : "yo‘q"} · chat_id: {ids.length ? ids.join(", ") : "yo‘q"}
            {fromEnv && " · (Netlify sozlamalaridan olingan)"}
          </div>
        </div>
      </div>

      <TelegramSetup hasToken={Boolean(token)} ready={ready} fromEnv={fromEnv} />
    </div>
  );
}
