---
name: TasteVault Portal
description: >-
  The Connoisseur's Gallery — a personal wall of judged interface designs, hung
  as silkscreen-printed plates pinned to a calm gallery wall. Rules and ink,
  never boxes. SLATE (light) / NOIR (dark).
colors:
  wall-ground: "#e6eaee"
  paper-panel: "#ffffff"
  plate-backing: "#eef1f4"
  near-black-ink: "#0f1418"
  soft-ink: "#48515a"
  plate-keyline: "#0f1418"
  cobalt-accent: "#1452ff"
  cobalt-text: "#1247e0"
  cyan-highlight: "#0bb6c9"
  liked-green: "#0aa259"
  liked-tint: "#dcf4e8"
  disliked-red: "#e11d34"
  disliked-tint: "#ffe1e3"
typography:
  display:
    fontFamily: '"Young Serif", Georgia, serif'
    fontSize: "clamp(2.6rem, 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline:
    fontFamily: '"Young Serif", Georgia, serif'
    fontSize: "clamp(2rem, 4.5vw, 3.1rem)"
    fontWeight: 400
    lineHeight: 1.01
    letterSpacing: "0"
  subhead:
    fontFamily: '"Young Serif", Georgia, serif'
    fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  note-lead:
    fontFamily: '"Spectral", Georgia, "Times New Roman", serif'
    fontSize: "clamp(1.5rem, 3.4vw, 2.3rem)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "0"
  title:
    fontFamily: '"Young Serif", Georgia, serif'
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0"
  body:
    fontFamily: '"Spectral", Georgia, "Times New Roman", serif'
    fontSize: "1.14rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0"
  body-sm:
    fontFamily: '"Spectral", Georgia, "Times New Roman", serif'
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  control:
    fontFamily: '"Spectral", Georgia, "Times New Roman", serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  clause:
    fontFamily: '"Spectral", Georgia, "Times New Roman", serif'
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label-lg:
    fontFamily: '"Spline Sans Mono", ui-monospace, monospace'
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.13em"
  label:
    fontFamily: '"Spline Sans Mono", ui-monospace, monospace'
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.13em"
  label-xs:
    fontFamily: '"Spline Sans Mono", ui-monospace, monospace'
    fontSize: "0.62rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  none: "0"
  full: "9999px"
spacing:
  hair: "0.25rem"
  xs: "0.45rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2.25rem"
  wall-col-gap: "1.875rem"
  wall-row-gap: "3.25rem"
  shell-max: "1280px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
  button-solid:
    backgroundColor: "{colors.near-black-ink}"
    textColor: "{colors.wall-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.disliked-red}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
  segmented-control:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.85rem"
  sentiment-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.8rem"
  tagchip:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.6rem"
  field:
    backgroundColor: "{colors.paper-panel}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.25rem"
    width: "100%"
  plate:
    backgroundColor: "{colors.plate-backing}"
    rounded: "{rounded.none}"
    width: "100%"
  label-block:
    backgroundColor: "{colors.paper-panel}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0.9rem 0.9rem"
  headblock:
    backgroundColor: "{colors.paper-panel}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.none}"
    padding: "0.9rem 1.05rem"
  pushpin:
    backgroundColor: "{colors.cobalt-accent}"
    rounded: "{rounded.full}"
    size: "17px"
  verdict-pill:
    backgroundColor: "{colors.liked-green}"
    textColor: "#04231b"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.65rem"
  note-lead:
    backgroundColor: "transparent"
    textColor: "{colors.cobalt-text}"
    typography: "{typography.headline}"
---

## Overview

**Creative North Star: "The Connoisseur's Gallery."** Browsing your own taste is
wandering a gallery you hung, not scanning a feed. Every judged interface is
a **pinned plate** — a screenshot with a thin ink keyline, a 6px paper mat, a
soft blurred cast shadow, a real radial-gradient pushpin, and a 1–2° tilt —
tacked to a calm, bright wall and arranged left-to-right by how much you mean it.
The surface is printed, not rendered: riso/silkscreen ink, hard rules, a fixed
grain overlay. The governing instinct is **rules and ink, never boxes**.

