"use client";

import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addBrandAction, deleteBrandAction, toggleBrandAction, type BrandFormState } from "../../actions";

type Item = { id: string; name: string; logo: string; sortOrder: number; active: boolean };

const input =
  "mt-1.5 block min-h-12 w-full rounded-[10px] border border-line bg-foam px-4 text-[15px] text-ink outline-none focus:border-red focus:bg-white focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";

export function BrandsAdmin({ items }: { items: Item[] }) {
  const [state, action, saving] = useActionState<BrandFormState, FormData>(addBrandAction, undefined);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  // a saved brand clears the form for the next one
  useEffect(() => {
    if (!state?.ok) return;
    form.current?.reset();
    const id = requestAnimationFrame(() => setPreview(null));
    return () => cancelAnimationFrame(id);
  }, [state]);

  return (
    <div className="mt-8 space-y-6">
      <form ref={form} action={action} className="grid gap-4 rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:grid-cols-[140px_1fr] sm:p-6">
        <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border-2 border-dashed border-line bg-foam hover:border-red">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-contain p-2" />
          ) : (
            <span className="flex flex-col items-center gap-1 p-2 text-center text-[12px] text-ink-soft">
              <ImageUp className="size-7 text-red" aria-hidden="true" />
              Logotip
            </span>
          )}
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        <div className="grid content-start gap-3">
          <label>
            <span className="text-[13px] font-semibold text-ink">Brend nomi</span>
            <input name="name" maxLength={60} placeholder="Masalan: Buxoro Qurilish" className={input} />
          </label>
          <label className="max-w-[200px]">
            <span className="text-[13px] font-semibold text-ink">Tartib raqami</span>
            <input name="sortOrder" inputMode="numeric" defaultValue={items.length + 1} className={`${input} tabular`} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-red px-6 text-[15px] font-semibold text-white hover:bg-red-deep disabled:opacity-70">
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Brend qo‘shish
            </button>
            {state?.error && <span className="text-[14px] font-medium text-red">{state.error}</span>}
            {state?.ok && <span className="text-[14px] font-medium text-[#1f6b36]">Qo‘shildi. Saytda 1 daqiqa ichida chiqadi.</span>}
          </div>
          <p className="text-[12px] text-ink-soft">Logotip kvadrat yoki gorizontal bo‘lsin, oq yoki shaffof fonda eng chiroyli chiqadi. 2 MB gacha.</p>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="rounded-[14px] bg-white p-8 text-center text-[15px] text-ink-soft shadow-[inset_0_0_0_1px_var(--line)]">Hali brend yo‘q — bo‘lim saytda yashirin turibdi.</p>
      ) : (
        <ul className={`grid gap-3 sm:grid-cols-2 ${pending ? "opacity-70" : ""}`}>
          {items.map((b) => (
            <li key={b.id} className="flex items-center gap-4 rounded-[14px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--line)]">
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-foam">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt="" className="size-full object-contain p-1.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">{b.name}</span>
                <span className="block text-[12px] text-ink-soft tabular">Tartib: {b.sortOrder}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={b.active}
                aria-label="Saytda ko‘rsatish"
                onClick={() => start(() => toggleBrandAction(b.id, !b.active))}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${b.active ? "bg-red" : "bg-plaster-deep"}`}
              >
                <span className={`size-5 rounded-full bg-white shadow transition-transform ${b.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <button
                type="button"
                aria-label="O‘chirish"
                onClick={() => confirm(`«${b.name}» o‘chirilsinmi?`) && start(() => deleteBrandAction(b.id))}
                className="inline-flex size-11 items-center justify-center rounded-[10px] text-ink-soft hover:bg-red/10 hover:text-red"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
