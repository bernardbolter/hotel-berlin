/**
 * Measure rendered card <img> CSS widths at 1440 viewport.
 * Run against a live server: npx tsx scripts/measure-card-widths.mts
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

async function imgWidth(page: import('@playwright/test').Page, selector: string) {
  const el = page.locator(selector).first()
  await el.waitFor({ state: 'visible', timeout: 60_000 })
  return el.evaluate((node) => (node as HTMLElement).getBoundingClientRect().width)
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`${BASE}/de/hier`, { waitUntil: 'load', timeout: 180_000 })
  await page.waitForTimeout(800)

  const spotlight = await imgWidth(page, '.spotlight-card__media img')
  const amenity = await imgWidth(page, '.amenity-card__media img')
  const placeStrip = await imgWidth(page, '.tip-card__media img')

  await page.goto(`${BASE}/de/you-me-and-berlin/iris-berndt`, {
    waitUntil: 'load',
    timeout: 180_000,
  })
  await page.waitForTimeout(800)
  const borrowed = await imgWidth(
    page,
    'section:has(#similar) ul.grid img, #similar ~ ul img',
  )

  const result = {
    spotlight,
    amenity,
    placeStrip,
    borrowed,
    max: Math.max(spotlight, amenity, placeStrip, borrowed),
    card: Math.max(spotlight, amenity, placeStrip, borrowed) * 2,
  }
  console.log(JSON.stringify(result, null, 2))
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