The personality is editorial and opinionated but never loud. Saturation is
rationed: the wall ground stays quiet so screenshots and prose carry the
contrast, and colour is spent only where it does work — the cobalt accent, the
cyan hover, and the two theme-stable sentiment colours (green Liked, red
Disliked). There are no card containers and no button chrome anywhere; structure
is carried entirely by 2px ink rules, colour blocks, and a 3–4px sentiment
ink-bar over each printed label. Corners are square throughout — the only curve
in the whole system is the pushpin disc.

Density is gallery-sparse, not dashboard-dense. Four columns of plates at
desktop, hung at staggered heights, with generous air between rows
(3.25rem / 1.875rem grid gaps). One authored motion carries the whole build: a
piece **ignites** on hover or focus — it straightens, lifts ~5px, its label
opens from 3 to 9 lines of the User Note, and the rest of the wall dims to
context weight (~0.48). Everything else holds perfectly still. On the detail
view, the exception to the colour discipline is deliberate: the User Note's
opening clause is set at poster scale in saturated cobalt Spectral italic,
because the Note is the whole point of the artefact.

**Key Characteristics:**

- **Rules and ink, never boxes.** Hard 2px `--ink` rules divide; active state
  floods an element with ink; zero card or button containers.
- **Squared corners everywhere (0 radius).** The pushpin disc and the 6px `kind`
  dot are the only curves in the system.
- **Every screenshot is a mounted plate** — 1.5px ink keyline, 6px `--panel`
  mat, `--shadow-plate` cast shadow, radial-gradient pushpin, 1–2° tilt.
- **Plate size rides `rating`, never `sentiment`** — ◆◆◆ 4:3, ◆◆ 16:11,
  ◆ / none 16:9. The wall stratifies by strength of feeling.
- **Sentiment is semantic and theme-stable** — green = Liked, red = Disliked, in
  both themes, and the only strong colour permitted on a plate.
- **Three real faces, one job each** — Young Serif (display), Spectral (the
  User Note), Spline Sans Mono (labels, meta, controls).
- **Riso/silkscreen grain** — one fixed radial-dot overlay, multiply in SLATE,
  screen in NOIR.
- **One authored moment** — a piece ignites on hover/focus while the wall dims;
  full `prefers-reduced-motion` path.
- **SLATE (light, default use scene) / NOIR (dark, answers the OS).** Theme
  follows `prefers-color-scheme`; `[data-theme]` and `?theme=` override.

## Colors

Two named token sets: **SLATE** (light, the default use scene — a developer at a
desk in daylight) on bare `:root`, and **NOIR** (dark) under
`@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`. Each colour is a
role, not a decoration. Hex pairs below read *SLATE / NOIR*.

### Primary — the working accents

- **Cobalt accent** `#1452ff / #2f6bff` (`--accent`). The pushpin fill, the
  search and field underline, `:focus-visible` outline, `::selection`,
  `caret-color`, `accent-color`, the `page` kind dot.
- **Cobalt text** `#1247e0 / #7ea3ff` (`--accent-text`). Link colour, the rating
  diamond marks, the monumental User Note lead, active "hang by" underline,
  detail nav links, the "later hand" header.
- **Cyan highlight** `#0bb6c9 / #22e6c8` (`--hi`). Hover-flood on every
  outlined control — buttons, segmented controls, tag chips — paired with ink
  text `#04231b`. Never a resting fill; only the hover state.

### Secondary — sentiment (semantic, theme-stable)

- **Liked green** `#0aa259 / #26d47e` (`--like`). Thumb-up mark, the 3px top
  ink-bar on a positive label, the 4px bar on the positive headblock, the
  "Liked" verdict pill, the active Liked filter segment.
- **Disliked red** `#e11d34 / #ff4b60` (`--dislike`). Thumb-down mark, a
  2.5px red plate keyline plus a red pushpin on a Disliked plate, the sentiment
  ink-bar on a negative label/headblock, the "Disliked" verdict pill, the
  `.btn--danger` border/text and its hover fill.
- **Liked tint** `#dcf4e8 / #12281f`, **Disliked tint** `#ffe1e3 / #331a1e`
  (`--like-tint` / `--dislike-tint`). Reserved quiet wash tokens for sentiment
  surfaces; used sparingly.

### Tertiary — the `kind` dot

A 6px dot before the kind word in the meta line, tinted from the existing
palette — a mark, never a fill, never a new hue. `page` → `--accent`;
`element` → `--hi`; `interaction` → 50/50 mix of accent + hi;
`flow` → 55% accent mixed with `--ink-soft`. Later kinds extend the same small
ramp.

