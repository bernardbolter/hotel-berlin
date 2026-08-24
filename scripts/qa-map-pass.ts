/**
 * Pre-merge map QA — drives Chromium through HotelBerlin_MapSection_CursorPrompt_v3_QA.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx tsx scripts/qa-map-pass.ts
 *
 * Temporarily publishes a few seed people so /you-me-and-berlin has a listing map,
 * then restores their previous status. Screenshots land in qa-screenshots/.
 */
import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, devices, type Browser, type Locator, type Page } from 'playwright'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'qa-screenshots')
const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3001'

const PUBLISH_SLUGS = ['kristiane-kegelmann', 'maike', 'alessandra-botts'] as const
/** Walkable default-map pin (König Galerie / Schloss are further-out). */
const CATEGORY_PIN = 'Neue Nationalgalerie'

type Status = 'pass' | 'fail' | 'blocked'
type Check = {
  id: string
  title: string
  status: Status
  screenshot?: string
  notes: string
}

const checks: Check[] = []

function record(check: Check) {
  checks.push(check)
  const mark = check.status === 'pass' ? 'PASS' : check.status === 'fail' ? 'FAIL' : 'BLOCKED'
  console.log(`[${mark}] ${check.id} — ${check.title}`)
  if (check.notes) console.log(`         ${check.notes}`)
  if (check.screenshot) console.log(`         ${check.screenshot}`)
}

async function shot(page: Page, name: string, target?: Locator) {
  const file = `${name}.png`
  const path = join(OUT, file)
  if (target) {
    await target.screenshot({ path, animations: 'disabled' })
  } else {
    await page.screenshot({ path, fullPage: false, animations: 'disabled' })
  }
  return file
}

async function waitForMap(page: Page, timeout = 45_000) {
  await page.waitForSelector('.mapboxgl-canvas', { timeout })
  await page.waitForSelector('.hbb-map-pin-host button', { timeout })
  await page.waitForTimeout(800)
}

function pinHost(page: Page, ariaSubstring: string) {
  return page.locator('.hbb-map-pin-host').filter({
    has: page.locator(`button[aria-label*="${ariaSubstring}"]`),
  })
}

function visibleCard(page: Page) {
  return page.locator('article[aria-live="polite"]').filter({ visible: true })
}

async function revealPinLabel(host: Locator) {
  await host.evaluate((el) => {
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
  })
}

/** Mapbox canvas often sits over marker buttons in hit-testing; call the control directly. */
async function tapPin(host: Locator) {
  await host.locator('button').evaluate((el) => (el as HTMLButtonElement).click())
}

async function labelOpacity(host: Locator) {
  return host.locator('span').first().evaluate((el) => getComputedStyle(el).opacity)
}

async function labelText(host: Locator) {
  return (await host.locator('span').first().innerText()).trim()
}

async function pinAria(host: Locator) {
  return host.locator('button').first().getAttribute('aria-label')
}

type SavedPerson = { id: number | string; slug: string; status: string }

