import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// the three language versions of the one page, each pointing to the others (hreflang),
// with the photos that matter for image search
const IMAGES = ["/og.jpg", "/images/about/feather-full.webp", "/images/about/arch-full.webp", "/images/about/panel-full.webp", "/images/process/store-1.webp", "/images/process/pack-1.webp"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const languages = { uz: `${base}/`, ru: `${base}/ru`, en: `${base}/en`, "x-default": `${base}/` };
  const images = IMAGES.map((i) => `${base}${i}`);
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1, alternates: { languages }, images },
    { url: `${base}/ru`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages }, images },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8, alternates: { languages }, images },
  ];
}