### Neutral — the wall

- **Wall ground** `#e6eaee / #0f1215` (`--ground`). The gallery wall behind
  everything; also the reversed text colour on ink-flooded controls.
- **Paper panel** `#ffffff / #1c2128` (`--panel`). The printed label block, the
  headblock, the 6px plate mat, the dialog.
- **Plate backing** `#eef1f4 / #262c34` (`--panel-2`). Behind a loading or
  imageless plate; skeleton fill.
- **Near-black ink** `#0f1418 / #f1f4f6` (`--ink`). Body text, every hard rule,
  every control border, the ink-flood active state.
- **Soft ink** `#48515a / #9aa6b2` (`--ink-soft`). Meta lines, standfirst,
  captions, dashed secondary rules, scrollbar thumb.
- **Plate keyline** `#0f1418 / #2b333c` (`--keyline`). The 1.5px printed edge
  around every plate (distinct from `--ink` in NOIR, where it is softer).
- **Grain** `rgba(15,20,24,0.05) / rgba(255,255,255,0.035)` (`--grain`). The
  fixed riso dot overlay: `radial-gradient(var(--grain) 1px, transparent 1px)`
  at 4px pitch, 0.55 opacity, `mix-blend-mode: multiply` in SLATE,
  `screen` in NOIR.

**The Named-Role Rule.** Every colour is one of seven print roles — ground,
panel, ink, accent, highlight, like, dislike — doing real work. No candy
accents, no fourth hue, no colour without a job.

**The Sentiment-Is-Semantic Rule.** Green is Liked and red is Disliked, in both
themes, always. Sentiment colour never shifts with the palette, and it is the
only saturated colour allowed to touch a plate.

**The Ink-Not-Box Rule.** Selection and active states flood an element with
`--ink` (or its sentiment colour) and reverse the text to `--ground`. They never
draw a new border and never raise a shadow.

## Typography

Three self-hosted faces (via `@fontsource`), each locked to one job.

- **Display — Young Serif (400).** Warm, chunky old-style serif. The `TasteVault`
  wordmark (`display`, `clamp(2.6rem, 7vw, 6rem)` / 0.9 / `-0.01em`, the `Vault`
  half in `--accent`); the detail entry title (`headline`,
  `clamp(2rem, 4.5vw, 3.1rem)` / 1.01); empty-state and section headings
  (`subhead`, `clamp(1.6rem, 3.4vw, 2.3rem)`); Reference card titles and dialog
  titles (`title`, 1.5rem / 1.06). Capped at 6rem.
- **Body — Spectral (400, plus 400 italic, 600, 600 italic).** The reading face.
  Base body 17px / 1.55 with old-style numerals; the User Note (`body`, 1.14rem /
  1.62); empty-state prose (`body-sm`, 1.05rem); the search input, Spectral
  *italic* (`control`, 1rem); the card clause and the "later hand" AI marginalia,
  Spectral *italic* (`clause`, 0.92rem). The **User Note lead** is `note-lead` —
  Spectral italic **600** at `clamp(1.5rem, 3.4vw, 2.3rem)` / 1.16 in
  `--accent-text`.
- **Label — Spline Sans Mono (400, 500).** Every control, meta line, label, and
  caption. Uppercase, letter-spaced 0.13em–0.18em, `tabular-nums` where numbers
  align. Three steps only: `label-lg` 0.72rem (standfirst, headblock definition
  lists), `label` 0.66rem (meta lines, legend, section captions), `label-xs`
  0.62rem / 0.18em (segmented controls, tag chips, sort/view toggles, page
  footers).

**Character.** Two serifs and a mono, no sans anywhere. Young Serif gives the
product a hand and a weight; Spectral is a quiet editorial voice for the one
piece of prose that matters; Spline Sans Mono makes every control read as a
typeset caption on a gallery label, not UI chrome.

**Hierarchy (largest to smallest):**

