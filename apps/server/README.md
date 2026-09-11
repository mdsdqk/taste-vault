# @taste-vault/server — the scan/watch server

The layer between the **Vault** (`references/`) and the **Portal** (`apps/web`).
It scans and watches the Vault, parses `reference.md` frontmatter, renders the
User Note to sanitised HTML, serves a JSON API, the raw asset files, and an SSE
stream so the Portal live-updates as folders change, and writes edits back to
disk in the same on-disk format a hand author or the `pnpm new-ref` scaffold
would produce. PRD §5.

Fastify + TypeScript, run with `tsx`. It never fails on bad input — a missing or
malformed `reference.md` still produces a listed Reference (ADR 0001).

```bash
pnpm install               # from the repo root
pnpm dev                   # server (:5174, API only) + Portal (:5173) with HMR
pnpm start                 # build the Portal, then serve it + the API on :5174
```

## Endpoints

### Read

| Method + path | Returns |
|---|---|
| `GET /api/references` | `RawReference[]` — the whole Vault |
| `GET /api/references/:slug` | one `RawReference`, or `404` |
| `GET /api/references/:slug/:file` | a raw asset file from that Reference folder |
| `GET /api/events` | `text/event-stream`; an `event: change` per debounced batch of Vault changes |
| `GET /api/health` | `{ ok, referencesDir, count }` |

### Write

| Method + path | Body | Effect |
|---|---|---|
| `POST /api/references` | `{ title?, url?, kind?, sentiment?, rating?, tags?, surface?, noteText? }` (all optional) | creates `references/<slugify(title)>-<today>/` (or `untitled-reference-<today>` if title is blank); returns the new `RawReference` (`201`) |
| `POST /api/references/:slug/images` | `multipart/form-data` files (`png` `webp` `jpg` `gif` `avif` `svg`, 25 MB each) | writes them into the folder under safe filenames; returns the updated `RawReference` (`201`) |
| `POST /api/references/:slug/cover` | `{ file }` (filename already in the folder) | renames that file to `cover.<ext>` (moves any existing `cover.*` aside); returns the updated `RawReference` |
| `DELETE /api/references/:slug/:file` | — | unlinks that image from the folder; returns the updated `RawReference` |
| `PATCH /api/references/:slug` | `ReferenceEdits` — same fields as create; `null`/`""` clears a field | merges into `reference.md` (frontmatter + body); if `title` is set, the folder is renamed to match; returns the updated `RawReference` (possibly under a new slug) |
| `DELETE /api/references/:slug` | — | moves the folder to `references/.trash/`; `204` |
| `GET /api/removed` | — | `RawReference[]` from `.trash/` (images under `/api/removed/:slug/:file`) |
| `GET /api/removed/:slug/:file` | — | a raw asset file from a removed Reference |
| `POST /api/removed/:slug/restore` | — | moves the folder back into `references/`, returns the restored `RawReference` |

`RawReference` matches `apps/web/src/lib/types.ts` field-for-field, so
`apps/web/src/lib/api.ts` drops in behind these with no component changes. The
one difference from a bare disk read: `images` are already resolved to
`/api/references/:slug/:file` URLs.

Writes never validate field *values* (ADR 0001) — a half-filled Reference is
allowed. `sentiment: positive` is written as the *absence* of the field
(ADR 0002). Frontmatter is re-emitted in the canonical key order
(`title, url, source, kind, saved, sentiment, rating, tags, surface`), tags
inline. A `reference.md` with unparseable YAML is left untouched; `PATCH`
returns `409` rather than overwriting it. On boot, folders whose names don't
match `title` in `reference.md` are renamed (including `.trash/`).

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
| `HOST` | `127.0.0.1` | listen host (loopback only unless `--allow-remote` / `TASTEVAULT_ALLOW_REMOTE=1`) |
| `TASTEVAULT_REFERENCES` | `<repo>/references` | the Vault directory to scan |
| `TASTEVAULT_SERVE_WEB=0` / `--no-web` | serve when `apps/web/dist` exists | disable serving the built Portal |
| `--allow-remote` / `TASTEVAULT_ALLOW_REMOTE=1` | off | permit a non-loopback `HOST` (the write API has no auth) |

## Layout

```
src/
├── index.ts        entry — load config, build server, listen, handle signals
├── config.ts       env + flags → Config
├── server.ts       Fastify instance: read routes, asset serving, SSE, SPA fallback
├── write-routes.ts create / amend / remove / restore
├── vault.ts        in-memory scan kept fresh by a chokidar watch; emits "change"
├── scanner.ts      a folder of References → RawReference[] + warnings (never throws)
├── reference-md.ts the shared reference.md merge + serialise (also used by pnpm new-ref)
├── markdown.ts     User Note → sanitised HTML (markdown-it + sanitize-html)
├── util.ts         path-segment guard
└── types.ts        RawReference (mirrors the Portal's wire model)
```

The `pnpm new-ref` scaffold (`scripts/new-ref.ts` at the repo root) imports
`reference-md.ts` directly, so a scaffolded folder and a Portal-written one are
byte-identical in format.
