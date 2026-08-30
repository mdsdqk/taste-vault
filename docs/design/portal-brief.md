# Portal — design brief (Library + Reference detail)

**Status:** confirmed — direction, palette, and all open items resolved
**Produced by:** `/impeccable shape` · direction roll seed `d8706055` (mode: operate)
**Supersedes:** nothing — first design brief for the Portal

This brief plans the UX/UI. It does not write code and does not write DESIGN.md;
DESIGN.md is authored later, from the built world.

---

## 1. Job and audience

The **Portal** is the human-facing application for browsing, inspecting, and
authoring the **Vault**. This brief covers its two core surfaces: the **Library**
view and the **Reference detail** view.

Who arrives: a developer running their own local TasteVault. The app is
open-source, so the design serves any adopter — a first-run experience, empty
states that read like documentation, no assumptions specific to the original
author — while every Vault stays private, local, and single-user.

They arrive in one of two states of mind:

- **The magpie** — just saw something good or bad on the web, wants to add it and
  move on, or wants to wander the collection for pleasure.
- **The director** — about to brief an AI coding agent, wants to find the few
  relevant References (and the relevant guard rails) fast.

**Visitor mode: Operate** — the visitor completes a task (browse, filter, find,
read, author). Expression is licensed heavily by the client (see §3), but it may
never obscure the task, the state, or a familiar affordance.

## 2. Outcome and proof

**Primary tasks:**
1. Scan the collection and recognise the piece you want.
2. Open one Reference and understand *why* it was saved — the User Note is the
   payload.
3. Add or amend a Reference in place, without friction and without a gate.

**Success:** the Library becomes something the user keeps adding to and enjoys
returning to; finding a Reference to hand an agent takes seconds; authoring never
feels like filing paperwork.

**Real evidence the surface carries:** screenshots (the Evidence), the User Note
(ground truth, set as the centrepiece), identity fields (source, url, kind,
saved, surface), `rating` (strength of feeling, 1–3), `sentiment`
(positive/negative), freeform `tags`, and — later — AI Interpretation shown as
clearly-derived, appended annotation. TasteVault has **no real References yet**;
all mockup content is illustrative and labelled as such.

**Product-specific truths the design must encode:**
- Raw Evidence and AI Interpretation are separate; the latter never overwrites
  the former, and is always visibly marked as derived.
- Both poles of taste live inline in one collection; a negative Reference is
  still a Reference, shown in the grid with a badge, not hidden or siloed.
- Metadata is enrichment, not a contract — every field is optional and the view
  degrades gracefully (ADR 0001).

## 3. Selected direction

**Visual world (brief-pinned): "The Connoisseur's Logbook", rendered as a bright
gallery.** The roll assigned the Logbook; the user locked it and steered its
rendition on two axes — composition and palette. Both steers are pinned.

**Identity — kept from the Logbook:**
- A Reference is a **mounted plate**: the screenshot with a printed edge, tipped
  in at a slight tilt, tacked with tape or a pin.
- Each plate carries a **typeset label** — source · surface · kind · saved ·
  `rating` as a shorthand of pips · the opening clause of the User Note.
- **`sentiment` is ink/colour, not layout** — emulate and avoid are two bold,
  legible colours; avoid pieces sit inline in the same collection with a clear
  mark, never dimmed away or hidden.
- **The User Note is the hand of the piece** — on the detail view it is the
  centrepiece, set large in an editorial face with a monumental opening line.
- **AI Interpretation is a later hand** — dated marginalia in a second ink,
  appended beside the note, never overwriting it.
- **Editing is "uncapping the pen"** — the detail view is always a page you can
  write on; fields become writable in place, plates accept drag-to-add and a
  cover pick, a half-filled save is allowed (no validation gate). Create is a
  fresh blank mount / catalogue page.

**Structural thesis (steer 1 — composition):** the Library is a **gallery wall,
not a register.** You do not read a gallery serially; you wander a scattered hang.
Resolved through mockup iteration:

- A **left-to-right, row-by-row grid** (4 columns at desktop → 2 → 1), *not*
  column-fill masonry — column masonry read as right-to-left and was rejected.
- The "hung at slightly different heights" gallery feel comes from a small
  **per-column vertical offset** plus a **1–2° tilt** per plate, never from
  packing order; reading order always equals DOM order.
