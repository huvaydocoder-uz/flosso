"use client";

import { Check, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CATEGORIES, finalPrice, type CategoryId, type Product } from "@data/products";
import { formatNumber } from "@/lib/format";
import { deleteProductAction, quickUpdateAction } from "../actions";

const CAT_NAME: Record<CategoryId, string> = {
  FKR: "Karnizlar",
  FNL: "Nalichniklar",
  FPD: "Podokonniklar",
  FTK: "Taroq-kolonnalar",
  FIK: "Kolonna igrushkalari",
  FIN: "Nalichnik igrushkalari",
  FTP: "Termopanellar",
};

export function ProductTable({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");
  const rank = (c: CategoryId) => CATEGORIES.findIndex((x) => x.id === c);
  const list = useMemo(
    () =>
      products
        .filter((p) => (cat === "all" || p.category === cat) && p.code.toLowerCase().includes(q.trim().toLowerCase().replace(/\s/g, "")))
        .sort((a, b) => rank(a.category) - rank(b.category) || a.order - b.order),
    [products, cat, q],
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
          {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap ${cat === c ? "bg-ink text-white" : "bg-white text-ink shadow-[inset_0_0_0_1px_var(--line)]"}`}
            >
              {c === "all" ? "Hammasi" : CAT_NAME[c]}
            </button>
          ))}
        </div>
        <label className="relative lg:ml-auto lg:w-64">
          <span className="sr-only">Kod bo‘yicha qidirish</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-pencil" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kod: FKR01…" className="min-h-10 w-full rounded-full border border-line bg-white pr-4 pl-9 text-[14px] outline-none focus:border-red" />
        </label>
      </div>

      {/* desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-[14px] bg-white shadow-[inset_0_0_0_1px_var(--line)] md:block">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-foam text-[12px] text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Mahsulot</th>
              <th scope="col" className="px-3 py-3 font-semibold">Narx, so‘m</th>
              <th scope="col" className="px-3 py-3 font-semibold">Chegirma</th>
              <th scope="col" className="px-3 py-3 font-semibold">Saytda</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => (
              <Row key={p.code} p={p} />
            ))}
          </tbody>
        </table>
      </div>

      {/* phone cards */}
      <ul className="mt-4 space-y-3 md:hidden">
        {list.map((p) => (
          <Row key={p.code} p={p} card />
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-center text-[14px] text-ink-soft">Hech narsa topilmadi.</p>}
    </div>
  );
}

function Row({ p, card }: { p: Product; card?: boolean }) {
  const [price, setPrice] = useState(String(p.price));
  const [disc, setDisc] = useState(String(p.discountPercent));
  const [active, setActive] = useState(p.active);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // last saved values: the server props refresh only on the next navigation
  const [base, setBase] = useState({ price: p.price, disc: p.discountPercent });

  const dirty = Number(price) !== base.price || Number(disc) !== base.disc;
  const now = finalPrice({ price: Number(price) || 0, discountPercent: Number(disc) || 0 });

  const save = (patch: Parameters<typeof quickUpdateAction>[1]) =>
    start(async () => {
      setError(null);
      const r = await quickUpdateAction(p.code, patch);
      if (r && "error" in r) setError(r.error === "price" ? "Narx noto‘g‘ri" : "Chegirma 0–90%");
      else {
        setBase((b) => ({ price: patch.price ?? b.price, disc: patch.discountPercent ?? b.disc }));
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1500);
      }
    });

  const del = () => {
    if (window.confirm(`${p.code} o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.`)) start(() => deleteProductAction(p.code));
  };

  const num = "min-h-10 w-full rounded-[8px] border border-line bg-foam px-3 text-[14px] font-semibold tabular outline-none focus:border-red focus:bg-white";
  const priceInput = (
    <input
      aria-label={`${p.code} narxi`}
      inputMode="numeric"
      value={price}
      onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 9))}
      onKeyDown={(e) => e.key === "Enter" && dirty && save({ price: Number(price), discountPercent: Number(disc) })}
      className={num}
    />
  );
  const discInput = (
    <div className="flex items-center gap-2">
      <input
        aria-label={`${p.code} chegirma foizi`}
        inputMode="numeric"
        value={disc}
        onChange={(e) => setDisc(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onKeyDown={(e) => e.key === "Enter" && dirty && save({ price: Number(price), discountPercent: Number(disc) })}
        className={`${num} !w-16`}
      />
      <span className="text-ink-soft">%</span>
    </div>
  );
  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${p.code} saytda ko‘rinsin`}
      onClick={() => {
        setActive(!active);
        save({ active: !active });
      }}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${active ? "bg-red" : "bg-plaster-deep"}`}
    >
      <span className={`size-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
  const actions = (
    <div className="flex items-center justify-end gap-1">
      {dirty && (
        <button
          type="button"
          onClick={() => save({ price: Number(price), discountPercent: Number(disc) })}
          disabled={pending}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-[8px] bg-red px-3 text-[13px] font-semibold text-white hover:bg-red-deep"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
          Saqlash
        </button>
      )}
      {saved && !dirty && <span className="px-2 text-[13px] font-semibold text-[#1d6b34]">Saqlandi ✓</span>}
      <Link href={`/admin/products/${encodeURIComponent(p.code)}`} aria-label={`${p.code} tahrirlash`} className="inline-flex size-10 items-center justify-center rounded-[8px] text-ink-soft hover:bg-foam hover:text-ink">
        <Pencil className="size-4" aria-hidden="true" />
      </Link>
      <button type="button" onClick={del} aria-label={`${p.code} o‘chirish`} className="inline-flex size-10 items-center justify-center rounded-[8px] text-ink-soft hover:bg-red/10 hover:text-red">
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
  const who = (
    <div className="flex items-center gap-3">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-[8px] bg-foam">
        <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-1" />
      </span>
      <span>
        <span className="block font-bold text-ink tabular">{p.code}</span>
        <span className="block text-[12px] text-ink-soft">
          {CAT_NAME[p.category]} · {p.unit === "metr" ? "1 metr" : "1 dona"}
          {Number(disc) > 0 && <b className="ml-1 text-red">→ {formatNumber(now)}</b>}
        </span>
      </span>
    </div>
  );

  if (card) {
    return (
      <li className={`rounded-[14px] bg-white p-4 shadow-[inset_0_0_0_1px_var(--line)] ${active ? "" : "opacity-60"}`}>
        <div className="flex items-start justify-between gap-3">
          {who}
          {toggle}
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <label className="text-[12px] text-ink-soft">
            Narx, so‘m
            {priceInput}
          </label>
          <label className="text-[12px] text-ink-soft">
            Chegirma
            {discInput}
          </label>
        </div>
        {error && <p className="mt-2 text-[13px] font-medium text-red">{error}</p>}
        <div className="mt-2">{actions}</div>
      </li>
    );
  }

  return (
    <tr className={active ? "" : "bg-foam/60 text-ink-soft"}>
      <td className="px-4 py-2.5">{who}</td>
      <td className="w-40 px-3 py-2.5">
        {priceInput}
        {error && <p className="mt-1 text-[12px] font-medium text-red">{error}</p>}
      </td>
      <td className="w-32 px-3 py-2.5">{discInput}</td>
      <td className="w-24 px-3 py-2.5">{toggle}</td>
      <td className="px-4 py-2.5">{actions}</td>
    </tr>
  );
}
