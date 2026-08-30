# TasteVault — Product Requirements

**Author:** Mohammed Sadiq K.
**Status:** Phase 1 planning
**Last revised:** 2026-08-29

This document supersedes the two drafts previously in `.scratch/`
(`TasteVault_PRD.md` and `Personal UX & Design Memory.md`). Vocabulary is fixed in
[`/CONTEXT.md`](../CONTEXT.md); the phase-by-phase plan lives in
[`ROADMAP.md`](./ROADMAP.md).

---

## 1. Summary

TasteVault is an open-source, local-first personal UX/design memory system. It
sits between the web and an AI coding agent as a persistent record of what a
specific human considers good user experience.

The user captures web experiences they like — and, marked as such, ones they
want to **avoid** — preserves the visual, structural, and behavioural
**Evidence** behind them, writes a **User Note** explaining *why*, browses the
accumulated collection through a **Portal** ("a personal Mobbin"), and — in later
phases — exposes the collection to a coding agent through a retrieval interface
(MCP) so the agent can pull the few relevant examples, and the relevant guard
rails, before it designs anything.

The transformation model:

```
Web experience
  → Human selection + explanation
  → Visual + structural + behavioural evidence
  → AI interpretation (derived)
  → Personal UX/design memory
  → Semantic retrieval
  → Claude + human
  → Generated product
```

The system **does not generate UI**. Generation stays with the coding agent and
the human directing it.

---

## 2. Motivation

The user considers UX and product thinking a personal strength, and visual/UI
execution a weaker one. AI can close that gap, but generic AI interfaces drift
toward average patterns. Existing reference tools (Mobbin and similar) help, but
screenshots alone lose the dimensions that make an experience good: interactions,
transitions, animation, state changes, navigation behaviour, responsive
behaviour, contextual relationships, perceived flow.

Core hypothesis:

> If an agent can retrieve interfaces and interactions a particular human has
> explicitly marked as good — or as bad — with the human's reasons and
> structured observations attached — it can produce designs much better aligned
> with that person's taste.

What a person wants to avoid is part of their taste too. A site the user found
horrible is a guard rail: an agent that can see it steers away from those
patterns instead of rediscovering them.

---

## 3. Core principles

1. **Open tool, private vault.** The application, extension, and future MCP server
   are open-source. The user's `references/` Vault is local and never committed.
2. **Experiences over screenshots.** A screenshot is one piece of Evidence. UX
   lives in motion, state transitions, micro-interactions, and context.
3. **Human rationale is ground truth.** The User Note is the primary anchor. AI
   Interpretation is derived data, never a replacement.
4. **Preserve Evidence before interpreting it.** Raw captures stay available;
   AI-generated tags, summaries, and principles are derived and marked as such,
   so an early AI mistake can never destroy the original evidence.
5. **Retrieval, not generation.** The system feeds curated, high-signal evidence
   to the agent *before* generation. It never produces the final interface.
6. **Context-window discipline.** The retrieval layer is a strict gatekeeper: the
   agent receives a small relevant set, never the whole Vault.
7. **The library never fails on incomplete data.** Metadata is enrichment, not a
   contract (see [ADR 0001](./adr/0001-references-degrade-gracefully.md)).
8. **Taste has two poles.** What the user wants to avoid is captured the same way
   as what they want to emulate — one `sentiment` field on a Reference, positive
   by default (see [ADR 0002](./adr/0002-negative-signal.md)).

---

## 4. The Reference model

A **Reference** is the unit of knowledge: one thing the user saved as a signal
about their taste — by default something they liked, or something they want to
avoid when its `sentiment` is `negative` ([ADR 0002](./adr/0002-negative-signal.md)).
It may represent a whole site, a page, a component, an interaction, a transition,
an animation, a responsive behaviour, or a UX pattern.

Conceptual layers (not every Reference has every layer; capture degrades
gracefully):

```
Reference
├── Identity          slug, title, source URL, source name, saved date
├── User Input        User Note (why), rating/importance, tags, surface
├── Visual Evidence   full-page / viewport / region screenshots
├── Structural Evid.  DOM snapshot, accessibility tree, computed styles   (Phase 3+)
├── Behavioural Evid. interaction sequence, before/after state, transition (Phase 3+)
├── Assets            images, SVGs, fonts, other resources                 (Phase 2+)
└── AI Interpretation visual/UX/interaction/motion vocabulary, principles  (Phase 4+)
```

### 4.1 On-disk layout (all phases)

Each Reference is a self-contained directory:

```
references/
└── stripe-command-palette-2026-08-29/
    ├── reference.md        # YAML frontmatter + Markdown body (the User Note)
    ├── cover.png           # optional; grid thumbnail if present
    ├── full.png            # any other images are Evidence, shown filename-sorted
    └── ...
```

- **Folder name** = `<slug>-<YYYY-MM-DD>`. Slug: lowercase, non-alphanumeric →
  `-`, trimmed to ~60 chars; same-name-same-day collisions get `-2`, `-3`.