1. `display` — `TasteVault` wordmark — Young Serif `clamp(2.6rem, 7vw, 6rem)`
2. `headline` — detail entry title — Young Serif `clamp(2rem, 4.5vw, 3.1rem)`
3. `subhead` — empty-state / section headings — Young Serif `clamp(1.6rem, 3.4vw, 2.3rem)`
4. `note-lead` — User Note opening clause — Spectral italic 600 `clamp(1.5rem, 3.4vw, 2.3rem)`, cobalt
5. `title` — card title / dialog title — Young Serif 1.5rem
6. `body` — User Note body — Spectral 1.14rem
7. `body-sm` — empty-state prose — Spectral 1.05rem
8. base body — Spectral 17px (root anchor; the rem scale is relative to it)
9. `control` — search input — Spectral italic 1rem
10. `clause` — card clause / AI marginalia — Spectral italic 0.92rem
11. `label-lg` — standfirst / headblock lists — Spline Sans Mono 0.72rem / 0.13em
12. `label` — meta lines / legend — Spline Sans Mono 0.66rem / 0.13em
13. `label-xs` — controls / chips / footers — Spline Sans Mono 0.62rem / 0.18em

**The Three-Faces Rule.** Young Serif sets identity, Spectral speaks, Spline Sans
Mono labels. A face never crosses into another face's job.

**The Monumental-Note Rule.** The User Note's opening clause is set at poster
scale in Spectral italic 600, `--accent-text` — the single place colour goes
bold in running prose. No other text ever gets this treatment.

**The Mono-Caps Rule.** Every control, meta line, badge, and caption is Spline
Sans Mono, uppercase, letter-spaced at least 0.09em. Numbers in aligned contexts
use `tabular-nums`; body prose uses `oldstyle-nums`.

## Layout

**Shell.** Centred column, `max-width: 1280px`, side padding
`clamp(1.25rem, 4vw, 2.25rem)`, bottom padding 8rem. A sticky translucent topbar
(`color-mix(--ground 86%, transparent)` + `blur(6px)`) with a 2px `--ink` base
rule.

**The wall.** A CSS Grid of `repeat(4, minmax(0, 1fr))`, gap
`3.25rem 1.875rem` (row / column), `align-items: start`. Reading order is
strictly left-to-right, row by row — DOM order equals visual order. The
"hung at different heights" feel comes only from per-column `margin-top` offsets
(`4n+2` → 1.9rem, `4n+3` → 0.9rem, `4n+4` → 2.75rem) plus a per-plate tilt; it
never comes from pack order, so column masonry is explicitly not used.

**Plate size from `rating`.** `data-rating="3"` → `aspect-ratio: 4/3`;
`"2"` → `16/11`; `"1"` / `"0"` → `16/9`. Bigger feeling, bigger plate. Sentiment
does not affect size.

**Detail view.** Two columns, `1.12fr 0.88fr`, gap
`clamp(1.75rem, 4vw, 3.25rem)`, opened by a 3px `--ink` top rule. Left: large
tipped-in plate(s) in a vertical stack (`bigplate`, `16/10`, alternating
±0.5° tilt, a 10px mat). Right: the headblock (identity `<dl>` + edit/remove
bar), then the entry title, the verdict pill, and the User Note as the
centrepiece, followed by the rating legend and the "later hand" AI marginalia.

**Responsive.** 4 columns → 2 at `max-width: 1000px` → 1 at `max-width: 560px`
(all per-column offsets drop to 0 at single column, so it never becomes a plain
list until it has to). The detail grid stacks to one column at
`max-width: 940px`. The control band stacks rather than clipping at
`max-width: 720px`. The topbar collapses button labels to icons at
`max-width: 560px`.

**Spacing rhythm.** A loose 0.25rem-based scale; recurring steps 0.35, 0.45,
0.6, 0.75, 0.9, 1.25, 1.5, 2.25rem. Vertical rhythm inside printed blocks is
tight (0.35–0.55rem); rhythm between wall rows is generous (3.25rem).

**The Reading-Order Rule.** The wall is a left-to-right, row-by-row grid
(4 → 2 → 1). The scattered-hang feel is per-column `margin-top` offset plus
per-plate tilt only. DOM order always equals reading order.

**The Rating-Stratifies Rule.** Plate proportion is driven by `rating` alone
(◆◆◆ 4:3, ◆◆ 16:11, ◆ / none 16:9). Neither sentiment nor recency ever changes a
plate's size.

## Elevation & Depth

