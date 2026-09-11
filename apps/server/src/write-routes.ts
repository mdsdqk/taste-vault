import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import matter from "gray-matter";
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
import {
  isCoverFilename,
  isImageFilename,
  isInsideDir,
  isSafeSegment,
  sanitizeImageFilename,
  uniqueFilename,
} from "./util.js";

/**
 * The disk-write half of the API: create, amend, hang/remove screenshots,
 * set cover, remove a Reference (→ `.trash/`), list removed, and restore.
 * There is no permanent-delete endpoint for a folder — Recently removed is
 * the archive. A folder can still be deleted by hand from disk; the Portal
 * will not. Screenshots taken down from a plate are unlinked (the user can
 * drop them in again). Every markdown write goes through `reference-md.ts`
 * so the on-disk format stays identical to what the scaffold and a hand
 * author would produce. No endpoint validates field values — a half-filled
 * Reference is allowed (ADR 0001).
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
function uniqueSlug(
  referencesDir: string,
  base: string,
  except?: string,
): string {
  const taken = (s: string): boolean => {
    if (except && s === except) return false;
    return (
      existsSync(path.join(referencesDir, s)) ||
      existsSync(path.join(referencesDir, ".trash", s))
    );
  };
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Date suffix on a folder slug, ignoring a trailing `-2` uniqueness mark. */
function folderDate(slug: string): string {
  const m = slug.match(/(\d{4}-\d{2}-\d{2})(?:-\d+)?$/);
  return m?.[1] ?? today();
}

function slugForTitle(
  referencesDir: string,
  title: string,
  currentSlug: string,
): string {
  return uniqueSlug(
    referencesDir,
    `${slugify(title)}-${folderDate(currentSlug)}`,
    currentSlug,
  );
}

async function titleFromFolder(dir: string): Promise<string | null> {
  const mdPath = path.join(dir, "reference.md");
  if (!existsSync(mdPath)) return null;
  try {
    const parsed = matter(await fs.readFile(mdPath, "utf8"));
    const data =
      parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
        ? (parsed.data as Record<string, unknown>)
        : {};
    return typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : null;
  } catch {
    return null;
  }
}

/**
 * Rename folders whose slug doesn't match `title` in `reference.md`. Runs
 * once at boot, before the watch starts, so Pin-created untitled folders
 * catch up with names the user already saved. `.trash/` is included so a
 * restore doesn't bring a stale untitled slug back onto the wall.
 */
export async function realignReferenceFolders(
  referencesDir: string,
  log: (msg: string) => void,
): Promise<void> {
  await realignDir(referencesDir, referencesDir, log);
  await realignDir(referencesDir, path.join(referencesDir, ".trash"), log);
}

