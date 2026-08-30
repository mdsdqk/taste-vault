# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decided in `docs/PRD.md` §5, not by init. The Portal (`apps/web`) is a Vite +
React + TypeScript SPA using Tailwind CSS and Radix primitives for interactive
parts (filter popover, dialog). The scanning server (`apps/server`) is Fastify +
TypeScript run with `tsx`. pnpm workspace globbing `apps/*`; Node 22 LTS;
TypeScript strict; MIT license. No scaffold exists in the repo yet — the code is
still to be written against this committed plan.

## Users

The primary user is a developer running their own local TasteVault: someone who
considers UX and product thinking a personal strength and visual/UI execution a
weaker one, who wants an AI coding agent to close that gap without drifting toward
average patterns. They use it in two situations — (1) browsing and curating their
accumulated collection of saved web experiences, and (2) directing an AI coding
agent that retrieves from that collection while designing something new.

The application code is open-source and the design should treat any developer as
a potential adopter: a first-run experience, empty states that read like
documentation, and no assumptions specific to the original author. Each user's
Vault is still private, local, and single-user — one person's taste on one
machine. There is no multi-user, multi-tenant, or shared-Vault dimension.

## Product Purpose

TasteVault is an open-source, local-first personal UX/design memory system. It
sits between the web and an AI coding agent as a persistent record of what a
specific human considers good — and bad — user experience.

The user captures web experiences they have explicitly judged (things to emulate,
and things to avoid), preserves the visual, structural, and behavioural
**Evidence** behind them, writes a **User Note** explaining *why*, browses the
accumulated collection through the **Portal**, and — in later phases — exposes the
collection to a coding agent through a retrieval interface (MCP) so the agent can
pull the few relevant examples, and the relevant guard rails, before it designs
anything.

The system does not generate UI. Generation stays with the coding agent and the
human directing it. Success for Phase 1 is that the library becomes something the
user naturally keeps adding to.

## Positioning

Describe TasteVault on its own terms, never by comparison to another product and
never as "the X of Y". Its distinguishing mechanism, which a neighbouring tool
could not truthfully claim:

- It preserves the dimensions a screenshot loses — interactions, transitions,
  animation, state changes, navigation and responsive behaviour, perceived flow —
  as first-class Evidence, not just static images.
- The human's own reasoning (the User Note) is ground truth and stays
  independently searchable; AI-derived vocabulary, patterns, and principles are
  kept separate and always marked as derived, so an early AI mistake can never
  destroy the original Evidence.
- Taste has two poles. What the user wants to avoid is captured exactly like what
  they want to emulate — one optional `sentiment` field, positive by default — and
  carried through every phase as a guard rail for the agent.
- It is a retrieval memory, not a generator. A strict gatekeeper feeds the agent
  a small, relevant, high-signal set — never the whole Vault.

## Operating Context

- **The Vault** is `references/` on the user's machine. Its contents are
  git-ignored and never committed; only `references/readme.md` (the authoring
  guide) and `references/AGENTS.md` (the agent-facing guide) are tracked.
- **A Reference** is any directory under `references/`, named
  `<slug>-<YYYY-MM-DD>`. It contains image files and an optional `reference.md`
  (YAML frontmatter + a Markdown body that is the User Note). It may represent a
  whole site, a page, a component, an interaction, a transition, an animation, a
  responsive behaviour, or a UX pattern.
- **Phase 1 capture is manual** — the user places files by hand or runs
  `pnpm new` (`scripts/new-reference.ts`), a scaffold that produces a well-formed
  folder. The scaffold is a convenience, never a gate. Later phases automate
  capture via a browser extension.
- **The Portal** has two views: **Library** (grid of covers; filter bar =
  `kind` toggle + `sentiment` toggle + tag chips + text search; default sort
  `saved` descending; negative References shown inline with a badge) and
  **Reference detail** (all screenshots, identity fields, rendered User Note).
  Client-side fuzzy search runs over title + tags + note text.
- **The server** scans and watches `references/` (chokidar), parses frontmatter,
  renders the User Note to sanitized HTML (`markdown-it`), and serves a JSON API
  plus an SSE stream (`GET /api/events`) so the Portal live-updates as folders
  change. Ports: server `5174`, Vite `5173` proxying `/api`. Everyday mode is
  `pnpm start` (server builds and serves the static Portal on one port);
  `pnpm dev` runs both with HMR.
- **Later phases** (not Phase 1): browser extension, structural/behavioural
  Evidence, AI Interpretation, semantic retrieval, MCP server, self-hosting.

## Capabilities and Constraints

- **Graceful degradation, never validation.** A Reference is any directory under
  `references/`; nothing inside is required. `reference.md` missing or its YAML
  unparseable → treat as no metadata, log a line, still list the folder. Missing
  `title` → de-kebab the slug; missing `saved` → folder date suffix then mtime;
  missing `kind`/`url`/`source`/`surface`/`rating` → omit from the view; missing
  `tags` → `[]`; no images → text-placeholder card. No schema validation, no
  required-field enforcement, no blocking error surface. Recorded in
  `docs/adr/0001-references-degrade-gracefully.md`.
