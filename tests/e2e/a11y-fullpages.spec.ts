import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = [
  { path: '/de/ausstattung', rules: ['nested-interactive'] },
  { path: '/de/hier', rules: ['definition-list', 'dlitem'] },
  { path: '/de/happenings', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
  { path: '/en/happenings', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
  { path: '/de/hier/events', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
  { path: '/en/here/events', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
  { path: '/de/hier/art', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
  { path: '/en/here/art', rules: ['nested-interactive', 'definition-list', 'dlitem'] },
] as const

for (const pageSpec of pages) {
  test(`axe ${pageSpec.rules.join('+')} on ${pageSpec.path}`, async ({ page }) => {
    await page.goto(pageSpec.path)
    await page.waitForLoadState('domcontentloaded')
    const results = await new AxeBuilder({ page }).include('body').analyze()
    const hits = results.violations.filter((v) => (pageSpec.rules as readonly string[]).includes(v.id))
    if (hits.length > 0) {
      console.log(pageSpec.path, JSON.stringify(hits.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })), null, 2))
    }
    expect(hits, hits.map((v) => v.id).join(', ')).toEqual([])
  })
}
