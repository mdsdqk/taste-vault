# create-taste-vault

One-command installer for [**TasteVault**](https://github.com/mdsdqk/taste-vault) — a local-first vault for the interface design you've judged.

```bash
npm create taste-vault
```

Same thing, other spellings:

```bash
npx create-taste-vault
npx create-taste-vault init
```

This sets up a ready-to-run workspace:

1. Clones TasteVault at the latest stable release (or `main` if none exists yet)
2. Installs workspace dependencies with pnpm 11

Then:

```bash
cd taste-vault
pnpm start
```

Open [http://localhost:5174](http://localhost:5174). The Vault starts empty and stays on your machine.

## Usage

```bash
npm create taste-vault [folder]          # default folder: ./taste-vault
npx create-taste-vault init [folder]
```

Prefer the manual route? `git clone` still works — see the [project README](https://github.com/mdsdqk/taste-vault#getting-started).

## Requirements

- Node.js 22+
- git

Works on macOS, Windows, and Linux. pnpm 11 is used automatically. You do not need to install it first.

## Publishing (maintainers)

The installer is this folder, not the TasteVault app. From `scaffolder/` after `npm login`:

```bash
npm publish --access public
```

Later publishes can go through `.github/workflows/publish-scaffolder.yml` once an `NPM_TOKEN` secret is set, or npm Trusted Publishing is configured for this repo.

## License

MIT
