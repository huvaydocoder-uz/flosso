import { BadgePercent, Building2, Feather, ShieldCheck, ThermometerSun } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { ProfileDrawing } from "../ProfileDrawing";
import { SectionHeading } from "../SectionHeading";

const ITEMS = [
  { key: "beauty", Icon: Building2 },
  { key: "warm", Icon: ThermometerSun },
  { key: "light", Icon: Feather },
  { key: "durable", Icon: ShieldCheck },
  { key: "price", Icon: BadgePercent },
] as const;

export async function Why() {
  const t = await getTranslations();

  return (
    <section aria-labelledby="why-title" id={SECTION_IDS.why} className="profile-wall py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start">
          {/* the heading sits on its own plaque so the red pattern never runs through the letters */}
          <div className="rounded-[16px] bg-surface/95 p-6 shadow-relief-sm sm:p-8">
            <SectionHeading id="why-title" title={t("why.title")} lead={t("why.lead")} />
          </div>
          <div className="mt-10 max-w-[440px] rounded-[14px] bg-surface p-6 shadow-relief-md sm:p-8">
            <figure>
              <ProfileDrawing code="FKR01-718" cm={t("units.cm")} title={t("why.drawing")} />
              <figcaption className="mt-3 text-center text-[13px] text-pencil tabular">{t("why.drawing")}</figcaption>
            </figure>
          </div>
        </div>

        <ul className="grid gap-4 sm:gap-5">
          {ITEMS.map(({ key, Icon }, i) => (
            <li
              key={key}
              className={`group grid grid-cols-[44px_1fr] gap-x-5 rounded-[16px] bg-surface p-5 shadow-relief-sm transition-transform duration-500 ease-[var(--ease-glide)] hover:-translate-y-1 sm:grid-cols-[56px_1fr] sm:p-7 ${frameClass("spin")}`}
              style={{ "--fframe-delay": `${-i * 1.4}s` } as CSSProperties}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-surface text-red shadow-relief-sm ring-1 ring-red/15 transition-[background-color,color,transform,box-shadow] duration-500 ease-[var(--ease-settle)] group-hover:-rotate-[10deg] group-hover:scale-110 group-hover:bg-red group-hover:text-white group-hover:shadow-[0_8px_22px_rgb(198_40_40/0.4)] sm:size-14">
                <Icon className="size-5 sm:size-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[20px] font-semibold text-ink transition-colors duration-300 group-hover:text-red sm:text-[22px]">{t(`why.items.${key}.t`)}</h3>
                <p className="mt-2 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft">{t(`why.items.${key}.d`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
