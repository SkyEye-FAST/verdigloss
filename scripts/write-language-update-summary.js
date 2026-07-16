import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const output = path.resolve(process.argv[2] ?? 'language-update-pr.md')
const run = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const currentEnglish = JSON.parse(await fs.readFile('src/assets/mc_lang/valid/en_us.json', 'utf8'))
const priorEnglish = JSON.parse(run('show', 'HEAD:src/assets/mc_lang/valid/en_us.json'))
const currentVersion = (await fs.readFile('src/assets/mc_lang/version.txt', 'utf8')).trim()
const priorVersion = run('show', 'HEAD:src/assets/mc_lang/version.txt').trim()
const changedLanguageFiles = run('diff', '--name-only', '--', 'src/assets/mc_lang/valid')
  .split('\n')
  .filter(Boolean).length
const submoduleChange =
  run('diff', '--submodule=short', '--', 'src/assets/mc_lang') || 'No submodule revision change'
const mappingChange =
  run('diff', '--numstat', '--', 'src/assets/data/quiz-id-map.json') || 'No quiz-mapping change'
const priorKeys = new Set(Object.keys(priorEnglish))
const currentKeys = new Set(Object.keys(currentEnglish))
const added = [...currentKeys].filter((key) => !priorKeys.has(key)).length
const removed = [...priorKeys].filter((key) => !currentKeys.has(key)).length

await fs.writeFile(
  output,
  `## Automated language-data update

- Submodule revision: \`${submoduleChange}\`
- Minecraft version: \`${priorVersion}\` → \`${currentVersion}\`
- Translation keys: ${added} added, ${removed} removed
- Changed language files: ${changedLanguageFiles}
- Quiz mapping: \`${mappingChange}\`
- Validation: generated-data validation, formatting, lint, type check, unit tests, production build, bundle budget, and end-to-end tests passed before this PR was created.

This workflow never commits directly to the default branch. Review this PR before merge.
`,
  'utf8',
)
