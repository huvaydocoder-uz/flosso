"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import {
  clearTelegramAction,
  findTelegramChatsAction,
  saveTelegramTokenAction,
  setTelegramChatAction,
  testTelegramAction,
  type TgState,
} from "../../actions";

const input =
  "mt-1.5 block min-h-12 w-full rounded-[10px] border border-line bg-foam px-4 text-[15px] text-ink outline-none focus:border-red focus:bg-white focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";
const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-semibold disabled:opacity-60";
const card = "rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6";

function Note({ s }: { s: TgState }) {
  if (!s) return null;
  if (s.error) return <p className="mt-3 text-[14px] font-medium text-red">{s.error}</p>;
  if (s.ok) return <p className="mt-3 text-[14px] font-medium text-[#1f6b36]">{s.ok}</p>;
  return null;
}

export function TelegramSetup({ hasToken, ready, fromEnv }: { hasToken: boolean; ready: boolean; fromEnv: boolean }) {
  const [tokenState, saveToken, savingToken] = useActionState<TgState, FormData>(saveTelegramTokenAction, undefined);
  const [chatState, setChatState] = useState<TgState>(undefined);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<TgState>) => start(async () => setChatState(await fn()));

  return (
    <div className="mt-8 space-y-5">
      <section className={card}>
        <h2 className="text-[17px] font-bold text-ink">1-qadam. Bot oching va tokenni shu yerga qo‘ying</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-ink">
          <li>
            Telegram’da <b>@BotFather</b> ni oching va <b>/newbot</b> deb yozing.
          </li>
          <li>Botga nom bering (masalan: <i>FLOSSO arizalar</i>), keyin username bering — oxiri <b>bot</b> bilan tugashi kerak (masalan: <i>flosso_ariza_bot</i>).</li>
          <li>
            BotFather uzun <b>token</b> beradi (masalan <span className="tabular">123456789:AAH…</span>). Uni nusxalab, pastga qo‘ying.
          </li>
        </ol>
        <form action={saveToken} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-[13px] font-semibold text-ink">Bot tokeni</span>
            <input name="token" autoComplete="off" spellCheck={false} placeholder="123456789:AAH…" className={`${input} tabular`} />
          </label>
          <button type="submit" disabled={savingToken} className={`${btn} bg-red text-white hover:bg-red-deep`}>
            {savingToken && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Saqlash
          </button>
        </form>
        <Note s={tokenState} />
      </section>

      <section className={card}>
        <h2 className="text-[17px] font-bold text-ink">2-qadam. Egasi botga /start bossin</h2>
        <p className="mt-2 text-[15px] text-ink">
          Arizalarni oladigan odam (<b>@Flosso_uz</b>) Telegram’da yangi botni topib, <b>Start</b> (yoki /start) tugmasini bossin. So‘ng shu yerda tugmani bosing — chat_id avtomatik topiladi.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!hasToken || pending} onClick={() => run(findTelegramChatsAction)} className={`${btn} bg-ink text-white hover:bg-ink/85`}>
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            chat_id ni aniqlash
          </button>
          {ready && (
            <button type="button" disabled={pending} onClick={() => run(testTelegramAction)} className={`${btn} border border-ink/20 text-ink hover:border-ink`}>
              Sinov xabari yuborish
            </button>
          )}
        </div>
        {chatState?.chats && (
          <ul className="mt-4 divide-y divide-line rounded-[12px] border border-line">
            {chatState.chats.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-3">
                <span className="text-[15px] text-ink">
                  <b>{c.name}</b>
                  {c.username && <span className="text-ink-soft"> @{c.username}</span>}
                  <span className="block text-[12px] text-ink-soft tabular">chat_id: {c.id}</span>
                </span>
                <button type="button" disabled={pending} onClick={() => run(() => setTelegramChatAction(c.id))} className={`${btn} min-h-10 bg-red text-white hover:bg-red-deep`}>
                  Shu chatni tanlash
                </button>
              </li>
            ))}
          </ul>
        )}
        <Note s={chatState?.chats ? undefined : chatState} />
      </section>

      <section className={card}>
        <h2 className="text-[17px] font-bold text-ink">Boshqa yo‘l (ixtiyoriy)</h2>
        <p className="mt-2 text-[14px] text-ink-soft">
          Token va chat_id ni Netlify → Project configuration → Environment variables’ga ham qo‘yish mumkin: <span className="tabular">TELEGRAM_BOT_TOKEN</span> va{" "}
          <span className="tabular">TELEGRAM_CHAT_ID</span> (bir nechta odam bo‘lsa vergul bilan). Ular bo‘lsa, shu sahifadagi sozlamadan ustun turadi.
        </p>
        {hasToken && !fromEnv && (
          <button type="button" disabled={pending} onClick={() => run(clearTelegramAction)} className="mt-3 text-[14px] font-semibold text-red underline underline-offset-4">
            Bot sozlamalarini o‘chirish
          </button>
        )}
      </section>
    </div>
  );
}
