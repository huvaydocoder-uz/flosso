import { MapPin, Phone, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CONTACT, MAP_LINKS, SECTION_IDS } from "@/lib/contact";
import { InstagramIcon, YouTubeIcon } from "./icons";
import { Logo } from "./Logo";
import { Frieze } from "./ornament/Frieze";
import { Lattice } from "./ornament/Lattice";
import { InstagramLink, TelegramLink, YouTubeLink } from "./social/SocialLinks";

const NAV = ["catalog", "solutions", "calculator", "about", "contact"] as const;

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  const link = "inline-flex min-h-10 items-center gap-2.5 text-[15px] text-white/90 transition-colors hover:text-white";
  const pill =
    "btn-shine group relative inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-[12px] bg-white px-4 text-[15px] font-semibold text-red shadow-[0_6px_16px_rgb(30_5_5/0.3)] ring-1 ring-white transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-glide)] hover:-translate-y-0.5 hover:bg-red-deep hover:text-white hover:shadow-[0_14px_28px_rgb(30_5_5/0.4)] active:translate-y-0 active:scale-[0.97]";

  return (
    <footer data-tone="red" className="relative bg-red text-white">
      <Frieze code="FKR04-817" height={36} />
      <Lattice tone="onRed" size={96} />
      <div className="relative mx-auto grid max-w-[1440px] gap-12 px-[var(--gutter)] pt-16 pb-10 md:grid-cols-[1.4fr_1fr_1.2fr] md:gap-10 lg:pt-20">
        <div className="max-w-[44ch]">
          <Logo tone="white" className="h-9 w-auto" />
          <p className="mt-6 text-[15px] leading-relaxed text-white/90">{t("footer.about")}</p>
        </div>

        <nav aria-label={t("footer.menu")}>
          <h2 className="text-[13px] font-semibold tracking-[0.12em] text-white/75 uppercase">{t("footer.menu")}</h2>
          <ul className="mt-4 space-y-1">
            {NAV.map((key) => (
              <li key={key}>
                <a href={`#${SECTION_IDS[key]}`} className={`${link} hover:translate-x-1 transition-[color,transform]`}>
                  {t(`nav.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[13px] font-semibold tracking-[0.12em] text-white/75 uppercase">{t("footer.contact")}</h2>
          {/* the numbers as plain links, then the three channels as buttons as wide as their text */}
          <ul className="mt-4 space-y-1">
            {[
              [CONTACT.phoneHref, CONTACT.phoneDisplay],
              [CONTACT.phone2Href, CONTACT.phone2Display],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="group inline-flex min-h-11 items-center gap-3 text-[17px] font-semibold text-white tabular transition-opacity hover:opacity-85">
                  <Phone className="phone-ring size-[18px]" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-3 grid w-max max-w-full gap-2">
            <li>
              <TelegramLink className={`${pill} w-full`}>
                <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                {t("social.telegram")}
              </TelegramLink>
            </li>
            <li>
              <InstagramLink className={`${pill} w-full`}>
                <InstagramIcon className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]" />
                {t("contact.instagram")}
              </InstagramLink>
            </li>
            <li>
              <YouTubeLink className={`${pill} w-full`}>
                <YouTubeIcon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                {t("contact.youtube")}
              </YouTubeLink>
            </li>
          </ul>
          <a href={MAP_LINKS.google} target="_blank" rel="noopener noreferrer" className={`${link} mt-3`}>
            <MapPin className="size-4" aria-hidden="true" />
            {t("map.address")}
          </a>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-white/25 px-[var(--gutter)] pt-6 pb-[calc(env(safe-area-inset-bottom)+88px)] text-[13px] text-white/80 sm:flex-row sm:justify-between lg:pb-6">
        <p>
          © {year} FLOSSO. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
