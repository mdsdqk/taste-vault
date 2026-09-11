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
  if (!res.ok) {
    let message = `${method} ${path} → ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "string"
      ) {
        message = (payload as { error: string }).error;
      }
    } catch {
      /* keep the status line */
    }
    throw new Error(message);
  }
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

export function imageFilename(src: string): string {
  const path = (src.split("?")[0] ?? src).split("#")[0] ?? src;
  const seg = path.split("/").filter(Boolean).pop() ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
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

/** Create a Reference folder. Pass the submitted identity — Pin itself writes nothing. */
export async function createReference(
  edits: ReferenceEdits = {},
): Promise<Reference> {
  const raw = await write<RawReference>("POST", "/references", edits);
  return normalize(raw);
}

export async function removeReference(slug: string): Promise<void> {
  await write<void>("DELETE", `/references/${encodeURIComponent(slug)}`);
}

export async function restoreReference(slug: string): Promise<void> {
  await write<void>("POST", `/removed/${encodeURIComponent(slug)}/restore`);
}

/** Hang one or more screenshots in a Reference folder. */
export async function addReferenceImages(
  slug: string,
  files: File[],
): Promise<Reference> {
  const form = new FormData();
  for (const file of files) form.append("files", file, file.name || "screenshot.png");
  const res = await fetch(`${API}/references/${encodeURIComponent(slug)}/images`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let message = `POST /references/${slug}/images → ${res.status}`;
    try {
      const payload: unknown = await res.json();
      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "string"
      ) {
        message = (payload as { error: string }).error;
      }
    } catch {
      /* keep the status line */
    }
    throw new Error(message);
  }
  return normalize((await res.json()) as RawReference);
}

/** Rename `file` to `cover.<ext>` so it becomes the grid thumbnail. */
export async function setReferenceCover(
  slug: string,
  file: string,
): Promise<Reference> {
  const raw = await write<RawReference>(
    "POST",
    `/references/${encodeURIComponent(slug)}/cover`,
    { file },
  );
  return normalize(raw);
}

/** Unlink a screenshot from the folder. */
export async function removeReferenceImage(
  slug: string,
  file: string,
): Promise<Reference> {
  const raw = await write<RawReference>(
    "DELETE",
    `/references/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`,
  );
  return normalize(raw);
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
