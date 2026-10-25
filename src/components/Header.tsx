"use client";

import { ChevronDown, LayoutGrid, MessageSquareText, Phone, Send } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_COVER, slugOf, type CategoryId } from "@data/products";
import { CONTACT, SECTION_IDS } from "@/lib/contact";
import { openCategory } from "@/lib/events";
import { LangFlags } from "./header/LangFlags";
import { ThemeToggle } from "./header/ThemeToggle";
import { InstagramIcon } from "./icons";
import { Logo } from "./Logo";
import { pilasterGradient } from "./ornament/Frieze";
import { useProducts } from "./ProductsProvider";
import { PhoneMenu } from "./social/PhoneMenu";
import { InstagramLink } from "./social/SocialLinks";

const NAV = ["catalog", "solutions", "calculator", "about", "contact"] as const;
type BarKey = "call" | "telegram" | "catalog" | "request";

const CASING = 14;

/** four strips of the casing profile, each cut at 45° so they meet like a window frame */
function HeaderCasing() {
  const w = `${CASING}px`;
  const g = (dir: string) => ({ backgroundImage: pilasterGradient("FNL01-415").replace("to right", dir), filter: "var(--frieze-filter)" });
  const strip = "pointer-events-none absolute";
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute shadow-[0_10px_24px_rgb(40_25_20/0.22),0_2px_5px_rgb(40_25_20/0.14)]" style={{ inset: `-${w}` }} />
      <span aria-hidden="true" className={strip} style={{ ...g("to bottom"), top: `-${w}`, left: `-${w}`, right: `-${w}`, height: w, clipPath: `polygon(0 0,100% 0,calc(100% - ${w}) 100%,${w} 100%)` }} />
      <span aria-hidden="true" className={strip} style={{ ...g("to top"), bottom: `-${w}`, left: `-${w}`, right: `-${w}`, height: w, clipPath: `polygon(${w} 0,calc(100% - ${w}) 0,100% 100%,0 100%)` }} />
      <span aria-hidden="true" className={strip} style={{ ...g("to right"), top: `-${w}`, bottom: `-${w}`, left: `-${w}`, width: w, clipPath: `polygon(0 0,100% ${w},100% calc(100% - ${w}),0 100%)` }} />
      <span aria-hidden="true" className={strip} style={{ ...g("to left"), top: `-${w}`, bottom: `-${w}`, right: `-${w}`, width: w, clipPath: `polygon(0 ${w},100% 0,100% 100%,0 calc(100% - ${w}))` }} />
    </>
  );
}

/** three lines that fold into an × */
function Burger({ open }: { open: boolean }) {
  const line = "absolute left-1/2 h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current transition-[transform,opacity] duration-350 ease-[cubic-bezier(.5,1.4,.5,1)]";
  return (
    <span aria-hidden="true" className="relative block size-5">
      <span className={`${line} top-1/2 ${open ? "-translate-y-1/2 rotate-45" : "-translate-y-[7px]"}`} />
      <span className={`${line} top-1/2 -translate-y-1/2 ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${line} top-1/2 ${open ? "-translate-y-1/2 -rotate-45" : "translate-y-[5px]"}`} />
    </span>
  );
}

