import { getMessages, getTranslations } from "next-intl/server";
import { SECTION_IDS } from "@/lib/contact";
import { Lattice } from "../ornament/Lattice";
import { SectionHeading } from "../SectionHeading";
import { PhoneMenu } from "../social/PhoneMenu";
import { FaqList } from "./FaqList";

type QA = { q: string; a: string };

// TODO(owner): confirm delivery terms, minimum order and installation advice before launch
export async function Faq() {
  const t = await getTranslations("faq");
  const messages = (await getMessages()) as { faq: { items: QA[] } };
  const items = messages.faq.items;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };

  return (
    <section aria-labelledby="faq-title" id={SECTION_IDS.faq} className="relative bg-foam py-20 lg:py-28">
      <Lattice tone="onLightStrong" size={104} />
      <div className="relative mx-auto max-w-[1440px] px-[var(--gutter)]">
        {/* like khalidmetall.uz: the heading on a plaque across the page, the questions from the left edge to past the middle */}
        <div className="rounded-[16px] bg-surface/95 px-6 py-7 shadow-relief-sm ring-1 ring-line sm:px-10 sm:py-9">
          <p className="mb-4 flex items-center gap-3 text-[12px] font-bold tracking-[0.18em] text-red uppercase">
            <span aria-hidden="true" className="h-px w-9 bg-red" />
            FLOSSO
          </p>
          <SectionHeading id="faq-title" title={t("title")} />
        </div>
        <div className="mt-10 grid max-w-[1000px] gap-4">
          <FaqList items={items} />
          {/* "Didn't find an answer?" with a call button that unfolds both numbers */}
          <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-[17px] font-medium text-ink">{t("more")}</p>
            <PhoneMenu
              align="stretch"
              panelClass="min-w-[280px] text-left"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-surface px-6 text-[16px] font-semibold text-red shadow-relief-sm ring-1 ring-line transition-[background-color,color,transform,box-shadow] duration-300 ease-[var(--ease-glide)] hover:-translate-y-0.5 hover:bg-red hover:text-white hover:shadow-[0_12px_26px_rgb(198_40_40/0.35)] hover:ring-red sm:w-auto"
            />
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
