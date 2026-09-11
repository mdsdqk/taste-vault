import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderNote } from "./markdown.js";
import type { RawReference } from "./types.js";
import { isImageFilename } from "./util.js";

/**
 * Read a directory of Reference folders off disk. Nothing here throws on bad
 * input: a folder that cannot be read, or a `reference.md` with broken YAML,
 * still produces a listed Reference (ADR 0001). Problems are collected as
 * warnings for the caller to log.
 *
 * `urlPrefix` is prepended to each image path — `/api/references` for the live
 * Vault, `/api/removed` for `.trash/`.
 */

/** gray-matter hands back `any` for `data`; keep only a plain object. */
function coerceFrontmatter(data: unknown): Record<string, unknown> {
  return data !== null && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

export async function readReference(
  rootDir: string,
  name: string,
  urlPrefix: string,
  warnings: string[],
): Promise<RawReference | null> {
  const dir = path.join(rootDir, name);

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
    .filter(isImageFilename)
    .sort((a, b) => a.localeCompare(b))
    .map(
      (file) =>
        `${urlPrefix}/${encodeURIComponent(name)}/${encodeURIComponent(file)}`,
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

export interface ScanResult {
  references: RawReference[];
  warnings: string[];
}

export async function scanDir(
  rootDir: string,
  urlPrefix: string,
): Promise<ScanResult> {
  const warnings: string[] = [];

  let dirents;
  try {
    dirents = await fs.readdir(rootDir, { withFileTypes: true });
  } catch {
    warnings.push(`directory not found at ${rootDir} — treating as empty`);
    return { references: [], warnings };
  }

  const names = dirents
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);

  const results = await Promise.all(
    names.map((name) => readReference(rootDir, name, urlPrefix, warnings)),
  );

  const references = results
    .filter((r): r is RawReference => r !== null)
    // newest folder-date first; the Portal re-sorts, this is just a stable default
    .sort((a, b) => b.slug.localeCompare(a.slug));

  return { references, warnings };
}

/** The live Vault. */
export function scan(referencesDir: string): Promise<ScanResult> {
  return scanDir(referencesDir, "/api/references");
}
