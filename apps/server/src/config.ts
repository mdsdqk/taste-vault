import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
/** `apps/server/src` → repo root */
const repoRoot = path.resolve(here, "..", "..", "..");

export interface Config {
  host: string;
  port: number;
  /** the Vault: the directory of Reference folders the server scans and watches */
  referencesDir: string;
  /** the built Portal, served in `pnpm start` mode when it exists */
  webDist: string;
  /**
   * Whether to serve the built Portal from `/`. `TASTEVAULT_SERVE_WEB=0` forces
   * it off (the `pnpm dev` case — Vite serves the app on :5173); otherwise the
   * server serves it whenever `apps/web/dist/index.html` is present.
   */
  serveWeb: boolean;
}

export function loadConfig(argv: string[] = process.argv.slice(2)): Config {
  const serveWebEnv = process.env.TASTEVAULT_SERVE_WEB;
  const serveWeb =
    !argv.includes("--no-web") && serveWebEnv !== "0";
  return {
    host: process.env.HOST ?? "127.0.0.1",
    port: Number(process.env.PORT ?? 5174),
    referencesDir:
      process.env.TASTEVAULT_REFERENCES ?? path.join(repoRoot, "references"),
    webDist: path.join(repoRoot, "apps", "web", "dist"),
    serveWeb,
  };
}
