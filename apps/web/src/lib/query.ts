import type { LibraryQuery, Reference } from "./types";

/** Tag facet: every tag present across the Vault, most-used first. */
export function aggregateTags(refs: Reference[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of refs) {
    for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Forgiving subsequence match over title + tags + note. */
function fuzzyHit(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (h.includes(n)) return true;
  let i = 0;
  for (const ch of n) {
    if (ch === " ") continue;
    i = h.indexOf(ch, i);
    if (i === -1) return false;
    i += 1;
  }
  return true;
}

export function applyQuery(refs: Reference[], q: LibraryQuery): Reference[] {
  let out = refs.filter((r) => {
    if (q.sentiment !== "all" && r.sentiment !== q.sentiment) return false;
    if (q.kind !== "all" && r.kind !== q.kind) return false;
    if (q.tags.length && !q.tags.every((t) => r.tags.includes(t))) return false;
    if (q.text) {
      const hay = `${r.title} ${r.tags.join(" ")} ${r.noteText} ${r.source ?? ""}`;
      if (!fuzzyHit(hay, q.text)) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    if (q.sort === "rating") {
      return (b.rating ?? 0) - (a.rating ?? 0) || b.saved.localeCompare(a.saved);
    }
    if (q.sort === "tag") {
      const at = a.tags[0] ?? "￿";
      const bt = b.tags[0] ?? "￿";
      return at.localeCompare(bt) || b.saved.localeCompare(a.saved);
    }
    return b.saved.localeCompare(a.saved); // saved desc (default)
  });

  return out;
}

export const EMPTY_QUERY: LibraryQuery = {
  sentiment: "all",
  kind: "all",
  tags: [],
  text: "",
  sort: "saved",
};

export function queryIsEmpty(q: LibraryQuery): boolean {
  return (
    q.sentiment === "all" &&
    q.kind === "all" &&
    q.tags.length === 0 &&
    q.text.trim() === ""
  );
}
