import { expect, test } from '@playwright/test'

import { resetBrowserState } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page)
})

test('query loading keeps spreadsheet and unused language chunks lazy', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main')).toContainText('Translation')
  const resources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  const languageResources = resources.filter((name) =>
    /assets\/(?:[a-z]{2,3}_[a-z]{2}|lzh)-/.test(name),
  )
  expect(resources.some((name) => /xlsx/i.test(name))).toBe(false)
  expect(languageResources.length).toBeLessThan(17)

  await page.goto('/table')
  await expect(page.getByRole('heading', { name: /translation table/i })).toBeVisible()
  const tableResources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  expect(tableResources.some((name) => /TranslationTable-/.test(name))).toBe(true)
})
