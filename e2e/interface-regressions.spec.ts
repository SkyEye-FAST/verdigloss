import { expect, type Page, test } from '@playwright/test'

import { deterministicQuizCode, expectNoPageOverflow, resetBrowserState } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page)
})

async function capture(page: Page, path: string) {
  await page.screenshot({ path, fullPage: true })
}

test('captures every repaired surface without layout regressions', async ({ page }, testInfo) => {
  const screenshot = (name: string) => testInfo.outputPath(`${name}.png`)

  await page.goto('/')
  await expect(page.locator('.result-section')).toBeVisible()
  await expect(page.locator('.lang-name').first()).toHaveText('简体中文（中国大陆）')
  await expect(page.locator('.result-section')).not.toContainText('Simplified Chinese')
  await expectNoPageOverflow(page)
  await capture(page, screenshot('query'))

  await page.goto('/table')
  await expect(page.locator('tbody tr').first()).toBeVisible()
  const wrapper = page.locator('.table-wrapper')
  const header = page.locator('thead th').first()
  const firstRowCell = page.locator('tbody tr').first().locator('.key-column')
  const [headerBox, firstRowBox] = await Promise.all([
    header.boundingBox(),
    firstRowCell.boundingBox(),
  ])
  expect(headerBox).not.toBeNull()
  expect(firstRowBox).not.toBeNull()
  expect(firstRowBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1)
  await wrapper.evaluate((element) => {
    element.scrollLeft = Math.min(500, element.scrollWidth - element.clientWidth)
  })
  const stickyStyle = await firstRowCell.evaluate((element) => {
    const style = getComputedStyle(element)
    return { backgroundColor: style.backgroundColor, zIndex: style.zIndex }
  })
  expect(stickyStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(stickyStyle.backgroundColor).not.toBe('transparent')
  expect(Number(stickyStyle.zIndex)).toBeGreaterThan(0)
  await wrapper.evaluate((element) => {
    element.scrollLeft = 0
  })
  await expectNoPageOverflow(page)
  await capture(page, screenshot('table'))

  await page.goto('/quiz')
  await expect(page.locator('.quiz-eligibility')).not.toContainText('10/10')
  await expect(page.locator('.quiz-eligibility--available')).toBeVisible()
  await expect(page.locator('.quiz-btn-primary')).toBeEnabled()
  await expect(page.locator('#query-lang option:checked')).not.toContainText('(10/10)')
  await expectNoPageOverflow(page)
  await capture(page, screenshot('quiz-portal'))

  await page.goto(`/quiz/${deterministicQuizCode}?l=zh_cn&t=0`)
  await expect(page.locator('.quiz-input')).toBeVisible()
  await expectNoPageOverflow(page)
  await capture(page, screenshot('active-quiz'))

  for (let question = 0; question < 10; question += 1) {
    while (await page.getByRole('button', { name: 'Hint' }).isVisible()) {
      await page.getByRole('button', { name: 'Hint' }).click()
    }
    if (await page.getByRole('button', { name: 'Skip' }).isVisible()) {
      await page.getByRole('button', { name: 'Skip' }).click()
    }
  }
  await expect(page.locator('.quiz-summary')).toBeVisible()
  await expect(page.locator('.status-cell').first()).toHaveText('Skipped')
  await expectNoPageOverflow(page)
  await capture(page, screenshot('quiz-summary'))

  await page.goto('/table/color')
  await expect(page.locator('.table-wrapper')).toBeVisible()
  await expectNoPageOverflow(page)
  await capture(page, screenshot('colours'))
})

test('Simplified Chinese interface contains no known hardcoded English controls', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-large')
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { configurable: true, get: () => 'zh-CN' })
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['zh-CN'],
    })
  })

  await page.goto('/table')
  await expect(page.getByRole('navigation', { name: '主导航' })).toContainText('查询')
  await expect(page.locator('.table-toolbar')).toContainText('导出')
  await expect(page.locator('.table-toolbar')).not.toContainText(
    /Displayed languages|Use pagination|Export|Current page|All filtered rows/,
  )
  await expect(page.getByRole('navigation', { name: '主导航' })).not.toContainText(
    /Query|Table|Quiz|Colours/,
  )

  await page.goto('/quiz')
  await expect(page.locator('.quiz-description')).toContainText('选择目标语言')
  await expect(page.locator('.quiz-description')).not.toContainText('Choose a target language')
  await expect(page.locator('#query-lang option:checked')).toHaveText('简体中文（中国大陆）')
})