**Hybrid, but strictly partitioned: shadow for plates, flat for everything
else.** The wall has exactly one raised object type — the pinned plate — plus the
modal dialog. Every other surface (labels, headblocks, bands, buttons, chips,
fields) sits flat on the ground and is separated by rules and colour blocks, not
by shadow or z-layering.

**Shadow Vocabulary:**

- `--shadow-plate` — resting plate cast shadow.
  SLATE `3px 6px 16px rgba(15,20,24,0.16)` / NOIR `3px 6px 18px rgba(0,0,0,0.5)`.
- `--shadow-plate-lift` — an ignited plate and the dialog.
  SLATE `6px 12px 26px rgba(15,20,24,0.22)` / NOIR `6px 12px 30px rgba(0,0,0,0.62)`.
- `--shadow-pin` — the pushpin.
  SLATE `0 2px 3px rgba(0,0,0,0.32)` / NOIR `0 2px 4px rgba(0,0,0,0.6)`.
- **Mat ring stack** (not a token; layered after the cast shadow on every plate):
  `0 0 0 6px var(--panel), 0 0 0 7.5px color-mix(in srgb, var(--ink) 18%, transparent)`
  — the 6px paper mat and a 1.5px ink keyline echo. A Disliked plate swaps the
  outer ring to `color-mix(in srgb, var(--dislike) 35%, transparent)`.

**Depth beyond shadow.** The riso grain overlay is a single `position: fixed`
layer over the whole wall (`#root` sits at `z-index: 2` above it). The topbar and
dialog use a light `backdrop-filter: blur`. Nothing else stacks.

**The Only-Plates-Lift Rule.** Cast shadows belong to pinned plates (and the one
modal dialog) only. Labels, headblocks, bands, buttons, and fields are flat —
separated by 2px rules and colour, never by shadow.

**The Ignite-Don't-Float Rule.** On hover/focus a plate moves from
`--shadow-plate` to `--shadow-plate-lift` and `translateY(-5px)` while
straightening to `rotate(0)`. That is the entire elevation change in the
product; there is no resting hover-float and no parallax.

## Shapes

**Zero radius, everywhere.** Every plate, label, headblock, button, chip, field,
toggle, dialog, and verdict pill has square corners (`border-radius: 0`). The
**only** curved shapes in the system are the 17px pushpin disc
(`border-radius: 50%`, a radial gradient) and the 6px `kind` dot. The scrollbar
thumb is pill-shaped as a browser-surface concession only.

**Borders as structure.** Hard **2px solid `--ink`** rules do the dividing work:
around segmented controls and toggles and tag chips and buttons, under the
topbar, top-and-bottom of the control band, above the detail grid and its nav.
Plates carry a **1.5px `--keyline`** printed edge (2.5px `--dislike` when
Disliked). A **3px** (label) / **4px** (headblock) sentiment ink-bar sits on top
of every printed label block. **1px dashed `--ink-soft`** marks derived or
secondary matter — the AI "later hand", edit hints, page footers.

**Underline as input.** Fields and the search box have no box at all — a single
**2px `--accent`** bottom border on an otherwise borderless element, with a
`--hi`-tinted fill on focus.

**Recurring geometry.** The authored **SVG diamond** (`M6 0.6 11.4 6 6 11.4 0.6 6Z`)
is the rating pip — one filled per point, hollow at 0.35 opacity for the rest.
The icon set is one 24px grid, **1.75 stroke**, round caps and joins,
`currentColor`. Plate tilt is quantised: resting `-1.3deg`, with `nth-child`
variants at `1deg`, `-0.45deg`, `1.5deg`; ignited state is always exactly
`rotate(0)`.

**The Zero-Radius Rule.** Every corner is square. The pushpin disc and the
`kind` dot are the only permitted curves — introducing `border-radius` anywhere
else breaks the print world.

**The Rule-Weight Rule.** Structural divisions are 2px solid `--ink`; plate
edges are 1.5px `--keyline`; sentiment bars are 3–4px; anything derived or
secondary is 1px dashed `--ink-soft`. Weights are not mixed arbitrarily.

## Components

### Buttons (`.btn`, `.btn--solid`, `.btn--danger`)

