import type { Kind, RawReference, Reference, Rating, Sentiment } from "./types";

/**
 * Fill every gap from a fallback. Nothing here throws, nothing rejects a
 * folder — a typo in hand-authored frontmatter must never hide a saved
 * Reference (ADR 0001).
 */

const KINDS: Kind[] = ["page", "element", "interaction", "flow"];

/** "linear-command-menu-2026-08-27" -> "Linear command menu" */
function deKebab(slug: string): string {
  const withoutDate = slug.replace(/-\d{4}-\d{2}-\d{2}(-\d+)?$/, "");
  const words = withoutDate.split("-").filter(Boolean);
  if (words.length === 0) return slug;
  return words
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** date suffix on the folder, else folder mtime */
function resolveSaved(slug: string, folderModified: string): string {
  const m = slug.match(/(\d{4})-(\d{2})-(\d{2})(?:-\d+)?$/);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}`;
    if (!Number.isNaN(Date.parse(iso))) return iso;
  }
  return folderModified.slice(0, 10);
}

function resolveSentiment(value: unknown): Sentiment {
  return value === "negative" ? "negative" : "positive";
}

function resolveKind(value: unknown): Kind | null {
  return typeof value === "string" && (KINDS as string[]).includes(value)
    ? (value as Kind)
    : null;
}

function resolveRating(value: unknown): Rating | null {
  const n = typeof value === "number" ? value : Number(value);
  return n === 1 || n === 2 || n === 3 ? (n as Rating) : null;
}

function resolveSource(explicit: unknown, url: string | null): string | null {
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function resolveCover(images: string[]): string | null {
  if (images.length === 0) return null;
  const named = images.find((src) => /(^|\/)cover\.[a-z0-9]+$/i.test(src));
  return named ?? images[0];
}

export function normalize(raw: RawReference): Reference {
  const fm = raw.frontmatter ?? {};
  const degraded = raw.frontmatter === null;

  const url =
    typeof fm.url === "string" && fm.url.trim() ? fm.url.trim() : null;
  const tags = Array.isArray(fm.tags)
    ? fm.tags.filter((t): t is string => typeof t === "string" && t.length > 0)
    : [];

  return {
    slug: raw.slug,
    title:
      typeof fm.title === "string" && fm.title.trim()
        ? fm.title.trim()
        : deKebab(raw.slug),
    url,
    source: resolveSource(fm.source, url),
    kind: resolveKind(fm.kind),
    saved: resolveSaved(raw.slug, raw.folderModified),
    sentiment: resolveSentiment(fm.sentiment),
    rating: resolveRating(fm.rating),
    tags,
    surface:
      typeof fm.surface === "string" && fm.surface.trim()
        ? fm.surface.trim()
        : null,
    images: raw.images,
    cover: resolveCover(raw.images),
    noteHtml: raw.noteHtml ?? "",
    noteText: raw.noteText ?? "",
    ai: raw.aiInterpretation ?? null,
    degraded,
  };
}
