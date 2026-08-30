import { createReadStream, existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import trash from "trash";
import type { FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import type { Vault } from "./vault.js";
import { readReference, scanDir } from "./scanner.js";
import {
  applyEdits,
  serializeReferenceMd,
  slugify,
  type ReferenceEdits,
} from "./reference-md.js";
import { isSafeSegment } from "./util.js";

/**
 * The disk-write half of the API: create, amend, remove (→ `.trash/`), list
 * removed, restore, and permanently delete (→ the OS trash). Every write goes
 * through `reference-md.ts` so the on-disk format stays identical to what the
 * scaffold and a hand author would produce. No endpoint validates field values
 * — a half-filled Reference is allowed (ADR 0001).
 */

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

async function atomicWrite(file: string, content: string): Promise<void> {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, file);
}

/** `<base>` if free, else `<base>-2`, `-3`, … (base already ends with the date). */
function uniqueSlug(referencesDir: string, base: string): string {
  const taken = (s: string): boolean =>
    existsSync(path.join(referencesDir, s)) ||
    existsSync(path.join(referencesDir, ".trash", s));
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function registerWriteRoutes(
  app: FastifyInstance,
  vault: Vault,
  config: Config,
): Promise<void> {
  const { referencesDir } = config;
  const trashDir = path.join(referencesDir, ".trash");

  /** Read a folder's `reference.md` into `{ data, body }`; back up broken YAML. */
  async function readMd(dir: string): Promise<{ data: Record<string, unknown>; body: string }> {
    const mdPath = path.join(dir, "reference.md");
    if (!existsSync(mdPath)) return { data: {}, body: "" };
    const raw = await fs.readFile(mdPath, "utf8");
    try {
      const parsed = matter(raw);
      const data =
        parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
          ? (parsed.data as Record<string, unknown>)
          : {};
      return { data, body: parsed.content };
    } catch {
      const backup = `${mdPath}.bak-${Date.now()}`;
      await fs.rename(mdPath, backup);
      app.log.warn(`reference.md in ${path.basename(dir)} had unparseable YAML — kept as ${path.basename(backup)}`);
      return { data: {}, body: "" };
    }
  }

  async function raw(slug: string, urlPrefix: string, root: string) {
    const warnings: string[] = [];
    const ref = await readReference(root, slug, urlPrefix, warnings);
    for (const w of warnings) app.log.warn(w);
    return ref;
  }

  // --- create -------------------------------------------------------------
  app.post<{ Body: Partial<ReferenceEdits> }>(
    "/api/references",
    async (req, reply) => {
      const body = req.body ?? {};
      const title =
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim()
          : "untitled reference";
      const slug = uniqueSlug(referencesDir, `${slugify(title)}-${today()}`);
      const dir = path.join(referencesDir, slug);
      await fs.mkdir(dir, { recursive: true });

      const data = applyEdits({ saved: today() }, {
        ...body,
        // only persist a title the user actually typed
        title: typeof body.title === "string" && body.title.trim() ? body.title : undefined,
      });
      await atomicWrite(
        path.join(dir, "reference.md"),
        serializeReferenceMd(data, typeof body.noteText === "string" ? body.noteText : ""),
      );

      await vault.forceRefresh();
      reply.code(201);
      return vault.find(slug) ?? (await raw(slug, "/api/references", referencesDir));
    },
  );

  // --- amend ------------------------------------------------------------------
  app.patch<{ Params: { slug: string }; Body: ReferenceEdits }>(
    "/api/references/:slug",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const dir = path.join(referencesDir, slug);
      if (!existsSync(dir)) return reply.code(404).send({ error: "not found" });

      const edits = req.body ?? {};
      const { data, body } = await readMd(dir);
      const nextData = applyEdits(data, edits);
      const nextBody = "noteText" in edits ? edits.noteText ?? "" : body;
      await atomicWrite(
        path.join(dir, "reference.md"),
        serializeReferenceMd(nextData, nextBody),
      );

      await vault.forceRefresh();
      return vault.find(slug) ?? (await raw(slug, "/api/references", referencesDir));
    },
  );

  // --- remove → .trash/ -----------------------------------------------------
  app.delete<{ Params: { slug: string } }>(
    "/api/references/:slug",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const src = path.join(referencesDir, slug);
      if (!existsSync(src)) return reply.code(404).send({ error: "not found" });

      await fs.mkdir(trashDir, { recursive: true });
      let dest = path.join(trashDir, slug);
      if (existsSync(dest)) dest = path.join(trashDir, `${slug}-${Date.now()}`);
      await fs.rename(src, dest);

      await vault.forceRefresh();
      return reply.code(204).send();
    },
  );

  // --- list removed --------------------------------------------------------
  app.get("/api/removed", async () => {
    const { references, warnings } = await scanDir(trashDir, "/api/removed");
    for (const w of warnings) app.log.debug(w);
    return references;
  });

  // --- a removed Reference's asset ---------------------------------------
  app.get<{ Params: { slug: string; file: string } }>(
    "/api/removed/:slug/:file",
    async (req, reply) => {
      const { slug, file } = req.params;
      if (!isSafeSegment(slug) || !isSafeSegment(file)) {
        return reply.code(400).send({ error: "bad path" });
      }
      const abs = path.join(trashDir, slug, file);
      if (!abs.startsWith(trashDir + path.sep)) {
        return reply.code(400).send({ error: "bad path" });
      }
      try {
        const stat = await fs.stat(abs);
        if (!stat.isFile()) return reply.code(404).send({ error: "not found" });
      } catch {
        return reply.code(404).send({ error: "not found" });
      }
      reply.type(MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream");
      return reply.send(createReadStream(abs));
    },
  );

  // --- restore -----------------------------------------------------------
  app.post<{ Params: { slug: string } }>(
    "/api/removed/:slug/restore",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const src = path.join(trashDir, slug);
      if (!existsSync(src)) return reply.code(404).send({ error: "not found" });

      let finalSlug = slug;
      let dest = path.join(referencesDir, slug);
      if (existsSync(dest)) {
        finalSlug = `${slug}-restored-${Date.now()}`;
        dest = path.join(referencesDir, finalSlug);
      }
      await fs.rename(src, dest);

      await vault.forceRefresh();
      return vault.find(finalSlug) ?? (await raw(finalSlug, "/api/references", referencesDir));
    },
  );

  // --- permanently delete → OS trash ------------------------------------
  app.delete<{ Params: { slug: string } }>(
    "/api/removed/:slug",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const target = path.join(trashDir, slug);
      if (!existsSync(target)) return reply.code(204).send(); // idempotent

      try {
        await trash(target);
      } catch (err) {
        app.log.warn(`OS trash failed for ${slug} (${(err as Error).message}) — removing directly`);
        await fs.rm(target, { recursive: true, force: true });
      }
      await vault.forceRefresh(); // .trash is unwatched — nudge SSE so clients refetch /api/removed
      return reply.code(204).send();
    },
  );
}
