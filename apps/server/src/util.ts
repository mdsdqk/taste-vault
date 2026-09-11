import path from "node:path";

/** Extensions the scanner hangs as Evidence; the write API accepts the same set. */
export const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

/** One path segment: no separators, no traversal, no dotfiles. */
export function isSafeSegment(seg: string): boolean {
  return (
    seg.length > 0 &&
    !seg.includes("/") &&
    !seg.includes("\\") &&
    !seg.includes("\0") &&
    seg !== "." &&
    seg !== ".." &&
    !seg.startsWith(".")
  );
}

export function isImageFilename(name: string): boolean {
  return IMAGE_EXT.has(path.extname(name).toLowerCase());
}

/** True when this file is the grid thumbnail (`cover.png`, `cover.webp`, …). */
export function isCoverFilename(name: string): boolean {
  return /^cover\.[a-z0-9]+$/i.test(name);
}

/**
 * Turn an upload's original name into a Vault-safe filename. Returns `null`
 * when the extension isn't an image. Collision handling is the caller's job.
 */
export function sanitizeImageFilename(original: string): string | null {
  const ext = path.extname(original).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;
  const stem = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const name = `${stem || "screenshot"}${ext}`;
  return isSafeSegment(name) ? name : `screenshot${ext}`;
}

/** `<desired>` if free (case-insensitive), else `<stem>-2.ext`, `-3`, … */
export function uniqueFilename(takenLower: Set<string>, desired: string): string {
  const key = (n: string): string => n.toLowerCase();
  if (!takenLower.has(key(desired))) return desired;
  const ext = path.extname(desired);
  const stem = desired.slice(0, desired.length - ext.length);
  let n = 2;
  while (takenLower.has(key(`${stem}-${n}${ext}`))) n += 1;
  return `${stem}-${n}${ext}`;
}

/** True if `candidate` is a file or folder strictly inside `root`. */
export function isInsideDir(root: string, candidate: string): boolean {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
