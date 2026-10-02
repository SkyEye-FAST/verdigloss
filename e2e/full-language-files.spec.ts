import fs from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { expectNoA11yViolations, expectNoPageOverflow, resetBrowserState } from './helpers'

test('switches query and table data together, persists the choice, and exports full entries', async ({
  page,
}) => {
  await resetBrowserState(page)
  await page.goto('/')
  const option = page.getByRole('checkbox', { name: 'Use full language files' })
  await expect(option).not.toBeChecked()
  await page.locator('#queryMode').selectOption('key')
  await page.locator('#queryContent').fill('gui.done')
  await expect(page.getByRole('alert')).toBeVisible()
  await option.check()
  await expect(page.locator('.result-section .subtitle')).toHaveText('gui.done')
  await expect(page.locator('#query-result-title')).toHaveText('Done')
  await expectNoPageOverflow(page)
  await expectNoA11yViolations(page)

  await page.getByRole('link', { name: 'Table', exact: true }).click()
  await expect(option).toBeChecked()
  await page.getByRole('searchbox').fill('gui.done')
  await expect(page.getByTestId('translation-row')).toHaveCount(1)
  await page.getByText('Export', { exact: true }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'JSON', exact: true }).click()
  const download = await downloaded
  const exported = await fs.readFile((await download.path())!, 'utf8')
  expect(exported).toContain('gui.done')
  expect(exported).toContain('Done')
  await expectNoPageOverflow(page)
  await expectNoA11yViolations(page)

  await page.reload()
  await expect(option).toBeChecked()
  await page.getByRole('searchbox').fill('gui.done')
  await expect(page.getByTestId('translation-row')).toHaveCount(1)
  await option.uncheck()
  await expect(page.getByTestId('translation-row')).toHaveCount(0)
  await page.goto('/')
  await expect(option).not.toBeChecked()
  await expect(page.locator('.result-section')).toHaveCount(0)
})
