# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, next-intl (uz default, ru, en), Framer Motion. Later: Neon Postgres + Drizzle ORM, Vercel Blob for images, self-made admin auth (bcrypt + encrypted httpOnly cookie). Specified by the owner's brief (FLOSSO_PROMPT.md). Deployment target is undecided: do not deploy until the owner names one.

## Users

FLOSSO is the client: a manufacturer of polystyrene (penoplast) facade decor who sells its own products. The site sells to two audiences, equally:
- **Homeowners** decorating their own house facade, often browsing on a phone, not knowing the trade vocabulary; they need to understand what goes where and what it costs.
- **Craftsmen / builders (ustalar)** buying in bulk (optom), who know product codes, care about price, quantity and availability.

## Product Purpose

A landing site that makes choosing facade decor easy: browse the catalog by category, see ready-made window compositions, calculate quantity and price, and leave a request or call. Success = a visitor understands which products they need and contacts FLOSSO (form, phone call, Instagram).

## Positioning

FLOSSO manufactures in its own workshop (confirmed by owner) and sells directly, at wholesale prices. Ready-made compositions (window + columns) from the catalog let a buyer pick a full set instead of individual parts.

## Operating Context

- Product codes follow a scheme: `FKR01-718` = category FKR (karniz) · model 01 · height 7 cm · depth/width 18 cm.
- Categories: Karnizlar (FKR), Nalichniklar (FNL), Podokonniklar (FPD), Taroq-kolonnalar (FTK), Kolonna igrushkalari (FIK, sold per piece, variants 20/30/40), Nalichnik igrushkalari (FIN, per piece, variants 10/12/15), Termopanellar (FTP).
- Most products are priced per running metre; igrushkalar per piece.
- Contact: phone +998 99 899 35 15, Instagram flosso_uz, site flosso.uz. **No Telegram** (owner has none).
- Owner manages products, prices, discounts and incoming requests from an admin panel, including on a phone.

## Capabilities and Constraints

- Three languages: Uzbek (default, always first), Russian, English. Every visible string changes with the language, including the slogan.
- Prices are not yet set by the owner: estimated starting prices, labelled "approximate, contact for exact price".
- Unknowns kept as TODO, never invented: address/map, real project photos, statistics numbers, FAQ answers (drafts only), production photos.
- Catalog inconsistencies to confirm with owner: FIN02-612 (catalog lists FIN02-614), FPD05-615 (catalog lists FPD05-413/515).
- Mobile-first, 360–1920 px. Respect prefers-reduced-motion.

## Brand Commitments

- Name: FLOSSO. Brand statement (from catalog): a modern Uzbek manufacturer of quality, energy-efficient building products; every product stands for trust, durability and modernity; customers get a long-term solution, a solid foundation for every home, building and project.
- Brand colours: red and white (owner's Instagram logo). Red logo file not supplied; the catalog's rhombus mark + FLOSSO wordmark is redrawn in red/white (owner approved).
- Catalog lettering is art-deco; owner wants an art-deco display face that supports Cyrillic.

## Evidence on Hand

- Catalog PDF: `flosso-katalog.pdf` (product photos on green backgrounds, vector profile cross-sections, 4 composition pages with labelled codes).
- No testimonials, client list, statistics, real installation photos or production photos exist yet: do not fabricate them.

## Product Principles

1. Choosing must be effortless: the visitor should know what to buy without knowing the trade.
2. Codes and sizes are always visible: professionals buy by code.
3. Every path ends in contact: call, form or Instagram, with the context (product, calculation) carried along.
4. Only true claims: unknown facts stay TODO.

## Accessibility & Inclusion

Phone-first audience on mixed connections: fast load, large tap targets, readable contrast, keyboard support, alt text, reduced-motion respected.
