import fs from 'node:fs'
import path from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const root = path.resolve(import.meta.dirname, '..')
const quizMap = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/data/quiz-id-map.json'), 'utf8'),
) as { ids: Record<string, string> }
const english = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/mc_lang/valid/en_us.json'), 'utf8'),
) as Record<string, string>
const chinese = JSON.parse(
  fs.readFileSync(path.join(root, 'src/assets/mc_lang/valid/zh_cn.json'), 'utf8'),
) as Record<string, string>

const eligible = Object.entries(quizMap.ids)
  .filter(([, key]) => chinese[key] && chinese[key] !== english[key])
  .slice(0, 10)

export const deterministicQuizCode = `v1.${eligible.map(([id]) => id).join('.')}`
export function answerForQuizKey(key: string) {
  return chinese[key]
}

export async function resetBrowserState(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('__verdigloss_e2e_reset__')) return
    localStorage.clear()
    sessionStorage.setItem('__verdigloss_e2e_reset__', 'true')
  })
}

export async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(
    dimensions.scrollWidth,
    `page overflow: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`,
  ).toBeLessThanOrEqual(dimensions.clientWidth)
}

export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .options({ rules: { 'target-size': { enabled: true } } })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  const violations = results.violations
  expect(
    violations,
    violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes
            .map((node) => `  ${node.target.join(' > ')}\n  ${node.failureSummary ?? ''}`)
            .join('\n')}`,
      )
      .join('\n\n'),
  ).toEqual([])
}