async function publishPeopleForListing(): Promise<SavedPerson[]> {
  const payload = await getPayload({ config })
  const saved: SavedPerson[] = []
  for (const slug of PUBLISH_SLUGS) {
    const found = await payload.find({
      collection: 'people',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const doc = found.docs[0]
    if (!doc) {
      console.warn(`No person with slug ${slug}`)
      continue
    }
    saved.push({ id: doc.id, slug, status: String(doc.status) })
    if (doc.status !== 'published') {
      await payload.update({
        collection: 'people',
        id: doc.id,
        data: { status: 'published' },
        overrideAccess: true,
      })
      console.log(`Published ${slug} for QA (was ${doc.status})`)
    }
  }
  return saved
}

async function restorePeople(saved: SavedPerson[]) {
  if (saved.length === 0) return
  const payload = await getPayload({ config })
  for (const person of saved) {
    await payload.update({
      collection: 'people',
      id: person.id,
      data: { status: person.status as 'draft' | 'published' },
      overrideAccess: true,
    })
    console.log(`Restored ${person.slug} → ${person.status}`)
  }
}

async function findPlaceWithoutImage(): Promise<string> {
  const res = await fetch(
    `${BASE}/api/neighbourhood-places?limit=50&depth=0&where[status][equals]=active`,
  )
  const data = (await res.json()) as {
    docs: Array<{ slug: string; image?: unknown }>
  }
  const empty = data.docs.find((d) => d.image == null || d.image === '')
  return empty?.slug ?? 'schloss-charlottenburg'
}

async function findZeroPicksSlug(): Promise<string | null> {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'people',
    depth: 1,
    limit: 100,
    overrideAccess: true,
  })
  const zero = found.docs.find((doc) => {
    const picks = doc.picks as { docs?: unknown[] } | undefined
    return !picks?.docs?.length
  })
  return typeof zero?.slug === 'string' ? zero.slug : null
}