async function realignDir(
  referencesDir: string,
  folder: string,
  log: (msg: string) => void,
): Promise<void> {
  let dirents;
  try {
    dirents = await fs.readdir(folder, { withFileTypes: true });
  } catch {
    return;
  }
  const names = dirents
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  for (const name of names) {
    const title = await titleFromFolder(path.join(folder, name));
    if (!title) continue;
    const next = slugForTitle(referencesDir, title, name);
    if (next === name) continue;
    try {
      await fs.rename(path.join(folder, name), path.join(folder, next));
      log(`renamed ${name} → ${next}`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      log(`could not rename ${name} → ${next}: ${detail}`);
    }
  }
}

export async function registerWriteRoutes(
  app: FastifyInstance,
  vault: Vault,
  config: Config,
): Promise<void> {
  const { referencesDir } = config;
  const trashDir = path.join(referencesDir, ".trash");

  /** Read a folder's `reference.md` into `{ data, body }`. Broken YAML is a
   *  conflict — we never rename or overwrite a file we couldn't parse. */
  async function readMd(
    dir: string,
  ): Promise<
    | { ok: true; data: Record<string, unknown>; body: string }
    | { ok: false }
  > {
    const mdPath = path.join(dir, "reference.md");
    if (!existsSync(mdPath)) return { ok: true, data: {}, body: "" };
    const raw = await fs.readFile(mdPath, "utf8");
    try {
      const parsed = matter(raw);
      const data =
        parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
          ? (parsed.data as Record<string, unknown>)
          : {};
      return { ok: true, data, body: parsed.content };
    } catch {
      return { ok: false };
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
      const md = await readMd(dir);
      if (!md.ok) {
        return reply.code(409).send({
          error:
            "reference.md has unparseable YAML. Fix the file on disk — the Portal will not overwrite it.",
        });
      }
      const { data, body } = md;
      const nextData = applyEdits(data, edits);
      const nextBody = "noteText" in edits ? edits.noteText ?? "" : body;
      await atomicWrite(
        path.join(dir, "reference.md"),
        serializeReferenceMd(nextData, nextBody),
      );

      let currentSlug = slug;
      const named =
        "title" in edits && typeof edits.title === "string" && edits.title.trim()
          ? edits.title.trim()
          : typeof nextData.title === "string" && nextData.title.trim()
            ? nextData.title.trim()
            : null;
      if (named) {
        const nextSlug = slugForTitle(referencesDir, named, slug);
        if (nextSlug !== slug) {
          await fs.rename(dir, path.join(referencesDir, nextSlug));
          currentSlug = nextSlug;
        }
      }

      await vault.forceRefresh();
      return (
        vault.find(currentSlug) ??
        (await raw(currentSlug, "/api/references", referencesDir))
      );
    },
  );

  async function takenNames(dir: string): Promise<Set<string>> {
    try {
      const names = await fs.readdir(dir);
      return new Set(names.map((n) => n.toLowerCase()));
    } catch {
      return new Set();
    }
  }

  async function respondWith(slug: string) {
    await vault.forceRefresh();
    return vault.find(slug) ?? (await raw(slug, "/api/references", referencesDir));
  }

  // --- hang screenshots ----------------------------------------------------
  app.post<{ Params: { slug: string } }>(
    "/api/references/:slug/images",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const dir = path.join(referencesDir, slug);
      if (!existsSync(dir)) return reply.code(404).send({ error: "not found" });

      const type = req.headers["content-type"] ?? "";
      if (!type.toLowerCase().includes("multipart/form-data")) {
        return reply.code(400).send({ error: "expected multipart image upload" });
      }

      const taken = await takenNames(dir);
      let saved = 0;
      let truncated = false;

      try {
        for await (const part of req.parts()) {
          if (part.type !== "file") continue;
          const desired = sanitizeImageFilename(part.filename || "screenshot.png");
          if (!desired) {
            part.file.resume();
            continue;
          }
          const name = uniqueFilename(taken, desired);
          const dest = path.join(dir, name);
          if (!isInsideDir(dir, dest)) {
            part.file.resume();
            continue;
          }
          await pipeline(part.file, createWriteStream(dest));
          if (part.file.truncated) {
            truncated = true;
            await fs.unlink(dest).catch(() => undefined);
            break;
          }
          taken.add(name.toLowerCase());
          saved += 1;
        }
      } catch (err) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: unknown }).code)
            : "";
        if (code === "FST_REQ_FILE_TOO_LARGE" || truncated) {
          return reply.code(413).send({ error: "screenshot is too large (25 MB limit)" });
        }
        req.log.warn({ err }, "image upload failed");
        return reply.code(400).send({ error: "could not read the upload" });
      }

      if (truncated) {
        return reply.code(413).send({ error: "screenshot is too large (25 MB limit)" });
      }
      if (saved === 0) {
        return reply.code(400).send({
          error: "no images in that drop — png, webp, jpg, gif, avif, or svg",
        });
      }

      reply.code(201);
      return respondWith(slug);
    },
  );

  // --- pick cover (rename to cover.<ext>, same convention as by hand) ------
  app.post<{ Params: { slug: string }; Body: { file?: string } }>(
    "/api/references/:slug/cover",
    async (req, reply) => {
      const { slug } = req.params;
      if (!isSafeSegment(slug)) return reply.code(400).send({ error: "bad slug" });
      const dir = path.join(referencesDir, slug);
      if (!existsSync(dir)) return reply.code(404).send({ error: "not found" });

      const file = typeof req.body?.file === "string" ? req.body.file : "";
      if (!isSafeSegment(file) || !isImageFilename(file)) {
        return reply.code(400).send({ error: "bad filename" });
      }
      const src = path.join(dir, file);
      if (!isInsideDir(dir, src) || !existsSync(src)) {
        return reply.code(404).send({ error: "not found" });
      }

      if (!isCoverFilename(file)) {
        const taken = await takenNames(dir);
        const entries = await fs.readdir(dir);
        for (const name of entries) {
          if (!isCoverFilename(name) || name === file) continue;
          const aside = uniqueFilename(taken, `plate${path.extname(name).toLowerCase()}`);
          await fs.rename(path.join(dir, name), path.join(dir, aside));
          taken.delete(name.toLowerCase());
          taken.add(aside.toLowerCase());
        }
        const destName = uniqueFilename(
          new Set([...taken].filter((n) => n !== file.toLowerCase())),
          `cover${path.extname(file).toLowerCase()}`,
        );
        if (destName !== file) {
          await fs.rename(src, path.join(dir, destName));
        }
      }

      return respondWith(slug);
    },
  );

  // --- take a screenshot off the plate ------------------------------------
  app.delete<{ Params: { slug: string; file: string } }>(
    "/api/references/:slug/:file",
    async (req, reply) => {
      const { slug, file } = req.params;
      if (!isSafeSegment(slug) || !isSafeSegment(file) || !isImageFilename(file)) {
        return reply.code(400).send({ error: "bad path" });
      }
      const dir = path.join(referencesDir, slug);
      const abs = path.join(dir, file);
      if (!existsSync(dir)) return reply.code(404).send({ error: "not found" });
      if (!isInsideDir(dir, abs)) return reply.code(400).send({ error: "bad path" });
      try {
        const stat = await fs.stat(abs);
        if (!stat.isFile()) return reply.code(404).send({ error: "not found" });
      } catch {
        return reply.code(404).send({ error: "not found" });
      }
      await fs.unlink(abs);
      return respondWith(slug);
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
      if (!isInsideDir(trashDir, abs)) {
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
}
