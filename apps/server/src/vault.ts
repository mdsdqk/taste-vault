import { EventEmitter } from "node:events";
import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";
import { scan } from "./scanner.js";
import type { RawReference } from "./types.js";

/**
 * The in-memory Vault: one scan of `references/` held in memory, kept fresh by a
 * chokidar watch. Routes read from `references` / `find()` so responses are
 * instant and consistent with what the SSE stream last announced.
 *
 * Emits `"change"` (debounced) whenever a file under the Vault is added,
 * changed, or removed.
 */
export class Vault extends EventEmitter {
  private cache: RawReference[] = [];
  private watcher: FSWatcher | null = null;
  private timer: NodeJS.Timeout | null = null;
  /** Serialises scans so an older in-flight `scan()` cannot overwrite a newer one. */
  private tail: Promise<void> = Promise.resolve();

  constructor(
    private readonly referencesDir: string,
    private readonly log: (msg: string) => void,
  ) {
    super();
  }

  get references(): RawReference[] {
    return this.cache;
  }

  find(slug: string): RawReference | undefined {
    return this.cache.find((r) => r.slug === slug);
  }

  /** Re-scan now and broadcast a `"change"`. Called after a disk write so the
   *  response and the SSE stream don't wait on the watch debounce. */
  async forceRefresh(): Promise<void> {
    await this.refresh(true);
  }

  async start(): Promise<void> {
    await this.refresh(false);

    this.watcher = chokidar.watch(this.referencesDir, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
      ignored: (p: string) => {
        const rel = path.relative(this.referencesDir, p);
        return rel
          .split(/[\\/]/)
          .some((seg) => seg.length > 0 && seg.startsWith("."));
      },
    });

    const bump = (): void => this.schedule();
    this.watcher
      .on("add", bump)
      .on("change", bump)
      .on("unlink", bump)
      .on("addDir", bump)
      .on("unlinkDir", bump)
      .on("error", (err) => this.log(`watch error: ${String(err)}`));
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.refresh(true);
    }, 150);
  }

  private refresh(emit: boolean): Promise<void> {
    const next = this.tail.then(async () => {
      const { references, warnings } = await scan(this.referencesDir);
      for (const w of warnings) this.log(w);
      this.cache = references;
      if (emit) this.emit("change");
    });
    this.tail = next.catch((err: unknown) => {
      this.log(`scan failed: ${String(err)}`);
    });
    return next;
  }

  async stop(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    await this.tail;
    await this.watcher?.close();
  }
}
