import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InlineScript } from "@/components/InlineScript";
import { ChatWidget } from "@/components/social/ChatWidget";
import { FloatingActions } from "@/components/social/FloatingActions";
import { Toaster } from "@/components/social/Toaster";
import { INTRO_BOOT, THEME_BOOT } from "@/lib/boot";
import { routing } from "@/i18n/routing";
import { CONTACT, MAP_LINKS } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";
import "../fonts.css";
import "../globals.css";

const DESCRIPTION: Record<string, string> = {
  uz: "Penoplastdan fasad dekori ishlab chiqarish: karniz, nalichnik, podokonnik, kolonna, termopanel",
  ru: "Производство фасадного декора из пенопласта: карнизы, наличники, подоконники, колонны, термопанели",
  en: "Polystyrene facade decor manufacturer: cornices, window casings, sills, columns, thermal panels",
};

/** one graph: the company, the site, this language's page and the workshop as a local business */
function structuredData(locale: string, keywords: string[]) {
  const page = locale === routing.defaultLocale ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;
  const org = `${SITE_URL}/#organization`;
  const sameAs = [CONTACT.instagramHref, CONTACT.telegramHref, CONTACT.youtubeHref];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: "FLOSSO",
        url: SITE_URL,
        logo: `${SITE_URL}/logo/flosso-logo.svg`,
        foundingDate: "2018-11-01",
        sameAs,
        contactPoint: [
          { "@type": "ContactPoint", telephone: "+998948903333", contactType: "sales", areaServed: "UZ", availableLanguage: ["uz", "ru"] },
          { "@type": "ContactPoint", telephone: "+998998993515", contactType: "sales", areaServed: "UZ", availableLanguage: ["uz", "ru"] },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "FLOSSO",
        inLanguage: ["uz", "ru", "en"],
        publisher: { "@id": org },
      },
      {
        "@type": "WebPage",
        "@id": `${page}#webpage`,
        url: page,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        primaryImageOfPage: `${SITE_URL}/og.jpg`,
      },
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE_URL}/#business`,
        name: "FLOSSO",
        parentOrganization: { "@id": org },
        foundingDate: "2018-11-01",
        description: DESCRIPTION[locale] ?? DESCRIPTION.uz,
        keywords: keywords.join(", "),
        url: SITE_URL,
        image: `${SITE_URL}/og.jpg`,
        logo: `${SITE_URL}/logo/flosso-logo.svg`,
        telephone: ["+998948903333", "+998998993515"],
        hasMap: MAP_LINKS.google,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Namozgoh ko‘chasi",
          addressLocality: "Buxoro",
          addressRegion: "Buxoro viloyati",
          postalCode: "200130",
          addressCountry: "UZ",
        },
        geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
        areaServed: { "@type": "Country", name: "Uzbekistan" },
        knowsLanguage: ["uz", "ru", "en"],
        sameAs,
        priceRange: "$$",
      },
    ],
  };
}

const OG_LOCALE: Record<string, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };

// the three language pages are rendered on the first visit and then cached (revalidate in page.tsx),
// not at build time: their prerendered copies (~1.9 MB each) failed to upload over a slow connection
export function generateStaticParams() {
  return [];
}

export const viewport: Viewport = {
  themeColor: "#faf7f5",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    applicationName: "FLOSSO",
    authors: [{ name: "FLOSSO", url: SITE_URL }],
    creator: "FLOSSO",
    publisher: "FLOSSO",
    category: "construction",
    formatDetection: { telephone: true, address: true },
    alternates: {
      canonical: path,
      languages: { uz: "/", ru: "/ru", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: path,
      siteName: "FLOSSO",
      locale: OG_LOCALE[locale] ?? "uz_UZ",
      alternateLocale: Object.entries(OG_LOCALE)
        .filter(([l]) => l !== locale)
        .map(([, v]) => v),
      type: "website",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/og.jpg"] },
    icons: { icon: "/logo/flosso-mark.svg" },
    // Google Search Console and Yandex Webmaster: the code from their "meta tag" verification
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
      ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    other: { "geo.region": "UZ-BU", "geo.placename": "Buxoro", "geo.position": `${CONTACT.geo.lat};${CONTACT.geo.lng}`, ICBM: `${CONTACT.geo.lat}, ${CONTACT.geo.lng}` },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const keywords = (await getTranslations({ locale, namespace: "meta" })).raw("keywords") as string[];
  // React hoists these itself, so they never drift from what hydration expects
  preload("/fonts/manrope-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/poiret-one-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* first thing in <body>: runs before any content paints; <head> is left to React so hosts can't reorder it */}
        <InlineScript html={THEME_BOOT + INTRO_BOOT} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(locale, keywords)) }} />
        <NextIntlClientProvider>
          {children}
          {/* on every page: call-back + back-to-top (bottom right), the chat (bottom left) */}
          <FloatingActions />
          <ChatWidget ai={Boolean(process.env.ANTHROPIC_API_KEY?.trim())} />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
