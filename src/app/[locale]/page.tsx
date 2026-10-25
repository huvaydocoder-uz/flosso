import { getTranslations, setRequestLocale } from "next-intl/server";
import { finalPrice, type Product } from "@data/products";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/hero/Hero";
import { Intro } from "@/components/intro/Intro";
import { Pilasters } from "@/components/ornament/Pilasters";
import { ProductsProvider } from "@/components/ProductsProvider";
import { Catalog } from "@/components/catalog/Catalog";
import { About } from "@/components/sections/About";
import { Brands } from "@/components/sections/Brands";
import { Calculator } from "@/components/sections/Calculator";
import { Choose } from "@/components/sections/Choose";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Gallery } from "@/components/sections/Gallery";
import { Instagram } from "@/components/sections/Instagram";
import { Solutions } from "@/components/sections/Solutions";
import { Process } from "@/components/sections/Process";
import { Why } from "@/components/sections/Why";
import { WhyUs } from "@/components/sections/WhyUs";
import { PromoBand, type PublicPromo } from "@/components/social/PromoBand";
import { getProducts, listBrands } from "@/lib/repo";
import { SITE_URL } from "@/lib/site";

// prices change in the admin panel; it also revalidates on save
export const revalidate = 300;

/** the offer band: every product with a discount set in the admin "Mahsulotlar" page, linked to that product */
function productPromo(p: Product, locale: string, t: Awaited<ReturnType<typeof getTranslations>>): PublicPromo {
  const own = locale === "ru" ? p.names?.ru : locale === "en" ? p.names?.en : p.names?.uz;
  const kind = p.position ? t(`categoryPos.${p.position}`) : t(`category.${p.category}`);
  return {
    id: `product-${p.code}`,
    title: own || p.names?.uz || t("naming.title", { kind, model: Number(p.model) }),
    text: t("promo.productText", { code: p.code }),
    image: p.image,
    discountPercent: p.discountPercent,
    targetType: "product",
    target: p.code,
    startsAt: null,
    endsAt: null,
  };
}

/** the catalog for search engines: every product with its code, picture and price in so‘m */
function catalogData(products: Product[], locale: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  const page = locale === "uz" ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;
  const own = (p: Product) => (locale === "ru" ? p.names?.ru : locale === "en" ? p.names?.en : p.names?.uz);
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: t("meta.itemList"),
    url: `${page}#katalog`,
    itemListElement: products
      .filter((p) => p.active)
      .map((p, i) => {
        const kind = p.position ? t(`categoryPos.${p.position}`) : t(`category.${p.category}`);
        return {
          "@type": "Offer",
          position: i + 1,
          price: finalPrice(p),
          priceCurrency: "UZS",
          availability: "https://schema.org/InStock",
          seller: { "@id": `${SITE_URL}/#organization` },
          itemOffered: {
            "@type": "Product",
            name: `${own(p) || t("naming.title", { kind, model: Number(p.model) })} — ${p.code}`,
            sku: p.code,
            mpn: p.code,
            category: t(`categoryPlural.${p.category}`),
            image: p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`,
            brand: { "@type": "Brand", name: "FLOSSO" },
            material: locale === "ru" ? "пенопласт" : locale === "en" ? "expanded polystyrene" : "penoplast",
          },
        };
      }),
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [products, brands, t] = await Promise.all([getProducts(), listBrands({ onlyActive: true }), getTranslations()]);
  const offers = products.filter((p) => p.active && p.discountPercent > 0).map((p) => productPromo(p, locale, t));

  return (
    <ProductsProvider products={products}>
      <Intro />
      <Pilasters />
      <Header />
      {/* everything sits inside the bay between the pilasters */}
      <div className="bay">
        <main>
          <Hero />
          <Gallery />
          {/* the offer band sits right before the third section */}
          <PromoBand promos={offers} />
          <Why />
          <Choose />
          <Solutions />
          {/* "From workshop to facade": real workshop photos, in place of the old wholesale banner */}
          <Process />
          <Catalog />
          <Calculator />
          <WhyUs />
          <Instagram />
          <Faq />
          <About />
          <Brands brands={brands.map((b) => ({ id: b.id, name: b.name, logo: b.logo }))} />
          <Contact />
        </main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogData(products, locale, t)) }} />
        <Footer />
      </div>
    </ProductsProvider>
  );
}