- **Plate size rides `rating`** (◆◆◆ large, ◆◆ medium, ◆ small) so the wall
  stratifies by strength of feeling. `sentiment` does **not** drive size.
- Each Reference is a **pinned plate**: printed-edge screenshot, a real
  **pushpin** at the top (not tape — tape read as a sticky note), tilt, and a
  drop shadow. Below it, a printed label block (thumb icon, title, meta line,
  rating pips, first lines of the User Note). No card containers or button
  chrome — rules, ink, and colour blocks, never boxes.
- On hover/focus a piece **ignites**: it straightens, lifts, its label opens to
  more of the note, and the rest of the wall dims to context weight.
- The label block also carries a **subtle `kind` accent** — a small dot before
  the kind word in the meta line, tinted from the existing palette (`page` and
  `element` get distinct restrained tints drawn from `--accent` / `--hi`, later
  kinds extend the same small ramp). It is a mark, never a fill, and never a new
  hue; sentiment stays the only strong colour on the card.
- A dense **ledger view** is **deferred past build 1.** Build 1 ships the
  gallery only, with windowing so it survives large collections; the
  gallery↔ledger toggle stays hidden/stubbed until the Vault is big enough to
  warrant a dense mode.

**Palette (steer 2 — colour): resolved.** Cold and punchy, theme-aware. The warm
riso/cream rendition was rejected; purple + orange was rejected.

- **Light theme = SLATE:** cool near-white ground `#e6eaee`, near-black ink
  `#0f1418`, cobalt accent `#1452ff`, hot-cyan highlight `#0bb6c9`, white panel.
- **Dark theme = NOIR:** near-black ground `#0f1215`, panel `#181c21`, light ink
  `#f1f4f6`, electric-blue accent `#2f6bff`, cyan highlight `#22e6c8`.
- Theme follows `prefers-color-scheme`; an explicit `data-theme` overrides.
- **Sentiment is semantic and theme-stable:** **green = liked**
  (`#0aa259` / `#26d47e`), **red = avoid** (`#e11d34` / `#ff4b60`). It never
  changes with palette.
- Colour is disciplined into named roles (ground, panel, ink, accent, highlight,
  like, avoid), doing real work — not scattered candy accents.

**Sentiment display: resolved.** A **thumb-up (green) / thumb-down (red)** icon
on every card's label; the filter toggle reads **All / 👍 Liked / 👎 Disliked**
(the words "Emulate" and "Avoid" were both rejected — "Liked / Disliked" is
declarative and simple, not authoritative). A disliked piece additionally gets
a **red plate keyline** and a red pushpin. **No corner chip** — it was tried and
rejected for shouting so loudly it subdued the positive pieces. The detail view
carries a small "👍 Liked · return to this" verdict pill.

**Type register: resolved for the mockup, confirm at build.**
- Display (vault name, Reference titles, detail entry title): **Young Serif** —
  warm, chunky old-style, characterful.
- Body / User Note: **Spectral** (with its italic for the monumental opening
  line and for marginalia).
- Label / metadata / controls: **Spline Sans Mono**.
- Instrument Serif was tried and dropped (flagged as an over-used AI face).

**Raises carried from the directions the roll beat:**
- *Monumental type as matter* (from Alphabet Storm): the User Note's opening
  clause and Reference titles set at poster scale; words carry the page.
- *No chrome* (from Metro Tiles): rules and ink only, selection floods a piece
  with ink, never a drawn box.
- *Rigid grid, focused piece ignites* (from Transit Diagram): the scatter sits on
  a real underlying measure; on hover/focus the piece straightens, lifts flat,
  and its label opens while neighbours hold context weight.
- *Rating as continuous visual weight* (from Cracktro Queue): `rating` drives
  plate size, ink density, and air — the wall visibly stratifies by strength of
  feeling — and the piece under the reader's eye holds perfectly still while
  anything else moves.

**Focal moment:** opening a Reference — the plate lifts off the wall and settles
on the table as its catalogue page, the User Note's first line arriving at full
scale.