Typeset labels, not chrome. Spline Sans Mono 0.68rem / 0.14em uppercase, 2px
`--ink` border, square, `0.6rem 1rem` padding, inline-flex with a 0.45rem gap to
a 1em icon. **Outline** (default): transparent → floods `--hi` with `#04231b`
text on hover. **Solid** (`--solid`): `--ink` fill / `--ground` text → `--accent`
fill / white text on hover. **Danger** (`--danger`): `--dislike` border and
text → `--dislike` fill / white text on hover. No radius, no shadow, no
disabled-state fill (band buttons instead go to 0.38 opacity with a
line-through).

### Chips (`.tagchip`)

Aggregated tag facets. Spline Sans Mono 0.625rem / 0.09em uppercase, 2px `--ink`
box, `0.25rem 0.6rem` padding. Active → floods `--ink` / `--ground`. Hover (when
inactive) → floods `--hi` / `#04231b`. An overflow chip reads `+ N more` and
expands the row in place.

### Segmented controls & toggles (`.seg`, `.toggle`)

Buttons welded edge-to-edge inside a single 2px `--ink` frame, divided by 2px
`--ink` `border-left` between items — no outer radius, no gaps. Active segment
floods `--ink` / `--ground`; hover floods `--hi`. The sentiment toggle is the
one exception where the active flood takes a colour: `data-tone="like"` →
`--like` / `#04231b`, `data-tone="dislike"` → `--dislike` / white. Used for the
section nav, theme picker, sentiment filter, kind filter, and the edit-form
sentiment/rating pickers.

### Cards / containers

There are none in the bordered-box sense. The **label block** (`.label`) is a
printed panel: `--panel` background, a **3px sentiment ink-bar on top only**, no
side or bottom border, `0.75rem 0.9rem 0.9rem` padding, `margin-top: 1.4rem`
below its plate. The **headblock** (`.headblock`) is the detail-view identity
panel: `--panel` background, a full 1px `--keyline` frame, a **4px sentiment
ink-bar on top**, holding a two-column mono `<dl>` and the edit/remove bar. Both
degrade field-by-field — any missing identity row is simply absent.

### Inputs / fields (`.field`, `.search`)

No box. A borderless element on `--panel` (or transparent, for search) with a
single **2px `--accent` bottom border**; `0.15rem 0.25rem` padding; full width.
Focus removes the outline and fills
`color-mix(in srgb, var(--hi) 12%, var(--panel))`. The search input is Spectral
*italic* with a leading 1.75-stroke magnifier. The note textarea is Spectral
1.05rem, min-height 11rem, vertical resize only. Field rows pair a 5.5rem mono
uppercase `<label>` with the control.

### Navigation

The **topbar** is sticky, translucent (`--ground` at 86% + `blur(6px)`), with a
2px `--ink` base rule; left is a `.seg` section nav (`The Wall` /
`Recently removed · N`), right is the solid `＋ Pin a reference` button and the
theme toggle. The **control band** is the gallery wall-text: sentiment toggle,
kind toggle, italic search, and a right-aligned `hang by` group of bare text
buttons that underline in `--accent` when active, plus the stubbed
`gallery / ledger` switch (ledger disabled). **Detail nav** is a
`prev / next` pair of cobalt mono links across a 2px `--ink` rule, `next`
reversed to the right.

### Signature component — the pinned plate (`.piece` / `.plate` / `.pin`)

The identity object. A screenshot with `object-fit: cover` on a `--panel-2`
backing, a 1.5px `--keyline` edge, the `--shadow-plate` + mat-ring stack, and a
resting tilt (`-1.3deg`, quantised variants). Above it, absolutely positioned at
`top: -12px`, a 17px **pushpin**: a `radial-gradient` disc in `--accent` with a
white specular highlight and a `--shadow-pin`, plus a 2px stem via `::after`.
Below it, the printed label block. On hover/focus the plate straightens to
`rotate(0)`, lifts `translateY(-5px)`, goes to `--shadow-plate-lift`, its clause
opens from 3 to 9 lines, and `.wall:hover .piece` drops siblings to `opacity:
0.48` — gated to `(hover:hover) and (pointer:fine)`, transition
`transform 0.22s cubic-bezier(0.22,0.61,0.36,1)`. **Disliked** swaps the edge to
2.5px `--dislike`, the outer mat ring to a red mix, and the pushpin gradient to
`--dislike` — nothing louder, no corner chip. Imageless → `.plate--empty` with a
centred mono `NO SCREENSHOT YET`, still hung.

### Signature component — the monumental note lead (`.note .lead`)