async function runTouchCategory(browser: Browser) {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/neighbourhood`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await waitForMap(page)

    const host = pinHost(page, CATEGORY_PIN)
    const exists = (await host.count()) > 0
    if (!exists) {
      record({
        id: 'touch-category-1',
        title: 'Category pin first tap reveals label',
        status: 'fail',
        screenshot: await shot(page, '01-touch-category-missing-pin'),
        notes: `No ${CATEGORY_PIN} pin in the DOM after map load.`,
      })
      return
    }

    await host.scrollIntoViewIfNeeded()
    const before = await labelOpacity(host)
    await tapPin(host)
    await page.waitForTimeout(400)
    const after = await labelOpacity(host)
    const text = await labelText(host)
    const file1 = await shot(page, '01-touch-category-first-tap-page')
    const file1pin = await shot(page, '01-touch-category-first-tap-pin', host)
    const revealed = Number(after) > 0.5
    record({
      id: 'touch-category-1',
      title: 'Category pin first tap reveals label',
      status: revealed ? 'pass' : 'fail',
      screenshot: `${file1}, ${file1pin}`,
      notes: `opacity ${before} → ${after}; label text "${text}".`,
    })

    const cardBefore = await visibleCard(page).count()
    await tapPin(host)
    const card = visibleCard(page)
    await card.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
    await card.scrollIntoViewIfNeeded().catch(() => undefined)
    const cardVisible = await card.isVisible().catch(() => false)
    const cardTitle = cardVisible ? (await card.locator('h3').innerText()).trim() : ''
    const file2 = await shot(page, '02-touch-category-second-tap-card')
    record({
      id: 'touch-category-2',
      title: 'Category pin second tap opens PlaceInfoCard',
      status: cardVisible && /nationalgalerie/i.test(cardTitle) ? 'pass' : 'fail',
      screenshot: file2,
      notes: `cards before=${cardBefore} after visible=${cardVisible} h3="${cardTitle}". Card is in the md:hidden slot under the map on iPhone.`,
    })
  } catch (err) {
    record({
      id: 'touch-category',
      title: 'Category pin touch sequence',
      status: 'fail',
      screenshot: await shot(page, '01-touch-category-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runTouchPerson(browser: Browser) {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/you-me-and-berlin`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    try {
      await waitForMap(page)
    } catch {
      record({
        id: 'touch-person',
        title: 'Person pin first/second tap on /you-me-and-berlin',
        status: 'blocked',
        screenshot: await shot(page, '03-touch-person-no-map'),
        notes:
          'Listing map did not hydrate (.mapboxgl-canvas missing after wait). Chips can appear before the canvas.',
      })
      return
    }

    const host = pinHost(page, 'König Galerie')
    if ((await host.count()) === 0) {
      record({
        id: 'touch-person-1',
        title: 'Person pin first tap reveals label',
        status: 'fail',
        screenshot: await shot(page, '03-touch-person-missing-pin'),
        notes: 'Map loaded but no König Galerie person pin.',
      })
      return
    }

    await tapPin(host)
    await page.waitForTimeout(400)
    const after = await labelOpacity(host)
    const text = await labelText(host)
    const aria = await pinAria(host)
    const file1 = await shot(page, '03-touch-person-first-tap-page')
    const file1pin = await shot(page, '03-touch-person-first-tap-pin', host)
    record({
      id: 'touch-person-1',
      title: 'Person pin first tap reveals label',
      status: Number(after) > 0.5 ? 'pass' : 'fail',
      screenshot: `${file1}, ${file1pin}`,
      notes: `opacity=${after}; label="${text}"; aria-label="${aria}".`,
    })

    await tapPin(host)
    const card = visibleCard(page)
    await card.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
    await card.scrollIntoViewIfNeeded().catch(() => undefined)
    const cardVisible = await card.isVisible().catch(() => false)
    const cardText = cardVisible ? (await card.innerText()).slice(0, 240) : ''
    const file2 = await shot(page, '04-touch-person-second-tap-card')
    record({
      id: 'touch-person-2',
      title: 'Person pin second tap opens PlaceInfoCard (person emphasis)',
      status: cardVisible ? 'pass' : 'fail',
      screenshot: file2,
      notes: cardVisible
        ? `Card visible. Starts with: ${JSON.stringify(cardText.replace(/\s+/g, ' ').slice(0, 180))}`
        : 'No PlaceInfoCard after second tap.',
    })
  } catch (err) {
    record({
      id: 'touch-person',
      title: 'Person pin touch sequence',
      status: 'fail',
      screenshot: await shot(page, '03-touch-person-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runKeyboard(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/neighbourhood`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await waitForMap(page)

    const host = pinHost(page, CATEGORY_PIN)
    const button = host.locator('button')

    // Tab from the map region (now a real tab stop). Next Tab should hit a pin
    // (markers sit in the canvas-container, before zoom/attribution controls).
    const mapRegion = page.locator('[data-hbb-guide-map]').first()
    await mapRegion.focus()
    const canvasTabIndex = await page.locator('.mapboxgl-canvas').first().getAttribute('tabindex')
    const focusPath: string[] = []
    let tabbedAria: string | null = null
    let tabs = 0
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      tabs += 1
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return {
          aria: el?.getAttribute('aria-label'),
          tag: el?.tagName,
          className: el?.className?.toString().slice(0, 80) ?? '',
          onPin: Boolean(el?.closest('.hbb-map-pin-host')),
        }
      })
      focusPath.push(`${info.tag}${info.aria ? `[${info.aria}]` : ''}`)
      if (info.onPin) {
        tabbedAria = info.aria ?? null
        break
      }
    }
    const tabFile = await shot(page, '05b-keyboard-tab-to-pin')
    let tabPinFile = ''
    const focusedHost = page.locator('.hbb-map-pin-host').filter({ has: page.locator('button:focus') })
    if ((await focusedHost.count()) > 0) {
      tabPinFile = await shot(page, '05b-keyboard-tab-to-pin-closeup', focusedHost)
    }
    record({
      id: 'keyboard-tab',
      title: 'Tab reaches a map pin from the map region',
      status: Boolean(tabbedAria) && tabs <= 4 ? 'pass' : 'fail',
      screenshot: tabPinFile ? `${tabFile}, ${tabPinFile}` : tabFile,
      notes: tabbedAria
        ? `After ${tabs} Tab(s) from [data-hbb-guide-map], focus is pin aria-label="${tabbedAria}". canvas tabindex=${canvasTabIndex}. path: ${focusPath.join(' → ')}`
        : `Tab from map region did not land on a pin within 4 tabs. canvas tabindex=${canvasTabIndex}. path: ${focusPath.join(' → ')}`,
    })

    await button.focus()
    await page.waitForTimeout(300)

    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    const opacity = await labelOpacity(host)
    const aria = await pinAria(host)
    const fileFocus = await shot(page, '05-keyboard-focus-label-page')
    const fileFocusPin = await shot(page, '05-keyboard-focus-label-pin', host)

    const ariaOk = Boolean(aria && /nationalgalerie/i.test(aria) && /art/i.test(aria))
    record({
      id: 'keyboard-focus',
      title: 'Focus-visible label reveal + aria-label has name + category',
      status: Number(opacity) > 0.5 && ariaOk ? 'pass' : 'fail',
      screenshot: `${fileFocus}, ${fileFocusPin}`,
      notes: `activeElement aria-label="${focused}"; pin aria-label="${aria}"; label opacity=${opacity}. Tab was not used from document start — pin was focused directly so the check is "keyboard focus", not a full tab-order walk.`,
    })

    await button.press('Enter')
    const card = visibleCard(page)
    await card.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
    const cardVisible = await card.isVisible().catch(() => false)
    const fileEnter = await shot(page, '06-keyboard-enter-card')
    record({
      id: 'keyboard-enter',
      title: 'Enter on focused pin opens PlaceInfoCard',
      status: cardVisible ? 'pass' : 'fail',
      screenshot: fileEnter,
      notes: cardVisible
        ? `Card h3="${(await card.locator('h3').innerText()).trim()}" (desktop floating overlay).`
        : 'Card not visible after Enter.',
    })
  } catch (err) {
    record({
      id: 'keyboard',
      title: 'Keyboard pin interaction',
      status: 'fail',
      screenshot: await shot(page, '05-keyboard-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runPersonFilter(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/you-me-and-berlin`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    try {
      await waitForMap(page)
    } catch {
      record({
        id: 'filter-click',
        title: 'Click person filter updates ?person=slug',
        status: 'blocked',
        screenshot: await shot(page, '07-filter-no-map'),
        notes: 'No listing map after wait, so person chips/map filter cannot be exercised.',
      })
      return
    }

    const maikeChip = page.getByRole('button', { name: 'Maike', exact: true })
    if ((await maikeChip.count()) === 0) {
      record({
        id: 'filter-click',
        title: 'Click person filter updates ?person=slug',
        status: 'fail',
        screenshot: await shot(page, '07-filter-no-maike-chip'),
        notes: 'Map present but no Maike filter chip.',
      })
      return
    }

    await maikeChip.click()
    await page.waitForURL(/person=maike/, { timeout: 15_000 })
    await waitForMap(page)
    const url = page.url()
    const card = visibleCard(page)
    const anyPersonPin = page.locator('.hbb-map-pin-host button').nth(1)
    await anyPersonPin.evaluate((el) => (el as HTMLButtonElement).click())
    await card.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
    const cardVisible = await card.isVisible().catch(() => false)
    const cardText = cardVisible ? (await card.innerText()).replace(/\s+/g, ' ').slice(0, 220) : ''
    const fileFilter = await shot(page, '07-filter-maike-click')
    record({
      id: 'filter-click',
      title: 'Click person → URL ?person=slug + person-emphasis card',
      status: url.includes('person=maike') && cardVisible ? 'pass' : 'fail',
      screenshot: fileFilter,
      notes: `url=${url}. cardVisible=${cardVisible}. card excerpt: ${JSON.stringify(cardText)}`,
    })

    await page.getByRole('button', { name: 'Everyone', exact: true }).click({ force: true })
    await page.waitForURL((url) => !url.search.includes('person='), { timeout: 15_000 })
    await page.waitForTimeout(800)
    const urlCleared = page.url()
    const personGone = !/[?&]person=/.test(urlCleared)
    const staleCard = await visibleCard(page).isVisible().catch(() => false)
    const fileClear = await shot(page, '08-filter-cleared')
    record({
      id: 'filter-clear',
      title: 'Clear filter restores unfiltered URL and does not leave a stale card',
      status: personGone && !staleCard ? 'pass' : 'fail',
      screenshot: fileClear,
      notes: `url=${urlCleared}. person param gone=${personGone}. stale card visible=${staleCard}.`,
    })
  } catch (err) {
    record({
      id: 'filter',
      title: 'Person filter click/clear',
      status: 'fail',
      screenshot: await shot(page, '07-filter-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runPersonFilterDirect(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/you-me-and-berlin?person=maike`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    try {
      await waitForMap(page)
    } catch {
      record({
        id: 'filter-direct',
        title: 'Direct ?person=maike load is already filtered',
        status: 'blocked',
        screenshot: await shot(page, '09-filter-direct-no-map'),
        notes: 'No listing map on direct filtered URL after wait.',
      })
      return
    }
    const url = page.url()
    const maikePressed = await page.getByRole('button', { name: 'Maike', exact: true }).getAttribute(
      'aria-pressed',
    )
    const pinCount = await page.locator('.hbb-map-pin-host button').count()
    const file = await shot(page, '09-filter-direct-load')
    record({
      id: 'filter-direct',
      title: 'Fresh load of ?person=maike is already filtered',
      status: url.includes('person=maike') && maikePressed === 'true' ? 'pass' : 'fail',
      screenshot: file,
      notes: `url=${url}; Maike aria-pressed=${maikePressed}; pin buttons=${pinCount} (hotel + her picks).`,
    })
  } catch (err) {
    record({
      id: 'filter-direct',
      title: 'Direct ?person= load',
      status: 'fail',
      screenshot: await shot(page, '09-filter-direct-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runMobileLayout(browser: Browser) {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/neighbourhood`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await waitForMap(page)
    const host = pinHost(page, CATEGORY_PIN)
    await tapPin(host)
    await page.waitForTimeout(300)
    await tapPin(host)
    const card = visibleCard(page)
    await card.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
    await card.scrollIntoViewIfNeeded().catch(() => undefined)
    const mobileVisible = await card.isVisible().catch(() => false)
    const desktopSlot = page.locator('.hidden.md\\:block article[aria-live="polite"]')
    const desktopVisible = await desktopSlot.isVisible().catch(() => false)
    const box = mobileVisible ? await card.boundingBox() : null
    const mapBox = await page.locator('[data-hbb-guide-map]').boundingBox()
    const viewport = page.viewportSize()
    const underMap = Boolean(box && mapBox && box.y >= mapBox.y + mapBox.height - 8)
    const fullWidth = Boolean(box && viewport && Math.abs(box.width - viewport.width) < 48)
    const fileN = await shot(page, '10-mobile-card-neighbourhood')
    record({
      id: 'mobile-card-neighbourhood',
      title: 'PlaceInfoCard full-width under the map on /nachbarschaft (iPhone)',
      status: mobileVisible && !desktopVisible && underMap ? 'pass' : 'fail',
      screenshot: fileN,
      notes: `card visible=${mobileVisible}, desktop overlay visible=${desktopVisible}, card width=${box?.width} viewport=${viewport?.width}, card.y=${box?.y} map.bottom=${mapBox ? mapBox.y + mapBox.height : 'n/a'} underMap=${underMap} fullWidth=${fullWidth}.`,
    })

    await page.goto(`${BASE}/en/you-me-and-berlin`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    try {
      await waitForMap(page)
      const pHost = page.locator('.hbb-map-pin-host button').nth(1)
      await pHost.evaluate((el) => (el as HTMLButtonElement).click())
      await page.waitForTimeout(300)
      await pHost.evaluate((el) => (el as HTMLButtonElement).click())
      const pCard = visibleCard(page)
      await pCard.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => undefined)
      await pCard.scrollIntoViewIfNeeded().catch(() => undefined)
      const pMobileVisible = await pCard.isVisible().catch(() => false)
      const pDesktop = page.locator('.hidden.md\\:block article[aria-live="polite"]')
      const pDesktopVisible = await pDesktop.isVisible().catch(() => false)
      const pBox = pMobileVisible ? await pCard.boundingBox() : null
      const pMap = await page.locator('[data-hbb-guide-map]').boundingBox()
      const under = Boolean(pBox && pMap && pBox.y >= pMap.y + pMap.height - 8)
      const fileP = await shot(page, '11-mobile-card-people')
      record({
        id: 'mobile-card-people',
        title: 'PlaceInfoCard full-width under the map on /you-me-and-berlin (iPhone)',
        status: pMobileVisible && !pDesktopVisible && under ? 'pass' : 'fail',
        screenshot: fileP,
        notes: `mobile=${pMobileVisible} desktopOverlay=${pDesktopVisible} width=${pBox?.width} y=${pBox?.y} underMap=${under}.`,
      })
    } catch (err) {
      record({
        id: 'mobile-card-people',
        title: 'PlaceInfoCard full-width under the map on /you-me-and-berlin (iPhone)',
        status: 'blocked',
        screenshot: await shot(page, '11-mobile-card-people-no-map'),
        notes: `No listing map or card. ${String(err)}`,
      })
    }

    await page.goto(`${BASE}/en/neighbourhood/schloss-charlottenburg`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    await waitForMap(page)
    await page.locator('.mapboxgl-canvas').scrollIntoViewIfNeeded()
    const overflowPlace = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    const filePlace = await shot(page, '12-mobile-compact-place')
    record({
      id: 'mobile-compact-place',
      title: 'Place detail compact map at mobile width — no overflow',
      status: overflowPlace ? 'fail' : 'pass',
      screenshot: filePlace,
      notes: `document scrollWidth overflow=${overflowPlace}.`,
    })

    await page.goto(`${BASE}/en/you-me-and-berlin/maike`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    let maikeMap = false
    try {
      await waitForMap(page)
      maikeMap = true
      await page.locator('.mapboxgl-canvas').scrollIntoViewIfNeeded()
    } catch {
      maikeMap = false
    }
    const overflowPerson = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    const filePerson = await shot(page, '13-mobile-compact-person')
    record({
      id: 'mobile-compact-person',
      title: 'Person detail compact map at mobile width — no overflow',
      status: overflowPerson ? 'fail' : 'pass',
      screenshot: filePerson,
      notes: `hasMap=${maikeMap}; overflow=${overflowPerson}.`,
    })
  } catch (err) {
    record({
      id: 'mobile-layout',
      title: 'Mobile layout',
      status: 'fail',
      screenshot: await shot(page, '10-mobile-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runFallbacks(browser: Browser, noImageSlug: string, zeroPicksSlug: string | null) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/you-me-and-berlin/maike`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    const h1 = page.locator('h1')
    const avatar = page.locator('main span[aria-hidden="true"]').first()
    const avatarText = (await avatar.innerText().catch(() => '')).trim()
    const schloss = page.getByText('Schloss Charlottenburg', { exact: false })
    const schlossVisible = await schloss.first().isVisible().catch(() => false)
    const fileMaike = await shot(page, '14-fallback-maike')
    record({
      id: 'fallback-maike',
      title: "Maike's page: initials avatar + Schloss Charlottenburg pick",
      status: avatarText.length > 0 && schlossVisible ? 'pass' : 'fail',
      screenshot: fileMaike,
      notes: `h1="${(await h1.innerText()).trim()}"; avatar initials="${avatarText}"; Schloss visible=${schlossVisible}.`,
    })

    await page.goto(`${BASE}/en/neighbourhood/${noImageSlug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    const hero = page.locator('main .bg-gray-100').first()
    const heroVisible = await hero.isVisible().catch(() => false)
    const brokenImg = await page.locator('img[alt][src=""]').count()
    const filePlace = await shot(page, '15-fallback-place-no-image')
    record({
      id: 'fallback-place-image',
      title: 'Place with no image uses gray placeholder well',
      status: heroVisible && brokenImg === 0 ? 'pass' : 'fail',
      screenshot: filePlace,
      notes: `slug=${noImageSlug}; gray well visible=${heroVisible}; empty-src imgs=${brokenImg}.`,
    })

    if (!zeroPicksSlug) {
      record({
        id: 'fallback-zero-picks',
        title: 'Person with zero picks shows coming-soon line, not an empty grid',
        status: 'blocked',
        notes:
          'Every person currently in Payload has at least one pick (join). The coming-soon copy exists in code (`picksComingSoon`) but no live record exercises it.',
      })
    } else {
    await page.goto(`${BASE}/en/you-me-and-berlin/${zeroPicksSlug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })
    const comingSoon = page.getByText(/coming soon/i)
    const comingVisible = await comingSoon.first().isVisible().catch(() => false)
    const gridItems = await page.locator('main ul li').count()
    const fileZero = await shot(page, '16-fallback-zero-picks')
    record({
      id: 'fallback-zero-picks',
      title: 'Person with zero picks shows coming-soon line, not an empty grid',
      status: comingVisible ? 'pass' : 'fail',
      screenshot: fileZero,
      notes: `slug=${zeroPicksSlug}; comingSoon visible=${comingVisible}; ul/li count=${gridItems}.`,
    })
    }
  } catch (err) {
    record({
      id: 'fallbacks',
      title: 'Fallback states',
      status: 'fail',
      screenshot: await shot(page, '14-fallback-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function runMultiEndorser(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE}/en/neighbourhood`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await waitForMap(page)

    const further = page.getByRole('button', { name: /show further out/i })
    if ((await further.count()) > 0) {
      await further.click()
      await page.waitForURL(/further=1/, { timeout: 15_000 })
      await waitForMap(page)
    }

    const schloss = pinHost(page, 'Schloss Charlottenburg')
    if ((await schloss.count()) === 0) {
      record({
        id: 'badge-plus',
        title: '+1 badge on Schloss Charlottenburg',
        status: 'fail',
        screenshot: await shot(page, '17-badge-missing-pin'),
        notes: 'Schloss pin not in DOM.',
      })
      return
    }

    const badge = schloss.getByText('+1', { exact: true })
    const badgeVisible = await badge.isVisible().catch(() => false)
    await schloss.locator('button').click({ force: true }).catch(() => undefined)
    await page.waitForTimeout(600)
    const fileBadge = await shot(page, '17-badge-schloss-page')
    const fileBadgePin = await shot(page, '17-badge-schloss-button', schloss.locator('button'))
    record({
      id: 'badge-plus',
      title: '+1 badge on Schloss Charlottenburg pin',
      status: badgeVisible ? 'pass' : 'fail',
      screenshot: `${fileBadge}, ${fileBadgePin}`,
      notes: `+1 visible=${badgeVisible}; aria-label="${await pinAria(schloss)}". Schloss is further-out; this load used the "Show further out" control on /en/neighbourhood.`,
    })

    await revealPinLabel(schloss)
    await page.waitForTimeout(400)
    const hoveredLabel = await labelText(schloss)
    const hoveredOpacity = await labelOpacity(schloss)
    const fileHover = await shot(page, '18-badge-schloss-hover-page')
    const fileHoverPin = await shot(page, '18-badge-schloss-hover-pin', schloss)
    const hoverOk =
      Number(hoveredOpacity) > 0.5 && /2 recommenders/i.test(hoveredLabel)
    record({
      id: 'badge-hover',
      title: 'Hover label shows "— 2 recommenders"',
      status: hoverOk ? 'pass' : 'fail',
      screenshot: `${fileHover}, ${fileHoverPin}`,
      notes: `Used pointerenter on the pin host (sticky nav intercepts Playwright hover). opacity=${hoveredOpacity}; label="${hoveredLabel}".`,
    })

    const hotel = pinHost(page, 'Hotel Berlin')
    const hotelBadgeCount = await hotel.getByText('+1', { exact: true }).count()
    const fileHotel = await shot(page, '19-badge-hotel-pin', hotel.locator('button'))
    const fileHotelPage = await shot(page, '19-badge-hotel-page')
    record({
      id: 'badge-hotel',
      title: 'Hotel marker does not show a +N badge',
      status: (await hotel.count()) > 0 && hotelBadgeCount === 0 ? 'pass' : 'fail',
      screenshot: `${fileHotelPage}, ${fileHotel}`,
      notes: `hotel pins=${await hotel.count()}; +1 count on hotel host=${hotelBadgeCount}; aria="${await pinAria(hotel)}".`,
    })
  } catch (err) {
    record({
      id: 'badge',
      title: 'Multi-endorser badge',
      status: 'fail',
      screenshot: await shot(page, '17-badge-error').catch(() => undefined),
      notes: String(err),
    })
  } finally {
    await context.close()
  }
}

async function writeReport() {
  const pass = checks.filter((c) => c.status === 'pass').length
  const fail = checks.filter((c) => c.status === 'fail').length
  const blocked = checks.filter((c) => c.status === 'blocked').length
  const lines = [
    '# Map section pre-merge QA',
    '',
    `Base: ${BASE}`,
    `When: ${new Date().toISOString()}`,
    `Totals: ${pass} pass / ${fail} fail / ${blocked} blocked`,
    '',
    '| id | status | title | screenshot | notes |',
    '|---|---|---|---|---|',
    ...checks.map(
      (c) =>
        `| ${c.id} | **${c.status}** | ${c.title} | ${c.screenshot ?? '—'} | ${c.notes.replace(/\|/g, '/')} |`,
    ),
    '',
  ]
  await writeFile(join(OUT, 'REPORT.md'), lines.join('\n'))
  await writeFile(join(OUT, 'report.json'), JSON.stringify({ base: BASE, checks }, null, 2))
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const fixesOnly = process.argv.includes('--fixes')

  const health = await fetch(`${BASE}/en/neighbourhood`).catch(() => null)
  if (!health || !health.ok) {
    throw new Error(`Dev server not serving at ${BASE} (status ${health?.status ?? 'no response'})`)
  }
  console.log(`Dev server OK at ${BASE} (${health.status})`)

  const noImageSlug = fixesOnly ? 'berghain-panorama-bar' : await findPlaceWithoutImage()
  const zeroPicksSlug = fixesOnly ? null : await findZeroPicksSlug()
  if (!fixesOnly) {
    console.log(`No-image place: ${noImageSlug}`)
    console.log(`Zero-picks person: ${zeroPicksSlug}`)
  }

  let saved: SavedPerson[] = []
  try {
    saved = await publishPeopleForListing()
  } catch (err) {
    console.warn('Could not publish people for listing map:', err)
  }

  const browser = await chromium.launch({ headless: true })
  try {
    if (fixesOnly) {
      await runKeyboard(browser)
      await runPersonFilter(browser)
    } else {
      await runTouchCategory(browser)
      await runTouchPerson(browser)
      await runKeyboard(browser)
      await runPersonFilter(browser)
      await runPersonFilterDirect(browser)
      await runMobileLayout(browser)
      await runFallbacks(browser, noImageSlug, zeroPicksSlug)
      await runMultiEndorser(browser)
    }
  } finally {
    await browser.close()
    try {
      await restorePeople(saved)
    } catch (err) {
      console.error('FAILED to restore people statuses — check Payload admin:', err)
    }
  }

  await writeReport()
  const fail = checks.filter((c) => c.status !== 'pass').length
  console.log(`\nWrote ${OUT}/REPORT.md`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
