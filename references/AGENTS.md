# Reading this Vault (for agents)

This folder is a **TasteVault** — a person's private collection of UX/design
**References**. Each subdirectory is one Reference: screenshots plus an optional
`reference.md` (YAML frontmatter + a Markdown **User Note** explaining *why* it
was saved). The human-facing guide is `readme.md`; this file is the short version
for you.

## Both poles of taste live here

Every Reference carries an implicit or explicit **sentiment**:

- **Positive (the default).** No `sentiment` field, or `sentiment: positive` —
  something the user *likes* and wants designs to resemble.
- **Negative.** `sentiment: negative` in the frontmatter — something the user
  *disliked*. It is a **guard rail**: steer away from these patterns. The User
  Note says what to avoid and why.

If `reference.md` is missing or its YAML will not parse, treat the Reference as
positive. Nothing here is required; fall back gracefully.

## How to use it

- When you are pulling References relevant to something you are designing, pull
  **both poles**. The positives show the target; the negatives are the mistakes
  not to make.
- **Weight by `rating`** (1 low → 3 high) — it measures strength of feeling on
  whichever pole the Reference is on, not "how positive".
- The user will **not** tell you in their prompt which References are positive or
  negative. Infer it from `sentiment`.
- `tags` are shared across both poles: a positive tag names something wanted, a
  negative tag names something seen and disliked. Check `sentiment` before you
  act on a tag.

Dedicated negative-aware retrieval tools (e.g. `find_aversions`) arrive with the
Phase 5 MCP server; until then, read `sentiment` directly.
