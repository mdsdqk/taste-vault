import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

/**
 * Render a User Note (Markdown body of `reference.md`) to sanitised HTML.
 *
 * The Note is hand-authored local text, but it is still rendered into the
 * Portal's DOM, so raw HTML is disabled in the parser and the output is passed
 * through an allow-list. The tag set is what a prose note realistically uses.
 */

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "a", "em", "strong", "s", "del", "mark", "sub", "sup",
    "blockquote", "ul", "ol", "li",
    "code", "pre", "kbd",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "hr", "br",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

export function renderNote(markdown: string): string {
  if (!markdown.trim()) return "";
  return sanitizeHtml(md.render(markdown), SANITIZE_OPTS).trim();
}
