<div align="center">
<img src="https://raw.githubusercontent.com/SkyEye-FAST/verdigloss/master/src/assets/images/icon.png" width="128" alt="Verdigloss icon">

---

# Verdigloss

![GitHub License](https://img.shields.io/github/license/SkyEye-FAST/verdigloss)
[![GitHub stars](https://img.shields.io/github/stars/SkyEye-FAST/verdigloss)](https://github.com/SkyEye-FAST/verdigloss/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/SkyEye-FAST/verdigloss)](https://github.com/SkyEye-FAST/verdigloss/issues)
</div>

Verdigloss is a Vue 3 single-page application for searching, comparing, exporting, and practising the standard Minecraft Java Edition translations. It is the frontend successor to [minecraft_translation_flask](https://github.com/SkyEye-FAST/minecraft_translation_flask).

## Demonstration

You can use Verdigloss at the following links:

- <https://mcst.teahouse.team/>
- <https://verdigloss.vercel.app/>

## Features

- [x] Search by English source text, translation key, or a selected target language
- [x] Compare selected language columns, filter results, paginate, and export CSV, TSV, JSON, XML, or XLSX
- [x] Shareable, versioned quiz codes with legacy-code compatibility
- [x] Quiz hints, timer mode, summaries, and resilient browser preference storage
- [x] Colour translation reference with Korean mixed-script and Vietnamese Chữ Nôm variants
- [x] Responsive navigation, dark mode, semantic tables, keyboard-friendly controls, and automated accessibility checks
- [x] Scheduled language-data updates that open a reviewable pull request instead of committing to the default branch

## Development

Verdigloss supports Node.js 24 and uses pnpm 11.10.0 through Corepack. Git with submodule support is required for the Minecraft language data.

1. Clone this repository and its language-data submodule:

   ```shell
   git clone --recurse-submodules https://github.com/SkyEye-FAST/verdigloss.git
   ```

2. Enable Corepack and install dependencies:

   ```shell
   cd verdigloss
   corepack enable
   pnpm install --frozen-lockfile
   ```

3. Start the development server:

   ```shell
   pnpm dev
   ```

4. Open your browser and go to `http://localhost:5173/`.

If the repository was cloned without the data submodule, run:

```shell
git submodule update --init --recursive
```

The main commands are:

```shell
pnpm dev               # start Vite
pnpm format:check      # verify Prettier formatting without writing
pnpm lint              # run ESLint
pnpm type-check        # run Vue and TypeScript checks
pnpm test              # run the Vitest unit suite
pnpm build             # type-check and create a production build
pnpm bundle:check      # enforce production bundle and remote-font budgets
pnpm test:e2e          # run the Playwright end-to-end suite
pnpm generate-data     # regenerate the deterministic quiz ID mapping
pnpm validate-data     # validate language data and generated mappings
```

`pnpm format` and `pnpm lint:fix` modify files. The non-mutating `format:check`, `lint`, and `validate-data` commands are appropriate for CI.

Install Playwright's local Chromium browser once before the first end-to-end run:

```shell
pnpm exec playwright install chromium
```

### Architecture

- `src/app/` configures application bootstrap, route titles, router, and interface i18n.
- `src/components/` contains the query, table, quiz, colour reference, and shared shell.
- `src/domain/` contains quiz-code, scoring, matching, and timing logic.
- `src/features/` holds query indexes, table pagination, and colour data.
- `src/services/` lazily imports language JSON and manages browser exports.
- `scripts/` owns deterministic generated-data validation, language-update summaries, and bundle budgets.

Language JSON is loaded only when a page needs it. XLSX is dynamically imported only for an XLSX export, so it is outside the initial query-route bundle.

### Translation data and quiz codes

The `src/assets/mc_lang` submodule downloads Minecraft language assets and provides the `valid/` language files used by the application. `src/assets/data/quiz-id-map.json` maps every English translation key to a deterministic, collision-checked seven-character base-62 ID.

New links use `v1.<id>.<id>...`. They can be decoded without random state; legacy 30-character links continue to use the preserved legacy map where available. A quiz question is eligible only when its target-language value is non-empty and differs from English.

After updating language data, run:

```shell
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

### CI, updates, and deployment

`CI` runs for every push and pull request with read-only permissions. It checks the submodule checkout, frozen install, generated data, formatting, lint, types, unit tests, production bundle, bundle budgets, and Playwright tests. Failed browser tests retain their trace, screenshot, video, and HTML report.

The scheduled **Update language data** workflow can also be run manually. It updates the submodule, regenerates and formats only the quiz map, runs the complete validation sequence, then opens a pull request rather than committing to the default branch. Its PR body records the submodule revision, Minecraft version, changed language files, key delta, quiz-map delta, and validation status.

Vercel serves the Vite SPA via `vercel.json`; application routes such as `/table`, `/table/color`, `/quiz`, and `/quiz/:code` are safe to open directly or refresh. No service worker is installed because offline behavior is not implemented or tested.

### Accessibility and contribution checks

Playwright runs axe checks on core routes and verifies responsive page overflow. Before a release, also manually check complete keyboard navigation, focus return from language popovers, visible focus, screen-reader labels and live messages, reduced-motion behavior, and colour-independent quiz states.

Keep generated changes focused. Pull requests should include tests for behavioural changes and must not weaken TypeScript, lint, or validation rules simply to make CI pass.

## License

The project is released under the [Apache License 2.0](LICENSE).

```text
    Verdigloss
    Copyright (c) 2025-2026 SkyEye_FAST

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

## Feedback

Please feel free to raise issues for any problems encountered or feature suggestions.

Pull requests are welcome.
