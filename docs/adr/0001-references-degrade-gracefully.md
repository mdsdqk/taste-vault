---
status: accepted
---

# References degrade gracefully; the Portal does not validate them

A Reference is any directory under `references/`. Every piece of metadata
(`reference.md`, its individual frontmatter fields, screenshots) is optional, and
the scanning server fills gaps from fallbacks (folder name, date suffix, mtime,
empty defaults) rather than rejecting the folder. We chose this over a strict
schema with fail-loud validation because TasteVault is a personal view library,
not a mission-critical system: a typo in hand-authored frontmatter should never
hide a saved Reference or stop the Portal from opening. The scaffold script
(`pnpm new`) produces well-formed folders as a convenience, but it is never a
gate.

## Consequences

- The `/api/references` response never fails on bad input; unparseable YAML is
  logged and treated as "no metadata".
- Contributors will be tempted to "add validation to be safe". This ADR is the
  answer: don't. Enrichment, not enforcement.
- If a controlled schema is ever genuinely needed, it must be additive and must
  not break existing hand-authored folders.
