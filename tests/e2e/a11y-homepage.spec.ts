import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const locales = ['en', 'de'] as const

for (const locale of locales) {
  test.describe(`homepage a11y — /${locale}`, () => {
    test(`axe WCAG 2.x AA scan on /${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      if (results.violations.length > 0) {
        console.log(
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.map((n) => ({
                html: n.html,
                target: n.target,
                failureSummary: n.failureSummary,
              })),
            })),
            null,
            2,
          ),
        )
      }

      expect(results.violations).toEqual([])
    })

    test(`document structure on /${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`)

      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('.skip-link')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('main#main-content')).toHaveCount(1)
      await expect(page.locator('header')).toHaveCount(1)
      await expect(page.locator('footer')).toHaveCount(1)
    })
  })
}
