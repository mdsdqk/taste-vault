/**
 * `pnpm new-ref` — scaffold a well-formed Reference folder in the Vault.
 *
 * A convenience, never a gate (PRD §5.1): it just creates
 * `references/<slug>-<YYYY-MM-DD>/reference.md` with whatever you supply. Every
 * field is optional; you can also make the folder by hand. Editing the file
 * afterwards, or leaving it half-filled, is fine — the Portal degrades
 * gracefully (ADR 0001).
 *
 * Interactive by default; also takes flags for scripting:
 *   pnpm new-ref --title="Linear command menu" --url=https://linear.app \
 *     --kind=element --tags=command-palette,keyboard-nav --negative
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout, argv, env } from "node:process";
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyEdits,
  serializeReferenceMd,
  slugify,
} from "../apps/server/src/reference-md.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referencesDir =
  env.TASTEVAULT_REFERENCES ?? path.join(repoRoot, "references");

function flag(name: string): string | undefined {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? "" : hit.slice(eq + 1);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function uniqueSlug(base: string): string {
  const taken = (s: string): boolean =>
    existsSync(path.join(referencesDir, s)) ||
    existsSync(path.join(referencesDir, ".trash", s));
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

async function main(): Promise<void> {
  const interactive = stdin.isTTY && flag("title") === undefined;
  const rl = interactive
    ? createInterface({ input: stdin, output: stdout })
    : null;

  const ask = async (q: string, fallback = ""): Promise<string> => {
    if (!rl) return fallback;
    const a = await rl.question(q);
    return a.trim() || fallback;
  };

  const title = (flag("title") ?? (await ask("Title: "))).trim();
  const url = (flag("url") ?? (await ask("URL (optional): "))).trim();
  const kind = (flag("kind") ?? (await ask("Kind — page / element (optional): ")))
    .trim()
    .toLowerCase();
  const tagsRaw = flag("tags") ?? (await ask("Tags, comma-separated (optional): "));
  const negativeAnswer =
    flag("negative") !== undefined
      ? "y"
      : await ask("Something to avoid? (negative Reference) [y/N]: ", "n");

  rl?.close();

  const negative = /^y(es)?$/i.test(negativeAnswer.trim());
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title) {
    stdout.write("No title given — creating an “untitled reference” you can rename later.\n");
  }

  const slug = uniqueSlug(`${slugify(title || "untitled reference")}-${today()}`);
  const dir = path.join(referencesDir, slug);

  const data = applyEdits({ saved: today() }, {
    title: title || undefined,
    url: url || undefined,
    kind: kind || undefined,
    tags,
    sentiment: negative ? "negative" : "positive",
  });

  const noteHint = negative
    ? "What to avoid here, and why:\n\n"
    : "Why this is worth keeping:\n\n";

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "reference.md"),
    serializeReferenceMd(data, noteHint),
    "utf8",
  );

  const rel = path.relative(repoRoot, dir);
  const shown = rel.startsWith("..") ? dir : rel;
  stdout.write(`\nCreated ${shown}\n`);
  stdout.write("  • drop screenshots into that folder (name one cover.* for the thumbnail)\n");
  stdout.write("  • open reference.md and write your User Note\n");
}

main().catch((err) => {
  stdout.write(`\nnew-ref failed: ${(err as Error).message}\n`);
  process.exitCode = 1;
});
