import yaml from "js-yaml";

/**
 * The one definition of how the Portal (and the `pnpm new-ref` scaffold) writes
 * a `reference.md`. The on-disk format is a fixed contract: manual, scaffold,
 * and future browser-extension authoring must all round-trip through the same
 * `<slug>-<YYYY-MM-DD>/` + optional `reference.md` (YAML frontmatter + Markdown
 * body) layout, so this file stays deliberately small and shared.
 *
 * Nothing here validates. A half-filled Reference is valid; clearing a field
 * just removes the key (ADR 0001). `sentiment: positive` is the *absence* of the
 * field, never a written value (ADR 0002).
 */

/** Edits the Portal's detail view can send. `null`/`""` clears the field. */
export interface ReferenceEdits {
  title?: string;
  url?: string | null;
  kind?: string | null;
  sentiment?: "positive" | "negative";
  rating?: number | null;
  tags?: string[];
  surface?: string | null;
  /** the Markdown body — the User Note */
  noteText?: string;
}

/** The canonical frontmatter key order (matches the PRD and the authoring guide). */
const KEY_ORDER = [
  "title",
  "url",
  "source",
  "kind",
  "saved",
  "sentiment",
  "rating",
  "tags",
  "surface",
] as const;

type Data = Record<string, unknown>;

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

/** Merge `edits` into existing frontmatter `data`, returning a new object. */
export function applyEdits(data: Data, edits: ReferenceEdits): Data {
  const next: Data = { ...data };

  const put = (key: string, value: unknown): void => {
    if (isBlank(value)) delete next[key];
    else next[key] = value;
  };

  if ("title" in edits) put("title", edits.title?.trim());
  if ("url" in edits) put("url", typeof edits.url === "string" ? edits.url.trim() : edits.url);
  if ("kind" in edits) put("kind", edits.kind);
  if ("surface" in edits) put("surface", edits.surface);

  if ("rating" in edits) {
    if (edits.rating === null || edits.rating === undefined) delete next.rating;
    else next.rating = edits.rating;
  }

  if ("sentiment" in edits) {
    if (edits.sentiment === "negative") next.sentiment = "negative";
    else delete next.sentiment; // positive == no field
  }

  if ("tags" in edits) {
    const tags = Array.isArray(edits.tags)
      ? edits.tags
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (tags.length) next.tags = tags;
    else delete next.tags;
  }

  return next;
}

function orderKeys(data: Data): Data {
  const out: Data = {};
  for (const key of KEY_ORDER) {
    if (key in data && data[key] !== undefined) out[key] = data[key];
  }
  for (const key of Object.keys(data)) {
    if (!(key in out) && data[key] !== undefined) out[key] = data[key];
  }
  return out;
}

/**
 * Serialise frontmatter + body back to a `reference.md` string. Short arrays
 * (tags) render inline. An empty frontmatter object yields a body-only file; an
 * empty everything yields "".
 */
export function serializeReferenceMd(data: Data, body: string): string {
  const ordered = orderKeys(data);
  const trimmedBody = body.replace(/\s+$/, "");

  if (Object.keys(ordered).length === 0) {
    return trimmedBody ? `${trimmedBody}\n` : "";
  }

  const frontmatter = yaml
    .dump(ordered, { flowLevel: 1, lineWidth: -1, noRefs: true, sortKeys: false })
    .replace(/\s+$/, "");

  return trimmedBody
    ? `---\n${frontmatter}\n---\n\n${trimmedBody}\n`
    : `---\n${frontmatter}\n---\n`;
}

/** Lowercase, strip diacritics, non-alphanumerics → "-", trimmed to ~60 chars. */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "reference"
  );
}
