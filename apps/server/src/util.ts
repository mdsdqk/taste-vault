import path from "node:path";

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

/** True if `candidate` is a file or folder strictly inside `root`. */
export function isInsideDir(root: string, candidate: string): boolean {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
