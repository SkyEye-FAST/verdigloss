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
  await expect(page.locator('.lang-name').first()).toHaveText('简体中文 (中国大陆)')
  await expect(page.locator('.result-section')).not.toContainText('Simplified Chinese')
  await expect(page.locator('.minecraft-title')).toHaveCSS('font-weight', '900')
  expect(
    await page
      .locator('.lang-name')
      .first()
      .evaluate((element) => {
        return Number.parseFloat(getComputedStyle(element).fontSize)
      }),
  ).toBeGreaterThanOrEqual(16)
  await expect(page.locator('.main-content > .result-count')).toHaveCount(0)
  await expect(page.locator('.input-group .result-count')).toBeVisible()
  await expectNoPageOverflow(page)
  await capture(page, screenshot('query'))

  await page.goto('/table')
  await expect(page.getByTestId('translation-row').first()).toBeVisible()
  const compactTable = (await page.viewportSize())!.width <= 800
  if (compactTable) {
    await expect(page.getByTestId('translation-card-list')).toBeVisible()
    await expect(page.locator('.translation-table .table-wrapper')).toHaveCount(0)
    await expect(page.getByTestId('translation-row')).toHaveCount(10)
    await expect(page.getByTestId('translation-row').first().getByRole('heading')).toBeVisible()
  } else {
    const wrapper = page.locator('.translation-table .table-wrapper')
    await expect(wrapper).toHaveAttribute('aria-label', 'Minecraft translations')
    await expect(page.locator('.table-horizontal-scrollbar')).toHaveCount(0)
    const headerCells = page.locator('.translation-table thead th')
    const firstRowCells = page.getByTestId('translation-row').first().locator('> *')
    const headerBoxes = await headerCells.evaluateAll((cells) =>
      cells.map((cell) => {
        const box = cell.getBoundingClientRect()
        return { left: box.left, top: box.top, width: box.width, height: box.height }
      }),
    )
    const rowBoxes = await firstRowCells.evaluateAll((cells) =>
      cells.map((cell) => {
        const box = cell.getBoundingClientRect()
        return { left: box.left, top: box.top, width: box.width }
      }),
    )
    expect(rowBoxes).toHaveLength(headerBoxes.length)
    for (const [index, headerBox] of headerBoxes.entries()) {
      expect(Math.abs(headerBox.left - rowBoxes[index]!.left)).toBeLessThan(1)
      expect(Math.abs(headerBox.width - rowBoxes[index]!.width)).toBeLessThan(1)
    }
    const naturalTableOrder = await page.locator('.translation-table table').evaluate((table) => {
      const heading = table.tHead
      const firstRow = table.tBodies[0]?.rows[0]
      return {
        headingBottom: (heading?.offsetTop ?? 0) + (heading?.offsetHeight ?? 0),
        firstRowTop: firstRow?.offsetTop ?? -1,
      }
    })
    expect(naturalTableOrder.firstRowTop).toBeGreaterThanOrEqual(
      naturalTableOrder.headingBottom - 1,
    )

    const firstColumnStyle = await firstRowCells.first().evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        position: style.position,
        zIndex: style.zIndex,
      }
    })
    expect(firstColumnStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(firstColumnStyle.backgroundColor).not.toBe('transparent')
    expect(firstColumnStyle.position).toBe('sticky')
    expect(Number(firstColumnStyle.zIndex)).toBeGreaterThan(0)

    await wrapper.evaluate((element) => {
      element.scrollLeft = Math.min(500, element.scrollWidth - element.clientWidth)
    })
    const scrolledHeaderBoxes = await headerCells.evaluateAll((cells) =>
      cells.map((cell) => {
        const box = cell.getBoundingClientRect()
        return { left: box.left, width: box.width }
      }),
    )
    const scrolledRowBoxes = await firstRowCells.evaluateAll((cells) =>
      cells.map((cell) => {
        const box = cell.getBoundingClientRect()
        return { left: box.left, width: box.width }
      }),
    )
    for (const [index, headerBox] of scrolledHeaderBoxes.entries()) {
      expect(Math.abs(headerBox.left - scrolledRowBoxes[index]!.left)).toBeLessThan(1)
      expect(Math.abs(headerBox.width - scrolledRowBoxes[index]!.width)).toBeLessThan(1)
    }
    await wrapper.evaluate((element) => {
      element.scrollLeft = 0
    })
  }
  await expectNoPageOverflow(page)
  await capture(page, screenshot('table'))

  await page.goto('/quiz')
  await expect(page.locator('.quiz-eligibility')).not.toContainText('10/10')
  await expect(page.locator('.quiz-eligibility--available')).toBeVisible()
  await expect(page.locator('.quiz-btn-primary')).toBeEnabled()
  await expect(page.locator('#query-lang')).not.toContainText('(10/10)')
  await expectNoPageOverflow(page)
  await capture(page, screenshot('quiz-portal'))

  await page.goto(`/quiz/${deterministicQuizCode}?l=zh_cn&t=0`)
  await expect(page.locator('.quiz-input')).toBeVisible()
  await expect(page.locator('.quiz-progress')).toHaveText('1 / 10')
  await expect(page.locator('.timer')).toHaveCount(0)
  await expect(page.locator('.progress-bar')).toHaveCount(0)
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
  const statusBox = await page.locator('.status-cell').first().boundingBox()
  expect(statusBox).not.toBeNull()
  expect(statusBox!.x + statusBox!.width).toBeLessThanOrEqual((await page.viewportSize())!.width)
  await expectNoPageOverflow(page)
  await capture(page, screenshot('quiz-summary'))

  await page.goto('/table/color')
  if ((await page.viewportSize())!.width <= 800) {
    await expect(page.locator('.color-card-list')).toBeVisible()
    await expect(page.locator('.page-content .table-wrapper')).toHaveCount(0)
  } else {
    await expect(page.locator('.page-content .table-wrapper')).toBeVisible()
  }
  await expect(page.locator('.table-section-nav')).toBeVisible()
  await expect(page.locator('.primary-nav')).toContainText(/Query.*Table.*Quiz/)
  await expect(page.locator('.primary-nav')).not.toContainText(/Colours|颜色|顏色/)
  await expect(page.locator('.primary-nav a[href="/table"]')).toHaveClass(/is-active/)
  await expectNoPageOverflow(page)
  await capture(page, screenshot('colours'))
})

