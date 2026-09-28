/**
 * Direction C verification — screenshots + band/quote audits + Mapbox network check.
 * Run: npx playwright test --config=playwright.config.ts scripts/verify-direction-c.mts
 * Or: npx tsx scripts/verify-direction-c.mts
 */
import { chromium, type Browser, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const OUT = path.resolve('doc/verify/direction-c')
const WIDTHS = [1440, 1024, 390] as const
const GOTO = { waitUntil: 'load' as const, timeout: 180_000 }

function placeUrl(slug: string) {
  return `${BASE}/de/nachbarschaft/${slug}`
}
function personUrl(slug: string) {
  return `${BASE}/de/you-me-and-berlin/${slug}`
}

async function shot(page: Page, name: string, width: number) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
  await page.waitForTimeout(400)
  const dir = path.join(OUT, String(width))
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function shots(page: Page, name: string) {
  const files: string[] = []
  for (const w of WIDTHS) files.push(await shot(page, name, w))
  return files
}

type NetHit = { url: string }

async function withMapboxWatch(page: Page, run: () => Promise<void>) {
  const hits: NetHit[] = []
  const onReq = (req: { url: () => string }) => {
    const u = req.url()
    if (/mapbox\.com/i.test(u)) hits.push({ url: u })
  }
  page.on('request', onReq)
  try {
    await run()
  } finally {
    page.off('request', onReq)
  }
  return hits
}

async function placeBand(page: Page, slug: string) {
  await page.goto(placeUrl(slug), GOTO)
  await page.waitForTimeout(800)
  const bands = page.locator('h2#related')
  const count = await bands.count()
  const heading = count > 0 ? (await bands.first().innerText()).trim() : null
  const stripCells = await page.locator('.place-c-strip__cell').count()
  const bandSections = await page.locator('section[aria-labelledby="related"]').count()
  return { slug, heading, stripCells, bandCount: bandSections || (count > 0 ? 1 : 0) }
}

async function personQuote(page: Page, slug: string) {
  await page.goto(personUrl(slug), GOTO)
  await page.waitForTimeout(800)
  const quote = page.locator('.person-c-hero__quote')
  const hasQuote = (await quote.count()) > 0
  const onPlace = page.locator('.person-c-hero__on-place')
  const borrowed = (await onPlace.count()) > 0
  const ring = (await page.locator('.person-c-hero__ring').count()) > 0
  const also = (await page.locator('.person-c-also__row').count()) > 0
  const walkStops = await page
    .locator('.person-c-walk__stop:not(.person-c-walk__stop--hotel)')
    .count()
  return {
    slug,
    hasQuote,
    source: !hasQuote ? 'none' : borrowed ? 'borrowed' : 'own',
    ring,
    also,
    walkStops,
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  const report: Record<string, unknown> = { base: BASE, shots: {}, bands: [], people: [], mapbox: {} }

  // — Screenshots —
  const shotJobs: Array<[string, string]> = [
    ['place-normal', placeUrl('bayerischer-platz')],
    ['place-olympiastadion', placeUrl('olympiastadion')],
    ['person-katja', personUrl('katja-morkel')],
    ['person-kristiane', personUrl('kristiane-kegelmann')],
    ['person-one-pick', personUrl('jennifer-oeser')],
  ]

  for (const [name, pathUrl] of shotJobs) {
    await page.goto(pathUrl, GOTO)
    await page.waitForTimeout(600)
    ;(report.shots as Record<string, string[]>)[name] = await shots(page, name)
  }

  // Fixture screenshots — only when those slugs still exist (dev-DB fixtures, not seed).
  const fixtureSlugs = [
    'fixture-multi',
    'fixture-no-endorser',
    'fixture-no-quote',
    'fixture-no-geo',
  ] as const
  for (const slug of fixtureSlugs) {
    const res = await page.goto(placeUrl(slug), GOTO)
    if (res && res.status() < 400) {
      ;(report.shots as Record<string, string[]>)[slug] = await shots(page, slug)
    }
  }

  // Band heading variants — pick pages by inspecting all 10
  const placeSlugs = [
    'anjoy',
    'bayerischer-platz',
    'einar-und-bert-bookshop',
    'einsunternull',
    'holocaust-memorial',
    'kaethe-kollwitz-museum',
    'koenig-galerie',
    'lokal',
    'nobelhart-und-schmutzig',
    'olympiastadion',
  ]
  for (const slug of placeSlugs) {
    ;(report.bands as unknown[]).push(await placeBand(page, slug))
  }

  // Extra shots for distinct band heading types found
  const byHeading = new Map<string, string>()
  for (const b of report.bands as Array<{ slug: string; heading: string | null }>) {
    if (!b.heading) continue
    const key = b.heading.startsWith('Wo ')
      ? 'band-endorser'
      : b.heading.startsWith('Mehr in der')
        ? 'band-mixed'
        : b.heading.startsWith('Mehr in ')
          ? 'band-district'
          : 'band-other'
    if (!byHeading.has(key)) byHeading.set(key, b.slug)
  }
  for (const [name, slug] of byHeading) {
    await page.goto(placeUrl(slug), GOTO)
    await page.waitForTimeout(600)
    report.shots[name] = await shots(page, name)
  }

  // People quote audit
  const people = [
    'christiane-fritsch-weith',
    'gita-kurdpoor',
    'iris-berndt',
    'jennifer-oeser',
    'katja-morkel',
    'kristiane-kegelmann',
  ]
  for (const slug of people) {
    report.people.push(await personQuote(page, slug))
  }

  // Mapbox network — with token (current .env)
  report.mapbox.withToken = {
    place: await withMapboxWatch(page, async () => {
      await page.goto(placeUrl('bayerischer-platz'), GOTO)
      await page.waitForTimeout(2000)
    }),
    person: await withMapboxWatch(page, async () => {
      await page.goto(personUrl('katja-morkel'), GOTO)
      await page.waitForTimeout(2000)
    }),
  }

  await browser.close()
  const outFile = path.join(OUT, 'report.json')
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.log('Wrote', outFile)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