export function Header() {
  const t = useTranslations();
  const { products } = useProducts();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [tapped, setTapped] = useState<BarKey | null>(null);
  const megaTimer = useRef<number | undefined>(undefined);
  const tapTimer = useRef<number | undefined>(undefined);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // which section is on screen
  useEffect(() => {
    const els = NAV.map((k) => document.getElementById(SECTION_IDS[k])).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setSection(e.target.id);
          else setSection((s) => (s === e.target.id ? null : s));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // close the dropdowns on Esc, outside taps and scroll
  useEffect(() => {
    if (!menu && !mega) return;
    const close = () => {
      setMenu(false);
      setMega(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && close();
    const y0 = window.scrollY;
    const onScroll = () => Math.abs(window.scrollY - y0) > 80 && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [menu, mega]);

  const pickCategory = useCallback((c: CategoryId) => {
    setMega(false);
    setMenu(false);
    openCategory(c);
  }, []);

  const tap = (k: BarKey) => {
    setTapped(k);
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => setTapped(null), 1600);
  };

  const count = (c: CategoryId) => products.filter((p) => p.active && p.category === c).length;
  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMega(false), 180);
  };

  // red follows the visitor: the section they're in, or the button they just pressed
  const barActive: BarKey | null =
    tapped ?? (section === SECTION_IDS.catalog ? "catalog" : section === SECTION_IDS.contact ? "request" : null);

  const dropdown = "absolute top-[calc(100%+22px)] transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-glide)]";
  const shown = "visible translate-y-0 scale-100 opacity-100";
  const hidden_ = "invisible -translate-y-2 scale-[0.97] opacity-0 pointer-events-none";

  return (
    <>
      <header className="bay-fixed fixed top-[18px] z-40 px-[calc(var(--gutter)+6px)]" onMouseLeave={closeMegaSoon}>
        <div ref={wrap} className="relative mx-auto max-w-[1440px]">
          <div
            className={`relative flex h-[var(--bar-h)] items-center gap-1.5 rounded-[2px] bg-surface/90 pr-2.5 pl-3.5 ring-1 ring-line backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300 sm:gap-2 lg:pl-5 ${
              scrolled || menu || mega ? "shadow-[0_10px_30px_rgb(40_25_20/0.14)]" : "shadow-[0_4px_16px_rgb(40_25_20/0.06)]"
            }`}
          >

            <a href="#top" className="mr-auto shrink-0 lg:mr-0" aria-label="FLOSSO" onClick={() => setMenu(false)}>
              <Logo className="h-6 w-auto sm:h-7" />
            </a>

            <nav aria-label={t("nav.menu")} className="ml-3 hidden lg:block xl:ml-8">
              <ul className="flex items-center">
                {NAV.map((key) => {
                  const on = section === SECTION_IDS[key];
                  const cls = `relative inline-flex min-h-11 items-center gap-1 rounded-[12px] px-2 text-[14px] font-medium whitespace-nowrap transition-colors xl:px-3 ${on ? "text-ink" : "text-ink-soft hover:text-ink"}`;
                  const dot = (
                    <span aria-hidden="true" className={`absolute inset-x-3 bottom-1.5 h-[2px] origin-left rounded-full bg-red transition-transform duration-300 ease-[var(--ease-glide)] ${on ? "scale-x-100" : "scale-x-0"}`} />
                  );
                  return key === "catalog" ? (
                    <li key={key} onMouseEnter={openMega}>
                      <button type="button" onClick={() => setMega((v) => !v)} aria-expanded={mega} aria-controls="mega-menu" className={cls}>
                        {t("nav.catalog")}
                        <ChevronDown className={`size-4 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} aria-hidden="true" />
                        {dot}
                      </button>
                    </li>
                  ) : (
                    <li key={key} onMouseEnter={closeMegaSoon}>
                      <a href={`#${SECTION_IDS[key]}`} aria-current={on ? "location" : undefined} className={cls}>
                        {t(`nav.${key}`)}
                        {dot}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:ml-auto">
              {/* "Call": unfolds both numbers under itself, like the menu */}
              <div className="hidden md:block">
                <PhoneMenu labelClass="hidden whitespace-nowrap xl:inline" className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-foam px-3 text-[14px] font-semibold text-ink ring-1 ring-line transition-[transform,background-color,color,box-shadow] duration-400 ease-[var(--ease-glide)] hover:-translate-y-0.5 hover:bg-red hover:text-white hover:shadow-[0_8px_20px_rgb(198_40_40/0.35)] hover:ring-red active:scale-95 [&_.phone-ring]:text-red [&:hover_.phone-ring]:text-white" />
              </div>
              <LangFlags />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => {
                  setMenu((v) => !v);
                  setMega(false);
                }}
                aria-expanded={menu}
                aria-controls="mobile-menu"
                aria-label={menu ? t("nav.close") : t("nav.menu")}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-red text-white shadow-relief-sm transition-[transform,background-color] hover:bg-red-deep active:scale-90 lg:hidden"
              >
                <Burger open={menu} />
              </button>
            </div>
            {/* a thick foam casing (catalog profile FNL01-415) round the bar, mitred at the corners
                like the casing round the window in the hero */}
            <HeaderCasing />
          </div>

          {/* phones: a compact card that drops from the capsule */}
          <div id="mobile-menu" className={`${dropdown} inset-x-0 origin-top-right lg:hidden ${menu ? shown : hidden_}`} aria-hidden={!menu}>
            <div className="max-h-[calc(100svh-var(--bar-h)-120px)] overflow-y-auto overscroll-contain rounded-[20px] bg-surface p-2 shadow-[0_24px_60px_rgb(40_25_20/0.22)] ring-1 ring-line">
              <nav aria-label={t("nav.menu")}>
                <ul>
                  {NAV.map((key, i) => (
                    <li key={key}>
                      <a
                        href={`#${SECTION_IDS[key]}`}
                        tabIndex={menu ? 0 : -1}
                        onClick={() => setMenu(false)}
                        className={`flex min-h-13 items-center justify-between rounded-[16px] px-4 text-[17px] font-semibold transition-[opacity,transform,background-color] duration-300 ${
                          section === SECTION_IDS[key] ? "bg-foam text-red" : "text-ink hover:bg-foam"
                        } ${menu ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                        style={{ transitionDelay: menu ? `${40 + i * 35}ms` : "0ms" }}
                      >
                        {t(`nav.${key}`)}
                        {section === SECTION_IDS[key] && <span aria-hidden="true" className="size-1.5 rounded-full bg-red" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mx-2 my-2 h-px bg-line" />
              <div
                className={`grid gap-1 transition-[opacity,transform] duration-300 ${menu ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                style={{ transitionDelay: menu ? "230ms" : "0ms" }}
              >
                {[
                  { href: CONTACT.phoneHref, label: CONTACT.phoneDisplay },
                  { href: CONTACT.phone2Href, label: CONTACT.phone2Display },
                ].map((ph) => (
                  <a key={ph.href} href={ph.href} tabIndex={menu ? 0 : -1} className="flex min-h-12 items-center gap-3 rounded-[16px] px-3 text-[16px] font-bold text-ink tabular hover:bg-foam">
                    <span className="inline-flex size-9 items-center justify-center rounded-full ring-1 ring-line">
                      <Phone className="size-4 text-red" aria-hidden="true" />
                    </span>
                    {ph.label}
                  </a>
                ))}
                <div className="mt-1 grid grid-cols-2 gap-2 p-1">
                  <a href={CONTACT.telegramHref} target="_blank" rel="noopener noreferrer" tabIndex={menu ? 0 : -1} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-foam text-[15px] font-semibold text-ink">
                    <Send className="size-4 text-red" aria-hidden="true" />
                    Telegram
                  </a>
                  <InstagramLink tabIndex={menu ? 0 : -1} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-foam text-[15px] font-semibold text-ink">
                    <InstagramIcon className="size-4 text-red" />
                    Instagram
                  </InstagramLink>
                </div>
              </div>
            </div>
          </div>

          {/* desktop: catalog categories */}
          <div id="mega-menu" onMouseEnter={openMega} aria-hidden={!mega} className={`${dropdown} inset-x-0 origin-top hidden lg:block ${mega ? shown : hidden_}`}>
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,1.2fr)] gap-2 rounded-[20px] bg-surface p-3 shadow-[0_24px_60px_rgb(40_25_20/0.2)] ring-1 ring-line">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  tabIndex={mega ? 0 : -1}
                  onClick={() => pickCategory(c.id)}
                  className={`group flex flex-col rounded-[18px] p-2 text-left transition-[background-color,opacity,transform] duration-300 hover:bg-foam ${mega ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
                  style={{ transitionDelay: mega ? `${i * 25}ms` : "0ms" }}
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[12px] bg-foam">
                    <Image
                      src={`/images/products/${slugOf(CATEGORY_COVER[c.id])}.webp`}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-contain p-2 transition-transform duration-500 ease-[var(--ease-glide)] group-hover:-translate-y-1"
                    />
                  </span>
                  <span className="mt-2 text-[14px] leading-snug font-semibold text-ink">{t(`categoryPlural.${c.id}`)}</span>
                  <span className="text-[12px] text-ink-soft">{t("choose.models", { count: count(c.id) })}</span>
                </button>
              ))}
              <a
                href={`#${SECTION_IDS.catalog}`}
                tabIndex={mega ? 0 : -1}
                onClick={() => setMega(false)}
                className="flex flex-col justify-end rounded-[18px] bg-red p-4 text-white transition-colors hover:bg-red-deep"
              >
                <LayoutGrid className="size-6" aria-hidden="true" />
                <span className="mt-auto pt-6 text-[16px] leading-tight font-semibold">{t("header.allCatalog")}</span>
                <span className="mt-1 text-[13px] text-white/80">{t("choose.models", { count: products.filter((p) => p.active).length })}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* phone action bar: red marks where you are or what you just pressed */}
      <nav
        aria-label={t("nav.contact")}
        className="bay-fixed fixed bottom-0 z-30 border-t border-line bg-surface/90 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-4 gap-1.5">
          {(
            [
              { k: "call", href: CONTACT.phoneHref, Icon: Phone, label: t("header.bar.call"), ext: false },
              { k: "telegram", href: CONTACT.telegramHref, Icon: Send, label: t("header.bar.telegram"), ext: true },
              { k: "catalog", href: `#${SECTION_IDS.catalog}`, Icon: LayoutGrid, label: t("header.bar.catalog"), ext: false },
              { k: "request", href: `#${SECTION_IDS.contact}`, Icon: MessageSquareText, label: t("header.bar.request"), ext: false },
            ] as const
          ).map(({ k, href, Icon, label, ext }) => {
            const on = barActive === k;
            return (
              <li key={k}>
                <a
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  onClick={() => tap(k)}
                  aria-current={on ? "true" : undefined}
                  className={`flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-semibold transition-[background-color,color,transform] duration-300 active:scale-95 ${
                    on ? "bg-red text-white shadow-relief-sm" : "text-ink"
                  }`}
                >
                  <Icon className={`size-5 transition-colors duration-300 ${on ? "text-white" : "text-red"}`} aria-hidden="true" />
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
