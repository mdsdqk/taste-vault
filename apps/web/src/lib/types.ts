/**
 * The Reference model.
 *
 * `RawReference` mirrors what the scanning server reads off disk from a
 * `references/<slug>-<YYYY-MM-DD>/` folder: `reference.md` frontmatter (every
 * field optional) plus a list of image files. `Reference` is the normalised
 * view model the Portal renders — see `normalize.ts`, where every gap is filled
 * from a fallback rather than rejected (ADR 0001: the library degrades, it does
 * not validate).
 */

export type Kind = "page" | "element" | "interaction" | "flow";
export type Sentiment = "positive" | "negative";
export type Rating = 1 | 2 | 3;

/** As read off disk. Anything here may be missing or malformed. */
export interface RawReference {
  /** folder name, e.g. "linear-command-menu-2026-08-27" */
  slug: string;
  /** folder mtime, ISO — always known */
  folderModified: string;
  /** image file names in the folder, filename-sorted; may be empty */
  images: string[];
  /** parsed frontmatter, or null when reference.md is missing / unparseable */
  frontmatter: Partial<{
    title: string;
    url: string;
    source: string;
    kind: string;
    saved: string;
    sentiment: string;
    rating: number;
    tags: string[];
    surface: string;
  }> | null;
  /** rendered + sanitised User Note HTML, or "" */
  noteHtml: string;
  /** raw User Note markdown body, for editing and for fuzzy search */
  noteText: string;
  /** derived, always marked as such; absent until Phase 4 */
  aiInterpretation?: AiInterpretation | null;
}

export interface AiInterpretation {
  derivedAt: string;
  observations: string[];
  patternName?: string;
  filedBeside?: string[];
}

/** Normalised: safe to render directly, every field resolved. */
export interface Reference {
  slug: string;
  title: string;
  url: string | null;
  source: string | null;
  kind: Kind | null;
  saved: string; // ISO date, always resolved
  sentiment: Sentiment; // absent ⇒ positive
  rating: Rating | null;
  tags: string[];
  surface: string | null;
  images: string[]; // resolved URLs; may be empty
  cover: string | null; // chosen cover URL, or null ⇒ text-placeholder plate
  noteHtml: string;
  noteText: string;
  ai: AiInterpretation | null;
  /** true when reference.md was missing or unparseable */
  degraded: boolean;
}

export type SentimentFilter = "all" | "positive" | "negative";
export type KindFilter = "all" | Kind;
export type SortKey = "saved" | "rating" | "tag";

export interface LibraryQuery {
  sentiment: SentimentFilter;
  kind: KindFilter;
  tags: string[];
  text: string;
  sort: SortKey;
}
