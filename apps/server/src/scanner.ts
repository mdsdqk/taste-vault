import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderNote } from "./markdown.js";
import type { RawReference } from "./types.js";

/**
 * Read the Vault off disk. Nothing here throws on bad input: a folder that
 * cannot be read, or a `reference.md` with broken YAML, still produces a listed
 * Reference (ADR 0001). Problems are collected as warnings for the caller to log.
 */

const IMAGE_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg",
]);

function isImage(name: string): boolean {
  return IMAGE_EXT.has(path.extname(name).toLowerCase());
}

/** gray-matter hands back `any` for `data`; keep only a plain object. */
function coerceFrontmatter(data: unknown): Record<string, unknown> {
  return data !== null && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

export interface ScanResult {
  references: RawReference[];
  warnings: string[];
}

async function readReference(
  referencesDir: string,
  name: string,
  warnings: string[],
): Promise<RawReference | null> {
  const dir = path.join(referencesDir, name);

  let stat;
  try {
    stat = await fs.stat(dir);
  } catch {
    return null;
  }
  if (!stat.isDirectory()) return null;

  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch (err) {
    warnings.push(`could not read folder ${name}: ${(err as Error).message}`);
  }

  const images = entries
    .filter(isImage)
    .sort((a, b) => a.localeCompare(b))
    .map(
      (file) =>
        `/api/references/${encodeURIComponent(name)}/${encodeURIComponent(file)}`,
    );

  let frontmatter: Record<string, unknown> | null = {};
  let noteText = "";
  let noteHtml = "";

  if (entries.includes("reference.md")) {
    try {
      const rawMd = await fs.readFile(path.join(dir, "reference.md"), "utf8");
      const parsed = matter(rawMd);
      frontmatter = coerceFrontmatter(parsed.data);
      noteText = parsed.content.trim();
      noteHtml = renderNote(noteText);
    } catch (err) {
      warnings.push(
        `reference.md unreadable in ${name} — listing from the folder (${(err as Error).message})`,
      );
      frontmatter = null;
    }
  }

  return {
    slug: name,
    folderModified: stat.mtime.toISOString(),
    images,
    frontmatter,
    noteHtml,
    noteText,
  };
}

export async function scan(referencesDir: string): Promise<ScanResult> {
  const warnings: string[] = [];

  let dirents;
  try {
    dirents = await fs.readdir(referencesDir, { withFileTypes: true });
  } catch {
    warnings.push(
      `references directory not found at ${referencesDir} — serving an empty Vault`,
    );
    return { references: [], warnings };
  }

  const names = dirents
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const results = await Promise.all(
    names.map((name) => readReference(referencesDir, name, warnings)),
  );

  const references = results
    .filter((r): r is RawReference => r !== null)
    // newest folder-date first; the Portal re-sorts, this is just a stable default
    .sort((a, b) => b.slug.localeCompare(a.slug));

  return { references, warnings };
}
