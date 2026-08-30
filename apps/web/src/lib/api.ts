import type { RawReference, Reference } from "./types";
import { normalize } from "./normalize";

/**
 * The data seam. Talks to the Fastify scan/watch server (`apps/server`, PRD §5)
 * over `/api` — proxied to `:5174` by Vite in `pnpm dev`, same-origin in
 * `pnpm start`.
 *
 * Reads degrade gracefully: if the server is unreachable the Portal shows an
 * empty Vault and its first-run state rather than an error screen — it is a
 * view library, not a system to fail on (ADR 0001). Writes reject so the caller
 * can surface the failure.
 *
 * The server returns `RawReference` (disk shape); `normalize()` fills every gap
 * here, so components only ever see a resolved `Reference`.
 */

const API = "/api";

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`GET ${path} → ${res.status}`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`GET ${path} failed — is apps/server running?`, err);
    return fallback;
  }
}

async function write<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Edits the detail view sends. `null` / `""` clears the field on disk. */
export interface ReferenceEdits {
  title?: string;
  url?: string | null;
  kind?: string | null;
  sentiment?: "positive" | "negative";
  rating?: number | null;
  tags?: string[];
  surface?: string | null;
  noteText?: string;
}

export async function listReferences(): Promise<Reference[]> {
  const raw = await readJSON<RawReference[]>("/references", []);
  return raw.map(normalize);
}

export async function getReference(slug: string): Promise<Reference | null> {
  const raw = await readJSON<RawReference | null>(
    `/references/${encodeURIComponent(slug)}`,
    null,
  );
  return raw ? normalize(raw) : null;
}

export async function listRemoved(): Promise<Reference[]> {
  const raw = await readJSON<RawReference[]>("/removed", []);
  return raw.map(normalize);
}

export async function updateReference(
  slug: string,
  edits: ReferenceEdits,
): Promise<Reference> {
  const raw = await write<RawReference>(
    "PATCH",
    `/references/${encodeURIComponent(slug)}`,
    edits,
  );
  return normalize(raw);
}

/** Create a blank mount. A half-filled Reference is valid — no gate. */
export async function createReference(): Promise<Reference> {
  const raw = await write<RawReference>("POST", "/references", {});
  return normalize(raw);
}

export async function removeReference(slug: string): Promise<void> {
  await write<void>("DELETE", `/references/${encodeURIComponent(slug)}`);
}

export async function restoreReference(slug: string): Promise<void> {
  await write<void>("POST", `/removed/${encodeURIComponent(slug)}/restore`);
}

/** Permanently delete — the server routes the folder to the OS trash. */
export async function purgeReference(slug: string): Promise<void> {
  await write<void>("DELETE", `/removed/${encodeURIComponent(slug)}`);
}

/* ---- live updates: the server's SSE stream (`GET /api/events`) ---- */

const listeners = new Set<() => void>();
let stream: EventSource | null = null;

function openStream(): void {
  if (stream || typeof EventSource === "undefined") return;
  stream = new EventSource(`${API}/events`);
  const fire = (): void => listeners.forEach((fn) => fn());
  // `change` on every debounced Vault edit; `ready` on (re)connect, so the
  // Portal also refreshes after the stream drops and comes back.
  stream.addEventListener("change", fire);
  stream.addEventListener("ready", fire);
  // EventSource reconnects on its own; nothing to do on error.
}

/** Subscribe to Vault changes. Returns an unsubscribe function. */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  openStream();
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && stream) {
      stream.close();
      stream = null;
    }
  };
}
