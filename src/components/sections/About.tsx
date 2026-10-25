import { getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/repo";
import { SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { SectionHeading } from "../SectionHeading";
import { AboutPhotos } from "./AboutPhotos";

// FLOSSO's own showroom: decor on finished walls (owner's iPhone RAW photos, graded to the site palette);
// the wide one on top is shown whole (4:3) so its frame is not cut
const PHOTOS = [
  { key: "feather", src: "/images/about/feather-full.webp", full: "/images/about/feather-full.webp", cls: "col-span-2 aspect-[4/3]" },
  { key: "arch", src: "/images/about/arch.webp", full: "/images/about/arch-full.webp", cls: "aspect-square" },
  { key: "panel", src: "/images/about/panel.webp", full: "/images/about/panel-full.webp", cls: "aspect-square" },
] as const;

// the company's first working day (from the owner)
const FOUNDED = new Date("2018-11-01T00:00:00+05:00");

/** whole years since the founding day */
function yearsSince(d: Date) {
  const now = new Date();
  let y = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) y--;
  return y;
}

export async function About() {
  const t = await getTranslations("about");
  const models = (await getProducts()).length;
  const STATS = [
    { k: "year", v: t("stats.year.v") },
    { k: "exp", v: t("stats.exp.v", { n: yearsSince(FOUNDED) }) },
    { k: "range", v: t("stats.range.v", { n: models }) },
    { k: "made", v: t("stats.made.v") },
  ] as const;

  return (
    <section aria-labelledby="about-title" id={SECTION_IDS.about} className="bg-surface py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-[var(--gutter)] lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-red/[0.08] py-1.5 pr-4 pl-1.5 text-[13px] font-bold tracking-[0.06em] text-red uppercase">
            <span className="rounded-full bg-red px-2.5 py-0.5 text-white tabular">2018</span>
            {t("since")}
          </p>
          <SectionHeading id="about-title" title={t("title")} />
          <div className={`mt-8 rounded-[16px] bg-foam p-5 sm:p-7 ${frameClass("spin")}`}>
            <p className="max-w-[60ch] text-[19px] leading-relaxed font-medium text-ink">{t("lead")}</p>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-ink">{t("p1")}</p>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">{t("p2")}</p>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.k} className={`rounded-[14px] bg-foam px-4 py-4 transition-transform duration-300 hover:-translate-y-0.5 ${frameClass("hover")}`}>
                <dt className="sr-only">{t(`stats.${s.k}.t`)}</dt>
                <dd>
                  <span className="block text-[clamp(24px,2.4vw,32px)] leading-none font-bold text-red tabular">{s.v}</span>
                  <span className="mt-2 block text-[13px] leading-snug text-ink-soft">{t(`stats.${s.k}.t`)}</span>
                </dd>
              </div>
            ))}
          </dl>
          <blockquote className={`mt-10 rounded-[16px] border-l-4 border-red bg-foam py-6 pr-6 pl-6 ${frameClass("static")}`}>
            <p className="display text-[clamp(22px,2.4vw,32px)] leading-[1.15] text-ink">{t("quote")}</p>
          </blockquote>
        </div>

        <AboutPhotos zoom={t("zoom")} photos={PHOTOS.map((p) => ({ ...p, alt: t(`photos.${p.key}`) }))} />
      </div>
    </section>
  );
}
