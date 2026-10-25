import { getTranslations } from "next-intl/server";
import type { BrandRow } from "@/lib/repo";
import { Marquee } from "../Marquee";
import { SectionHeading } from "../SectionHeading";

/** each logo hangs in a moulded foam frame, the way FLOSSO trims a window */
function Framed({ b }: { b: Pick<BrandRow, "name" | "logo"> }) {
  return (
    <li className="w-[150px] shrink-0 sm:w-[176px]">
      <figure className="mould group">
        <span className="flex aspect-square items-center justify-center overflow-hidden rounded-[3px] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.logo} alt={b.name} loading="eager" draggable={false} className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
        </span>
        <figcaption className="mt-2 truncate pb-1 text-center text-[11px] font-bold tracking-[0.12em] text-ink-soft uppercase">{b.name}</figcaption>
      </figure>
    </li>
  );
}

export async function Brands({ brands: real }: { brands: Pick<BrandRow, "id" | "name" | "logo">[] }) {
  // partners come from the admin "Brendlar" page; with none the section stays hidden
  if (!real.length) return null;
  const brands = real;
  const t = await getTranslations("brands");
  // enough cards to run edge to edge; Marquee doubles them for a seamless loop
  const base = Array.from({ length: Math.max(1, Math.ceil(8 / brands.length)) }, () => brands).flat();
  const second = [...base].reverse();

  return (
    <section aria-labelledby="brands-title" className="overflow-hidden bg-foam py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <SectionHeading id="brands-title" title={t("title")} lead={t("lead")} align="center" />
      </div>
      {/* both rows can be pulled with the mouse or a finger; on wide screens they slip behind the pilasters */}
      <div className="edge-band brands-mask mt-12 grid gap-6">
        {[base, second].map((row, r) => (
          <Marquee key={r} reverse={r === 1} speed={34}>
            <ul className="flex gap-5 py-2 pr-5 sm:gap-6 sm:pr-6">
              {row.map((b, i) => (
                <Framed key={`${b.id}-${i}`} b={b} />
              ))}
            </ul>
          </Marquee>
        ))}
      </div>
    </section>
  );
}
