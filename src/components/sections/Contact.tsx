import { MapPin, Navigation, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MAP_LINKS, SECTION_IDS } from "@/lib/contact";
import { frameClass } from "../FlossoFrame";
import { InstagramIcon, YouTubeIcon } from "../icons";
import { Lattice } from "../ornament/Lattice";
import { PhoneMenu } from "../social/PhoneMenu";
import { InstagramLink, TelegramLink, YouTubeLink } from "../social/SocialLinks";
import { SectionHeading } from "../SectionHeading";
import { ContactForm } from "./ContactForm";

export async function Contact() {
  const t = await getTranslations();
  // the three channels share one row on a computer: smaller, like the footer's channel buttons
  const channel = "sm:col-span-2 sm:min-h-12 sm:gap-1.5 sm:px-3 sm:text-[14px]";
  // white buttons on the red ground; on hover they take the deep red of the section with a white rim
  const ghost =
    "group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[12px] bg-white px-5 text-[16px] font-semibold text-red shadow-[0_10px_24px_rgb(60_8_8/0.3)] ring-1 ring-white transition-[background-color,color,transform,box-shadow] duration-300 ease-[var(--ease-glide)] hover:-translate-y-0.5 hover:bg-red-deep hover:text-white hover:shadow-[0_16px_32px_rgb(40_5_5/0.45)] active:translate-y-0";

  return (
    <>
      <section data-tone="red" aria-labelledby="contact-title" id={SECTION_IDS.contact} className="relative overflow-hidden bg-red text-white">
        <Lattice tone="onRedStrong" size={96} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_0%,rgb(255_255_255/0.14),transparent_60%),radial-gradient(70%_60%_at_0%_100%,rgb(80_8_8/0.35),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-[var(--gutter)] py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 lg:py-28">
          <div className="flex flex-col">
            <h2 id="contact-title" className="display text-[clamp(38px,6vw,84px)]">
              {t("contact.title")}
            </h2>
            <p className="mt-6 max-w-[44ch] text-[18px] leading-relaxed text-white/90">{t("contact.lead")}</p>

            {/* call + "write on Telegram" on top; Instagram, YouTube and the Telegram channel underneath */}
            <div className="mt-10 grid max-w-[640px] gap-3 sm:grid-cols-6">
              <div className="sm:col-span-3">
              <PhoneMenu
                align="stretch"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[12px] bg-white px-5 text-[16px] font-semibold text-red shadow-[0_10px_24px_rgb(60_8_8/0.3)] ring-1 ring-white transition-[transform,background-color,color,box-shadow] duration-300 ease-[var(--ease-glide)] hover:-translate-y-0.5 hover:bg-red-deep hover:text-white hover:shadow-[0_16px_32px_rgb(40_5_5/0.45)]"
                panelClass="min-w-[280px]"
              />
              </div>
              <TelegramLink className={`${ghost} sm:col-span-3`}>
                <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                {t("contact.telegram")}
              </TelegramLink>
              <InstagramLink className={`${ghost} ${channel}`}>
                <InstagramIcon className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-[8deg]" />
                {t("contact.instagram")}
              </InstagramLink>
              <YouTubeLink className={`${ghost} ${channel}`}>
                <YouTubeIcon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                {t("contact.youtube")}
              </YouTubeLink>
              <TelegramLink className={`${ghost} ${channel}`}>
                <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                {t("social.telegram")}
              </TelegramLink>
            </div>
          </div>

          <div className={`relative rounded-[18px] bg-surface p-6 text-ink shadow-[0_24px_60px_rgb(60_8_8/0.45)] sm:p-9 ${frameClass("spin")}`}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* the address: the plaque and the map are two separate cards side by side */}
      <section aria-labelledby="map-title" className="relative bg-foam py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
          <SectionHeading id="map-title" title={t("map.heading")} align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8">
            <div className={`flex flex-col rounded-[18px] bg-surface p-6 text-ink shadow-relief-md sm:p-8 ${frameClass("static")}`}>
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red text-white shadow-[0_6px_16px_rgb(198_40_40/0.35)]">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold tracking-[0.08em] text-red uppercase">{t("map.title")}</p>
                  <p className="mt-1 text-[21px] leading-snug font-semibold">{t("map.address")}</p>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{t("map.note")}</p>
              <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <a
                  href={MAP_LINKS.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-red px-4 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-red-deep"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  {t("map.route")}
                </a>
                <a
                  href={MAP_LINKS.yandex}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-ink/20 px-4 text-[15px] font-semibold text-ink transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-ink"
                >
                  {t("map.yandex")}
                </a>
              </div>
            </div>

            <div className="map-frame overflow-hidden rounded-[18px] bg-surface p-2 shadow-relief-lg sm:p-3">
              <div className="relative overflow-hidden rounded-[12px]">
                <iframe
                  title={`${t("map.title")}: ${t("map.address")}`}
                  src={MAP_LINKS.embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="map-embed block h-[340px] w-full border-0 sm:h-[420px] lg:h-[480px]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-[12px] shadow-[inset_0_0_0_1px_rgb(26_26_26/0.08),inset_0_2px_12px_rgb(26_26_26/0.12)]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