- **`sentiment`** is one optional frontmatter field; the only meaningful value is
  `negative`. Absent, `positive`, or unparseable ⇒ the Reference is positive.
  Storage stays flat — no `positives/` / `negatives/` split. Recorded in
  `docs/adr/0002-negative-signal.md`.
- **`rating`** is orthogonal to `sentiment`: it means strength of feeling
  (`1`–`3`) on whichever pole the Reference is on, not "how positive".
- **No fixed taxonomy.** Freeform `tags: string[]` and an optional freeform
  `surface` hint. The Portal builds its filter facets by aggregating whatever
  tags exist. `tags` share one facet across both sentiment poles; the card badge
  disambiguates. `docs/` may carry a *suggested* tag list; nothing is enforced.
- **Local-first, no external-service dependency.** Personal taste data, possibly
  from authenticated sites, potentially a large asset corpus. A hosted version
  may come later but is not a Phase 1 concern.
- **Raw Evidence and AI Interpretation are separate stores.** An incorrect AI
  summary must never overwrite captured Evidence.
- **Retrieval, not generation.** TasteVault never produces the final interface;
  the context window is a first-class constraint on what retrieval returns.
- Terminology is fixed in `CONTEXT.md`: Reference, Sentiment, Surface, Vault,
  Portal, Evidence, User Note, AI Interpretation, Capture, Taste Profile. Use
  those words; honour their listed *Avoid* lists.
- **Open decisions (not blocking):** browser capture fidelity; storing References
  from authenticated apps; cross-origin / canvas / WebGL content; capturing
  stateful apps; third-party content licensing; retrieval quality at scale; taste
  drift (weighting by recency); how `sentiment` weights retrieval ranking and the
  shape of a negative-aware MCP tool (deferred to Phase 5).

## Brand Commitments

- **Name:** "TasteVault" is locked. Written as one word, capital T, capital V.
  The repo, package, and directory use `taste-vault`.
- **No comparison positioning.** Do not describe the product as "a personal
  Mobbin" or with any "the X of Y" / "like X for Y" construction — the user has
  asked for this explicitly, on the grounds that the purpose is genuinely
  different from reference-screenshot tools. The phrase "a personal Mobbin"
  appears in `docs/PRD.md`, `CONTEXT.md`, and `references/readme.md` as legacy
  wording that predates this preference; treat it as something to drop, not to
  carry forward.
- Voice and personality for the Portal are otherwise open — to be set in the
  later visual pass, not here.

## Evidence on Hand

- **Product documentation, all current:** `docs/PRD.md` (full Phase 1 spec and
  long-term architecture), `docs/ROADMAP.md` (six phased plan),
  `docs/adr/0001-references-degrade-gracefully.md`,
  `docs/adr/0002-negative-signal.md`, `CONTEXT.md` (fixed glossary),
  `references/readme.md` (human authoring guide), `references/AGENTS.md`
  (agent-facing guide).
- **No application code yet.** `package.json` is a bare stub; there is no
  `apps/`, no server, no Portal, no scaffold script. All of it is still to be
  built against the PRD.
- **No real References yet.** The Vault contains only the tracked `readme.md` and
  `AGENTS.md`. There are no saved screenshots, no example folders, no populated
  `reference.md` files. Any References shown in design work are illustrative and
  must be labelled as such — do not present invented saved experiences as the
  user's real taste data.
- **No users, adoption numbers, testimonials, press, benchmarks, pricing, or
  deployment history.** None of these exist; future work must not fabricate them.

## Product Principles

1. **Open tool, private Vault.** The application, extension, and future MCP
   server are open-source; each user's `references/` collection is local and
   never committed. Design for adopters, but never assume more than one person
   per Vault.
2. **Experiences over screenshots.** A screenshot is one piece of Evidence. The
   value lives in motion, state transitions, micro-interactions, and context —
   the Portal and the model should keep room for those dimensions.
3. **Human rationale is ground truth; AI Interpretation is derived.** The User
   Note is the primary anchor and stays independently searchable. Derived data is
   always visibly marked as derived and never replaces captured Evidence.
4. **The library never fails on incomplete data.** Metadata is enrichment, not a
   contract. Prefer a graceful fallback and a logged line over an error surface
   that blocks the view.
5. **Retrieval, not generation, with context-window discipline.** TasteVault
   feeds a small, curated, high-signal set to the agent before generation and
   never produces the final interface.
6. **Taste has two poles.** What the user wants to avoid is modelled, stored,
   analysed, and retrieved exactly like what they want to emulate — one
   cross-cutting `sentiment` field, positive by default, not a separate
   workstream.

## Accessibility & Inclusion

No formal standard and no audit gate. Portal work should meet sensible defaults —
fully keyboard-operable, real visible focus states, reasonable colour contrast,
motion that respects `prefers-reduced-motion` — but there is no WCAG target and
no specific personal accessibility need on record.
