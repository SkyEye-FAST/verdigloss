import { expect, test } from '@playwright/test'

import { deterministicQuizCode, resetBrowserState } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page)
})

test('keeps the query sidebar and popover usable with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const toggle = page.locator('.toggle-button')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#query-settings')).toHaveCount(0)
  await toggle.click()
  await expect(page.locator('#query-settings')).toBeVisible()

  const selector = page.locator('.language-selector').first()
  const trigger = selector.locator('.language-selector__trigger')
  await trigger.click()
  await expect(selector.locator('.language-selector__popover')).toBeVisible()
  await trigger.click()
  await expect(selector.locator('.language-selector__popover')).toHaveCount(0)

  await page.getByRole('link', { name: /table/i }).first().click()
  await expect(page.locator('.translation-table tbody tr').first()).toBeVisible()
})

test('dismisses dropdown menus when focus moves away', async ({ page }) => {
  await page.goto('/table')

  const exportMenu = page.locator('.export-menu')
  await exportMenu.locator('summary').click()
  await expect(exportMenu).toHaveAttribute('open', '')
  await page.locator('.table-header__title').click()
  await expect(exportMenu).not.toHaveAttribute('open', '')

  await exportMenu.locator('summary').click()
  await exportMenu.locator('summary').press('Escape')
  await expect(exportMenu).not.toHaveAttribute('open', '')

  await page.goto('/')
  const keyInput = page.locator('#localeKey')
  await keyInput.click()
  await expect(page.locator('.query-key-results')).toBeVisible()
  await page.locator('#queryContent').click()
  await expect(page.locator('.query-key-results')).toHaveCount(0)
})

test('advances a question without replacing the answer input and uses transform timer progress', async ({
  page,
}) => {
  await page.goto(`/quiz/${deterministicQuizCode}?l=zh_cn&t=1`)
  const input = page.locator('.quiz-input')
  await expect(input).toBeVisible()
  await expect(page.locator('.progress-fill')).toHaveAttribute('style', /scaleX\(/)

  while (await page.locator('.quiz-hint-btn').isVisible()) {
    await page.locator('.quiz-hint-btn').click()
  }
  await page.locator('.quiz-skip-btn').click()
  await expect(page.locator('.quiz-progress')).toHaveText('2 / 10')
  await expect(input).toBeFocused()
})
