import { expect, test } from '@playwright/test'

import {
  answerForQuizKey,
  deterministicQuizCode,
  expectNoPageOverflow,
  expectNoSeriousA11yViolations,
  resetBrowserState,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page)
})

test('query persists valid preferences and recovers from malformed storage', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('verdigloss:query:selectedLanguages:v1', '{invalid'),
  )
  await page.goto('/')
  await expect(page.getByRole('main')).toContainText('Translation')
  await page.locator('#queryContent').fill('The End')
  await page.locator('#localeKey').focus()
  await expect(page.locator('#query-key-results [role="option"]').first()).toBeVisible()
  await page.locator('#query-key-results [role="option"]').first().click()
  await expect(page.locator('.subtitle')).toContainText('.')
  await page.locator('#queryMode').selectOption('key')
  await page.locator('#queryContent').fill('advancements.end')
  await page.locator('#localeKey').focus()
  await expect(page.locator('#query-key-results [role="option"]').first()).toBeVisible()
  await page.locator('#localeKey').press('Escape')
  await page.getByRole('button', { name: /Selected languages/i }).click()
  await page.getByRole('button', { name: 'Clear' }).click()
  await page.getByRole('button', { name: /Selected languages/i }).press('Escape')
  await page.reload()
  await expect(page.locator('#queryMode')).toHaveValue('key')
  await expectNoPageOverflow(page)
  await expectNoSeriousA11yViolations(page)
})

test('translation table supports direct routes, filtering, pagination, and exports', async ({
  page,
}) => {
  await page.goto('/table')
  await expect(page.getByRole('heading', { name: /translation table/i })).toBeVisible()
  const search = page.getByRole('searchbox')
  await page.getByLabel('Next page').last().click()
  await search.fill('advancements.end')
  await expect(page.locator('tbody tr').first()).toBeVisible()
  await page.getByRole('button', { name: /Displayed languages/i }).click()
  await page.getByRole('button', { name: 'Clear' }).click()
  await page.locator('input[type="checkbox"][value="en_us"]').check()
  await page.getByRole('button', { name: /Displayed languages/i }).press('Escape')
  await page.locator('summary').filter({ hasText: 'Export' }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'TSV' }).click()
  await expect((await download).suggestedFilename()).toMatch(/\.tsv$/)
  await search.fill('this-key-does-not-exist')
  await expect(page.getByText('No translation keys match the current filters.')).toBeVisible()
  await expectNoPageOverflow(page)
  await expectNoSeriousA11yViolations(page)
})

test('quiz portal and deterministic active quiz handle invalid and completed routes', async ({
  page,
}) => {
  await page.goto('/quiz')
  await expect(page.getByRole('heading', { name: /translation quiz/i })).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  await page.locator('#timer-mode').check()
  await page.locator('#quiz-code').fill('invalid-code')
  await page.getByRole('button', { name: 'Enter' }).click()
  await expect(page.getByRole('alert')).toContainText('supported quiz code')
  await page.locator('#quiz-code').fill(deterministicQuizCode)
  await page.getByRole('button', { name: 'Enter' }).click()
  await expect(page).toHaveURL(/\/quiz\/v1\./)
  await expect(page.locator('.quiz-input')).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  const keyLocator = page.locator('.quiz-info .key').first()
  await expect(keyLocator).not.toBeEmpty()
  const questionKey = (await keyLocator.textContent())?.trim()
  expect(questionKey).toBeTruthy()
  await page.locator('.quiz-input').fill(answerForQuizKey(questionKey!))
  await expect(page.locator('.quiz-progress')).toHaveText('2 / 10')
  for (let index = 2; index <= 10; index += 1) {
    while (await page.getByRole('button', { name: 'Hint' }).isVisible()) {
      await page.getByRole('button', { name: 'Hint' }).click()
    }
    await page.getByRole('button', { name: 'Skip' }).click()
    if (index < 10) await expect(page.locator('.quiz-progress')).toHaveText(`${index + 1} / 10`)
  }
  await expect(page.getByText(/All questions completed/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Copy quiz code/i })).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  await expectNoPageOverflow(page)
  await page.getByRole('button', { name: /One more group/i }).click()
  await expect(page).toHaveURL(/l=zh_cn&t=1/)
  await page.goBack()
  await page.goForward()
  await expect(page.locator('.quiz-input, .quiz-summary')).toBeVisible()
  await expectNoPageOverflow(page)
})

test('color route, shell navigation, dark mode, and SPA fallbacks work', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/table/color')
  await expect(page.getByRole('heading', { name: /colou?r translation table/i })).toBeVisible()
  await page.getByLabel(/Korean Mixed/i).uncheck()
  await page.getByLabel(/Chữ Nôm/i).uncheck()
  await expect(page.getByRole('img', { name: /Colour value/i }).first()).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  await page.getByRole('link', { name: 'Quiz' }).first().click()
  await expect(page).toHaveURL(/\/quiz$/)
  await page.getByRole('button', { name: /Use dark theme/i }).click()
  await expect(page.locator('body')).toHaveClass(/dark-mode/)
  await page.getByRole('button', { name: /Use light theme/i }).click()
  await page.getByRole('button', { name: /Follow system theme/i }).click()
  await expect(page.getByRole('button', { name: /Follow system theme/i })).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('darkMode')))
    .toBe('"system"')
  await page.reload()
  await expect(page.locator('body')).toHaveClass(/dark-mode/)
  await page.goto('/not-a-route')
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await expectNoPageOverflow(page)
})
