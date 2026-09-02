#!/usr/bin/env node
// TasteVault scaffolder — one-command install.
// Clones the repo at the latest release tag (falls back to the default branch)
// and installs workspace dependencies with pnpm. The Vault itself stays empty
// and local; nothing is uploaded.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
);

const REPO = "https://github.com/mdsdqk/taste-vault.git";
const LATEST_RELEASE = "https://api.github.com/repos/mdsdqk/taste-vault/releases/latest";
const PNPM_SPEC = "pnpm@11";
const MIN_NODE_MAJOR = 22;
const IS_WIN = process.platform === "win32";
const NPX = IS_WIN ? "npx.cmd" : "npx";
const PNPM = IS_WIN ? "pnpm.cmd" : "pnpm";
const COREPACK = IS_WIN ? "corepack.cmd" : "corepack";

const USAGE = `TasteVault — set up a local vault for the interface design you've judged.

Usage:
  npm create taste-vault [folder]
  npx create-taste-vault [folder]
  npx create-taste-vault init [folder]

Default folder: ./taste-vault

Requires Node.js ${MIN_NODE_MAJOR}+ and git. pnpm 11 is used automatically.

After setup:
  cd <folder>
  pnpm start

Then open http://localhost:5174
Docs: https://github.com/mdsdqk/taste-vault`;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function winQuote(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function run(cmd, args, cwd, capture = false) {
  const opts = capture
    ? { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    : { cwd, stdio: "inherit" };
  // Windows .cmd shims (pnpm.cmd, npx.cmd) cannot be execFile'd. Unix binaries
  // and shebang scripts can. Same installer, two spawn paths.
  if (IS_WIN) {
    const line = [cmd, ...args].map(winQuote).join(" ");
    const out = execFileSync("cmd.exe", ["/d", "/s", "/c", line], opts);
    return capture ? String(out) : undefined;
  }
  const out = execFileSync(cmd, args, opts);
  return capture ? String(out) : undefined;
}

function hasGit() {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function nodeMajor() {
  return Number(process.versions.node.split(".")[0]);
}

function pnpmMajor() {
  try {
    const out = run(PNPM, ["--version"], undefined, true).trim();
    return Number(out.split(".")[0]);
  } catch {
    return 0;
  }
}

function hasCorepack() {
  try {
    run(COREPACK, ["--version"], undefined, true);
    return true;
  } catch {
    return false;
  }
}

function installDeps(cwd) {
  const abs = resolve(cwd);
  if (pnpmMajor() >= 11) {
    run(PNPM, ["install"], abs);
    return;
  }
  // corepack runs pnpm directly. npx would read the clone's package.json and
  // refuse: this repo's devEngines.packageManager is pnpm, not npm.
  if (hasCorepack()) {
    run(COREPACK, ["pnpm", "install"], abs);
    return;
  }
  run(NPX, ["--yes", PNPM_SPEC, "--dir", abs, "install"], tmpdir());
}

async function latestTag() {
  try {
    const res = await fetch(LATEST_RELEASE, {
      headers: {
        "User-Agent": "create-taste-vault",
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.tag_name === "string" && data.tag_name.length > 0
      ? data.tag_name
      : null;
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = argv.filter((a) => a !== "init");
  const flags = new Set(args.filter((a) => a.startsWith("-")));
  const positional = args.filter((a) => !a.startsWith("-"));
  return { flags, folder: positional[0] ?? "taste-vault" };
}

async function main() {
  const { flags, folder } = parseArgs(process.argv.slice(2));

  if (flags.has("-h") || flags.has("--help")) {
    console.log(USAGE);
    process.exit(0);
  }
  if (flags.has("-v") || flags.has("--version")) {
    console.log(pkg.version);
    process.exit(0);
  }
  if ([...flags].some((f) => f !== "-h" && f !== "--help" && f !== "-v" && f !== "--version")) {
    die(`Unknown option.\n${USAGE}`);
  }

  const major = nodeMajor();
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    die(
      `Node.js ${MIN_NODE_MAJOR}+ is required (found ${process.version}). Install it from https://nodejs.org and try again.`,
    );
  }
  if (!hasGit()) {
    die("git is required but was not found on PATH. Install git and try again.");
  }

  if (existsSync(folder) && readdirSync(folder).length > 0) {
    die(`Target folder "${folder}" already exists and is not empty. Pick another name.`);
  }

  const display = isAbsolute(folder) ? folder : `./${folder}`;

  const tag = await latestTag();
  console.log(`\n→ Cloning TasteVault${tag ? ` @ ${tag}` : ""} into ${display} ...`);
  const cloneArgs = ["clone", "--depth=1"];
  if (tag) cloneArgs.push("--branch", tag);
  cloneArgs.push(REPO, folder);
  try {
    execFileSync("git", cloneArgs, { stdio: "inherit" });
  } catch {
    die("git clone failed. Check your network connection and try again.");
  }

  console.log("\n→ Installing dependencies (pnpm install) ...");
  try {
    installDeps(folder);
  } catch {
    die(
      `pnpm install failed. The repo is in ${display} — cd in and run "pnpm install" to finish.`,
    );
  }

  console.log(`\n✓ TasteVault is ready in ${display}\n`);
  console.log("Next steps:");
  console.log(`  1. cd ${folder}`);
  console.log("  2. pnpm start");
  console.log("  3. Open http://localhost:5174\n");
  console.log("Your Vault starts empty. Add a Reference with `pnpm new-ref`,");
  console.log("by dropping a folder into references/, or from the Portal.");
  console.log("Nothing you save leaves this machine.\n");
}

main().catch((err) => die(err?.message || String(err)));
