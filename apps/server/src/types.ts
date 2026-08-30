/**
 * The wire model. This mirrors `RawReference` in `apps/web/src/lib/types.ts`
 * field-for-field: what the scanner reads off disk from a
 * `references/<slug>-<YYYY-MM-DD>/` folder. The Portal's `normalize.ts` turns it
 * into the view model, filling every gap from a fallback (ADR 0001 — the library
 * degrades, it does not validate).
 *
 * The one deliberate difference from a bare disk read: `images` are already
 * resolved to URLs the browser can fetch (`/api/references/:slug/:file`), not
 * bare filenames.
 */
export interface RawReference {
  /** folder name, e.g. "linear-command-menu-2026-08-27" */
  slug: string;
  /** folder mtime, ISO — always known */
  folderModified: string;
  /** image URLs under `/api/references/:slug/`, filename-sorted; may be empty */
  images: string[];
  /**
   * Parsed frontmatter as an object (possibly empty), or `null` when a
   * `reference.md` is present but its YAML could not be parsed. A folder with no
   * `reference.md` at all is not degraded — it is a note-less Reference and gets
   * `{}` here.
   */
  frontmatter: Record<string, unknown> | null;
  /** rendered + sanitised User Note HTML, or "" */
  noteHtml: string;
  /** raw User Note markdown body, for editing and for fuzzy search */
  noteText: string;
}
