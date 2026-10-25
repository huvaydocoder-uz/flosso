/** Contact facts: the owner's Instagram (@flosso_decor) bio + catalog PDF. */
export const CONTACT = {
  // calls go to the Instagram number (owner's choice)
  phoneDisplay: "+998 94 890 33 33",
  phoneHref: "tel:+998948903333",
  // catalog number
  phone2Display: "+998 99 899 35 15",
  phone2Href: "tel:+998998993515",
  instagramHandle: "flosso_decor",
  instagramHref: "https://www.instagram.com/flosso_decor/",
  instagramApp: "instagram://user?username=flosso_decor",
  // the one Telegram address on the site (change it here only)
  telegramHandle: "Flosso_uz",
  telegramHref: "https://t.me/Flosso_uz",
  youtubeHref: "https://www.youtube.com/@flosso_decor",
  geo: { lat: 39.748572, lng: 64.39705 },
} as const;

export const MAP_LINKS = {
  embed: `https://maps.google.com/maps?q=${CONTACT.geo.lat},${CONTACT.geo.lng}&z=16&hl=uz&output=embed`,
  google: `https://www.google.com/maps/search/?api=1&query=${CONTACT.geo.lat},${CONTACT.geo.lng}`,
  route: `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.geo.lat},${CONTACT.geo.lng}`,
  yandex: `https://yandex.uz/maps/?pt=${CONTACT.geo.lng},${CONTACT.geo.lat}&z=16&l=map`,
};

export const SECTION_IDS = {
  gallery: "ishlar",
  why: "nima-uchun",
  choose: "tanlash",
  process: "ish-jarayoni",
  catalog: "katalog",
  solutions: "tayyor-yechimlar",
  calculator: "kalkulyator",
  whyUs: "nega-biz",
  instagram: "instagram",
  faq: "savollar",
  about: "biz-haqimizda",
  contact: "aloqa",
} as const;

