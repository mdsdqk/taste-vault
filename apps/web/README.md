# @taste-vault/web — the Portal

The human-facing app for browsing and authoring the Vault. Vite + React + TS,
Tailwind + Radix, self-hosted fonts.

```bash
pnpm install          # from the repo root
pnpm dev              # → http://localhost:5173  (root script; or: pnpm --filter @taste-vault/web dev)
pnpm build            # typecheck + production build
```

## What's here

- **Library** (`/`) — the gallery wall: pinned screenshot plates hung by rating,
  filter/sort band, tag facet, in-place "pin a reference".
- **Reference detail** (`/r/:slug`) — the piece on the table: plates, typeset
  identity block, the User Note set large, AI Interpretation as dated marginalia,
  in-place edit ("uncap the pen"), delete → Recently removed.
- **Recently removed** (`/removed`) — restore or delete-for-good.

Theme: SLATE (light) / NOIR (dark), following `prefers-color-scheme`; a manual
override lives in the topbar and via `?theme=light|dark`.

## Data

Runs entirely on an in-memory **fixture Vault** (`src/lib/fixtures.ts`), mirrored
to `localStorage` so edits/removals survive a reload. `src/lib/api.ts` is the
seam the future Fastify scan/watch server + SSE (PRD §5) drops in behind, with
no component changes. `src/lib/normalize.ts` holds the graceful-degradation
fallbacks (ADR 0001) — nothing is required, every gap has a fallback.

Screenshots for design review: `node scripts/shoot.mjs [baseUrl]` (needs Chrome;
set `CHROME_PATH` if it's not at the default Windows location).

## Data source

`src/lib/api.ts` still runs on the in-memory fixture Vault. The real
`apps/server` (Fastify scan/watch + write API + SSE) now exists — wiring
`api.ts`'s calls to it (`GET/POST/PATCH/DELETE /api/references…`, `GET
/api/events`) is the remaining step.

## Not yet built (follow-ups)

- Point `src/lib/api.ts` at `apps/server` instead of the fixtures.
- The dense ledger view (deferred; the toggle renders but is stubbed).
