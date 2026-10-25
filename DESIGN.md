---
name: FLOSSO
description: Foam facade mouldings, shown the way a showroom wall shows them
colors:
  flosso-red: "#c62828"
  flosso-red-deep: "#8e1b1b"
  flosso-red-ink: "#6e1414"
  foam: "#faf7f5"
  plaster: "#ece6e1"
  plaster-deep: "#ddd5ce"
  rule-line: "#e4ddd7"
  pencil: "#8a817b"
  ink: "#1a1a1a"
  ink-soft: "#4a4440"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Poiret One, Manrope, sans-serif"
    fontSize: "clamp(32px, 4.4vw, 60px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  display-hero:
    fontFamily: "Poiret One, Manrope, sans-serif"
    fontSize: "clamp(38px, 4.6vw, 68px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.1em"
rounded:
  control: "10px"
  card: "14px"
  panel: "18px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  section: "80px"
  section-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.flosso-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.flosso-red-deep}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
  input:
    backgroundColor: "{colors.foam}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "52px"
  card-product:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    height: "44px"
---

# Design System: FLOSSO

## Overview

**Creative North Star: "The Showroom Wall"**

The site is FLOSSO's showroom wall. Mouldings hang on warm-white plaster under raking light from the upper left, so relief reads as soft offset shadow. Every piece wears a red paper tag on a string: tap it and you get the name, width and price. The page is built like a facade: the sections are its floors, and real catalog profiles, rendered as lit cornices, separate them.

Red is a material, not a sprinkle. It owns whole fields twice (the wholesale banner and the contact close), and elsewhere it marks only the selected or acting piece: the active tag, the chosen hotspot, the primary button. Everything else is foam, plaster and ink.

**Key Characteristics:**
- Warm-white foam and plaster grounds, lit from the upper left.
- Art-deco display capitals (Poiret One) at size; Manrope for everything read.
- Real product geometry as ornament: friezes and pilasters are extruded from the catalog's own profile sections; wallpaper is their cross-sections; the lattice is the FLOSSO mark.
- Plain names first, codes second: "Karniz, 1-model · katta o‘lcham" before `FKR01-718`.

## Colors

One red, a family of warm neutrals, and ink.

### Primary
- **FLOSSO Red** (#c62828): primary actions, active tags and hotspots, the wholesale and contact fields, discount prices.
- **Kiln Red** (#8e1b1b): hover and pressed states for red, the depth of a tag's eyelet.

### Neutral
- **Foam** (#faf7f5): page ground, input wells.
- **Plaster** (#ece6e1): the wall the facade and the sets hang on.
- **Plaster Deep** (#ddd5ce): idle switches, dimmed dimension lines.
- **Rule Line** (#e4ddd7): dividers, card hairlines.
- **Pencil** (#8a817b): secondary captions, strings, struck-out old prices.
- **Ink** (#1a1a1a) and **Ink Soft** (#4a4440): text; Ink also grounds the footer and the utility strip.

### Named Rules
**The One Red Thing Rule.** Outside the two red fields, red marks only what is selected, acting, or discounted. Never decorate with it.

## Typography

**Display Font:** Poiret One (art-deco hairline capitals, self-hosted, Latin + Cyrillic)
**Body Font:** Manrope (self-hosted, Latin + Cyrillic)

**Character:** Poiret One is the lettering on the showroom plaque. It only works at size, so it never carries small text. Manrope does every job a reader or a buyer needs.

### Hierarchy
- **Display** (400, clamp 32→60px, line-height 1, uppercase, +0.04em): section titles.
- **Display Hero** (400, clamp 38→68px): the slogan on the hero plaque.
- **Title** (600, 18–22px): card and row titles.
- **Body** (400, 16–17px, 1.6): copy kept to 60ch or less.
- **Label** (600, 12–13px, +0.1em, uppercase): small group labels only, never above headings.

### Named Rules
**The Plaque Rule.** Poiret One is used only at 22px or larger. Prices, codes and numbers are set in Manrope with tabular figures.

## Layout

The content column is 1440px max with a fluid gutter of clamp(16px, 4vw, 48px). Sections run 80px (phone) to 112px (desktop) of vertical padding. Where one section meets the next, a 26–36px frieze stands in for the gap, like a cornice line between floors. Wide screens (≥1640px) frame the page between two fixed fluted pilasters. Phones get a bottom action bar (call · Telegram · catalog · request) once the hero is passed, and the header hides on downward scroll.

## Elevation & Depth

One light source, from the upper left. Every shadow falls down and to the right, warm brown, never black.

### Shadow Vocabulary
- **relief-sm** (`1px 2px 2px rgb(60 40 30/.12), 2px 4px 8px rgb(60 40 30/.08)`): buttons, small chips.
- **relief-md** (`2px 4px 6px rgb(60 40 30/.12), 6px 14px 28px rgb(60 40 30/.12)`): cards on hover, drawing panels.
- **relief-lg** (`4px 8px 12px rgb(60 40 30/.14), 14px 30px 60px rgb(60 40 30/.16)`): the hero plaque, the estimate slip, the address plaque.
- **Moulding**: friezes are CSS gradients computed from the real profile geometry (`scripts/build_friezes.py`), with a soft drop of `0 8px 14px -6px rgb(70 50 40/.35)`.

## Shapes

Controls are 10px rounded, cards 14px, panels 18px. Pills are reserved for filter chips and language toggles. Tags are the one sharp silhouette: a rectangle with a notched point and an eyelet.

## Components

### Buttons
- **Primary:** FLOSSO Red, white 16px/600 text, 48–52px tall, 10px radius, relief-sm; hover goes to Kiln Red.
- **Secondary:** transparent with a 1px ink/20 border; hover darkens the border to ink.
- **On red:** white fill with red text, or a white/60 outline.

### Facade Tag (signature)
A white paper tag hanging on a pencil-grey string from a pin, swaying ±2.5° (static with reduced motion). The selected tag turns red. Tapping it opens a small card with name, width, price, an "Ask" button and a link to the catalog.

### Product Card
A white card with a foam image well, a plain-language name, a size word, "width · thickness" in cm, the code in a small foam chip, and the price at the bottom. With a discount: the old price is struck through in pencil, the new price is red, and a −X% pill sits on the image.

### Inputs
A foam well with a 1px rule border, 52px tall. Focus turns it white with a red border and a 3px red/15 glow. The phone field shows a fixed "+998" prefix and masks the 9 local digits.

### Navigation
Utility strip (ink) → main bar (foam, blurs on scroll) → an 8px casing moulding. Catalog opens a mega-menu of the seven categories with their photos. Ctrl K opens a search palette that matches plain names and codes.

## Do's and Don'ts

- **Do** lead with what a person calls the thing ("Karniz", "Kolonna tepasi") and keep the code as secondary detail.
- **Do** build ornament from the catalog's real profiles and the FLOSSO mark; never from generic stripes.
- **Do** keep shadows warm, offset to the lower right, and soft.
- **Don't** put Poiret One under 22px, on prices, or on numbers.
- **Don't** use red as decoration on neutral sections.
- **Don't** invent claims or figures: unknowns stay out until the owner confirms them.
