---
status: accepted
---

# TasteVault represents negative signal as a `sentiment` field on a Reference

## Context

TasteVault's original framing was positive-only: a Reference was "one thing the
user saved because they liked it", the User Note explained why something is
*good*, and the derived Taste Profile aggregated *preferences*. But what a person
wants to **avoid** is as much a part of their taste as what they want to emulate.
A site the user found horrible is a useful guard rail: an AI coding agent that
can see it can steer away from those patterns instead of rediscovering them.

An earlier PRD draft (in the since-superseded `.scratch/` notes) raised this and
it was lost when the drafts were consolidated into `docs/PRD.md`. This ADR puts
it back deliberately.

## Decision

Negative signal is a **cross-cutting property of the existing Reference model**,
not a new type, phase, or storage location.

- **One optional frontmatter field, `sentiment`.** The only meaningful value is
  `negative`. Absent, `positive`, or unparseable ⇒ the Reference is positive.
  Everything under `references/` is something the user likes *unless it says
  otherwise*.
- **A negative case is still a Reference.** Same on-disk layout, same scanner,
  same Portal, same API. `references/` stays flat — no `positives/` /
  `negatives/` split. This preserves the ADR 0001 invariant ("a Reference is any
  directory under `references/`") and needs no migration of existing folders.
- **Same shape as a positive.** A negative Reference carries the same Evidence
  (screenshots, later DOM/behaviour) and a User Note that says *what to avoid*.
  A blunt page-level "this whole site is horrible" is allowed and degrades
  gracefully, exactly as a vague positive does; there is no separate "veto"
  sub-model.
- **`rating` stays orthogonal.** It means *intensity / strength of feeling* and
  applies to both poles: a strongly-held dislike is `rating: 3`.
- **`sentiment` is present from Phase 1.** The manual folder workflow can mark a
  folder negative today. Each later phase absorbs it as metadata — the Phase 2
  extension gains a "mark as negative" action, Phase 4 analysis derives
  anti-patterns the same way it derives patterns, the Phase 5 Taste Profile
  gains a "tendencies to avoid" half. None of this is a distinct workstream; it
  is the negative pole of work already planned.
- **Agent discovery from Phase 0.** A new `references/AGENTS.md` tells any agent
  reading the Vault that both poles exist and how to read `sentiment`. Dedicated
  negative-aware MCP retrieval tools arrive with Phase 5, when the retrieval
  layer itself is built.

## Alternatives considered

- **`references/positives/` + `references/negatives/` directory split.** Makes
  the sign un-missable, but breaks the ADR 0001 invariant, forces every existing
  hand-authored folder and the scaffold's output to migrate, makes a folder
  loose in `references/` ambiguous, and turns reclassification into a move. It
  promotes one boolean to a directory hierarchy.
- **Overloading `rating` to a signed `-3..3` scale.** Conflates sign with
  intensity, breaks existing folders and the rating UI, and has no natural
  "unrated negative".
- **A separate noun (Anti-Reference / Aversion) and a second sub-model.** The two
  cases are not conceptually distinct enough to justify it; "negative Reference"
  in prose is sufficient.

## Consequences

- `CONTEXT.md` redefines **Reference** and **User Note** to cover both poles and
  notes the `sentiment` / `rating` split.
- The Portal shows negative References **inline** in the Library grid with a
  badge, and a filter facet to isolate or exclude them. `tags` share one facet
  across both poles; the badge disambiguates.
- The scaffold (`pnpm new-ref`) gains an optional `sentiment` prompt, defaulting to
  positive. It remains a convenience, never a gate.
- Teaching generation skills (e.g. Impeccable) to actively *weight* negatives at
  generation time is **out of scope** here; this ADR delivers the TasteVault-side
  model and `references/AGENTS.md` only.
- Still open, for Phase 5: how negatives affect retrieval ranking, and the shape
  of a negative-aware MCP tool (a dedicated `find_aversions` vs. a signed field
  on existing results).
