import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import type { Config } from "./config.js";
import { Vault } from "./vault.js";
import { registerWriteRoutes } from "./write-routes.js";
import { isSafeSegment } from "./util.js";

export async function buildServer(config: Config): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // `@fastify/static` throws if its root is missing; the scanner tolerates it,
  // so make sure the Vault directory exists before we wire asset serving.
  if (!existsSync(config.referencesDir)) {
    mkdirSync(config.referencesDir, { recursive: true });
    app.log.warn(`created missing Vault directory at ${config.referencesDir}`);
  }

  const vault = new Vault(config.referencesDir, (msg) => app.log.warn(msg));
  await vault.start();
  app.addHook("onClose", async () => {
    await vault.stop();
  });

  // Enables `reply.sendFile(name, root)`; no route of its own.
  await app.register(fastifyStatic, {
    root: config.referencesDir,
    serve: false,
  });

  app.get("/api/health", async () => ({
    ok: true,
    referencesDir: config.referencesDir,
    count: vault.references.length,
  }));

  // The whole Vault.
  app.get("/api/references", async () => vault.references);

  // One Reference.
  app.get<{ Params: { slug: string } }>(
    "/api/references/:slug",
    async (req, reply) => {
      if (!isSafeSegment(req.params.slug)) {
        return reply.code(400).send({ error: "bad slug" });
      }
      const ref = vault.find(req.params.slug);
      if (!ref) return reply.code(404).send({ error: "not found" });
      return ref;
    },
  );

  // A raw asset file inside a Reference folder.
  app.get<{ Params: { slug: string; file: string } }>(
    "/api/references/:slug/:file",
    async (req, reply) => {
      const { slug, file } = req.params;
      if (!isSafeSegment(slug) || !isSafeSegment(file)) {
        return reply.code(400).send({ error: "bad path" });
      }
      if (!vault.find(slug)) {
        return reply.code(404).send({ error: "not found" });
      }
      return reply.sendFile(
        path.posix.join(slug, file),
        config.referencesDir,
      );
    },
  );

  // Create, amend, remove → .trash/, list removed, restore.
  await registerWriteRoutes(app, vault, config);

  // Live update: one event per debounced batch of Vault changes.
  app.get("/api/events", (req, reply) => {
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    let closed = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    const safeWrite = (chunk: string): void => {
      if (closed || res.writableEnded) return;
      try {
        res.write(chunk);
      } catch {
        cleanup();
      }
    };

    const onChange = (): void => {
      safeWrite("event: change\ndata: {}\n\n");
    };

    const cleanup = (): void => {
      if (closed) return;
      closed = true;
      if (heartbeat !== undefined) clearInterval(heartbeat);
      vault.off("change", onChange);
      try {
        if (!res.writableEnded) res.end();
      } catch {
        /* ignore */
      }
    };

    safeWrite("retry: 3000\n\n");
    safeWrite("event: ready\ndata: {}\n\n");

    vault.on("change", onChange);

    heartbeat = setInterval(() => {
      safeWrite(": ping\n\n");
    }, 25_000);

    req.raw.on("close", cleanup);
    req.raw.on("error", cleanup);
    res.on("error", cleanup);
  });

  // `pnpm start`: also serve the built Portal, with SPA fallback.
  const webIndex = path.join(config.webDist, "index.html");
  if (config.serveWeb && existsSync(webIndex)) {
    await app.register(fastifyStatic, {
      root: config.webDist,
      prefix: "/",
      decorateReply: false,
    });
    app.setNotFoundHandler((req, reply) => {
      if (req.raw.url?.startsWith("/api/")) {
        return reply.code(404).send({ error: "not found" });
      }
      return reply.sendFile("index.html", config.webDist);
    });
    app.log.info(`serving the Portal from ${config.webDist}`);
  }

  return app;
}