**Cross-surface reach:** the same gallery/print world carries a future Taste
Profile (an exhibition-catalogue essay / a wall of aggregate swatches), the
Phase 2 browser-extension quick capture (a plate pinned up fast), and the Phase 5
MCP retrieval view (pieces pulled from the wall for the agent).

**Implementation consequence:** a left-to-right grid of non-uniform tiles on a
shared baseline measure; the SLATE/NOIR theme-aware palette system with named
roles; the Portal is a Vite + React SPA against a Fastify scan/watch server per
PRD §5; an SSE-driven "new plate pinned up" update; one orchestrated
print/gallery motion grammar with a reduced-motion path. Deleting a Reference
moves its folder to a hidden removed state (e.g. `references/.trash/<slug>/`,
already covered by the `references/*` gitignore) that a **Recently removed**
panel lists, with restore and permanently-delete; permanently-delete routes to
the OS trash. Kept until the user empties it (optional later: auto-purge after N
days).

**Honest risk:** a bright riso/gallery look has its own generic cluster (the
"playful startup, five candy colours, hand-drawn blobs" trap). Defences: colour
stays disciplined into named print roles; the type is a real opinionated face,
not a rounded-sans default; imperfection is genuine print registration, not
decorative wobble; and the ground stays calm and light enough to be a real
gallery wall — saturation lives in ink, labels, `sentiment`, and accents, never
at the cost of screenshot or prose legibility.

## 4. Scope and boundaries

**In scope for this brief:** Library view; Reference detail view (including its
in-place create / edit / delete affordances, since the user placed authoring
there rather than on separate screens); a lightweight **Recently removed** panel
(list + restore + permanently-delete).

**Fidelity / breadth:** the two production-ready screens plus the removed panel
and all material states. Not in this brief: a separate `/new` or `/edit` route,
the dense ledger view (deferred), settings, the Taste Profile, MCP/retrieval
surfaces, the browser extension.

**Interactivity:** real filtering, sorting, search, in-place editing, delete →
recover, and the print/gallery motion grammar — not a static comp. The
gallery↔ledger toggle renders but is stubbed (ledger deferred).

**Must remain untouched:**
- The on-disk format: whatever the Portal writes is exactly the
  `<slug>-<YYYY-MM-DD>/` + optional `reference.md` (YAML + Markdown body) + image
  files layout, so manual, scaffold (`pnpm new`), and future extension authoring
  stay interchangeable.
- Graceful degradation (ADR 0001): no schema validation, no required-field
  enforcement, no blocking error surface. A half-filled or malformed Reference
  still appears.
- CONTEXT.md terminology verbatim in UI copy: Reference, Vault, Portal, User
  Note, Evidence, Sentiment, Surface, AI Interpretation, Capture, Taste Profile.
  No synonyms.

**Anti-goals:**
- Not a reference-screenshot tool clone — no comparison positioning anywhere in
  copy, and the masonry-plus-sidebar canon "done cleanly" is explicitly the thing
  this is not.
- No heavy branded app shell, marketing flourishes, or dashboard-style stat
  headers ("it's a personal tool").
- No muted / pastel / subdued rendition — that steer has been given once and is
  pinned.
- Authoring is never a wizard or a gate.

## 5. States and ranges

**Content ranges (design for growth, unknown ceiling):**
- Start: 0 References (first run).
- Habit: tens to low hundreds.
- Must not break at thousands: the gallery needs windowing/virtualisation and
  the ledger view is the load-bearing dense mode at that scale; masonry
  pagination or infinite scroll is expected.

**Per Reference:** 0–~12 images; User Note 0 to several paragraphs; 0–~8 tags;
`rating` absent or 1–3; `sentiment` absent (positive) or negative; any identity
field may be missing.

**Material states:**
- **First run / empty gallery:** an empty wall with a few "pin your first piece"
  mounts and the authoring-guide content inline — docs-quality, joyful, not a sad
  empty state.
- **Loading / scanning:** plates arriving as the server scans `references/`.
- **Degraded Reference:** missing `reference.md` or unparseable YAML → title
  de-kebabed from the folder slug, date from the folder suffix then mtime, other
  fields simply absent from the label; a logged line, never an error card.
- **No images:** a text-placeholder plate, still hung on the wall.
- **Disliked Reference:** red plate keyline + red pushpin + thumb-down icon,
  inline on the same wall. No corner chip.
