# Your TasteVault

This folder is your **Vault** — your private, local collection of design/UX
**References**. Its contents are git-ignored; only this `readme.md` is tracked.
Nothing here is uploaded anywhere.

## What a Reference is

One thing you saved as a signal about your taste — a whole page or site, a
component, or (in later phases) an interaction or flow. By default it is
something you **liked**. It can also be something you want to **avoid**: add
`sentiment: negative` (see [Negative References](#negative-references)). Each
Reference is one directory inside `references/`.

Agents read `AGENTS.md` in this folder to learn that both poles exist.

## Creating a Reference

**The easy way:** from the repo root run

```
pnpm new
```

It asks for a title, URL, kind, and tags, then creates a well-formed folder for
you.

**By hand:** make a directory named `<slug>-<YYYY-MM-DD>`, drop in one or more
screenshots, and optionally add a `reference.md`:

```
references/
└── stripe-command-palette-2026-08-29/
    ├── reference.md      # optional — metadata + your note
    ├── cover.png         # optional — used as the grid thumbnail if present
    └── full.png          # any other images are shown, sorted by filename
```

## `reference.md`

YAML frontmatter followed by a Markdown body. **Every field is optional**, and so
is the whole file — the Portal fills in what it can from the folder name and file
dates. The Markdown body is your note on *why* you saved this.

```markdown
---
title: Stripe command palette
url: https://stripe.com/dashboard
source: Stripe                        # defaults to the URL's hostname
kind: element                         # page | element
saved: 2026-08-29                     # match the folder's date suffix
sentiment: negative                   # optional; omit for something you like
rating: 3                             # optional: strength of feeling, 1 low / 2 / 3 high
tags: [command-palette, keyboard-nav, overlay]
surface: dashboard                    # optional freeform hint
---

I love how ⌘K opens instantly with zero layout shift, and Escape returns
focus exactly to where it was before. The results feel like they were
always there.
```

### Fields

| Field | Meaning | If omitted |
|---|---|---|
| `title` | Display name | de-kebabed from the folder slug |
| `url` | Where it's from | hidden in the view |
| `source` | Site/product name | the URL's hostname |
| `kind` | `page` (whole page/site) or `element` (isolated component/region) | hidden |
| `saved` | Date you saved it | folder date suffix, else folder modified time |
| `sentiment` | `negative` if this is something to avoid; omit if you liked it | `positive` |
| `rating` | Strength of feeling, `1`–`3` (applies to either pole) | hidden |
| `tags` | Freeform list; the Portal builds its filters from these | `[]` |
| `surface` | Freeform hint like `dashboard`, `marketing site`, `editor` | hidden |

There is no fixed tag list and nothing is validated — a typo in this file will
never hide your Reference. See `docs/` for *suggested* tags if you want
consistency.

## Negative References

Sometimes the useful signal is a bad one: you land on a site, it's horrible, and
you want your AI agent to *avoid* whatever it did. Save it the same way you'd
save something you like — folder, screenshots, a `reference.md` — and add one
field:

```yaml
sentiment: negative
```

In the User Note, say **what to avoid and why** rather than what you liked. Use
`rating` for how strongly you feel (a `3` negative is "never do this"). It can be
a whole page (`kind: page`) or one bad pattern in isolation (`kind: element`).

Everything under `references/` counts as something you *like* unless it carries
`sentiment: negative`. The Portal shows negative References in the grid with a
badge and lets you filter by sentiment; agents pick them up from the field (see
`AGENTS.md`).

## Screenshots

Put any image files (`png`, `webp`, `jpg`, `gif`) directly in the folder. They're
shown sorted by filename. Name one `cover.*` to control the grid thumbnail;
otherwise the first image is used. A Reference with no images still appears, with
a text placeholder.

## Browsing

From the repo root:

```
pnpm start
```

then open the Portal. It watches this folder, so new References appear as you add
them.
