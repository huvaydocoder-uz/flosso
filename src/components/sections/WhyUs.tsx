import { getTranslations } from "next-intl/server";
import { SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { Frieze } from "../ornament/Frieze";
import { SectionHeading } from "../SectionHeading";

// values that are pure numbers come from the catalog itself (56 models, 7 categories, 4 sets)
// TODO(owner): years in business / delivery days / projects done, once confirmed
const ROWS = ["own", "range", "solutions", "wholesale", "delivery", "advice"] as const;

export async function WhyUs() {
  const t = await getTranslations("whyUs");

  return (
    <section aria-labelledby="whyus-title" id={SECTION_IDS.whyUs} className="relative bg-foam pb-20 lg:pb-28">
      <Frieze code="FKR02-718" height={26} />
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)] pt-20 lg:pt-24">
        <SectionHeading id="whyus-title" title={t("title")} align="center" />
        {/* each claim on its own framed card: value · claim · proof */}
        <dl className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ROWS.map((r) => (
            <div
              key={r}
              className={`group flex flex-col rounded-[16px] bg-surface p-6 shadow-relief-sm transition-transform duration-500 ease-[var(--ease-glide)] hover:-translate-y-1 sm:p-7 ${frameClass("hover")}`}
            >
              <dt className="flex flex-col">
                <span className="display text-[clamp(30px,3.2vw,46px)] text-red">{t(`rows.${r}.v`)}</span>
                <span className="mt-2 text-[16px] font-semibold text-ink">{t(`rows.${r}.t`)}</span>
              </dt>
              <dd className="mt-3 border-t border-line pt-3 text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">{t(`rows.${r}.d`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
