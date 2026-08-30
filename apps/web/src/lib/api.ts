import type { RawReference, Reference } from "./types";
import { normalize } from "./normalize";
import { FIXTURES } from "./fixtures";

/**
 * The data seam. Every call is async and returns normalised `Reference`s so a
 * real transport (the Fastify scan/watch server + SSE, per PRD §5) can drop in
 * behind this file with no change to the components.
 *
 * Until that server exists the Portal runs on the fixture Vault, held in memory
 * and mirrored to localStorage so edits and removals survive a reload.
 */

const STORE_KEY = "tastevault:store:v1";

interface Store {
  live: RawReference[];
  removed: RawReference[];
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* private mode / blocked storage — fall through to seed */
  }
  return { live: structuredClone(FIXTURES), removed: [] };
}

function persist(store: Store): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* nothing to do — in-memory store still works for this session */
  }
}

let store: Store = load();

const listeners = new Set<() => void>();
function emit(): void {
  persist(store);
  listeners.forEach((fn) => fn());
}

/** Subscribe to Vault changes. Stands in for the SSE stream from the server. */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const settle = <T>(value: T): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), 90));

export async function listReferences(): Promise<Reference[]> {
  return settle(store.live.map(normalize));
}

export async function getReference(slug: string): Promise<Reference | null> {
  const raw = store.live.find((r) => r.slug === slug);
  return settle(raw ? normalize(raw) : null);
}

export async function listRemoved(): Promise<Reference[]> {
  return settle(store.removed.map(normalize));
}

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

export async function updateReference(
  slug: string,
  edits: ReferenceEdits,
): Promise<Reference> {
  const raw = store.live.find((r) => r.slug === slug);
  if (!raw) throw new Error(`No Reference ${slug}`);
  const fm = { ...(raw.frontmatter ?? {}) };
  if (edits.title !== undefined) fm.title = edits.title;
  if (edits.url !== undefined) fm.url = edits.url ?? undefined;
  if (edits.kind !== undefined) fm.kind = edits.kind ?? undefined;
  if (edits.sentiment !== undefined) fm.sentiment = edits.sentiment;
  if (edits.rating !== undefined) fm.rating = edits.rating ?? undefined;
  if (edits.tags !== undefined) fm.tags = edits.tags;
  if (edits.surface !== undefined) fm.surface = edits.surface ?? undefined;
  raw.frontmatter = fm;
  if (edits.noteText !== undefined) {
    raw.noteText = edits.noteText;
    raw.noteHtml = edits.noteText
      ? `<p>${escapeHtml(edits.noteText).replace(/\n\n+/g, "</p><p>")}</p>`
      : "";
  }
  emit();
  return normalize(raw);
}

function slugify(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "reference";
  const date = new Date().toISOString().slice(0, 10);
  let slug = `${base}-${date}`;
  let n = 2;
  while (
    store.live.some((r) => r.slug === slug) ||
    store.removed.some((r) => r.slug === slug)
  ) {
    slug = `${base}-${date}-${n++}`;
  }
  return slug;
}

/** Create a blank mount. A half-filled Reference is valid — no gate. */
export async function createReference(): Promise<Reference> {
  const slug = slugify("untitled reference");
  const raw: RawReference = {
    slug,
    folderModified: new Date().toISOString(),
    images: [],
    frontmatter: { saved: new Date().toISOString().slice(0, 10) },
    noteHtml: "",
    noteText: "",
  };
  store.live = [raw, ...store.live];
  emit();
  return normalize(raw);
}

export async function removeReference(slug: string): Promise<void> {
  const idx = store.live.findIndex((r) => r.slug === slug);
  if (idx === -1) return;
  const [raw] = store.live.splice(idx, 1);
  store.removed = [{ ...raw }, ...store.removed];
  emit();
}

export async function restoreReference(slug: string): Promise<void> {
  const idx = store.removed.findIndex((r) => r.slug === slug);
  if (idx === -1) return;
  const [raw] = store.removed.splice(idx, 1);
  store.live = [raw, ...store.live];
  emit();
}

/** Permanently delete — in the real Portal this routes the folder to OS trash. */
export async function purgeReference(slug: string): Promise<void> {
  store.removed = store.removed.filter((r) => r.slug !== slug);
  emit();
}

/** Reset to the pristine fixture Vault (dev affordance). */
export async function resetVault(): Promise<void> {
  store = { live: structuredClone(FIXTURES), removed: [] };
  emit();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
