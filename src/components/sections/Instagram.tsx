import { ArrowUpRight, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { SECTION_IDS } from "@/lib/contact";
import { InstagramIcon, YouTubeIcon } from "../icons";
import { Logo } from "../Logo";
import { SectionHeading } from "../SectionHeading";
import { InstagramLink, TelegramLink, YouTubeLink } from "../social/SocialLinks";

// one long red band of the brand, running like a shop banner
const RUN = Array.from({ length: 8 }, (_, i) => i);

function Band() {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
      {RUN.map((i) => (
        <span key={i} className="flex items-center gap-10 sm:gap-16">
          <Logo tone="white" className="h-7 w-auto sm:h-9" title="" />
          <Logo tone="white" markOnly className="h-4 w-auto opacity-55 sm:h-5" title="" />
        </span>
      ))}
    </div>
  );
}

const btn =
  "btn-shine group relative inline-flex min-h-[68px] w-full items-center gap-4 overflow-hidden rounded-[16px] px-5 text-left transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-glide)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]";

function Inner({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] transition-transform duration-500 ease-[var(--ease-settle)] group-hover:-rotate-[8deg] group-hover:scale-110">{icon}</span>
      <span className="flex-1 text-[18px] font-bold tracking-[0.01em]">{label}</span>
      <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
    </>
  );
}

export async function Instagram() {
  const t = await getTranslations();

  return (
    <section aria-labelledby="ig-title" id={SECTION_IDS.instagram} className="overflow-hidden bg-surface pt-12 pb-20 lg:pt-14 lg:pb-28">
      {/* on wide screens the band stops at the pilasters instead of running over them */}
      <div className="edge-band overflow-hidden py-3">
        <div aria-hidden="true" data-tone="red" className="ig-band relative -rotate-[1.2deg] bg-red py-5 shadow-relief-md sm:py-6">
          <div className="ig-run flex w-max">
            <Band />
            <Band />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1440px] px-[var(--gutter)] lg:mt-12">
        <SectionHeading id="ig-title" title={t("instagram.title")} lead={t("instagram.lead")} align="center" />

        {/* YouTube · Instagram · Telegram — side by side on a computer, stacked on a phone */}
        <div className="mx-auto mt-10 grid max-w-[1080px] gap-3 sm:gap-4 lg:grid-cols-3">
          <YouTubeLink className={`${btn} bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--line),0_8px_22px_-10px_rgb(40_25_20/0.25)] hover:bg-[#ff0033] hover:text-white hover:shadow-[0_18px_36px_-12px_rgb(255_0_51/0.5)]`}>
            <Inner icon={<YouTubeIcon className="size-6 text-[#ff0033] transition-colors group-hover:text-white" />} label={t("social.youtube")} />
          </YouTubeLink>
          <InstagramLink className={`${btn} bg-red text-white shadow-[0_10px_26px_rgb(140_25_25/0.35)] hover:bg-red-deep hover:shadow-[0_18px_40px_rgb(140_25_25/0.45)]`}>
            <Inner icon={<span className="flex size-11 items-center justify-center rounded-[12px] bg-white text-red"><InstagramIcon className="size-6" /></span>} label={t("social.instagram")} />
          </InstagramLink>
          <TelegramLink className={`${btn} bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--line),0_8px_22px_-10px_rgb(40_25_20/0.25)] hover:bg-[#229ed9] hover:text-white hover:shadow-[0_18px_36px_-12px_rgb(34_158_217/0.5)]`}>
            <Inner icon={<Send className="size-6 text-[#229ed9] transition-colors group-hover:text-white" aria-hidden="true" />} label={t("social.telegram")} />
          </TelegramLink>
        </div>
      </div>
    </section>
  );
}