test('summarizes multi-language selections with technical codes', async ({ page }) => {
  await page.goto('/table')
  const selector = page.locator('.table-toolbar .language-selector')
  const trigger = selector.locator('.language-selector__trigger')
  await trigger.click()
  await selector.getByRole('button', { name: 'Clear' }).click()
  await selector.locator('input[value="en_us"]').check()
  await selector.locator('input[value="zh_cn"]').check()
  await trigger.click()
  await expect(selector.locator('.language-selector__summary')).toContainText('en_us')
  await expect(selector.locator('.language-selector__summary')).toContainText('zh_cn')
})

test('uses serif by default and switches each language to its matching sans-serif stack', async ({
  page,
}) => {
  await page.goto('/')
  const chineseLanguage = page.locator('.lang-name').first()

  await expect(page.locator('body')).not.toHaveClass(/translation-font-sans/)
  await expect(chineseLanguage).toHaveCSS('font-family', /Noto Serif SC/)

  await page.getByRole('button', { name: 'Use sans-serif translation font' }).click()

  await expect(page.locator('body')).toHaveClass(/translation-font-sans/)
  await expect(chineseLanguage).toHaveCSS('font-family', /Noto Sans SC/)
})

test('keeps quiz progress concise and shows time only for timed quizzes', async ({ page }) => {
  await page.goto(`/quiz/${deterministicQuizCode}?l=zh_cn&t=1`)
  await expect(page.locator('.quiz-input')).toBeVisible()
  await expect(page.locator('.quiz-progress')).toHaveText('1 / 10')
  await expect(page.locator('.timer')).toHaveText(/^3:[0-5]\d$/)
  await expect(page.locator('.progress-bar')).toBeVisible()
})

test('keeps the query toggle persistent and the mobile navigation evenly divided', async ({
  page,
}) => {
  await page.goto('/')
  const toggle = page.locator('.toggle-button')
  const icon = toggle.locator('.toggle-button__icon')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(icon).toHaveCount(1)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toHaveClass(/is-collapsed/)
  await expect(icon).toHaveCount(1)
  await expect(page.locator('#query-settings')).toHaveCount(0)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#query-settings')).toBeVisible()

  const mobileNav = page.locator('.mobile-nav')
  await expect(mobileNav.locator('a')).toHaveCount(3)
  if ((await page.viewportSize())!.width <= 800) {
    expect(
      (await mobileNav.evaluate((element) => getComputedStyle(element).gridTemplateColumns))
        .trim()
        .split(/\s+/),
    ).toHaveLength(3)
  }
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
  await expect(page.locator('#query-lang')).toHaveValue('zh_cn')
  await expect(page.locator('#query-lang option:checked')).toHaveText('简体中文 (中国大陆)')
})
