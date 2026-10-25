import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SOLUTIONS } from "@data/solutions";
import { SECTION_IDS } from "@/lib/contact";
import { WALLS } from "@/lib/walls";
import { SectionHeading } from "../SectionHeading";
import { SolutionLink } from "../SolutionLink";

// the four catalog sets, each on a different wall

export async function Gallery() {
  const t = await getTranslations();
  const tile = "w-[84vw] max-w-[520px] shrink-0 snap-start sm:w-[60vw] lg:w-auto lg:max-w-none";

  return (
    <section aria-labelledby="gallery-title" id={SECTION_IDS.gallery} className="bg-foam py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <SectionHeading id="gallery-title" title={t("gallery.title")} lead={t("gallery.lead")} align="center" />
      </div>

      <ul className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:pb-0">
        {SOLUTIONS.map((s, i) => {
          const wall = WALLS[i];
          const main = s.items.filter((it) => ["cornice", "casing", "sill", "column"].includes(it.role)).map((it) => it.code);
          return (
            <li key={s.id} className={tile}>
              <SolutionLink id={s.id} className="group block overflow-hidden rounded-[14px] bg-surface shadow-relief-sm transition-shadow duration-300 hover:shadow-relief-md">
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[clamp(280px,26vw,400px)]" style={wall.style}>
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,rgb(255_255_255/0.35),transparent_60%)]" />
                  <Image
                    src={s.image}
                    alt={`${t("gallery.item", { n: s.id })} — ${t(`gallery.walls.${wall.key}`)}`}
                    fill
                    sizes="(min-width: 1024px) 45vw, 84vw"
                    className="object-contain p-[6%] drop-shadow-[5px_10px_8px_rgb(40_25_20/0.35)] transition-transform duration-700 ease-[var(--ease-glide)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-[12px] font-semibold text-ink-soft">{t("gallery.badge")}</span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
                  <p className="text-[16px] font-semibold text-ink">
                    {t("gallery.item", { n: s.id })} <span className="font-normal text-ink-soft">· {t(`gallery.walls.${wall.key}`)}</span>
                  </p>
                  <p className="text-[12px] tracking-[0.02em] text-pencil tabular">{main.join(" · ")}</p>
                </div>
              </SolutionLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