- **`reference.md` frontmatter** (every field optional — see §4.2):

  ```yaml
  ---
  title: Stripe command palette
  url: https://stripe.com/dashboard
  source: Stripe                       # defaults to url hostname
  kind: element                        # page | element  (interaction | flow later)
  saved: 2026-08-29                    # same value as the folder date suffix
  sentiment: negative                  # optional; omit for a positive Reference
  rating: 3                            # optional: strength of feeling, 1 low / 2 / 3 high
  tags: [command-palette, keyboard-nav]
  surface: dashboard                   # optional freeform hint
  ---

  I love how ⌘K opens instantly with zero layout shift, and Escape
  returns focus exactly to where it was before…
  ```

  The Markdown **body is the User Note**.

### 4.2 Graceful degradation (the v1 data contract)

A Reference is *any directory* under `references/`. Nothing is required. The
scanning server fills gaps:

| Missing | Fallback |
|---|---|
| `reference.md` or unparseable YAML | treat as no metadata, log a line, still list the folder |
| `title` | de-kebab the folder's slug portion |
| `saved` | folder date suffix, else folder mtime |
| `sentiment` | treated as `positive` (unmarked = a liked Reference) |
| `kind`, `url`, `source`, `surface`, `rating` | omitted from the view |
| `tags` | `[]` |
| no images | text-placeholder grid card |

No schema validation, no required-field enforcement, no blocking error surface.
This is a deliberate, recorded decision: [ADR 0001](./adr/0001-references-degrade-gracefully.md).

### 4.3 Taxonomy

No fixed category hierarchy. Each Reference has a freeform `tags: string[]` and an
optional freeform `surface` hint. The Portal builds its filter facets by
aggregating whatever tags exist. `docs/` carries a *suggested* tag list for
consistency; nothing is enforced. Rationale: search matters more than taxonomy,
and a solo user's hand-maintained hierarchy always rots.

`tags` share one facet across both `sentiment` poles — a positive tag names what
the user wants, a negative tag names what they saw and disliked; the card badge
disambiguates. `sentiment` is itself a filter facet (show all / only positive /
only negative).

---

## 5. Phase 1 architecture

Phase 1 proves the core hypothesis before any capture automation is built:
**does the user actually enjoy and benefit from their own visual reference
library?** Success = the library becomes something they naturally keep adding to.

```
references/  ──scan+watch──▶  apps/server (Fastify + TS)  ──/api──▶  apps/web (Vite + React SPA)
                                 │  GET /api/references                  Library grid
                                 │  GET /api/references/:slug            Reference detail
                                 │  GET /api/references/:slug/:file      filter: kind + tags + text
                                 └─ GET /api/events (SSE, chokidar)      live update on file change
```

### 5.1 Components

- **`references/`** — the Vault. Git-ignored contents; `references/readme.md` is
  tracked and is the living authoring guide.
- **`apps/server`** — Fastify + TypeScript (run with `tsx`). Scans and watches
  `references/`, parses frontmatter, renders the User Note to sanitized HTML
  (`markdown-it`), serves the JSON API, the raw asset files, and an SSE stream so
  the Portal live-updates. Never fails on bad input.
- **`apps/web`** — Vite + React + TypeScript SPA. Tailwind CSS + Radix primitives
  for the interactive bits (filter popover, dialog). Two routes: **Library**
  (masonry grid of covers; filter bar = `kind` toggle + `sentiment` toggle + tag
  chips + text box; default sort `saved` descending; negative References shown
  inline with a badge) and **Reference detail** (all screenshots,
  identity fields, rendered User Note). Client-side fuzzy search over title +
  tags + note text.
- **`apps/extension`** — empty stub; Phase 2.
- **Scaffold script** — root `pnpm new` → `scripts/new-reference.ts` (tsx).
  Prompts for title / url / kind / tags and whether this is a negative Reference
  (default no), computes `<slug>-<today>`, creates the folder with a pre-filled
  `reference.md` (`sentiment: negative` written only when chosen), prints the
  path. A convenience, never a gate.

### 5.2 Repo & tooling

- pnpm workspace: `pnpm-workspace.yaml` globs `apps/*`. `packages/*` is added
  only when a shared package actually exists (shared types live in `apps/web`
  for now).
- Root scripts: `pnpm dev` (server + web with HMR), `pnpm start` (server builds
  and serves the static Portal on a single port — the everyday mode), `pnpm new`.
- Ports: server `5174`, Vite `5173` proxying `/api` → server.
- Baseline: Node 22 LTS, `tsx`, TypeScript `strict`.
- License: MIT.

### 5.3 Explicitly out of scope for Phase 1

Browser capture, structural/behavioural evidence, AI analysis, semantic search,
MCP, self-hosting. All covered by later phases in [`ROADMAP.md`](./ROADMAP.md).

---

## 6. Long-term architecture (Phases 2–6)