The one place prose takes colour. Spectral italic **600** at
`clamp(1.5rem, 3.4vw, 2.3rem)` / 1.16, `--accent-text`, wrapped in typographic
quotes, sitting directly under the entry title and verdict pill. Degraded and
empty notes reuse the same lead slot with a plain-language fallback sentence.

### Signature component — the "later hand" (`.laterhand`)

AI Interpretation as dated marginalia. A block indented `2.75rem` into the left
margin with a `text-indent: -2.75rem` hanging first line, a 1px **dashed**
`--ink-soft` top rule, set in Spectral italic 0.95rem `--ink-soft`, under a mono
uppercase `--accent-text` header (`LATER HAND — AI INTERPRETATION · <date>`). It
never overlaps or restyles the User Note above it.

### Rating mark (`.rating-mark`) & kind dot (`.kind__dot`)

The rating mark is three 12px SVG diamonds in `--accent-text`, filled up to the
score, hollow at 0.35 opacity beyond. The kind dot is a 6px palette-tinted
circle before the lowercase kind word — a mark, never a fill.

### Dialog (`.dialog-content`)

Radix modal. `--panel` background, 2px `--ink` border, `--shadow-plate-lift`,
`width: min(28rem, calc(100vw - 2rem))`, 1.5rem padding; overlay is
`color-mix(in srgb, var(--ink) 45%, transparent)` + `blur(2px)`. Young Serif
1.5rem title, right-aligned `Cancel` (outline) + confirm (solid, or `--danger`).

## Do's and Don'ts

- **Do** keep the wall ground calm (`--ground`) so screenshots and prose carry
  the contrast — spend saturation only on ink, labels, sentiment, and the cobalt
  accent.
- **Don't** add a fourth hue or a decorative accent. `kind` is a 6px
  palette-derived dot, never a fill and never a new colour.
- **Do** divide with a hard **2px `--ink`** rule.
- **Don't** wrap anything in a bordered or rounded card — the label and
  headblock are printed panels with a top ink-bar, not boxes.
- **Do** flood active controls with `--ink` (or the sentiment colour) and
  reverse the text to `--ground`.
- **Don't** outline an active control or give it a drop shadow.
- **Do** give every screenshot the full plate treatment: 1.5px `--keyline`
  edge, 6px `--panel` mat, `--shadow-plate`, a pushpin, and a 1–2° tilt.
- **Don't** render a bare image, a zero-tilt plate, or a plate without a
  pushpin.
- **Do** size plates from `rating` only (◆◆◆ 4:3, ◆◆ 16:11, ◆ / none 16:9).
- **Don't** let `sentiment` or recency change a plate's size.
- **Do** mark a Disliked piece with exactly a red keyline + red pushpin +
  thumb-down, inline on the same wall.
- **Don't** add a corner chip, or dim / hide / silo a Disliked piece — the
  corner chip was tried and rejected for drowning the positives.
- **Do** keep every corner square (0 radius).
- **Don't** introduce `border-radius` anywhere except the pushpin disc and the
  `kind` dot.
- **Do** set the User Note lead at poster scale in cobalt Spectral italic 600.
- **Don't** apply that colour-in-prose treatment to any other text, and don't
  colour the User Note body.
- **Do** keep AI Interpretation visually subordinate — 1px dashed rule, muted
  ink, `2.75rem` margin indent, dated mono header.
- **Don't** let the "later hand" touch, overlap, or restyle the User Note.
- **Do** keep the segmented look literal: buttons welded inside one 2px frame,
  divided by 2px `border-left`, no gaps, no outer radius.
- **Don't** space segment buttons apart or round the group.
- **Do** ship exactly one authored motion — the ignite (straighten + lift +
  label-open + wall-dim to ~0.48) — and gate the wall-dim to
  `(hover:hover) and (pointer:fine)`.
- **Don't** add incidental transitions, entrance animations, parallax, or a
  resting hover-float; honour `prefers-reduced-motion` by dropping the transform.
- **Do** write every control, meta line, and badge in Spline Sans Mono,
  uppercase, tracked ≥ 0.09em.
- **Don't** introduce a sans-serif anywhere, and don't set body prose in
  anything but Spectral.
- **Do** write "TasteVault" as one word, capital T and V, with `Vault` in
  `--accent`.
- **Don't** describe the Portal by comparison to any other product.
