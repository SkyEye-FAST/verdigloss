# Verdigloss

Verdigloss is a Vue 3 single-page application for searching, comparing, exporting, and practising the standard Minecraft Java Edition translations. It is the frontend successor to [minecraft_translation_flask](https://github.com/SkyEye-FAST/minecraft_translation_flask).

Live deployments: <https://mcst.teahouse.team/> and <https://verdigloss.vercel.app/>.

## Features

- Search by English source text, translation key, or a selected target language.
- Compare selected language columns, filter results, paginate, and export CSV, TSV, JSON, XML, or XLSX.
- Shareable, versioned quiz codes with legacy-code compatibility.
- Quiz hints, timer mode, summaries, and resilient browser preference storage.
- Colour translation reference with Korean mixed-script and Vietnamese Chữ Nôm variants.
- Responsive navigation, dark mode, semantic tables, keyboard-friendly controls, and automated accessibility checks.

## Prerequisites

- Node.js **24.9.x** (the supported range is recorded in `package.json`).
- Corepack with **pnpm 11.10.0**. The repository pins this in `packageManager`.
- Git with submodule support.

## Install and develop

```sh
git clone --recurse-submodules https://github.com/SkyEye-FAST/verdigloss.git
cd verdigloss
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

If the repository was cloned without its data submodule, run:

```sh
git submodule update --init --recursive
```

## Commands

All default validation commands are read-only. Their corresponding `:fix` or generation commands are explicit.

| Command                       | Purpose                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm format`                 | Format tracked project files (mutating).                                                  |
| `pnpm format:check`           | Verify Prettier formatting without writing.                                               |
| `pnpm lint` / `pnpm lint:fix` | Check ESLint / apply ESLint fixes.                                                        |
| `pnpm type-check`             | Run Vue and TypeScript checks.                                                            |
| `pnpm test`                   | Run the Vitest unit suite.                                                                |
| `pnpm build`                  | Type-check and produce the production bundle.                                             |
| `pnpm test:e2e`               | Run Playwright at desktop, 390px mobile, and 844×390 landscape sizes.                     |
| `pnpm generate-data`          | Regenerate the deterministic quiz ID mapping (mutating).                                  |
| `pnpm validate-data`          | Validate data integrity, quiz mappings, language registry, ratings, and UI locale parity. |
| `pnpm check-generated`        | CI-safe alias for generated-data validation.                                              |
| `pnpm bundle:check`           | Enforce production bundle and remote-font budgets after `pnpm build`.                     |

Install Playwright's local Chromium browser once before the first end-to-end run:

```sh
pnpm exec playwright install chromium
```

## Translation data and quiz codes

The `src/assets/mc_lang` submodule downloads Minecraft language assets and derives the `valid/` language files used by the application. `src/assets/data/quiz-id-map.json` maps every English translation key to a deterministic, collision-checked seven-character base-62 ID.

New links use `v1.<id>.<id>...`. They can be decoded without random state; legacy 30-character links continue to use the preserved legacy map where available. A quiz question is eligible only when its target-language value is non-empty and differs from English.

After updating language data, run:

```sh
pnpm generate-data
pnpm validate-data
pnpm format:generated
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm bundle:check
pnpm test:e2e
```

## Architecture

- `src/app/` configures application bootstrap, route titles, router, and interface i18n.
- `src/components/` contains the query, table, quiz, colour reference, and shared shell.
- `src/domain/` contains quiz-code, scoring, matching, and timing logic.
- `src/features/` holds query indexes, table pagination, and colour data.
- `src/services/` lazily imports language JSON and manages browser exports.
- `scripts/` owns deterministic generated-data validation, language-update summaries, and bundle budgets.

Language JSON is loaded only when a page needs it. XLSX is dynamically imported only for an XLSX export, so it is outside the initial query route bundle.

## CI, updates, and deployment

`CI` runs for every push and pull request with read-only permissions. It checks the submodule checkout, frozen install, generated data, formatting, lint, types, unit tests, production bundle, bundle budgets, and Playwright tests. Failed browser tests retain their trace, screenshot, video, and HTML report.

The scheduled **Update language data** workflow can also be run manually. It updates the submodule, regenerates and formats only the quiz map, runs the complete validation sequence, then opens a PR rather than committing to the default branch. Its PR body records the submodule revision, Minecraft version, changed language files, key delta, quiz-map delta, and validation status.

Vercel serves the Vite SPA via `vercel.json`; application routes such as `/table`, `/table/color`, `/quiz`, and `/quiz/:code` are safe to open directly or refresh. Static assets remain emitted from Vite's `public/` and built asset paths. No service worker is installed because offline behavior is not implemented or tested.

## Accessibility and contribution checks

Playwright runs axe checks on core routes and verifies responsive page overflow. Before a release, also manually check complete keyboard navigation, focus return from language popovers, visible focus, screen-reader labels and live messages, reduced-motion behavior, and colour-independent quiz states.

Keep generated changes focused. Do not commit a language-data update or snapshot change until it has been reviewed with the commands above. Pull requests should include tests for behavioural changes and must not weaken TypeScript, lint, or validation rules simply to make CI pass.

## License

Copyright 2025 SkyEye_FAST. Licensed under the [Apache License 2.0](LICENSE).