```
                 HUMAN
                   │
          ┌────────▼─────────┐
          │ Browser Extension│  save page / component / interaction + explanation
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ Capture Pipeline │  screenshots, DOM/state, styles, interactions, motion, assets
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ Reference Store  │  raw evidence + metadata + User Notes + AI Interpretation
          └───────┬───────┬──┘
          ┌───────┘       └────────┐
          ▼                        ▼
   ┌────────────┐          ┌──────────────────┐
   │ Portal     │          │ Retrieval / MCP  │  search, retrieve, compare, taste profile
   │ browse     │          └────────┬─────────┘
   │ filter     │                   ▼
   │ inspect    │              Claude Code
   │ curate     │                   ▼
   └────────────┘            Human + Agent generate UI
```

Anticipated future packages: `packages/core` (shared schema/types),
`packages/database` (filesystem adapter + vector search), `apps/mcp-server`.

### 6.1 Intelligence layer (Phase 4)

Capture asks *"what happened?"*; analysis asks *"what does it mean?"*. Keep both.
Prefer measurable observations (spacing, typography, colour, radii, transition
timing, DOM relationships). AI-inferred patterns (progressive disclosure,
contextual navigation, persistent spatial context, restrained motion, …) are
marked as interpretation. The User Note stays independently searchable. Negative
References run through the same analysis; what it derives from them are
anti-patterns — the same machinery, the opposite pole.

### 6.2 Retrieval (Phase 5)

Combine lexical search, metadata filtering, semantic search, user-preference
relevance, and reference type into ranked results. The agent receives the top
handful of References and their relevant Evidence — never the whole Vault. MCP
tools (retrieval-only): `search_references`, `get_reference`,
`get_reference_evidence`, `search_interactions`, `find_patterns`,
`find_user_preferences`, `get_related_references`, `get_taste_profile`.

Negative References are part of retrieval, not a bolt-on: when the agent pulls
examples relevant to what it is designing, the relevant guard rails come with
them. The consuming agent (e.g. Impeccable) infers which is which from
`sentiment` — the user does not flag poles in their prompt. Open for this phase:
how `sentiment` weights ranking, and whether negatives surface through a
dedicated tool (`find_aversions`) or a signed field on existing results.

### 6.3 Taste Profile (Phase 5+)

A higher-level summary derived by aggregating across the Vault (visual / UX /
motion / navigation tendencies), with two halves: tendencies to emulate (from
positive References) and tendencies to avoid (from negative ones). Derived
knowledge, not ground truth; individual References remain the evidence. Taste
drift: newer References may warrant more weight than older ones.

---

## 7. Key design decisions

1. **Local-first is the default.** Personal taste data, possibly authenticated
   sites, large asset corpus, no external-service dependency. A hosted version
   can come later.
2. **Raw Evidence and AI Interpretation are separate.** An incorrect AI summary
   must never replace captured Evidence.
3. **User Notes are first-class.** The human's reason is among the most valuable
   data in the system and stays independently searchable.
4. **A Reference can be page-level or element/interaction-level.** Not every
   Reference represents a whole page.
5. **Search over taxonomy.** Freeform tags, no enforced hierarchy; semantic
   retrieval is the long-term target.
6. **MCP retrieves Evidence; it never dumps the Vault.** Context efficiency is a
   first-class constraint.
7. **Generation stays outside the system.** TasteVault is the agent's design
   *memory*, not its design *generator*. Existing generation skills
   (Impeccable, component/reference tools) stay in the generation workflow;
   TasteVault is another source of context.
8. **The library degrades gracefully; it does not validate.**
   [ADR 0001](./adr/0001-references-degrade-gracefully.md).
9. **Negative signal is one field, not a new model.** `sentiment: negative` on a
   Reference, positive by default, flat storage, present from Phase 1, carried
   through every phase as metadata rather than a separate workstream.
   [ADR 0002](./adr/0002-negative-signal.md).

---

## 8. Known risks / open questions (not blocking Phase 1)

- **Browser capture fidelity** — how much useful information can be reliably
  extracted from arbitrary modern sites?
- **Authentication / privacy** — how to store References from authenticated apps.
- **Cross-origin content** — iframes and embedded apps.
- **Canvas / WebGL** — experiences not meaningfully represented via DOM.
- **Dynamic applications** — capturing stateful apps without reproducing a
  backend.
- **Legal / licensing** — how much third-party page content to persist locally
  vs. represent through screenshots, metadata, and derived observations.
- **Retrieval quality** — preventing a large corpus from surfacing superficially
  relevant but aesthetically wrong results.
- **Taste drift** — weighting References by recency as taste evolves.
- **Negative signal in retrieval** — how `sentiment` weights ranking, and the
  shape of a negative-aware MCP tool (dedicated `find_aversions` vs. a signed
  field on existing results). Deferred to Phase 5 ([ADR 0002](./adr/0002-negative-signal.md)).

---

## 9. One-line definition

> A personal, local-first UX/design memory that lets me save things I love on the
> web — and the ones I want to avoid — preserve the visual and behavioural
> evidence behind them, explain why, browse my accumulated taste like a personal
> Mobbin, and give an AI agent a powerful retrieval interface for finding the
> right examples, and the right guard rails, when I'm designing something new.
