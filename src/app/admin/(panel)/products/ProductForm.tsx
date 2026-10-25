"use client";

import { ArrowLeft, ImageUp, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CATEGORIES, finalPrice, type Product } from "@data/products";
import { formatNumber } from "@/lib/format";
import { saveProductAction, type ProductFormState } from "../../actions";

const CAT_NAME: Record<string, string> = {
  FKR: "Karniz (FKR)",
  FNL: "Nalichnik (FNL)",
  FPD: "Podokonnik (FPD)",
  FTK: "Taroq-kolonna (FTK)",
  FIK: "Kolonna igrushkasi (FIK)",
  FIN: "Nalichnik igrushkasi (FIN)",
  FTP: "Termopanel (FTP)",
};

const input =
  "mt-1.5 block min-h-12 w-full rounded-[10px] border border-line bg-foam px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow,background-color] focus:border-red focus:bg-white focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";
const label = "text-[13px] font-semibold text-ink";

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProductAction, undefined);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [discOn, setDiscOn] = useState((product?.discountPercent ?? 0) > 0);
  const [disc, setDisc] = useState(String(product?.discountPercent || 10));
  const [category, setCategory] = useState<string>(product?.category ?? "FKR");
  const err = state?.errors ?? {};
  const after = discOn ? finalPrice({ price: Number(price) || 0, discountPercent: Number(disc) || 0 }) : null;


  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <input type="hidden" name="originalCode" value={product?.code ?? ""} />
      <input type="hidden" name="currentImage" value={product?.image ?? ""} />

      <div className="space-y-6">
        <section className="rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6">
          <h2 className="text-[16px] font-bold text-ink">Asosiy ma’lumot</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={label}>Toifa</label>
              <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} select-chevron appearance-none pr-10`}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{CAT_NAME[c.id]}</option>
                ))}
              </select>
              <FieldError msg={err.category} />
            </div>
            <div>
              <label htmlFor="code" className={label}>Kod (ID)</label>
              <input id="code" name="code" defaultValue={product?.code} placeholder={category === "FIK" ? "FIK(T)04-717" : `${category}01-718`} required className={`${input} font-semibold uppercase tabular`} />
              <p className="mt-1 text-[12px] text-ink-soft">Masalan FKR01-718: 01 — model, 7 — qalinligi, 18 — eni (sm). O‘lchamlar koddan o‘zi olinadi.</p>
              <FieldError msg={err.code} />
            </div>
            <div>
              <label htmlFor="unit" className={label}>Narx birligi</label>
              <select id="unit" name="unit" defaultValue={product?.unit ?? (category === "FIK" || category === "FIN" ? "dona" : "metr")} className={`${input} select-chevron appearance-none pr-10`}>
                <option value="metr">1 metr uchun</option>
                <option value="dona">1 dona uchun</option>
              </select>
            </div>
            <div>
              <label htmlFor="variants" className={label}>Variantlar, sm <span className="font-normal text-ink-soft">(ixtiyoriy)</span></label>
              <input id="variants" name="variants" defaultValue={product?.variants?.join(", ")} placeholder="20, 30, 40" className={`${input} tabular`} />
            </div>
          </div>
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6">
          <h2 className="text-[16px] font-bold text-ink">Nomi (3 tilda)</h2>
          <p className="mt-1 text-[13px] text-ink-soft">Bo‘sh qoldirsangiz, nom avtomatik bo‘ladi: masalan «Karniz, 1-model».</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(
              [
                ["nameUz", "O‘zbekcha", product?.names?.uz],
                ["nameRu", "Ruscha", product?.names?.ru],
                ["nameEn", "Inglizcha", product?.names?.en],
              ] as const
            ).map(([n, l, v]) => (
              <div key={n}>
                <label htmlFor={n} className={label}>{l}</label>
                <input id={n} name={n} defaultValue={v ?? ""} className={input} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6">
          <h2 className="text-[16px] font-bold text-ink">Narx va chegirma</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={label}>Narx, so‘m</label>
              <input id="price" name="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} required className={`${input} font-semibold tabular`} />
              <FieldError msg={err.price} />
            </div>
            <div>
              <span className={label}>Chegirma</span>
              <div className="mt-1.5 flex min-h-12 items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={discOn}
                  aria-label="Chegirmani yoqish"
                  onClick={() => setDiscOn(!discOn)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${discOn ? "bg-red" : "bg-plaster-deep"}`}
                >
                  <span className={`size-5 rounded-full bg-white shadow transition-transform ${discOn ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <input type="hidden" name="discountOn" value={discOn ? "1" : ""} />
                <input
                  aria-label="Chegirma foizi"
                  name="discountPercent"
                  inputMode="numeric"
                  disabled={!discOn}
                  value={disc}
                  onChange={(e) => setDisc(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className={`${input} mt-0 w-20 tabular disabled:opacity-40`}
                />
                <span className="text-ink-soft">%</span>
              </div>
              <FieldError msg={err.discountPercent} />
            </div>
          </div>
          {after !== null && Number(price) > 0 && (
            <p className="mt-4 text-[14px] text-ink-soft tabular">
              Saytda: <s>{formatNumber(Number(price))}</s> → <b className="text-red">{formatNumber(after)} so‘m</b>
            </p>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6">
          <h2 className="text-[16px] font-bold text-ink">Rasm</h2>
          <label className="mt-4 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[12px] border-2 border-dashed border-line bg-foam text-center hover:border-red">
            {preview ? (
              <span className="relative block size-full">
                <Image src={preview} alt="" fill sizes="300px" className="object-contain p-3" unoptimized={preview.startsWith("blob:")} />
              </span>
            ) : (
              <span className="flex flex-col items-center gap-2 p-4 text-[13px] text-ink-soft">
                <ImageUp className="size-8 text-red" aria-hidden="true" />
                Rasm tanlang (PNG, JPG, WEBP — 4 MB gacha)
              </span>
            )}
            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </label>
          <p className="mt-2 text-[12px] text-ink-soft">Eng chiroylisi — fon shaffof (PNG/WEBP) mahsulot rasmi.</p>
          <FieldError msg={err.image} />
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-6">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-[15px] font-semibold text-ink">Saytda ko‘rinsin</span>
              <span className="block text-[12px] text-ink-soft">O‘chirsangiz, mahsulot vaqtincha yashiriladi</span>
            </span>
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} value="1" className="size-6 accent-red" />
          </label>
          <div className="mt-4">
            <label htmlFor="order" className={label}>Tartib raqami</label>
            <input id="order" name="order" inputMode="numeric" defaultValue={product?.order ?? 0} className={`${input} tabular`} />
            <p className="mt-1 text-[12px] text-ink-soft">Kichik raqam — toifada birinchi turadi.</p>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-red px-6 text-[16px] font-semibold text-white hover:bg-red-deep disabled:opacity-80">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Saqlash
          </button>
          <Link href="/admin" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-ink/20 px-6 text-[15px] font-semibold text-ink hover:border-ink">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Ro‘yxatga qaytish
          </Link>
        </div>
      </aside>
    </form>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[13px] font-medium text-red">{msg}</p> : null;
}