- **Filtered to empty:** a clear "nothing hung matches" state with a reset.
- **Live update:** a new plate is pinned up (SSE) without disturbing the piece
  being read.
- **Editing:** "pen uncapped" — fields writable in place, unsaved-change
  indication, drag-to-add images, pick cover.
- **Delete:** removes the piece from the wall into a hidden removed state; a
  **Recently removed** panel lists it with restore and permanently-delete.
- **Recently removed (empty):** a quiet "nothing removed" state.
- **Save of an incomplete Reference:** allowed, no blocking validation.

## 6. Interaction and layout

- **Hierarchy:** the plates (Evidence) lead the Library; the User Note leads the
  detail view; identity fields and AI Interpretation are support.
- **Library topology:** a left-to-right, row-by-row grid (4 → 2 → 1 columns);
  per-column vertical offset + per-plate tilt for the hung feel; plate size from
  `rating`. Each label carries the subtle `kind` dot. A header band as the
  gallery's wall text — sentiment toggle (All / Liked / Disliked with thumb
  icons), kind toggle, aggregated tag chips, text search, sort (default `saved`
  desc; also rating; also tag-cluster), the stubbed gallery↔ledger toggle, and an
  entry point to **Recently removed** (overflow or a quiet link, not a primary
  control). Client-side fuzzy search over title + tags + note.
- **Detail topology:** the piece "on the table" — large tipped-in plate(s), a
  bold typeset label block, the User Note as the monumental centrepiece, the
  rating shorthand with its legend, AI Interpretation as dated marginalia. Edit
  affordances inline; delete sits here too. Previous/next to move along the wall.
- **Responsiveness:** the scatter reflows column count down to a single column on
  narrow screens without becoming a plain list; the header band collapses to a
  compact control set; the detail view stacks plate → label → note.
- **Affordances & feedback:** hover/focus ignites a piece (straighten, lift flat,
  label opens, neighbours hold context); selection floods with ink, not a box;
  keyboard-navigable throughout with real visible focus states.
- **Transitions:** one orchestrated print/gallery motion grammar — pinning a
  plate up (new save), lifting a plate off the wall (open detail), uncapping the
  pen (edit). Expensive effects bounded; content visible by default; full
  `prefers-reduced-motion` path.

## 7. Constraints and open decisions

**Binding constraints:**
- Platform: web. Stack per PRD §5: Vite + React + TypeScript SPA (Tailwind +
  Radix primitives), Fastify + `tsx` scan/watch server, SSE for live update,
  Node 22, TS strict.
- Accessibility: sensible defaults — fully keyboard-operable, real focus states,
  reasonable contrast (bright palette must still pass), `prefers-reduced-motion`
  honoured. No formal WCAG target, no audit gate.
- On-disk format and graceful degradation as in §4.
- No comparison positioning; CONTEXT.md terms verbatim.

**Resolved through mockup iteration (see `docs/design/.scratch/logbook.html`):**
- Palette: SLATE (light) / NOIR (dark), values in §3.
- Type faces: Young Serif / Spectral / Spline Sans Mono (confirm at build).
- Plate size ← `rating` only (◆◆◆/◆◆/◆ → large/medium/small).
- Sentiment shown via thumb-up/down icons + red plate keyline for disliked; no
  corner chip; filter reads All / Liked / Disliked.
- Library grid reads left-to-right, row by row; hung feel via column offset +
  tilt.
- Label carries a **subtle `kind` dot** (mark, not fill; palette-derived tints),
  in addition to the sentiment border. `surface` is not colour-coded.
- **Delete is recoverable:** into a hidden removed state with a **Recently
  removed** panel (restore / permanently-delete → OS trash).
- **Ledger view deferred** past build 1; gallery only, with windowing; toggle
  stubbed.

**Nothing left open.** The brief is fully resolved.

**Deferred (not this brief):** the dense ledger view, separate authoring routes,
settings, Taste Profile, MCP/retrieval surfaces, browser extension, self-hosting.

---

## Next step

On confirmation of this brief, the next action is the build: `/impeccable`
new-work continues from the pinned direction — commit the world (colour strategy,
faces, the direction contract), build Library + Reference detail with full
commitment, then the finish review and DESIGN.md. `shape` stops here.
