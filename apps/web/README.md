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

`src/lib/api.ts` talks to `apps/server` (the Fastify scan/watch + write API +
SSE, PRD §5) over `/api` — proxied to `:5174` by Vite in `pnpm dev`, same-origin
under `pnpm start`. It fetches `RawReference` and runs it through
`src/lib/normalize.ts`, which holds the graceful-degradation fallbacks (ADR
0001) — nothing is required, every gap has a fallback. `subscribe()` is an
`EventSource` on `GET /api/events`; the wall re-reads on every `change`.

With no server (or an empty Vault) the Portal shows its first-run empty state
rather than erroring. Add References with `pnpm new-ref` or in place via the
detail view.

Screenshots for design review: `node scripts/shoot.mjs [baseUrl]` (needs Chrome;
set `CHROME_PATH` if it's not at the default Windows location).

## Not yet built (follow-ups)

- The dense ledger view (deferred; the toggle renders but is stubbed).
