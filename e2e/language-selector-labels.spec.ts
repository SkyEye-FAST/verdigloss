import { expect, test } from '@playwright/test'
import { resetBrowserState } from './helpers'

for (const route of ['/', '/table']) {
  test(`language selection supports label text, codes, and keyboard on ${route}`, async ({
    page,
  }) => {
    await resetBrowserState(page)
    await page.goto(route)
    const selector = page.locator('.language-selector')
    await selector.locator('.language-selector__trigger').click()
    const checkbox = selector.getByRole('checkbox', { name: /Deutsch/ })
    const row = selector.locator('label').filter({ hasText: 'Deutsch' })
    await expect(checkbox).not.toBeChecked()
    await row.locator('span').click()
    await expect(checkbox).toBeChecked()
    await row.locator('span').click()
    await expect(checkbox).not.toBeChecked()
    await row.locator('code').click()
    await expect(checkbox).toBeChecked()
    await checkbox.focus()
    await checkbox.press('Space')
    await expect(checkbox).not.toBeChecked()
    await checkbox.click()
    await expect(checkbox).toBeChecked()
    await expect(selector.locator('.language-selector__popover')).toBeVisible()
    await page.locator('#main-content').focus()
    await expect(selector.locator('.language-selector__popover')).not.toBeVisible()
    await selector.locator('.language-selector__trigger').click()
    await page.locator('#main-content').click({ position: { x: 1, y: 1 } })
    await expect(selector.locator('.language-selector__popover')).not.toBeVisible()
  })
}
