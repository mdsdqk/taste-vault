# TasteVault — Roadmap

Phased plan. Each phase must prove useful before the next begins. See
[`PRD.md`](./PRD.md) for the product and [`/CONTEXT.md`](../CONTEXT.md) for
vocabulary.

---

## Phase 1 — Manual taste library

**Goal:** prove the user enjoys and benefits from their own visual reference
library, before building any capture automation.

**Build:**

- `references/` Vault: one self-contained directory per Reference
  (`<slug>-<YYYY-MM-DD>/`), `reference.md` = YAML frontmatter + Markdown body
  (the User Note), plus image files. Every field optional; the library never
  fails on incomplete data ([ADR 0001](./adr/0001-references-degrade-gracefully.md)).
  An optional `sentiment: negative` field marks a Reference the user wants to
  *avoid*; unmarked means liked ([ADR 0002](./adr/0002-negative-signal.md)).
- `references/AGENTS.md` — agent-facing counterpart to `readme.md`: tells any
  agent reading the Vault that both taste poles exist and how to read `sentiment`.
- `apps/server` — Fastify + TS. Scans and watches `references/`, parses
  frontmatter, renders the User Note to sanitized HTML, serves
  `GET /api/references`, `GET /api/references/:slug`,
  `GET /api/references/:slug/:file`, and `GET /api/events` (SSE) for live update.
- `apps/web` — Vite + React + TS SPA. Tailwind + Radix. **Library** view
  (masonry grid, filter bar: `kind` toggle + `sentiment` toggle + tag chips +
  text search, default sort `saved` desc; negative References shown inline with a
  badge) and **Reference detail** view (all screenshots, identity fields,
  rendered User Note). Client-side fuzzy search over title + tags + note.
- `scripts/new-reference.ts` — `pnpm new` scaffolds a well-formed Reference
  folder; asks whether it is a negative Reference (default no). A convenience,
  never a gate.
- Workspace: `pnpm-workspace.yaml` (`apps/*`). Root `pnpm dev` / `pnpm start` /
  `pnpm new`. Node 22, `tsx`, TS strict, MIT license.

**Follow-up:** a dedicated visual-design pass on the Portal with the `impeccable`
skill, once the functional build lands.

**Success criterion:** the library becomes something the user naturally keeps
adding to.

---

## Phase 2 — Browser capture

**Goal:** remove the friction between discovering something and saving it.

**Build:**

- `apps/extension` — browser extension. Primary action: **Save page**, followed
  optionally by **"What do you like about it?"**. A **"mark as negative"** toggle
  flips the prompt to *"what do you want to avoid here?"* and writes
  `sentiment: negative`.
- Capture for the current page: URL, title, screenshot(s), User Note, basic
  metadata, relevant assets.
- The extension writes into the same `references/` store Phase 1 reads; the
  Portal shows captured and hand-authored References together with no changes.

**Success criterion:** saving a reference takes seconds.

---

## Phase 3 — Focused & interactive capture

Moves the system from *screenshot library* to *UX/interaction reference library*.
Introduced in three increments.

### Phase 3A — Focused element capture

Select an element/region and capture just that: screenshot, DOM subtree, computed
styles, element metadata, User Note. Adds `kind: element` capture so a mediocre
site no longer pollutes a Reference. ("I don't like this site, but I love this
dropdown.")

### Phase 3B — Basic interaction capture

Record `before → action → after` for common interactions: hover, click, focus,
dropdown, menu, modal, tabs, expand/collapse. Store visual + structural evidence.
Adds `kind: interaction`.

### Phase 3C — Behavioural intelligence

Richer capture where it pays off: animations, transitions, multi-step flows,
responsive variants, scroll behaviour, drag/drop, keyboard interactions. A
Reference may now represent a `kind: flow` micro-flow. Pursue only after the
simpler interaction model has proven useful.

---

## Phase 4 — AI analysis & knowledge extraction

**Goal:** turn captured Evidence into searchable knowledge, kept separate from
the Evidence itself.

Per Reference, derive: objective observations (dimensions, spacing, typography,
colour, radii, layout, animation duration, transition properties, DOM
relationships); visual vocabulary; UX vocabulary; interaction vocabulary; motion
vocabulary; a concise "why this is interesting" design-principle note. All marked
as AI Interpretation. The User Note stays separate and independently searchable.
Negative References go through the same pipeline; from them it derives
anti-patterns — same machinery, opposite pole.

---

## Phase 5 — Retrieval & MCP

**Goal:** make the corpus useful to Claude Code.

- Retrieval combining lexical search, metadata filtering, semantic search,
  user-preference relevance, and reference type → ranked results → relevant
  evidence only. Relevant negative References (guard rails) surface alongside the
  positive examples; the consuming agent tells the poles apart from `sentiment`.
- Local lightweight vector database for semantic search.
- MCP server (retrieval-only): `search_references`, `get_reference`,
  `get_reference_evidence`, `search_interactions`, `find_patterns`,
  `find_user_preferences`, `get_related_references`, `get_taste_profile`.
  **Open:** how `sentiment` weights ranking, and whether negatives get a
  dedicated `find_aversions` tool or a signed field on existing results
  ([ADR 0002](./adr/0002-negative-signal.md)).
- Derived Taste Profile (aggregate tendencies to emulate *and* to avoid), treated
  as derived knowledge.

**Criterion:** the agent asks "find references relevant to what I'm designing"
and gets a small high-quality set, not the whole database.

---

## Phase 6 — Agent augmentation & self-hosted ecosystem

**Goal:** connect retrieval directly into the design workflow, and offer flexible
deployment.

- Workflow: human brief → agent searches the taste library via MCP → agent
  studies visual + UX + interaction evidence *and the relevant guard rails* →
  agent + human explore directions → agent generates implementation. Existing
  generation skills stay in that workflow; TasteVault is another source of
  context. Teaching those skills to actively weight negatives is their own
  concern, not TasteVault's.
- Single-command Docker containerization for self-hosting.
- Support for remote database / vector storage backends for multi-device sync.
- Open-source community contributions for capture plugins and UI templates.
