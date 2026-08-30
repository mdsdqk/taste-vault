# @taste-vault/server — the scan/watch server

The read layer between the **Vault** (`references/`) and the **Portal**
(`apps/web`). It scans and watches the Vault, parses `reference.md` frontmatter,
renders the User Note to sanitised HTML, and serves a JSON API, the raw asset
files, and an SSE stream so the Portal live-updates as folders change. PRD §5.

Fastify + TypeScript, run with `tsx`. It never fails on bad input — a missing or
malformed `reference.md` still produces a listed Reference (ADR 0001).

```bash
pnpm install               # from the repo root
pnpm dev                   # server (:5174, API only) + Portal (:5173) with HMR
pnpm start                 # build the Portal, then serve it + the API on :5174
```

## Endpoints

| Method + path | Returns |
|---|---|
| `GET /api/references` | `RawReference[]` — the whole Vault |
| `GET /api/references/:slug` | one `RawReference`, or `404` |
| `GET /api/references/:slug/:file` | a raw asset file from that Reference folder |
| `GET /api/events` | `text/event-stream`; an `event: change` per debounced batch of Vault changes |
| `GET /api/health` | `{ ok, referencesDir, count }` |

`RawReference` matches `apps/web/src/lib/types.ts` field-for-field, so
`apps/web/src/lib/api.ts` drops in behind it with no component changes. The one
difference from a bare disk read: `images` are already resolved to
`/api/references/:slug/:file` URLs.

### Degradation

- No `reference.md` → `frontmatter: {}`, empty note. **Not** degraded — a
  note-less Reference is normal.
- `reference.md` present but its YAML won't parse → `frontmatter: null` (the
  Portal renders the degraded state), a warning is logged, the folder is still
  listed.
- Folder that can't be read, no images, unknown fields → listed anyway; the
  Portal's `normalize.ts` fills every gap.

## Configuration

| Env / flag | Default | Effect |
|---|---|---|
| `PORT` | `5174` | listen port |
| `HOST` | `127.0.0.1` | listen host |
| `TASTEVAULT_REFERENCES` | `<repo>/references` | the Vault directory to scan |
| `TASTEVAULT_SERVE_WEB=0` / `--no-web` | serve when `apps/web/dist` exists | disable serving the built Portal |

## Layout

```
src/
├── index.ts     entry — load config, build server, listen, handle signals
├── config.ts    env + flags → Config
├── server.ts    Fastify instance: routes, asset serving, SSE, SPA fallback
├── vault.ts     in-memory scan kept fresh by a chokidar watch; emits "change"
├── scanner.ts   references/ → RawReference[] + warnings (never throws)
├── markdown.ts  User Note → sanitised HTML (markdown-it + sanitize-html)
└── types.ts     RawReference (mirrors the Portal's wire model)
```
