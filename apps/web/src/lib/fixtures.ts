import type { RawReference } from "./types";
import { screenshot } from "./placeholders";

/**
 * A synthetic Vault. Illustrative only — TasteVault has no real References yet.
 * Shapes exercised: both sentiment poles, every Phase-1 kind, ratings 1–3 and
 * unrated, a folder with no images, and a folder whose reference.md failed to
 * parse (frontmatter: null → degraded).
 */

function p(html: string, text: string): { noteHtml: string; noteText: string } {
  return { noteHtml: `<p>${html}</p>`, noteText: text };
}

export const FIXTURES: RawReference[] = [
  {
    slug: "linear-command-menu-2026-08-27",
    folderModified: "2026-08-27T10:12:00Z",
    images: [screenshot("palette"), screenshot("toolbar")],
    frontmatter: {
      title: "Linear — command menu",
      url: "https://linear.app/",
      source: "Linear",
      kind: "element",
      saved: "2026-08-27",
      rating: 3,
      tags: ["command-palette", "keyboard-nav", "motion"],
      surface: "dashboard",
    },
    ...p(
      "Cmd-K opens with zero layout shift and the results feel like they were already there. Escape returns focus exactly to the cell I left, not the top of the page. The list fades under 90ms so it reads as revealed, not constructed. This is the bar for any command surface I ask an agent to build: instant, positional, quiet.",
      "Cmd-K opens with zero layout shift and the results feel like they were already there. Escape returns focus exactly to the cell I left, not the top of the page. The list fades under 90ms so it reads as revealed, not constructed. This is the bar for any command surface I ask an agent to build: instant, positional, quiet.",
    ),
    aiInterpretation: {
      derivedAt: "2026-08-28",
      observations: [
        "overlay 560px wide",
        "92ms ease-out",
        "backdrop blur 8px",
        "focus-trap with restore",
      ],
      patternName: "positional continuity — the interface never loses the user’s place",
      filedBeside: ["arc-command-bar", "notion-slash-menu"],
    },
  },
  {
    slug: "stripe-docs-api-reference-2026-08-24",
    folderModified: "2026-08-24T09:03:00Z",
    images: [screenshot("docs")],
    frontmatter: {
      title: "Stripe Docs — API reference",
      url: "https://stripe.com/docs/api",
      kind: "page",
      saved: "2026-08-24",
      rating: 3,
      tags: ["three-column", "code-sync", "density"],
      surface: "docs",
    },
    ...p(
      "The right rail tracks prose and code position at the same time. Nothing is loud; everything sits where my hand expects it. The density is high but never crowded — every line has room to be read.",
      "The right rail tracks prose and code position at the same time. Nothing is loud; everything sits where my hand expects it. The density is high but never crowded — every line has room to be read.",
    ),
  },
  {
    slug: "enterprise-iam-settings-2026-08-21",
    folderModified: "2026-08-21T14:40:00Z",
    images: [screenshot("settings")],
    frontmatter: {
      title: "Enterprise IAM — settings",
      kind: "page",
      saved: "2026-08-21",
      sentiment: "negative",
      rating: 3,
      tags: ["nested-tabs", "modal-in-modal", "save-ambiguity"],
      surface: "settings",
    },
    ...p(
      "Six levels of nested tabs, two of them inside modals. You never know whether a change is saved. Never bury the primary action, and never make the user model where they are in a tree just to change one value.",
      "Six levels of nested tabs, two of them inside modals. You never know whether a change is saved. Never bury the primary action, and never make the user model where they are in a tree just to change one value.",
    ),
  },
  {
    slug: "vercel-deployment-list-2026-08-19",
    folderModified: "2026-08-19T18:22:00Z",
    images: [screenshot("list")],
    frontmatter: {
      title: "Vercel — deployment list",
      url: "https://vercel.com/",
      kind: "element",
      saved: "2026-08-19",
      rating: 2,
      tags: ["list", "status", "relative-time"],
      surface: "dashboard",
    },
    ...p(
      "Status, branch, author and age in one glanceable line. The row is the unit, not a card. Nothing wrapped, nothing truncated past use.",
      "Status, branch, author and age in one glanceable line. The row is the unit, not a card. Nothing wrapped, nothing truncated past use.",
    ),
  },
  {
    slug: "cosmos-infinite-canvas-2026-08-15",
    folderModified: "2026-08-15T11:00:00Z",
    images: [screenshot("canvas")],
    frontmatter: {
      title: "Cosmos — infinite canvas",
      url: "https://cosmos.so/",
      kind: "page",
      saved: "2026-08-15",
      rating: 2,
      tags: ["canvas", "zoom", "spatial-memory"],
      surface: "gallery",
    },
    ...p(
      "Pan-and-zoom that keeps its place. I come back an hour later and my spatial memory still works — the thing I left is where I left it, at the scale I left it.",
      "Pan-and-zoom that keeps its place. I come back an hour later and my spatial memory still works — the thing I left is where I left it, at the scale I left it.",
    ),
  },
  {
    slug: "things-3-quick-entry-2026-08-09",
    folderModified: "2026-08-09T08:15:00Z",
    images: [screenshot("editor")],
    frontmatter: {
      title: "Things 3 — quick entry",
      url: "https://culturedcode.com/things/",
      kind: "interaction",
      saved: "2026-08-09",
      rating: 3,
      tags: ["quick-add", "magic-plus", "motion"],
      surface: "productivity",
    },
    ...p(
      "The plus button detaches and follows the cursor, then drops the new to-do exactly where you point. Playful without being slow — the motion is doing wayfinding, not decoration.",
      "The plus button detaches and follows the cursor, then drops the new to-do exactly where you point. Playful without being slow — the motion is doing wayfinding, not decoration.",
    ),
  },
  {
    slug: "generic-saas-landing-2026-08-12",
    folderModified: "2026-08-12T16:30:00Z",
    images: [screenshot("landing")],
    frontmatter: {
      title: "Generic SaaS — landing",
      kind: "page",
      saved: "2026-08-12",
      sentiment: "negative",
      rating: 2,
      tags: ["popup-stack", "autoplay", "cookie-wall"],
      surface: "marketing site",
    },
    ...p(
      "Three popups before I read one sentence of copy. Autoplaying video with sound. A cookie wall that greys the page. This is what desperation looks like — every one of these is the site not trusting its own offer.",
      "Three popups before I read one sentence of copy. Autoplaying video with sound. A cookie wall that greys the page. This is what desperation looks like — every one of these is the site not trusting its own offer.",
    ),
  },
  {
    slug: "arc-command-bar-2026-08-06",
    folderModified: "2026-08-06T20:05:00Z",
    images: [screenshot("toolbar")],
    frontmatter: {
      title: "Arc — command bar",
      url: "https://arc.net/",
      kind: "element",
      saved: "2026-08-06",
      rating: 2,
      tags: ["command-palette", "theming"],
      surface: "browser",
    },
    ...p(
      "Same Cmd-T muscle memory as a new tab, but it’s a full command surface. The theme tints it without hurting contrast.",
      "Same Cmd-T muscle memory as a new tab, but it’s a full command surface. The theme tints it without hurting contrast.",
    ),
  },
  {
    slug: "notion-slash-menu-2026-08-04",
    folderModified: "2026-08-04T13:44:00Z",
    images: [screenshot("editor")],
    frontmatter: {
      title: "Notion — slash menu",
      url: "https://notion.so/",
      kind: "element",
      saved: "2026-08-04",
      rating: 2,
      tags: ["slash-menu", "inline", "filtering"],
      surface: "editor",
    },
    ...p(
      "Typing / filters block types as fast as I think. Arrow keys and Enter, never the mouse. The menu is positioned off the caret, so it never covers what I just wrote.",
      "Typing / filters block types as fast as I think. Arrow keys and Enter, never the mouse. The menu is positioned off the caret, so it never covers what I just wrote.",
    ),
  },
  {
    slug: "retool-table-editor-2026-08-02",
    folderModified: "2026-08-02T10:20:00Z",
    images: [screenshot("table")],
    frontmatter: {
      title: "Retool — table editor",
      url: "https://retool.com/",
      kind: "element",
      saved: "2026-08-02",
      rating: 1,
      tags: ["inline-edit", "table", "focus-ring"],
      surface: "editor",
    },
    ...p(
      "Click a cell, type, Tab to the next. It behaves like a spreadsheet, which is the point. The focus ring is the only chrome and it’s enough.",
      "Click a cell, type, Tab to the next. It behaves like a spreadsheet, which is the point. The focus ring is the only chrome and it’s enough.",
    ),
  },
  {
    // no images — exercises the text-placeholder plate
    slug: "raycast-window-management-2026-07-28",
    folderModified: "2026-07-28T22:10:00Z",
    images: [],
    frontmatter: {
      title: "Raycast — window management",
      url: "https://raycast.com/",
      kind: "flow",
      saved: "2026-07-28",
      rating: 2,
      tags: ["keyboard-nav", "hotkeys", "motion"],
      surface: "utility",
    },
    ...p(
      "Meant to grab a screenshot and forgot. The feel: a hotkey snaps the window to a half, then a second press to a third — the animation is fast enough to trust and slow enough to follow.",
      "Meant to grab a screenshot and forgot. The feel: a hotkey snaps the window to a half, then a second press to a third — the animation is fast enough to trust and slow enough to follow.",
    ),
  },
  {
    // reference.md failed to parse — degraded, still listed
    slug: "figma-multiplayer-cursors-2026-07-22",
    folderModified: "2026-07-22T09:30:00Z",
    images: [screenshot("canvas")],
    frontmatter: null,
    noteHtml: "",
    noteText: "",
  },
];
