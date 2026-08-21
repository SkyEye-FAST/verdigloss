import { expect, test } from '@playwright/test'

import { expectNoA11yViolations, expectNoPageOverflow, resetBrowserState } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page)
})

test('supports skip navigation and restores focus after route changes', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  await page.goto('/')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()
  await skipLink.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()

  await page.getByRole('link', { name: 'Table' }).first().click()
  await expect(page).toHaveURL(/\/table$/)
  await expect(page.getByRole('main')).toBeFocused()

  for (const path of ['/', '/table', '/table/color', '/quiz', '/not-a-route']) {
    await page.goto(path)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('#main-content h1')).toHaveCount(1)
    await expectNoA11yViolations(page)
  }
})

test('uses native query selection and restores focus for custom popovers', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  await page.goto('/')
  await expect(page.locator('.result-count')).toContainText('matching translation key')

  const keySelect = page.locator('#localeKey')
  await expect(keySelect).toHaveJSProperty('tagName', 'SELECT')
  await expect.poll(() => keySelect.locator('option').count()).toBeGreaterThan(1)
  await keySelect.focus()
  await keySelect.selectOption({ index: 1 })
  await expect(keySelect).toBeFocused()
  await expect(page.locator('.subtitle')).toContainText('.')
  await expectNoA11yViolations(page)

  const languageTrigger = page.getByRole('button', {
    name: /Selected languages/i,
  })
  await languageTrigger.focus()
  await languageTrigger.press('Enter')
  await expect(languageTrigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Select all' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(languageTrigger).toBeFocused()
  await expect(languageTrigger).toHaveAttribute('aria-expanded', 'false')
})

test('reflows every primary route at a 320px CSS viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.setViewportSize({ width: 320, height: 800 })

  for (const path of ['/', '/table', '/table/color', '/quiz']) {
    await page.goto(path)
    await expectNoPageOverflow(page)
    await expectNoA11yViolations(page)
  }

  await page.goto('/table')
  const translationCard = page.getByTestId('translation-row').first()
  await expect(translationCard.getByRole('heading')).toBeVisible()
  await expect(translationCard.locator('dl')).toBeVisible()
  await expect(page.locator('.translation-table table')).toHaveCount(0)

  await page.goto('/table/color')
  const colorCard = page.locator('.color-card-list article').first()
  await expect(colorCard.getByRole('heading')).toBeVisible()
  await expect(colorCard.locator('dl')).toBeVisible()
  await expect(page.locator('.page-content table')).toHaveCount(0)
})
